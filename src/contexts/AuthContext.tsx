import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Storage key for user session
  const USER_STORAGE_KEY = 'cricket_app_user';

  // Helper function to get user from localStorage
  const getStoredUser = (): User | null => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
      return null;
    }
  };

  // Helper function to store user in localStorage
  const storeUser = (userData: User | null) => {
    try {
      if (userData) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error storing user in localStorage:', error);
    }
  };

  useEffect(() => {
    // Initialize auth from localStorage - trust stored session
    // API calls will fail if session is invalid
    const initializeAuth = () => {
      try {
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        storeUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Store user data in localStorage for session persistence
        storeUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth-logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear user data from state and localStorage
      setUser(null);
      storeUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};