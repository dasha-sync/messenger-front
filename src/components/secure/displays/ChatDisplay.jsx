import { useEffect, useState, useRef, useCallback } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import api from '../../../api/config';
import { CHATS, MESSAGES, USERS } from '../../../api/routes';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { useWebSocket } from '../../../hooks/useWebSocket';
import Alert from '../../controls/Alert';
import './ChatDisplay.css';

const ChatDisplay = ({ chatId, onDisplaySelect }) => {
    const { error, handleError, clearError } = useErrorHandler();
    const [messages, setMessages] = useState([]);
    const [chatInfo, setChatInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const messagesEndRef = useRef(null);

    const { publish, isConnected } = useWebSocket(chatId, useCallback((message) => {
        const updateMessages = {
            CREATE: () => setMessages(prev => [...prev, message]),
            UPDATE: () => setMessages(prev => prev.map(msg => msg.id === message.id ? message : msg)),
            DELETE: () => setMessages(prev => prev.filter(msg => msg.id !== message.id)),
        };
        updateMessages[message.action]?.();
    }, []));

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!chatId) return;

        const fetchChatData = async () => {
            setLoading(true);
            try {
                const [chatRes, msgRes] = await Promise.all([
                    api.get(CHATS.GET_BY_ID(chatId)),
                    api.get(MESSAGES.LIST(chatId))
                ]);
                setChatInfo(chatRes.data.data);
                setMessages(msgRes.data.data);
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
        if (!newMessage.trim() || !isConnected) return;

        try {
            publish(`/app/secured/chats/${chatId}/messages/create`, { text: newMessage });
            setNewMessage('');
        } catch (error) {
            handleError(error, 'DANGER');
        }
    };

    const handleUpdateMessage = async () => {
        if (!editedText.trim() || !isConnected || !editingMessage) return;

        try {
            publish(`/app/secured/chats/${chatId}/messages/${editingMessage.id}/update`, { newContent: editedText });
            setShowEditModal(false);
            setEditingMessage(null);
            setEditedText('');
        } catch (error) {
            handleError(error, 'DANGER');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!isConnected) return;

        try {
            publish(`/app/secured/chats/${chatId}/messages/${messageId}/destroy`);
        } catch (error) {
            handleError(error, 'DANGER');
        }
    };

    const openEditModal = (message) => {
        setEditingMessage(message);
        setEditedText(message.text);
        setShowEditModal(true);
    };

    const goToUser = async (chatName) => {
        try {
            const response = await api.post(USERS.LIST, { username: chatName, email: "" });
            const userId = response.data.data[0]?.id;
            if (userId) onDisplaySelect(userId, false);
        } catch (err) {
            handleError(err, 'DANGER');
        }
    };

    const groupMessagesByDate = (msgs) => {
        return msgs.reduce((groups, msg) => {
            const dateKey = new Date(msg.createdAt).toLocaleDateString();
            groups[dateKey] = [...(groups[dateKey] || []), msg];
            return groups;
        }, {});
    };

    const formatMessageTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const formatDateHeader = (dateStr) => {
        const today = new Date();
        const date = new Date(dateStr);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return date.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderMessages = () => {
        const grouped = groupMessagesByDate(messages);
        const username = sessionStorage.getItem("username");

        return Object.entries(grouped).map(([date, dateMessages]) => (
            <div key={date} className="message-group d-flex flex-column mb-4">
                <div className="date-header d-flex justify-content-center text-center mb-3">
                    <span className="date-badge badge px-3 py-1">{formatDateHeader(date)}</span>
                </div>
                {dateMessages.map((msg) => {
                    const isOwn = msg.username === username;
                    return (
                        <div key={msg.id} className={`message mb-3 ${isOwn ? 'message-own' : 'message-other'}`}>
                            <div className={`d-flex flex-column ${isOwn ? 'align-items-end' : 'align-items-start'}`}>
                                <div className="small text-muted mb-1 mx-2">{msg.username}</div>
                                <div className="message-content p-2 rounded text-left">
                                    {isOwn && (
                                        <div className="message-actions">
                                            <button className="btn btn-sm btn-link" onClick={() => openEditModal(msg)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteMessage(msg.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    )}
                                    <div className="message-text">{msg.text}</div>
                                    <div className="message-time small text-muted text-end">{formatMessageTime(msg.createdAt)}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ));
    };

    if (!chatId) {
        return (
            <div className="bg-body-tertiary border rounded-3 ms-3">
                {error && <Alert message={error.message} status={error.status} onClose={clearError} />}
                <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-muted">Select a chat to start messaging</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="display-chat ms-3 d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="display-chat ms-3">
            <div className="chat-container bg-body-tertiary border rounded-3 d-flex flex-column">
                {error && <Alert message={error.message} status={error.status} onClose={clearError} />}

                <div className="p-2 border-bottom d-flex justify-content-start">
                    <h5 className="mb-0 btn btn-outline-warning" onClick={() => goToUser(chatInfo?.name || 'Chat')}>
                        {chatInfo?.name || 'Chat'}
                    </h5>
                </div>

                <div className="messages-area flex-grow-1 p-3 overflow-auto">
                    {renderMessages()}
                    <div ref={messagesEndRef} />
                </div>

                <div className="message-input-area p-3 border-top">
                    <Form onSubmit={handleSendMessage} className="d-flex gap-2">
                        <Form.Control
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow-1 bg-body-tertiary"
                        />
                        <Button type="submit" className="btn-icon" variant="primary">
                            <i className="bi bi-send-fill"></i>
                        </Button>
                    </Form>
                </div>

                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                    <Modal.Header closeButton className="bg-dark border-secondary text-light">
                        <Modal.Title>Edit Message</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-dark text-light border-secondary">
                        <Form.Group>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="bg-dark text-light border-secondary"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="bg-dark text-light border-secondary">
                        <Button variant="outline-light" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleUpdateMessage} disabled={!editedText.trim()}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default ChatDisplay;
