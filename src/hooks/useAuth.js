/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import { AUTH } from '../api/routes';

export const useAuth = (isSignUp = false) => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (credentials) => {
        setIsLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const signUpResponse = await api.post(AUTH.SIGNUP, credentials, { timeout: 5000 });
                if (!signUpResponse.data.data) {
                    throw new Error('Invalid signup response');
                }
                // After successful signup, proceed with signin
                credentials = { username: credentials.username, password: credentials.password };
            }

            const signInResponse = await api.post(AUTH.SIGNIN, credentials, { timeout: 5000 });

            if (signInResponse.data?.data?.token) {
                localStorage.setItem('token', signInResponse.data.data.token);
                localStorage.setItem('username', signInResponse.data.data.user.username);
                localStorage.setItem('email', signInResponse.data.data.user.email);
                window.dispatchEvent(new Event('authChange'));
                navigate('/');
            } else {
                throw new Error('Invalid signin response');
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleError = (err) => {
        if (err.code === 'ECONNABORTED') {
            setError('Connection timeout. Please try again.');
        } else if (err.response?.data?.errors) {
            const errors = err.response.data.errors;
            const errorMessages = Object.entries(errors)
                .map(([key, value]) => value)
                .filter(Boolean)
                .join('\n');
            setError(errorMessages);
        } else if (err.request) {
            setError('No response from server. Please check your connection.');
        } else {
            setError(err.message || 'An error occurred. Please try again.');
        }
    };

    return {
        error,
        isLoading,
        handleAuth
    };
};
