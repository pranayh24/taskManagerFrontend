import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {User, AuthResponse} from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response: AuthResponse = await apiService.login(email, password);
        const userData: User = {
            userId: response.userId,
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email,
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const register = async (firstName: string, lastName: string, email: string, password: string) => {
        await apiService.register(firstName, lastName, email, password);
        // Auto-login after registration
        await login(email, password);
    };

    const logout = () => {
        apiService.clearToken();
        localStorage.removeItem('user');
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};