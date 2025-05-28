import { ListGroup, Spinner } from 'react-bootstrap';
import { useState, useEffect, useCallback } from 'react';
import api from '../../../../api/config';
import { CHATS } from '../../../../api/routes';
import DeleteButton from '../../../controls/DeleteButton';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import { useChatsWebSocket } from '../../../../hooks/useChatsWebSocket';
import Alert from '../../../../components/controls/Alert';

const ChatsList = ({ onDisplaySelect }) => {
    const { error, handleError, clearError } = useErrorHandler();
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentChatId, setCurrentChatId] = useState(null);

    const { error: wsError, clearError: clearWsError } = useChatsWebSocket(
        useCallback((contactUpdate) => {
            const { action, ...chatData } = contactUpdate;

            setChatList((prev) => {
                if (action === 'DELETE') {
                    if (chatData.id === currentChatId) {
                        onDisplaySelect(null, false);
                        setCurrentChatId(null);
                    }
                    return prev.filter(chat => chat.id !== chatData.id);
                } else if (action === 'CREATE') {
                    return [...prev, chatData];
                }
                return prev;
            });
        }, [onDisplaySelect, currentChatId])
    );

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await api.get(CHATS.LIST);
                setChatList(response.data?.data?.chats || []);
            } catch (err) {
                handleError(err, 'DANGER');
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [handleError]);

    const handleChatClick = (chatId) => {
        setCurrentChatId(chatId);
        onDisplaySelect(chatId, true);
    };

    if (loading) return <Spinner animation="border" />;

    if (!chatList.length) return <div className="text-info">No chats.</div>;

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
                    {chatList.map((chat) => (
                        <ListGroup.Item
                            key={chat.id}
                            action
                            onClick={() => handleChatClick(chat.id)}
                            className="bg-body-tertiary hover-border text-start"
                        >
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
