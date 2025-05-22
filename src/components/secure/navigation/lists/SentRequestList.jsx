import { ListGroup } from 'react-bootstrap';

const SentRequestList = () => {
    const mockData = {
        sentRequests: [
            { id: 1, to: 'dave@example.com' },
            { id: 2, to: 'eve@example.com' },
            { id: 3, to: 'frank@example.com' },
        ],
    };

    const handleChatClick = (chatId) => {
        console.log("Clicked chat:", chatId);
        // тут можно сделать переход или открыть чат
    };

    return (
        <ListGroup>
            {mockData.sentRequests.map((req) => (
                <ListGroup.Item key={req.id} action
                    onClick={() => handleChatClick(req.id)}
                    className="bg-body-secondary hover-border text-start">
                    Отправлено: {req.to}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default SentRequestList;
