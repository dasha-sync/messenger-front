import { useState, useEffect } from 'react';
import api from '../../../api/config';
import { REQUESTS } from '../../../api/routes';
import { Nav, ListGroup } from 'react-bootstrap';
import ChatsList from './lists/ChatsList'
import ContactsList from './lists/ContactsList'
import SentRequestList from './lists/SentRequestList'
import ReceivedRequestsList from './lists/ReceivedRequestsList'
import SearchList from './lists/SearchList'
import './ChatsSidebar.css'
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import Alert from '../../../components/controls/Alert';

const ChatsSidebar = ({ onDisplaySelect }) => {
    const [activeTab, setActiveTab] = useState('chats');
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const { error, handleError, clearError } = useErrorHandler();

    useEffect(() => {
        const fetchIncomingRequests = async () => {
            try {
                const response = await api.get(REQUESTS.LIST);
                setIncomingRequests(response.data.data);
            } catch (err) {
                handleError(err, 'DANGER');
            } finally {
                setLoadingRequests(false);
            }
        };

        fetchIncomingRequests();
    }, [handleError]);


    const renderContent = () => {
        switch (activeTab) {
            case 'chats':
                return (
                    <ChatsList onDisplaySelect={onDisplaySelect} />
                );
            case 'contacts':
                return (
                    <ContactsList onDisplaySelect={onDisplaySelect} />
                );
            case 'sentRequests':
                return (
                    <SentRequestList onDisplaySelect={onDisplaySelect} />
                );
            case 'receivedRequests':
                return (
                    <ReceivedRequestsList
                        incomingRequests={incomingRequests}
                        loading={loadingRequests}
                        error={error}
                        onDisplaySelect={onDisplaySelect} />
                );
            case 'search':
                return (
                    <SearchList onDisplaySelect={onDisplaySelect} />
                );
            default:
                return null;
        }
    };

    return (
        <div className="chats-container bg-body-tertiary border rounded-3 p-2">
            {error && (
                <Alert
                    message={error.message}
                    status={error.status}
                    onClose={clearError}
                />
            )}
            <div className="d-flex flex-row justify-content-center">
                <div className="horizontal-scroll overflow-auto">
                    <Nav
                        variant="tabs"
                        activeKey={activeTab}
                        className="custom-tabs flex-nowrap icon"
                        onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="chats"><i className="bi bi-chat-right-dots"></i></Nav.Link>{/*chats */}
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="contacts"><i className="bi bi-telephone"></i></Nav.Link>{/*contacts */}
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="sentRequests"><i className="bi bi-telephone-outbound"></i></Nav.Link>{/*outgoing requests */}
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="receivedRequests" className="d-flex flex-row flex-nowrap">{/*incoming requests */}
                                <i className="bi bi-telephone-inbound"></i>{' '}
                                {!loadingRequests && incomingRequests.length > 0 && (
                                    <span className="notification-dot"></span>
                                )}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="search"><i className="bi bi-search"></i></Nav.Link>{/*search */}
                        </Nav.Item>
                    </Nav>
                </div>
            </div>

            <div className="mt-3">{renderContent()}</div>
        </div>

    );
};

export default ChatsSidebar;
