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

    const sendContactRequest = () => {

    }

    const approove = () => {

    }

    const reject = () => {

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
                    <div className="mb-4">
                        <div className="card bg-light-subtle">
                            <div className="card-body d-flex user-card">
                                <div className="card-text">
                                    <label className="text-muted small">Username</label>
                                    <div className="fw-bold">{user.username}</div>
                                </div>
                                <div className="card-text">
                                    <label className="text-muted small">Email</label>
                                    <div className="fw-bold">{user.email}</div>
                                </div>
                            </div>
                            <div className="d-flex">
                                {relations.hasChat ? (
                                    <div>
                                        <button type="button" size="lg" className="btn btn-outline-secondary" onClick={goToDialog}>
                                            Go to dialog
                                        </button>
                                        <button type="button" size="lg" className="btn btn-outline-secondary" onClick={deleteDialog}>
                                            Delete dialog
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" size="lg" className="btn btn-outline-secondary" onClick={startDialog}>
                                        Start dialog
                                    </button>
                                )}
                                {relations.hasContact ? (
                                    <button type="button" size="lg" className="btn btn-outline-secondary" onClick={deleteContact}>
                                        Delete contact
                                    </button>
                                )
                                    : relations.hasOutgoingRequest ? (
                                        <button type="button" size="lg" className="btn btn-outline-secondary" onClick={deleteOutgoingRequest}>
                                            Delete outgoing request
                                        </button>
                                    ) : (
                                        <button type="button" size="lg" className="btn btn-outline-secondary" onClick={sendContactRequest}>
                                            Send contact request
                                        </button>
                                    )}
                                {relations.hasIncomingRequest ? (
                                    <div className="btn-group btn-group-sm" role="group">
                                        <button type="button" className="btn btn-request btn-outline-warning" onClick={approove}>Approve</button>
                                        <button type="button" className="btn btn-request btn-outline-info" onClick={reject}>Reject</button>
                                    </div>
                                ) : (<div></div>)}
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
