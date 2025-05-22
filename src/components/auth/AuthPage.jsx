import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AuthPage.css';

const AuthPage = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex mx-auto text-center align-items-center justify-content-center">
            <Container className="text-center centerize">
                <b><h1 className="welcome-text">Talk Wire</h1></b>
                <div className="d-flex gap-3 justify-content-center">
                    <Button variant="primary" size="lg" className="px-4" onClick={() => navigate('/signup')}>
                        Sign up
                    </Button>
                    <Button variant="outline-light" size="lg" className="px-4" onClick={() => navigate('/signin')}>
                        Sign in
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default AuthPage;
