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

    const [validationErrors, setValidationErrors] = useState({});

    const validateField = (name, value) => {
        const errors = {};

        switch (name) {
            case 'username':
                if (!value.match(/^[a-z][a-z0-9_.-]*$/)) {
                    errors.username = "Username can only contain Latin lowercase letters, numbers, '_', '-', '.' and must begin with the letter";
                } else if (value.length < 3 || value.length > 20) {
                    errors.username = "Username must contain 3 - 20 symbols";
                }
                break;
            case 'email':
                if (isSignUp && !value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
                    errors.email = "Non correct email format";
                }
                break;
            case 'password':
                if (value.length < 6 || value.length > 20) {
                    errors.password = "Password must contain 6 - 20 symbols";
                }
                break;
        }

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));

        // Validate field on change
        const errors = validateField(name, value);
        setValidationErrors(prev => ({
            ...prev,
            [name]: errors[name]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields before submission
        const errors = {};
        Object.keys(credentials).forEach(field => {
            const fieldErrors = validateField(field, credentials[field]);
            if (fieldErrors[field]) {
                errors[field] = fieldErrors[field];
            }
        });

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        console.log('Form submitted with credentials:', credentials);
        await handleAuth(credentials);
    };

    const formFields = [
        {
            name: 'username',
            label: 'Username',
            type: 'text',
            required: true,
            pattern: '^[a-z][a-z0-9_.-]*$',
            minLength: 3,
            maxLength: 20,
            feedback: validationErrors.username
        },
        ...(isSignUp ? [{
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            feedback: validationErrors.email
        }] : []),
        {
            name: 'password',
            label: 'Password',
            type: 'password',
            required: true,
            minLength: 6,
            maxLength: 20,
            feedback: validationErrors.password
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

                {formFields.map(({ name, label, type, required, pattern, minLength, maxLength, feedback }) => (
                    <Form.Group key={name} className="mb-3">
                        <Form.Label className="text-light text-start w-100">{label}</Form.Label>
                        <Form.Control
                            className={`bg-dark text-light border-secondary ${feedback ? 'is-invalid' : ''}`}
                            type={type}
                            name={name}
                            value={credentials[name]}
                            onChange={handleChange}
                            required={required}
                            disabled={isLoading}
                            pattern={pattern}
                            minLength={minLength}
                            maxLength={maxLength}
                        />
                        {feedback && (
                            <Form.Control.Feedback type="invalid" className="text-danger">
                                {feedback}
                            </Form.Control.Feedback>
                        )}
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
