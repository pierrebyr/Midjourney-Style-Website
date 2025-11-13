import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { User } from '../types';
import { authApi, usersApi, tokenUtils } from '../services/api';
import { isValidEmail, isValidPassword, validateName } from '../utils/validation';
import {
  ValidationError,
  AuthenticationError,
  logError,
} from '../utils/errorHandling';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => Promise<User>;
  getUserById: (userId: string) => User | undefined;
  toggleFollow: (targetUserId: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user on mount if token exists
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const token = tokenUtils.getToken();
        if (token) {
          const { user } = await authApi.getCurrentUser();
          setCurrentUser(user as User);
        }
      } catch (error) {
        // Token might be expired or invalid
        tokenUtils.removeToken();
        logError(error as Error, { context: 'loadCurrentUser' });
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<User> => {
      try {
        // Validate name
        const nameValidation = validateName(name);
        if (!nameValidation.valid) {
          throw new ValidationError(nameValidation.error || 'Invalid name');
        }

        // Validate email
        if (!isValidEmail(email)) {
          throw new ValidationError('Please enter a valid email address');
        }

        // Validate password
        if (!isValidPassword(password)) {
          throw new ValidationError('Password must be at least 8 characters long');
        }

        // Call backend API (authApi)
        const response = await authApi.register({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
        });

        // Set token and current user
        tokenUtils.setToken(response.token);
        setCurrentUser(response.user as User);

        return response.user as User;
      } catch (error) {
        logError(error as Error, { context: 'register' });
        throw error;
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      try {
        // Validate email format
        if (!isValidEmail(email)) {
          throw new ValidationError('Please enter a valid email address');
        }

        // Call backend API (authApi)
        const response = await authApi.login({
          email: email.toLowerCase().trim(),
          password,
        });

        // Set token and current user
        tokenUtils.setToken(response.token);
        setCurrentUser(response.user as User);

        return response.user as User;
      } catch (error) {
        logError(error as Error, { context: 'login' });
        throw error;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    tokenUtils.removeToken();
    authApi.logout(); // au cas où tu ajoutes plus tard de la logique backend
  }, []);

  const updateUser = useCallback(
    async (updatedData: Partial<User>): Promise<User> => {
      try {
        if (!currentUser) {
          throw new AuthenticationError('No user is logged in.');
        }

        // Validate updated data
        if (updatedData.name) {
          const nameValidation = validateName(updatedData.name);
          if (!nameValidation.valid) {
            throw new ValidationError(nameValidation.error || 'Invalid name');
          }
        }

        if (updatedData.email) {
          if (!isValidEmail(updatedData.email)) {
            throw new ValidationError('Please enter a valid email address');
          }
        }

        // Call backend API
        const response = await usersApi.updateProfile(updatedData);
        const updatedUser = response.user as User;
        setCurrentUser(updatedUser);

        return updatedUser;
      } catch (error) {
        logError(error as Error, { context: 'updateUser' });
        throw error;
      }
    },
    [currentUser]
  );

  const getUserById = useCallback(
    (userId: string) => {
      // Return from local users cache if available
      const foundUser = users.find((u) => u.id === userId);
      if (foundUser) {
        return foundUser;
      }
      // Note: In a real app, you might want to fetch from API if not in cache
      return undefined;
    },
    [users]
  );

  const toggleFollow = useCallback(
    async (targetUserId: string) => {
      if (!currentUser) {
        throw new AuthenticationError('User must be logged in to follow.');
      }

      try {
        await usersApi.toggleFollow(targetUserId);

        // Refresh current user to get updated following list
        const { user } = await authApi.getCurrentUser();
        setCurrentUser(user as User);
      } catch (error) {
        logError(error as Error, { context: 'toggleFollow' });
        throw error;
      }
    },
    [currentUser]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        register,
        login,
        logout,
        updateUser,
        getUserById,
        toggleFollow,
        isLoading,
      }}
    >
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