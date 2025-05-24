import { ListGroup, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import api from '../../../../api/config';
import { CHATS } from '../../../../api/routes';
import DeleteButton from './../../../controls/DeleteButton'
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import Alert from '../../../../components/controls/Alert';

const ChatsList = ({ onDisplaySelect }) => {
    const { error, handleError, clearError } = useErrorHandler();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await api.get(CHATS.LIST);
                setChats(response.data);
            } catch (err) {
                handleError(err, 'DANGER');
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [handleError]);

    const handleChatClick = (chatId) => {
        onDisplaySelect(chatId, true);
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (!chats.data.chats.length) {
        return <div className="text-info">No chats.</div>;
    }
    /*
        const handleDeleteClick = async (chatId) => {
            try {
                // eslint-disable-next-line no-unused-vars
                const response = await api.delete(CHATS.DELETE(chatId));
                setChats(prevChats => ({
                    ...prevChats,
                    data: {
                        ...prevChats.data,
                        chats: prevChats.data.chats.filter(chat => chat.id !== chatId)
                    }
                }));
            } catch (err) {
                handleError(err, 'DANGER');
            }
        };*/

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
                    {chats.data.chats.map((chat) => (
                        <ListGroup.Item
                            key={chat.id}
                            action
                            onClick={() => handleChatClick(chat.id)}
                            className="bg-body-secondary hover-border text-start">
                            <div className="d-flex justify-content-between">
                                {chat.name}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default ChatsList;
