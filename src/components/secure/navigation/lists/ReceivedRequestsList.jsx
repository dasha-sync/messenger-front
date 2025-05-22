import { ListGroup, Spinner } from 'react-bootstrap';
import api from '../../../../api/config';
import { REQUESTS } from '../../../../api/routes';
import { useState } from 'react';

const ReceivedRequestsList = ({ incomingRequests, loading }) => {
    const [error, setError] = useState(null);

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (!incomingRequests.length) {
        return <div className="text-info">No incoming requests</div>;
    }

    const handleApproveClick = async (reqId) => {
        try {
            const response = await api.post(REQUESTS.APPROVE(reqId));
            console.log(response.data)
        } catch (err) {
            console.error('Error while fetching outgoing requests:', err);
            setError('Error loading data');
        }
    }

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    const handleRejectClick = async (reqId) => {
        try {
            const response = await api.post(REQUESTS.REJECT(reqId));
            console.log(response.data)
        } catch (err) {
            console.error('Error while fetching outgoing requests:', err);
            setError('Error loading data');
        }
    }

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    return (
        <div className="list-parent">
            <div className="list">
                <ListGroup>
                    {incomingRequests.map((req) => (
                        <ListGroup.Item key={req.id} className="bg-body-secondary hover-border text-start">
                            <div className="d-flex justify-content-between">
                                <div>{req.fromUsername}</div>
                                <div className="btn-group btn-group-sm" role="group">
                                    <button type="button" className="btn btn-outline-warning" onClick={() => handleApproveClick(req.id)}>Approve</button>
                                    <button type="button" className="btn btn-outline-info" onClick={() => handleRejectClick(req.id)}>Reject</button>
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
