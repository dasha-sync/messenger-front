import { ListGroup, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import api from '../../../../api/config';
import { REQUESTS } from '../../../../api/routes';

const SentRequestList = () => {
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOutgoingRequests = async () => {
            try {
                const response = await api.get(REQUESTS.USER_REQUESTS);
                setOutgoingRequests(response.data);
            } catch (err) {
                console.error('Error while fetching outgoing requests:', err);
                setError('Error loading data');
            } finally {
                setLoading(false);
            }
        };

        fetchOutgoingRequests();
    }, []);

    const handleChatClick = (chatId) => {
        console.log("Clicked chat:", chatId);
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    if (!outgoingRequests.data.length) {
        return <div className="text-info">No outgoing requests</div>;
    }

    return (
        <div className="list-parent">
            <div className="list">
                <ListGroup>
                    {outgoingRequests.data.map((req) => (
                        <ListGroup.Item key={req.id} action
                            onClick={() => handleChatClick(req.id)}
                            className="bg-body-secondary hover-border text-start">
                            {req.toUsername}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default SentRequestList;
