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

        try {
            const finalCredentials = {
                ...credentials,
                newPassword: credentials.newPassword || credentials.currentPassword
            };

            const authResponse = await api.post(AUTH.SIGNIN, {
                username: localStorage.getItem("username"),
                password: credentials.currentPassword
            });

            console.log(deleteFlag);

            if (authResponse.data?.data?.token && authResponse.data?.data?.user?.id) {
                if (!deleteFlag) {
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
                } else {
                    try {
                        console.log({ password: finalCredentials.currentPassword })
                        const deleteResponse = await api.delete(USERS.DELETE, { data: { password: finalCredentials.currentPassword } });
                        console.log(deleteResponse)
                        localStorage.removeItem("token");
                        localStorage.removeItem("username");
                        localStorage.removeItem("email");
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
                        <Button variant="danger"
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
                                'Delete Prifile'
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
