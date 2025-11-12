
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../data/users';
import { isValidEmail, isValidPassword, validateName } from '../utils/validation';
import { ValidationError, AuthenticationError, logError } from '../utils/errorHandling';

interface AuthContextType {
    currentUser: User | null;
    users: User[];
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string) => Promise<User>;
    logout: () => void;
    updateUser: (updatedData: Partial<User>) => Promise<User>;
    getUserById: (userId: string) => User | undefined;
    toggleFollow: (targetUserId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'midjourney_style_library_users';
const CURRENT_USER_ID_KEY = 'midjourney_style_library_current_user_id';

// WARNING: This is a mock authentication system for demonstration purposes only.
// DO NOT use this in production. Passwords should NEVER be stored in plaintext
// or in localStorage. Use a proper backend with bcrypt/argon2 hashing and JWT tokens.

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(() => {
        try {
            const localData = window.localStorage.getItem(USERS_STORAGE_KEY);
            if (localData) return JSON.parse(localData);
        } catch (error) { console.error("Failed to load users from localStorage:", error); }
        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(MOCK_USERS));
        return MOCK_USERS;
    });
    
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const userId = window.localStorage.getItem(CURRENT_USER_ID_KEY);
            if (userId) {
                const storedUsers = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
                const foundUser = storedUsers.find((u: User) => u.id === userId) || null;
                if (foundUser) delete foundUser.password;
                return foundUser;
            }
        } catch (error) { console.error("Failed to load current user from localStorage:", error); }
        return null;
    });

    useEffect(() => {
        try {
            // Never store passwords in the public user list that might be stringified
            const usersToSave = users.map(({ password, ...user }) => user);
            window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersToSave));
        } catch (error) { console.error("Failed to save users to localStorage:", error); }
    }, [users]);

    const register = useCallback((name: string, email: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            try {
                // Validate name
                const nameValidation = validateName(name);
                if (!nameValidation.valid) {
                    reject(new ValidationError(nameValidation.error || 'Invalid name'));
                    return;
                }

                // Validate email
                if (!isValidEmail(email)) {
                    reject(new ValidationError('Please enter a valid email address'));
                    return;
                }

                // Validate password
                if (!isValidPassword(password)) {
                    reject(new ValidationError('Password must be at least 8 characters long'));
                    return;
                }

                // Check if user already exists
                if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                    reject(new ValidationError("An account with this email already exists."));
                    return;
                }

                // WARNING: Storing password in plaintext - for demo only!
                const newUser: User = {
                    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    password, // INSECURE: In production, hash with bcrypt before storing
                    avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
                    bio: '',
                    followers: [],
                    following: []
                };

                setUsers(prev => {
                    const updatedUsers = [...prev, newUser];
                    // Immediately persist to localStorage
                    try {
                        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
                    } catch (error) {
                        logError(error as Error, { context: 'register - localStorage save' });
                    }
                    return updatedUsers;
                });

                const { password: _, ...userWithoutPassword } = newUser;
                setCurrentUser(userWithoutPassword);
                window.localStorage.setItem(CURRENT_USER_ID_KEY, newUser.id);
                resolve(userWithoutPassword);
            } catch (error) {
                logError(error as Error, { context: 'register' });
                reject(error);
            }
        });
    }, [users]);
    
    const login = useCallback((email: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            try {
                // Validate email format
                if (!isValidEmail(email)) {
                    reject(new ValidationError('Please enter a valid email address'));
                    return;
                }

                // FIXED: Search in current users state, not just MOCK_USERS
                // This allows newly registered users to log in
                const userToLogin = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

                // WARNING: Plaintext password comparison - insecure!
                // In production, use bcrypt.compare(password, user.hashedPassword)
                if (userToLogin && userToLogin.password === password) {
                    const { password: _, ...userWithoutPassword } = userToLogin;
                    setCurrentUser(userWithoutPassword);
                    window.localStorage.setItem(CURRENT_USER_ID_KEY, userToLogin.id);
                    resolve(userWithoutPassword);
                } else {
                    reject(new AuthenticationError("Invalid email or password."));
                }
            } catch (error) {
                logError(error as Error, { context: 'login' });
                reject(error);
            }
        });
    }, [users]);

    const logout = useCallback(() => {
        setCurrentUser(null);
        window.localStorage.removeItem(CURRENT_USER_ID_KEY);
    }, []);

    const updateUser = useCallback((updatedData: Partial<User>): Promise<User> => {
        return new Promise((resolve, reject) => {
            try {
                if (!currentUser) {
                    reject(new AuthenticationError("No user is logged in."));
                    return;
                }

                // Validate updated data
                if (updatedData.name) {
                    const nameValidation = validateName(updatedData.name);
                    if (!nameValidation.valid) {
                        reject(new ValidationError(nameValidation.error || 'Invalid name'));
                        return;
                    }
                }

                if (updatedData.email) {
                    if (!isValidEmail(updatedData.email)) {
                        reject(new ValidationError('Please enter a valid email address'));
                        return;
                    }
                }

                // FIXED: Handle race condition with proper state update
                setUsers(prev => {
                    const userIndex = prev.findIndex(u => u.id === currentUser.id);

                    if (userIndex === -1) {
                        reject(new Error("Failed to find user to update."));
                        return prev;
                    }

                    const updatedUser = { ...prev[userIndex], ...updatedData };
                    const newUsers = [...prev];
                    newUsers[userIndex] = updatedUser;

                    // Update current user state
                    const { password: _, ...userWithoutPassword } = updatedUser;
                    setCurrentUser(userWithoutPassword);
                    resolve(userWithoutPassword);

                    return newUsers;
                });
            } catch (error) {
                logError(error as Error, { context: 'updateUser' });
                reject(error);
            }
        });
    }, [currentUser]);

    const getUserById = useCallback((userId: string) => {
        const foundUser = users.find(u => u.id === userId);
        if (foundUser) {
            const { password, ...userWithoutPassword } = foundUser;
            return userWithoutPassword;
        }
        return undefined;
    }, [users]);

    const toggleFollow = useCallback((targetUserId: string) => {
        if (!currentUser) return;

        setUsers(prevUsers => {
            const newUsers = [...prevUsers];
            const currentUserIndex = newUsers.findIndex(u => u.id === currentUser.id);
            const targetUserIndex = newUsers.findIndex(u => u.id === targetUserId);

            if (currentUserIndex === -1 || targetUserIndex === -1) return prevUsers;
            
            const isFollowing = newUsers[currentUserIndex].following.includes(targetUserId);

            if (isFollowing) {
                newUsers[currentUserIndex].following = newUsers[currentUserIndex].following.filter(id => id !== targetUserId);
                newUsers[targetUserIndex].followers = newUsers[targetUserIndex].followers.filter(id => id !== currentUser.id);
            } else {
                newUsers[currentUserIndex].following.push(targetUserId);
                newUsers[targetUserIndex].followers.push(currentUser.id);
            }
            
            if (newUsers[currentUserIndex].id === currentUser.id) {
                 const { password, ...userWithoutPassword } = newUsers[currentUserIndex];
                setCurrentUser(userWithoutPassword);
            }
            
            return newUsers;
        });
    }, [currentUser]);

    return (
        <AuthContext.Provider value={{ currentUser, users, register, login, logout, updateUser, getUserById, toggleFollow }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};