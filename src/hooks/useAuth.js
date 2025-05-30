/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import { AUTH } from '../api/routes';
import { useErrorHandler } from './useErrorHandler';

export const useAuth = (isSignUp = false) => {
    const navigate = useNavigate();
    const { error, handleError, clearError } = useErrorHandler();
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (credentials) => {
        setIsLoading(true);
        clearError();

        try {
            if (isSignUp) {
                const signUpResponse = await api.post(AUTH.SIGNUP, credentials, { timeout: 5000 });
                if (!signUpResponse.data.data) {
                    throw new Error('Invalid signup response');
                }
                credentials = { username: credentials.username, password: credentials.password };
            }

            const signInResponse = await api.post(AUTH.SIGNIN, credentials, {
                timeout: 5000,
                withCredentials: true
            });

            if (signInResponse.data?.data?.user) {
                sessionStorage.setItem('username', signInResponse.data.data.user.username);
                sessionStorage.setItem('email', signInResponse.data.data.user.email);

                window.dispatchEvent(new Event('authChange'));

                try {
                    const checkResponse = await api.get(AUTH.CHECK);
                    if (checkResponse.data?.authenticated) {
                        navigate('/');
                    } else {
                        throw new Error('Authentication check failed');
                    }
                } catch (checkError) {
                    console.error('Auth check failed:', checkError);
                    handleError(checkError, 'DANGER');
                    sessionStorage.clear();
                }
            } else {
                throw new Error('Invalid signin response');
            }
        } catch (err) {
            handleError(err, 'DANGER');
            sessionStorage.clear();
        } finally {
            setIsLoading(false);
        }
    };

    return {
        error,
        isLoading,
        handleAuth,
        clearError
    };
};
