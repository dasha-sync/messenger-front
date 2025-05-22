import { ListGroup } from 'react-bootstrap';

const ReceivedRequestsList = () => {
    const mockData = {
        receivedRequests: [
            { id: 1, from: 'grace@example.com' },
            { id: 2, from: 'heidi@example.com' },
            { id: 3, from: 'ivan@example.com' },
        ],
    };

    const handleChatClick = (chatId) => {
        console.log("Clicked chat:", chatId);
        // тут можно сделать переход или открыть чат
    };

    return (
        <ListGroup>
            {mockData.receivedRequests.map((req) => (
                <ListGroup.Item key={req.id} action
                    onClick={() => handleChatClick(req.id)}
                    className="bg-body-secondary text-start">
                    Получено от: {req.from}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default ReceivedRequestsList;
