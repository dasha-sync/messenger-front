import { ListGroup, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import api from '../../../../api/config';
import { CONTACTS } from '../../../../api/routes';
import DeleteButton from './../../../controls/DeleteButton'
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import Alert from '../../../../components/controls/Alert';

const ContactsList = () => {
    const { error, handleError, clearError } = useErrorHandler();
    const [contacts, setContacts] = useState([]);
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
                handleError(err, 'DANGER');
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

    if (!contacts.data.length) {
        return <div className="text-info">No contacts</div>;
    }

    const handleDeleteClick = async (contactId) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await api.delete(CONTACTS.DELETE(contactId));
            setContacts(prevContacts => ({
                ...prevContacts,
                data: prevContacts.data.filter(contact => contact.id !== contactId)
            }));
        } catch (err) {
            handleError(err, 'DANGER');
        }
    };

    return (
        <div className="list-parent">
            {error && (
                <Alert
                    message={error.message}
                    status={error.status}
                    onClose={clearError}
                />
            )}
            <div className="list">
                <ListGroup>
                    {contacts.data.map((contact) => (
                        <ListGroup.Item key={contact.id} action
                            onClick={() => handleChatClick(contact.id)}
                            className="bg-body-secondary hover-border text-start">
                            <div className="d-flex justify-content-between">
                                {contact.toUsername}
                                <DeleteButton onClick={() => handleDeleteClick(contact.id)} />
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default ContactsList;
