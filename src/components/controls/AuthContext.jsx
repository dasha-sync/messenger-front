import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../../api/config';
import { useErrorHandler } from './../../hooks/useErrorHandler';
import { AUTH } from './../../api/routes';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { error, handleError, clearError } = useErrorHandler();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null); // если хочешь держать данные о пользователе

    const checkAuth = async () => {
        try {
            const response = await api.get(AUTH.CHECK); // или /me
            setIsAuthenticated(true);
            console.log(response.data); // опционально
            if (response?.data) {
                sessionStorage.setItem("username", response.data.username)
                sessionStorage.setItem("email", response.data.email)
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Добавляем обработчик события authChange
        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('authChange', handleAuthChange);
        checkAuth(); // Первоначальная проверка

        return () => {
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, [handleError]);

    const logout = async () => {
        try {
            await api.post(AUTH.SIGNOUT);
            sessionStorage.clear();
        } catch (err) {
            handleError(err, 'DANGER');
        } finally {
            setIsAuthenticated(false);
            setUser(null);
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
};

export const useAuth = () => useContext(AuthContext);
