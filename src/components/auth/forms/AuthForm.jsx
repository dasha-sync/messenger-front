import React, { useState } from 'react';
import { Form, Button, Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Alert from '../../controls/Alert';

const AuthForm = ({ mode = 'signin' }) => {
    const navigate = useNavigate();
    const isSignUp = mode === 'signup';
    const { error, isLoading, handleAuth, clearError } = useAuth(isSignUp);

    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        ...(isSignUp && { email: '' })
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted with credentials:', credentials);
        await handleAuth(credentials);
    };

    const formFields = [
        {
            name: 'username',
            label: 'Username',
            type: 'text',
            required: true
        },
        ...(isSignUp ? [{
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true
        }] : []),
        {
            name: 'password',
            label: 'Password',
            type: 'password',
            required: true
        }
    ];

    return (
        <Container>
            <Form onSubmit={handleSubmit} className="mx-auto bg-dark text-light p-4 rounded" style={{ maxWidth: '400px' }}>
                <h2 className="mb-4 text-light centerize-form">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
                {error && (
                    <Alert
                        message={error.message}
                        status={error.status}
                        onClose={clearError}
                    />
                )}

                {formFields.map(({ name, label, type, required }) => (
                    <Form.Group key={name} className="mb-3">
                        <Form.Label className="text-light text-start w-100">{label}</Form.Label>
                        <Form.Control className="bg-dark text-light border-secondary" type={type} name={name} value={credentials[name]} onChange={handleChange} required={required} disabled={isLoading} />
                    </Form.Group>
                ))}

                <div className="d-flex gap-2 justify-content-center">
                    <Button variant="outline-light" onClick={() => navigate('/welcome')} disabled={isLoading}>
                        Back
                    </Button>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                {isSignUp ? 'Signing up...' : 'Signing in...'}
                            </>
                        ) : (
                            isSignUp ? 'Sign Up' : 'Sign In'
                        )}
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default AuthForm;
