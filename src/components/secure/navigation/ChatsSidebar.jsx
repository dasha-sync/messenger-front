import React, { useState } from 'react';
import { Nav, ListGroup } from 'react-bootstrap';
import ChatsList from './lists/ChatsList'
import ContactsList from './lists/ContactsList'
import SentRequestList from './lists/SentRequestList'
import ReceivedRequestsList from './lists/ReceivedRequestsList'
import SearchList from './lists/SearchList'
import './ChatsSidebar.css'

const ChatsSidebar = () => {
    const [activeTab, setActiveTab] = useState('chats');

    const renderContent = () => {
        switch (activeTab) {
            case 'chats':
                return (
                    <ChatsList />
                );
            case 'contacts':
                return (
                    <ContactsList />
                );
            case 'sentRequests':
                return (
                    <SentRequestList />
                );
            case 'receivedRequests':
                return (
                    <ReceivedRequestsList />
                );
            case 'search':
                return (
                    <SearchList />
                );
            default:
                return null;
        }
    };

    return (
        <div className="chats-container bg-body-tertiary border rounded-3 p-2">
            <div className="horizontal-scroll">
                <Nav
                    variant="tabs"
                    activeKey={activeTab}
                    className="custom-tabs flex-nowrap"
                    onSelect={(k) => setActiveTab(k)}>
                    <Nav.Item>
                        <Nav.Link eventKey="chats">Chats</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="contacts">Contacts</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="sentRequests">Outgoing</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="receivedRequests">Incoming</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="search">Search</Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>

            <div className="mt-3">{renderContent()}</div>
        </div>

    );
};

export default ChatsSidebar;
