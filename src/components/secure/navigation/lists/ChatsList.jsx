import { ListGroup, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import api from '../../../../api/config';
import { CHATS } from '../../../../api/routes';

const ChatsList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await api.get(CHATS.LIST);
                setChats(response.data);
            } catch (err) {
                console.error('Error while fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    const handleChatClick = (chatId) => {
        console.log("Clicked chat:", chatId);
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (!chats.data.chats.length) {
        return <div className="text-info">No chats.</div>;
    }


    return (
        <div className="list-parent">
            <div className="list">
                <ListGroup>
                    {chats.data.chats.map((chat) => (
                        <ListGroup.Item
                            key={chat.id}
                            action
                            onClick={() => handleChatClick(chat.id)}
                            className="bg-body-secondary hover-border text-start">
                            {chat.name}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default ChatsList;
