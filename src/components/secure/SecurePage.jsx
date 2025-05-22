import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatsSidebar from './navigation/ChatsSidebar'
import '../auth/AuthPage.css';
import './SecurePage.css';

const SecurePage = () => {
    const navigate = useNavigate();

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
                    <ChatsSidebar />
                    <div className="chat-container bg-body-tertiary border rounded-3 ms-3" style={{ width: '75%', minHeight: '100%' }}>
                        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurePage;
