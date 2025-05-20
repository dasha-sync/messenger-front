import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../auth/AuthPage.css';

const SecurePage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('authChange'));
        navigate('/welcome');
    };

    return (
        <div className="d-flex text-center align-items-center justify-content-center">
            <Container className="text-center">
                <b><h1 className="welcome-text">Talk Wire</h1></b>
                <div className="d-flex gap-3 justify-content-center">
                    <Button variant="primary" size="lg" className="px-4" onClick={handleLogout}>
                        Logout
                    </Button>
                    <Button variant="primary" size="lg" className="px-4" onClick={() => navigate('/settings')}>
                        Settings
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default SecurePage;
