import { ListGroup, Spinner } from 'react-bootstrap';
import { useState, useEffect, useCallback } from 'react';
import api from '../../../../api/config';
import { REQUESTS } from '../../../../api/routes';
import DeleteButton from './../../../controls/DeleteButton'
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import Alert from '../../../../components/controls/Alert';
import { useSentRequestsWebSocket } from '../../../../hooks/useSentRequestsWebSocket';

const SentRequestList = ({ onDisplaySelect }) => {
    const { error, handleError, clearError } = useErrorHandler();
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const { error: wsError, clearError: clearWsError } = useSentRequestsWebSocket(
        useCallback((senetRequestsUpdate) => {
            const { action, ...sentRequestsData } = senetRequestsUpdate;

            setOutgoingRequests((prev) => {
                if (action === 'DELETE') {
                    return prev.filter(sentRequests => sentRequests.id !== sentRequestsData.id);
                } else if (action === 'CREATE') {
                    return [...prev, sentRequestsData];
                }
                return prev;
            });
        }, [])
    );

    useEffect(() => {
        const fetchOutgoingRequests = async () => {
            try {
                const response = await api.get(REQUESTS.USER_REQUESTS);
                setOutgoingRequests(response.data?.data || []);
            } catch (err) {
                handleError(err, 'DANGER');
            } finally {
                setLoading(false);
            }
        };

        fetchOutgoingRequests();
    }, []);

    const handleUserClick = (userId) => {
        onDisplaySelect(userId, false)
    };

    if (loading) return <Spinner animation="border" />;

    if (!outgoingRequests.length) return <div className="text-info">No outgoing requests</div>;

    const handleDeleteClick = async (requestId) => {
        try {
            const response = await api.delete(REQUESTS.DELETE(requestId));
            handleError(response.data?.data, 'SUCCESS');
        } catch (err) {
            handleError(err, 'DANGER');
        }
    };

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
                    {outgoingRequests.map((req) => (
                        <ListGroup.Item
                            key={req.id}
                            action
                            onClick={() => handleUserClick(req.to)}
                            className="bg-body-tertiary hover-border text-start">
                            <div className="d-flex justify-content-between">
                                {req.toUsername}
                                <DeleteButton onClick={() => handleDeleteClick(req.id)} />
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default SentRequestList;
