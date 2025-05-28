import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../../api/config';
import { useErrorHandler } from './../../hooks/useErrorHandler';
import { AUTH } from './../../api/routes';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { error, handleError, clearError } = useErrorHandler();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const checkAuth = async () => {
        try {
            console.log('Checking auth...');
            const response = await api.get(AUTH.CHECK, {
                withCredentials: true
            });
            console.log('Auth check response:', response.data);

            if (response?.data?.authenticated) {
                console.log('User is authenticated');
                setIsAuthenticated(true);
                if (response.data.username) {
                    sessionStorage.setItem("username", response.data.username);
                }
                if (response.data.email) {
                    sessionStorage.setItem("email", response.data.email);
                }
            } else {
                console.log('User is not authenticated');
                setIsAuthenticated(false);
                setUser(null);
                sessionStorage.clear();
            }
        } catch (err) {
            console.error('Auth check failed:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                headers: err.response?.headers,
                config: {
                    url: err.config?.url,
                    method: err.config?.method,
                    headers: err.config?.headers
                }
            });
            setIsAuthenticated(false);
            setUser(null);
            sessionStorage.clear();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('authChange', handleAuthChange);
        checkAuth();

        return () => {
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    const logout = async () => {
        try {
            await api.post(AUTH.SIGNOUT);
        } catch (err) {
            handleError(err, 'DANGER');
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            sessionStorage.clear();
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            user,
            setIsAuthenticated,
            setUser,
            logout,
            error,
            handleError,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
