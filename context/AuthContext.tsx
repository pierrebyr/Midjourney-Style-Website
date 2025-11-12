
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../data/users';

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
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                reject(new Error("An account with this email already exists."));
                return;
            }

            const newUser: User = {
                id: `user-${Date.now()}`,
                name,
                email,
                password, // This will be handled in-memory for this mock setup
                avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
                bio: '',
                followers: [],
                following: []
            };

            setUsers(prev => [...prev, newUser]);
            setCurrentUser(newUser);
            window.localStorage.setItem(CURRENT_USER_ID_KEY, newUser.id);
            resolve(newUser);
        });
    }, [users]);
    
    const login = useCallback((email: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            // In a real app, you'd fetch from an API. Here we find in our mock data.
            const userToLogin = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (userToLogin && userToLogin.password === password) {
                const { password, ...userWithoutPassword } = userToLogin;
                setCurrentUser(userWithoutPassword);
                window.localStorage.setItem(CURRENT_USER_ID_KEY, userToLogin.id);
                resolve(userWithoutPassword);
            } else {
                reject(new Error("Invalid email or password."));
            }
        });
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        window.localStorage.removeItem(CURRENT_USER_ID_KEY);
    }, []);

    const updateUser = useCallback((updatedData: Partial<User>): Promise<User> => {
        return new Promise((resolve, reject) => {
            if (!currentUser) {
                reject(new Error("No user is logged in."));
                return;
            }
            let updatedUser: User | null = null;
            setUsers(prev => prev.map(u => {
                if (u.id === currentUser.id) {
                    updatedUser = { ...u, ...updatedData };
                    return updatedUser;
                }
                return u;
            }));
            
            if (updatedUser) {
                 const { password, ...userWithoutPassword } = updatedUser;
                setCurrentUser(userWithoutPassword);
                resolve(userWithoutPassword);
            } else {
                reject(new Error("Failed to find user to update."));
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