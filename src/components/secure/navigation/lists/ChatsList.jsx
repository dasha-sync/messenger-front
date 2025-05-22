import { ListGroup } from 'react-bootstrap';

const ChatsList = () => {
    const mockData = {
        chats: [
            { id: 1, name: 'Чат с Алисой' },
            { id: 2, name: 'Чат с Бобом' },
            { id: 3, name: 'Чат с Карлом' },
        ],
    };

    const handleChatClick = (chatId) => {
        console.log("Clicked chat:", chatId);
        // тут можно сделать переход или открыть чат
    };

    return (
        <ListGroup>
            {mockData.chats.map((chat) => (
                <ListGroup.Item key={chat.id} action
                    onClick={() => handleChatClick(chat.id)}
                    className="bg-body-secondary hover-border text-start">{chat.name}</ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default ChatsList;
