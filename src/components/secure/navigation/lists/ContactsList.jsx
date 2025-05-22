import { ListGroup, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import api from '../../../../api/config';
import { CONTACTS } from '../../../../api/routes';

const ContactsList = () => {
    const [contacts, setContacts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await api.get(CONTACTS.LIST, {
                    username: "",
                    email: ""
                });
                setContacts(response.data);
            } catch (err) {
                console.error('Error while fetching users:', err);
                setError('Error loading data');
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    const handleChatClick = (chatId) => {
        console.log("Clicked chat:", chatId);
        // here you can navigate or open chat
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    if (!contacts.data.length) {
        return <div className="text-info">No contacts</div>;
    }

    return (
        <div className="list-parent">
            <div className="list">
                <ListGroup>
                    {contacts.data.map((contact) => (
                        <ListGroup.Item key={contact.id} action
                            onClick={() => handleChatClick(contact.id)}
                            className="bg-body-secondary hover-border text-start">
                            {contact.toUsername}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default ContactsList;
