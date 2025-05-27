import { useEffect, useState, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import SockJS from 'sockjs-client';
import api from '../../../api/config';
import { CHATS, MESSAGES, USERS } from '../../../api/routes';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import Alert from '../../controls/Alert';
import './ChatDisplay.css';
import { Client } from '@stomp/stompjs';

const ChatDisplay = ({ chatId, onDisplaySelect }) => {
    const [stompClient, setStompClient] = useState(null);
    const { error, handleError, clearError } = useErrorHandler();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatInfo, setChatInfo] = useState(null);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

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

    useEffect(() => {
        if (!chatId) return;

        const socket = new SockJS('/ws');
        const stomp = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                // The token is automatically sent in cookies
            },
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stomp.onConnect = () => {
            console.log('Connected to WebSocket');
            // Subscribe to the chat's message topic
            stomp.subscribe(`/topic/chats/${chatId}/messages`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                handleIncomingMessage(receivedMessage);
            });
        };

        stomp.onStompError = (frame) => {
            console.error('STOMP error:', frame);
            handleError(new Error('WebSocket connection error'), 'DANGER');
        };

        stomp.activate();
        setStompClient(stomp);

        // Cleanup on unmount
        return () => {
            if (stomp.connected) {
                stomp.deactivate();
            }
        };
    }, [chatId, handleError]);

    const handleIncomingMessage = (message) => {
        setMessages(prev => {
            // Handle different message types
            switch (message.type) {
                case 'CREATE':
                    return [...prev, message];
                case 'UPDATE':
                    return prev.map(msg => msg.id === message.id ? message : msg);
                case 'DELETE':
                    return prev.filter(msg => msg.id !== message.id);
                default:
                    return prev;
            }
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !stompClient?.connected) return;

        try {
            stompClient.publish({
                destination: `/app/chats/${chatId}/messages/create`,
                body: JSON.stringify({ text: newMessage })
            });
            setNewMessage('');
        } catch (err) {
            handleError(err, 'DANGER');
        }
    };

    const handleUpdateMessage = async (messageId, newText) => {
        if (!stompClient?.connected) return;

        try {
            stompClient.publish({
                destination: `/app/chats/${chatId}/messages/${messageId}/update`,
                body: JSON.stringify({ text: newText })
            });
        } catch (err) {
            handleError(err, 'DANGER');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!stompClient?.connected) return;

        try {
            stompClient.publish({
                destination: `/app/chats/${chatId}/messages/${messageId}/destroy`
            });
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

    const goToUser = async (chatName) => {
        var id = false;
        try {
            const response = await api.post(USERS.LIST, {
                username: chatName,
                email: ""
            });
            id = response.data.data.at(0).id
        } catch (err) {
            handleError(err, 'DANGER');
        }
        onDisplaySelect(id, false);
    }


    if (!chatId) {
        return (
            <div className="bg-body-tertiary border rounded-3 ms-3">
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
            <div className="display-chat ms-3 justify-content-center align-items-center">
                <div className="bg-body-tertiary border rounded-3 ms-3 d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }


    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setIsActive(false);
    };
    const handleMouseDown = () => setIsActive(true);
    const handleMouseUp = () => setIsActive(false);
    const iconClass = isActive ? "bi-send" : isHovered ? "bi-send-fill" : "bi-send";



    return (
        <div className="display-chat ms-3 justify-content-center align-items-center">
            <div className="chat-container bg-body-tertiary border rounded-3 d-flex flex-column">
                {error && (
                    <Alert
                        message={error.message}
                        status={error.status}
                        onClose={clearError}
                    />
                )}

                {/* Chat header */}
                <div className="p-2 border-bottom d-flex justify-content-start">
                    <h5 className="mb-0 btn btn-outline-warning" onClick={() => { goToUser(chatInfo?.name || 'Chat') }}>{chatInfo?.name || 'Chat'}</h5>
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
                                    className={`message mb-3 ${message.username === sessionStorage.getItem("username")
                                        ? 'message-own'
                                        : 'message-other'
                                        }`}
                                >
                                    <div className={`d-flex flex-column ${message.username === sessionStorage.getItem("username")
                                        ? 'align-items-end'
                                        : 'align-items-start'
                                        }`}>
                                        <div className=" small text-muted mb-1 mx-2">
                                            {message.username}
                                        </div>
                                        <div className="align-items-start message-content p-2 rounded text-left">
                                            {message.username === sessionStorage.getItem("username") && (
                                                <div className="message-actions">
                                                    <button
                                                        className="btn btn-sm btn-link"
                                                        onClick={() => handleUpdateMessage(message.id, prompt('Edit message:', message.text))}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-link text-danger"
                                                        onClick={() => handleDeleteMessage(message.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            )}
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
                        <Button
                            type="submit"
                            className="btn-icon"
                            variant="primary"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}>
                            <i className={`bi ${iconClass}`}></i>
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ChatDisplay;
