import { useState, useEffect } from 'react';
import api from '../../../api/config';
import { USERS, CHATS, CONTACTS, REQUESTS } from '../../../api/routes';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import Alert from '../../controls/Alert';
import './Displays.css'

const UserDisplay = ({ userId, onDisplaySelect }) => {
    const { error, handleError, clearError } = useErrorHandler();
    const [user, setUser] = useState(null);
    const [relations, setRelations] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (userId) {
                    const userResponse = await api.get(USERS.GET_BY_ID(userId))
                    setUser(userResponse.data.data)
                    const relationsResponse = await api.get(USERS.RELATIONS(userId))
                    setRelations(relationsResponse.data.data)
                    console.log(relationsResponse)
                }
            } catch (err) {
                handleError(err, 'DANGER');
            }
        };
        fetchData();
    }, [userId, handleError]);

    if (!userId) {
        return (
            <div className="chat-container bg-body-tertiary border rounded-3 ms-3 p-4">
                {error && (
                    <Alert
                        message={error.message}
                        status={error.status}
                        onClose={clearError}
                    />
                )}
            </div>
        )
    }

    const goToDialog = () => {
        onDisplaySelect(relations.hasChat, true);
    }

    const deleteDialog = async () => {
        try {
            const response = await api.delete(CHATS.DELETE(relations.hasChat))
            handleError(response, 'SUCCESS')
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const startDialog = async () => {
        try {
            const response = await api.post(CHATS.CREATE, { username: user.username })
            handleError(response, 'SUCCESS')
            onDisplaySelect(response.data.data.id, true);
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const deleteContact = async () => {
        try {
            const response = await api.delete(CONTACTS.DELETE(relations.hasContact))
            handleError(response, 'SUCCESS')
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }
    const deleteOutgoingRequest = async () => {
        try {
            const response = await api.delete(REQUESTS.DELETE(relations.hasOutgoingRequest))
            handleError(response, 'SUCCESS')
        } catch (err) {
            handleError(err, 'DANGER');
        }

    }

    const sendContactRequest = async () => {
        try {
            const response = await api.post(REQUESTS.CREATE(user.id))
            handleError(response, 'SUCCESS')
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const approve = async () => {
        try {
            const response = await api.post(REQUESTS.APPROVE(relations.hasIncomingRequest))
            handleError(response, 'SUCCESS')
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const reject = async () => {
        try {
            const response = await api.post(REQUESTS.REJECT(relations.hasIncomingRequest))
            handleError(response, 'SUCCESS')
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    return (
        <div className="chat-container bg-body-tertiary border rounded-3 ms-3 p-4">
            {error && (
                <Alert
                    message={error.message}
                    status={error.status}
                    onClose={clearError}
                />
            )}

            {user ? (
                <div className="user-profile">
                    <div className="mb-4 card bg-light-subtle">
                        <div className="card-body ">
                            <div className="d-flex user-card">
                                <div className="card-text">
                                    <label className="text-muted small">Username</label>
                                    <div className="fw-bold">{user.username}</div>
                                </div>
                                <div className="card-text">
                                    <label className="text-muted small">Email</label>
                                    <div className="fw-bold">{user.email}</div>
                                </div>
                            </div>
                            <div className="d-flex flex-column user-actions">
                                {relations.hasChat ? (
                                    <div>
                                        <button type="button" size="lg" className="btn btn-outline-light mb-3" onClick={goToDialog}>
                                            Go to chat
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <button type="button" size="lg" className="btn btn-outline-secondary mb-3" onClick={startDialog}>
                                            Start chatting
                                        </button>
                                    </div>
                                )}
                                {relations.hasContact ? (
                                    <div>
                                        <button type="button" size="lg" className="btn btn-outline-danger mb-3" onClick={deleteContact}>
                                            Delete contact
                                        </button>
                                    </div>
                                ) : relations.hasOutgoingRequest ? (
                                    <div>
                                        <button type="button" size="lg" className="btn btn-outline-secondary btn-outline-danger mb-3" onClick={deleteOutgoingRequest}>
                                            Delete outgoing request
                                        </button>
                                    </div>
                                ) : relations.hasIncomingRequest ? (
                                    <div className="btn-group btn-group mb-3" role="group">
                                        <button type="button" className="btn btn-request btn-outline-warning" onClick={approve}>Approve</button>
                                        <button type="button" className="btn btn-request btn-outline-info" onClick={reject}>Reject</button>
                                    </div>
                                ) : (
                                    <div>
                                        <button type="button" size="lg" className="btn btn-outline-info" onClick={sendContactRequest}>
                                            Send contact request
                                        </button>
                                    </div>
                                )}
                                {relations.hasChat ? (
                                    <div>
                                        <button type="button" size="lg" className="btn btn-outline-danger mb-3" onClick={deleteDialog}>
                                            Delete chat
                                        </button>
                                    </div>
                                ) : (
                                    <div></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDisplay;
