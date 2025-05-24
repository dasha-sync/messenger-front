import { ListGroup, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import api from '../../../../api/config';
import { REQUESTS } from '../../../../api/routes';
import DeleteButton from './../../../controls/DeleteButton'
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import Alert from '../../../../components/controls/Alert';

const SentRequestList = ({ onDisplaySelect }) => {
    const { error, handleError, clearError } = useErrorHandler();
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOutgoingRequests = async () => {
            try {
                const response = await api.get(REQUESTS.USER_REQUESTS);
                setOutgoingRequests(response.data);
            } catch (err) {
                handleError(err, 'DANGER');
            } finally {
                setLoading(false);
            }
        };

        fetchOutgoingRequests();
    }, [handleError]);

    const handleUserClick = (userId) => {
        onDisplaySelect(userId, false)
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (!outgoingRequests.data.length) {
        return <div className="text-info">No outgoing requests</div>;
    }

    const handleDeleteClick = async (requestId) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await api.delete(REQUESTS.DELETE(requestId));
            setOutgoingRequests(prevRequests => ({
                ...prevRequests,
                data: prevRequests.data.filter(request => request.id !== requestId)
            }));
        } catch (err) {
            handleError(err, 'DANGER');
        }
    };

    return (
        <div className="list-parent">
            {error && (
                <Alert
                    message={error.message}
                    status={error.status}
                    onClose={clearError}
                />
            )}
            <div className="list">
                <ListGroup>
                    {outgoingRequests.data.map((req) => (
                        <ListGroup.Item
                            key={req.id}
                            action
                            onClick={() => handleUserClick(req.to)}
                            className="bg-body-secondary hover-border text-start">
                            <div className="d-flex justify-content-between">
                                {req.toUsername}
                                <DeleteButton onClick={() => handleDeleteClick(req.to)} />
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default SentRequestList;
