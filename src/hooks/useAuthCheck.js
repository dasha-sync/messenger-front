import { useEffect, useState } from 'react';
import api from '../api/config';
import { useErrorHandler } from './useErrorHandler';
import { AUTH } from '../../../api/routes';

export const useAuthCheck = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
    const { error, handleError, clearError } = useErrorHandler();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get(AUTH.CHECK); // эндпоинт, который возвращает статус входа
                setIsAuthenticated(response.data.authenticated); // true или false
            } catch (err) {
                handleError(err, 'DANGER');
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, [handleError]);

    return { isAuthenticated, error, clearError };
};
