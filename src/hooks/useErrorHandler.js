import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
    const [error, setError] = useState(null);

    const handleError = useCallback((err, customStatus = null) => {
        if (err.code === 'ECONNABORTED') {
            setError({
                message: 'Connection timeout. Please try again.',
                status: customStatus || 'WARNING'
            });
        } else if (err.response?.data?.errors) {
            const errors = err.response.data.errors;
            const errorMessages = Object.values(errors)
                .filter(Boolean)
                .join('\n');
            setError({
                message: errorMessages,
                status: customStatus || 'DANGER'
            });
        } else if (err.response?.data?.message) {
            setError({
                message: err.response.data.message,
                status: customStatus || 'DANGER'
            });
        } else if (err.data?.action === "DELETE") {
            setError({
                message: 'Successfully deleted',
                status: customStatus || 'DANGER'
            });
        } else if (err.data?.action === "UPDATE") {
            setError({
                message: 'Successfully updated',
                status: customStatus || 'DANGER'
            });
        } else if (err.data?.message) {
            setError({
                message: err.data.message,
                status: customStatus || 'DANGER'
            });
        } else if (err.data?.data?.message) {
            setError({
                message: err.data.data.message,
                status: customStatus || 'DANGER'
            });
        } else if (err.request) {
            setError({
                message: 'No response from server. Please check your connection.',
                status: customStatus || 'DANGER'
            });
        } else {
            setError({
                message: err.message || 'An error occurred. Please try again.',
                status: customStatus || 'DANGER'
            });
        }
    }, []);


    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return { error, handleError, clearError };
};
