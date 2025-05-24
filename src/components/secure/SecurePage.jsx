import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatsSidebar from './navigation/ChatsSidebar'
import ChatDisplay from './displays/ChatDisplay'
import UserDisplay from './displays/UserDisplay'
import '../auth/AuthPage.css';
import './SecurePage.css';

const SecurePage = () => {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(null);
    const [isChat, setIsChat] = useState(null);

    function setDisplay(id, flag) {
        setSelectedId(id)
        setIsChat(flag)
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('authChange'));
        navigate('/welcome');
    };

    return (
        <div className="d-flex flex-column">
            <div className="d-flex justify-content-between bg-body-tertiary border rounded-bottom-3 mx-3 mb-3 pt-3">
                <div className="d-flex my-auto mx-3 mb-3">
                    <button type="button" size="lg" className="btn btn-outline-warning">
                        {localStorage.getItem("username")}
                    </button>
                    <p className="info my-auto mx-3 mb-2">
                        <a href="http://localhost:8080/swagger-ui.html">API documentation</a>
                    </p>
                </div>
                <div className="d-flex my-auto mx-3 mb-3">
                    <button type="button" size="lg" className="btn btn-outline-primary mx-3" onClick={() => navigate('/settings')}>
                        Settings
                    </button>
                    <button type="button" size="lg" className="btn btn-outline-secondary" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
            <div className="flex-grow-1 d-flex px-3">
                <div className="d-flex w-100">
                    <ChatsSidebar onDisplaySelect={setDisplay} />
                    {isChat ? (
                        <ChatDisplay chatId={selectedId} />
                    ) : (
                        <UserDisplay userId={selectedId} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurePage;
