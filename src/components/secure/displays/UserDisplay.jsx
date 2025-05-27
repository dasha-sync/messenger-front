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
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (userId) {
                    const userResponse = await api.get(USERS.GET_BY_ID(userId))
                    setUser(userResponse.data.data)
                    const relationsResponse = await api.get(USERS.RELATIONS(userId))
                    setRelations(relationsResponse.data.data)
                }
            } catch (err) {
                handleError(err, 'DANGER');
            }
        };
        fetchData();
    }, [userId, handleError, refreshTrigger]);

    if (!userId) {
        return (
            <div className="empty-container bg-transparent border rounded-3 ms-3 p-4">
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
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const startDialog = async () => {
        try {
            const response = await api.post(CHATS.CREATE, { username: user.username })
            handleError(response, 'SUCCESS')
            onDisplaySelect(response.data.data.id, true);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const deleteContact = async () => {
        try {
            const response = await api.delete(CONTACTS.DELETE(relations.hasContact))
            handleError(response, 'SUCCESS')
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const deleteOutgoingRequest = async () => {
        try {
            const response = await api.delete(REQUESTS.DELETE(relations.hasOutgoingRequest))
            handleError(response, 'SUCCESS')
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const sendContactRequest = async () => {
        try {
            const response = await api.post(REQUESTS.CREATE(user.id))
            handleError(response, 'SUCCESS')
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const approve = async () => {
        try {
            const response = await api.post(REQUESTS.APPROVE(relations.hasIncomingRequest))
            handleError(response, 'SUCCESS')
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const reject = async () => {
        try {
            const response = await api.post(REQUESTS.REJECT(relations.hasIncomingRequest))
            handleError(response, 'SUCCESS')
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    return (
        <div className="user-dispay bg-transparent ms-3">
            {error && (
                <Alert
                    message={error.message}
                    status={error.status}
                    onClose={clearError}
                />
            )}

            {user ? (
                <div className="user-profile">
                    <div className="mb-4 card bg-body-tertiary">
                        <div className="card-header bg-transparent">
                            <div className="d-flex justify-content-start align-items-end mb-1">
                                {relations.hasContact ? (
                                    <h3 className="mb-0">Contact profile</h3>
                                ) : (
                                    <h3 className="mb-0">User profile</h3>
                                )}
                                {relations.hasChat ? (
                                    <button type="button" className="btn btn-outline-info mx-3" onClick={goToDialog}>
                                        Go to chat
                                    </button>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </div>
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

                        </div>
                    </div>

                    {/* Actions Card */}
                    <div className="card bg-body-tertiary">
                        <div className="card-header bg-transparent d-flex justify-content-start  align-items-end mb-1">
                            <h5 className="mb-0">Actions Menu</h5>
                        </div>
                        <div className="card-body">
                            {/* Chat Actions */}
                            {/* Contact Actions */}
                            <div className="">
                                {relations.hasChat ? (
                                    <></>
                                ) : (
                                    <div className="d-flex justify-content-start align-items-center mb-3">
                                        Start the conversation?
                                        <button type="button" className="btn btn-outline-info mx-3" onClick={startDialog}>
                                            Create chat
                                        </button>
                                    </div>
                                )}
                                {relations.hasContact ? (
                                    <div className="d-flex justify-content-start align-items-center mb-3">
                                        Remove from contacts?
                                        <button type="button" className="btn btn-outline-danger mx-3" onClick={deleteContact}>
                                            Delete contact
                                        </button>
                                    </div>
                                ) : relations.hasOutgoingRequest ? (
                                    <div className="d-flex justify-content-start align-items-center mb-3">
                                        Changed your mind?
                                        <button type="button" className="btn mx-3 btn-outline-secondary btn-outline-danger" onClick={deleteOutgoingRequest}>
                                            Delete outgoing request
                                        </button>
                                    </div>
                                ) : relations.hasIncomingRequest ? (
                                    <div className="d-flex justify-content-start align-items-center mb-3">
                                        Contact request is waiting for your approval.
                                        <div className="d-flex gap-2 flex-wrap mx-3">
                                            <button type="button" className="btn btn-primary" onClick={approve}>Approve</button>
                                            <button type="button" className="btn btn-outline-info" onClick={reject}>Reject</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-start align-items-center mb-3">
                                        Add to contacts?
                                        <button type="button" className="btn btn-outline-info mx-3" onClick={sendContactRequest}>
                                            Send contact request
                                        </button>
                                    </div>
                                )}
                                {relations.hasChat ? (
                                    <div className="d-flex justify-content-start align-items-center mb-3">
                                        Conversation over?
                                        <button type="button" className="btn btn-outline-danger mx-3" onClick={deleteDialog}>
                                            Delete chat
                                        </button>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>


                        </div>
                    </div>
                </div >
            ) : (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
        </div >
    );
};

export default UserDisplay;
