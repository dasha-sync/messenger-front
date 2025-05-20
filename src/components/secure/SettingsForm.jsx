import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../api/config';
import { AUTH, USERS } from '../../api/routes';
import './SettingsForm.css';


const SettingsForm = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        email: '',
        newPassword: '',
        currentPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Load initial values from localStorage
    useEffect(() => {
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('email');
        if (username && email) {
            setCredentials(prev => ({
                ...prev,
                username,
                email
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            const finalCredentials = {
                ...credentials,
                newPassword: credentials.newPassword || credentials.currentPassword
            };

            const authResponse = await api.post(AUTH.SIGNIN, {
                username: localStorage.getItem("username"),
                password: credentials.currentPassword
            });

            if (authResponse.data?.data?.token && authResponse.data?.data?.user?.id) {
                const userId = authResponse.data.data.user.id;

                try {
                    const updateResponse = await api.patch(USERS.UPDATE(userId), finalCredentials);

                    if (updateResponse.data?.data?.token) {
                        console.log(updateResponse.data.data.token)
                        localStorage.setItem('token', updateResponse.data.data.token);
                        localStorage.setItem('username', updateResponse.data.data.user.username);
                        localStorage.setItem('email', updateResponse.data.data.user.email);
                        navigate('/settings');
                    }
                } catch (updateError) {
                    handleError(updateError)
                }
            }
        } catch (err) {
            handleError(err)
        } finally {
            setIsLoading(false);
            setShowPasswordModal(false);
        }
    };

    const handleError = (err) => {
        if (err.code === 'ECONNABORTED') {
            setError('Connection timeout. Please try again.');
        } else if (err.response?.data?.errors) {
            const errors = err.response.data.errors;
            const errorMessages = Object.entries(errors)
                // eslint-disable-next-line no-unused-vars
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

    return (
        <>
            <Container className="mt-5">
                <Form onSubmit={handleSubmit} className="mx-auto bg-dark text-light p-4 rounded" style={{ maxWidth: '400px' }}>
                    <h2 className="mb-4 text-light">Update Profile</h2>
                    {error && <div className="text-danger mb-3 text-start w-100" style={{ whiteSpace: 'pre-line' }}>{error}</div>}

                    <Form.Group className="mb-3">
                        <Form.Label className="text-light text-start w-100">Username</Form.Label>
                        <Form.Control
                            className="bg-dark text-light border-secondary"
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="text-light text-start w-100">Email</Form.Label>
                        <Form.Control
                            className="bg-dark text-light border-secondary"
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="text-light text-start w-100">New Password (optional)</Form.Label>
                        <Form.Control
                            className="bg-dark text-light border-secondary"
                            type="password"
                            name="newPassword"
                            value={credentials.newPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
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
                                className="bg-dark text-light border-secondary"
                            />
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
