import { ListGroup, Spinner } from 'react-bootstrap';
import api from '../../../../api/config';
import { REQUESTS } from '../../../../api/routes';
import { useState, useCallback } from 'react';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import Alert from '../../../../components/controls/Alert';
import { useReceivedRequestsWebSocket } from '../../../../hooks/useReceivedRequestsWebSocket';

const ReceivedRequestsList = ({ incomingRequests, loading, onDisplaySelect }) => {
    const { error, handleError, clearError } = useErrorHandler();
    const [requests, setRequests] = useState(incomingRequests);

    const { error: wsError, clearError: clearWsError } = useReceivedRequestsWebSocket(
        useCallback((receivedRequestUpdate) => {
            const { action, ...receivedRequestData } = receivedRequestUpdate;

            setRequests((prev) => {
                if (action === 'DELETE') {
                    return prev.filter(request => request.id !== receivedRequestData.id);
                } else if (action === 'CREATE') {
                    return [...prev, receivedRequestData];
                }
                return prev;
            });
        }, [])
    );

    if (loading) return <Spinner animation="border" />;

    if (!incomingRequests.length) return <div className="text-info">No incoming requests</div>;

    const handleApproveClick = async (reqId) => {
        try {
            const response = await api.post(REQUESTS.APPROVE(reqId));
            setRequests(prevRequests => prevRequests.filter(request => request.id !== reqId));
            handleError(response.data, 'SUCCESS');
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const handleRejectClick = async (reqId) => {
        try {
            const response = await api.post(REQUESTS.REJECT(reqId));
            setRequests(prevRequests => prevRequests.filter(request => request.id !== reqId));
            handleError(response.data, 'SUCCESS');
        } catch (err) {
            handleError(err, 'DANGER');
        }
    }

    const handleUserClick = (userId) => onDisplaySelect(userId, false)

    return (
        <div className="list-parent">
            {(error || wsError) && (
                <Alert
                    message={(error || wsError).message}
                    status={(error || wsError).status}
                    onClose={() => {
                        clearError();
                        clearWsError();
                    }}
                />
            )}
            <div className="list">
                <ListGroup>
                    {requests.map((req) => (
                        <ListGroup.Item
                            key={req.id}
                            action
                            onClick={() => handleUserClick(req.from)}
                            className="bg-body-tertiary hover-border text-start">
                            <div className="d-flex justify-content-between">
                                <div>{req.fromUsername}</div>
                                <div className="btn-group btn-group-sm" role="group">
                                    <a type="button" className="btn btn-request btn-primary" onClick={() => handleApproveClick(req.id)}>Approve</a>
                                    <a type="button" className="btn btn-request btn-outline-info" onClick={() => handleRejectClick(req.id)}>Reject</a>
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default ReceivedRequestsList;
