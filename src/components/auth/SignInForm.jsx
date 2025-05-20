import React, { useState } from 'react';
import { Form, Button, Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../api/config';
import { AUTH } from '../../api/routes';

const SignInForm = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post(AUTH.SIGNIN, credentials, {
                timeout: 5000
            });

            console.log(response)

            if (response.data && response.data.data.token) {
                localStorage.setItem('token', response.data.data.token);
                window.dispatchEvent(new Event('authChange'));
                navigate('/');
            } else {
                setError('Invalid response from server');
            }
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setError('Connection timeout. Please try again.');
            } else if (err.response) {
                var errors = err.response.data?.errors
                setError((errors.username ? errors.username + '\n' : '') + (errors.password ? errors.password : ''))
            } else if (err.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Form onSubmit={handleSubmit} className="mx-auto bg-dark text-light p-4 rounded" style={{ maxWidth: '400px' }}>
                <h2 className="mb-4 text-light">Sign In</h2>
                {error && <div className="text-danger mb-3 text-start w-100" style={{ whiteSpace: 'pre-line' }}>{error}</div>}
                <Form.Group className="mb-3">
                    <Form.Label className="text-light text-start w-100">Username</Form.Label>
                    <Form.Control className="bg-dark text-light border-secondary" type="text" name="username" value={credentials.username} onChange={handleChange} required disabled={isLoading} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="text-light text-start w-100">Password</Form.Label>
                    <Form.Control className="bg-dark text-light border-secondary" type="password" name="password" value={credentials.password} onChange={handleChange} required disabled={isLoading} />
                </Form.Group>
                <div className="d-flex gap-2 justify-content-center">
                    <Button variant="outline-light" onClick={() => navigate('/welcome')} disabled={isLoading}>
                        Back
                    </Button>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default SignInForm;
