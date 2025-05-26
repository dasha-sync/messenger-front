import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatsSidebar from './navigation/ChatsSidebar'
import ChatDisplay from './displays/ChatDisplay'
import UserDisplay from './displays/UserDisplay'
import { useAuth } from './../controls/AuthContext'
import Alert from './../controls/Alert';
import '../auth/AuthPage.css';
import './SecurePage.css';

const SecurePage = () => {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(() => {
        const savedId = sessionStorage.getItem('selectedId');
        return savedId ? JSON.parse(savedId) : null;
    });
    const [isChat, setIsChat] = useState(() => {
        const savedIsChat = sessionStorage.getItem('isChat');
        return savedIsChat ? JSON.parse(savedIsChat) : null;
    });
    const { logout, error, clearError } = useAuth();

    useEffect(() => {
        if (selectedId !== null) {
            sessionStorage.setItem('selectedId', JSON.stringify(selectedId));
        }
        if (isChat !== null) {
            sessionStorage.setItem('isChat', JSON.stringify(isChat));
        }
    }, [selectedId, isChat]);

    function setDisplay(id, flag) {
        setSelectedId(id);
        setIsChat(flag);
    }

    const handleLogout = async () => {
        await logout();
        navigate('/welcome');
    };

    return (
        <div className="d-flex flex-column">
            {error && (
                <Alert
                    message={error.message}
                    status={error.status}
                    onClose={clearError}
                />
            )}
            <div className="d-flex justify-content-between bg-body-tertiary border rounded-bottom-3 mx-3 mb-3 pt-3">
                <div className="d-flex my-auto mx-3 mb-3">
                    <button type="button" size="lg" className="btn btn-outline-success">
                        {sessionStorage.getItem("username")}
                    </button>
                </div>
                <div className="d-flex my-auto mx-3 mb-3">
                    <p className="info my-auto mx-3 mb-2 text-muted small">
                        <a href="http://localhost:8080/swagger-ui.html">API documentation</a>
                    </p>
                    <button type="button" size="lg" className="btn btn-outline-info mx-3" onClick={() => navigate('/settings')}>
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
                        <ChatDisplay chatId={selectedId} onDisplaySelect={setDisplay} />
                    ) : (
                        <UserDisplay userId={selectedId} onDisplaySelect={setDisplay} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurePage;
