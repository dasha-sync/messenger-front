import { useEffect, useState, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../../../api/config';
import { CHATS, MESSAGES } from '../../../api/routes';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import Alert from '../../controls/Alert';
import './ChatDisplay.css';

const ChatDisplay = ({ chatId }) => {
    const { error, handleError, clearError } = useErrorHandler();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatInfo, setChatInfo] = useState(null);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchChatData = async () => {
            try {
                if (chatId) {
                    setLoading(true);
                    // Fetch chat info
                    const chatResponse = await api.get(CHATS.GET_BY_ID(chatId));
                    setChatInfo(chatResponse.data.data);

                    // Fetch messages
                    const messagesResponse = await api.get(MESSAGES.LIST(chatId));
                    setMessages(messagesResponse.data.data);
                }
            } catch (err) {
                handleError(err, 'DANGER');
            } finally {
                setLoading(false);
            }
        };

        fetchChatData();
    }, [chatId, handleError]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await api.post(MESSAGES.CREATE(chatId), {
                text: newMessage
            });
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (err) {
            handleError(err, 'DANGER');
        }
    };

    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(message => {
            const date = new Date(message.createdAt);
            const dateKey = date.toLocaleDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
        });
        return groups;
    };

    const formatMessageTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateHeader = (dateString) => {
        const today = new Date();
        const messageDate = new Date(dateString);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return messageDate.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!chatId) {
        return (
            <div className="chat-container bg-body-tertiary border rounded-3 ms-3">
                {error && (
                    <Alert
                        message={error.message}
                        status={error.status}
                        onClose={clearError}
                    />
                )}
                <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-muted">Select a chat to start messaging</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="chat-container bg-body-tertiary border rounded-3 ms-3 d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container bg-body-tertiary border rounded-3 ms-3 d-flex flex-column">
            {error && (
                <Alert
                    message={error.message}
                    status={error.status}
                    onClose={clearError}
                />
            )}

            {/* Chat header */}
            <div className="p-3 border-bottom">
                <h5 className="mb-0">{chatInfo?.name || 'Chat'}</h5>
            </div>

            {/* Messages area */}
            <div className="messages-area flex-grow-1 p-3 overflow-auto">
                {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                    <div key={date} className="message-group d-flex flex-column  mb-4">
                        <div className="date-header d-flex justify-content-center text-center mb-3">
                            <span className="date-badge badge px-3 py-1">
                                {formatDateHeader(date)}
                            </span>
                        </div>
                        {dateMessages.map((message) => (
                            <div
                                key={message.id}
                                className={`message mb-3 ${message.username === localStorage.getItem("username")
                                    ? 'message-own'
                                    : 'message-other'
                                    }`}
                            >
                                <div className={`d-flex flex-column ${message.username === localStorage.getItem("username")
                                    ? 'align-items-end'
                                    : 'align-items-start'
                                    }`}>
                                    <div className=" small text-muted mb-1 mx-2">
                                        {message.username}
                                    </div>
                                    <div className="align-items-start message-content p-2 rounded text-left">

                                        <div className="message-text">{message.text}</div>
                                        <div className="message-time small text-muted text-end">
                                            {formatMessageTime(message.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input form */}
            <div className="message-input-area p-3 border-top">
                <Form onSubmit={handleSendMessage} className="d-flex gap-2 ">
                    <Form.Control
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow-1 bg-body-tertiary"
                    />
                    <Button type="submit" variant="primary">
                        Send
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default ChatDisplay;
