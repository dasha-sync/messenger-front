import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/config';
import { AUTH, USERS } from '../../../api/routes';
import './SettingsForm.css';
import Alert from './../../controls/Alert'
import { useErrorHandler } from './../../../hooks/useErrorHandler';


const SettingsForm = () => {
    const navigate = useNavigate();
    const { error, handleError, clearError } = useErrorHandler();
    const [credentials, setCredentials] = useState({
        username: '',
        email: '',
        newPassword: '',
        currentPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [deleteFlag, setDeleteFlag] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Load initial values from localStorage
    useEffect(() => {
        const username = sessionStorage.getItem("username");
        const email = sessionStorage.getItem("email");
        if (username && email) {
            setCredentials(prev => ({
                ...prev,
                username,
                email
            }));
        }
    }, []);

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
                if (!value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
                    errors.email = "Non correct email format";
                }
                break;
            case 'newPassword':
                if (value && (value.length < 6 || value.length > 20)) {
                    errors.newPassword = "Password must contain 6 - 20 symbols";
                }
                break;
            case 'currentPassword':
                if (value.length < 6 || value.length > 20) {
                    errors.currentPassword = "Password must contain 6 - 20 symbols";
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
            if (field !== 'currentPassword') { // Don't validate current password here
                const fieldErrors = validateField(field, credentials[field]);
                if (fieldErrors[field]) {
                    errors[field] = fieldErrors[field];
                }
            }
        });

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async () => {
        // Validate current password before submission
        const passwordErrors = validateField('currentPassword', credentials.currentPassword);
        if (passwordErrors.currentPassword) {
            setValidationErrors(prev => ({
                ...prev,
                currentPassword: passwordErrors.currentPassword
            }));
            return;
        }

        setIsLoading(true);

        try {
            const finalCredentials = {
                ...credentials,
                newPassword: credentials.newPassword || credentials.currentPassword
            };

            const authResponse = await api.post(AUTH.SIGNIN, {
                username: sessionStorage.getItem("username"),
                password: credentials.currentPassword
            });

            if (authResponse.data?.data?.token && authResponse.data?.data?.user?.id) {
                if (!deleteFlag) {
                    try {
                        const updateResponse = await api.patch(USERS.UPDATE, finalCredentials);

                        if (updateResponse.data?.data?.token) {
                            handleError(updateResponse.data, 'SUCCESS');
                            sessionStorage.clear();
                            localStorage.clear();
                            document.cookie.split(";").forEach(cookie => {
                                const [name] = cookie.split("=");
                                document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                            });
                            navigate('/welcome');
                            navigate('/settings');
                        }
                    } catch (updateError) {
                        handleError(updateError)
                    }
                } else {
                    try {
                        const deleteResponse = await api.delete(USERS.DELETE, { data: { password: finalCredentials.currentPassword } });
                        handleError(deleteResponse.data, 'SUCCESS');
                        sessionStorage.removeItem("username");
                        sessionStorage.removeItem("email");
                        navigate('/');
                    } catch (updateError) {
                        handleError(updateError)
                    }
                }
            }
        } catch (err) {
            handleError(err)
        } finally {
            setIsLoading(false);
            setShowPasswordModal(false);
            setCredentials(prev => ({ ...prev, currentPassword: '' }));
        }
    };

    return (
        <>
            <Container>
                <Form onSubmit={handleSubmit} className="mx-auto bg-dark text-light p-4 rounded" style={{ maxWidth: '400px' }}>
                    <h2 className="mb-4 text-light centerize-form">Update Profile</h2>
                    {error && (
                        <Alert
                            message={error.message}
                            status={error.status}
                            onClose={clearError}
                        />
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="text-light text-start w-100">Username</Form.Label>
                        <Form.Control
                            className={`bg-dark text-light border-secondary ${validationErrors.username ? 'is-invalid' : ''}`}
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            pattern="^[a-z][a-z0-9_.-]*$"
                            minLength={3}
                            maxLength={20}
                        />
                        {validationErrors.username && (
                            <Form.Control.Feedback type="invalid" className="text-danger">
                                {validationErrors.username}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="text-light text-start w-100">Email</Form.Label>
                        <Form.Control
                            className={`bg-dark text-light border-secondary ${validationErrors.email ? 'is-invalid' : ''}`}
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        {validationErrors.email && (
                            <Form.Control.Feedback type="invalid" className="text-danger">
                                {validationErrors.email}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="text-light text-start w-100">New Password (optional)</Form.Label>
                        <Form.Control
                            className={`bg-dark text-light border-secondary ${validationErrors.newPassword ? 'is-invalid' : ''}`}
                            type="password"
                            name="newPassword"
                            value={credentials.newPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                            minLength={6}
                            maxLength={20}
                        />
                        {validationErrors.newPassword && (
                            <Form.Control.Feedback type="invalid" className="text-danger">
                                {validationErrors.newPassword}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>

                    <div className="d-flex gap-2 justify-content-center">
                        <Button variant="outline-light" onClick={() => navigate('/')} disabled={isLoading}>
                            Back
                        </Button>
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Updating...
                                </>
                            ) : (
                                'Update Profile'
                            )}
                        </Button>
                        <Button variant="outline-danger"
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                                setDeleteFlag(true);
                                setShowPasswordModal(true);
                            }}>
                            {isLoading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Profile'
                            )}
                        </Button>
                    </div>
                </Form>
            </Container>

            {/* Password Confirmation Modal */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton className="bg-dark border-secondary text-light">
                    <Modal.Title className="bg-dark">Confirm Current Password</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-light border-secondary">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="currentPassword"
                                value={credentials.currentPassword}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className={`bg-dark text-light border-secondary ${validationErrors.currentPassword ? 'is-invalid' : ''}`}
                                minLength={6}
                                maxLength={20}
                            />
                            {validationErrors.currentPassword && (
                                <Form.Control.Feedback type="invalid" className="text-danger">
                                    {validationErrors.currentPassword}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="bg-dark text-light border-secondary">
                    <Button variant="outline-light" onClick={() => setShowPasswordModal(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handlePasswordSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Updating...
                            </>
                        ) : (
                            'Continue'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SettingsForm;
