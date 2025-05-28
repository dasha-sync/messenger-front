import { ListGroup, Spinner } from 'react-bootstrap';
import { useState, useEffect, useCallback } from 'react';
import api from '../../../../api/config';
import { CONTACTS } from '../../../../api/routes';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import { useContactsWebSocket } from '../../../../hooks/useContactsWebSocket';
import Alert from '../../../../components/controls/Alert';

const ContactsList = ({ onDisplaySelect }) => {
    const { error, handleError, clearError } = useErrorHandler();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleContactUpdate = useCallback((contactUpdate) => {
        setContacts(prevContacts => ({
            ...prevContacts,
            data: prevContacts.data.filter(contact => contact.id !== contactUpdate.id)
        }));
    }, []);

    const { error: wsError, clearError: clearWsError } = useContactsWebSocket(handleContactUpdate);

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
    }, [handleError]);

    const handleUserClick = (userId) => {
        onDisplaySelect(userId, false);
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (!contacts.data.length) {
        return <div className="text-info">No contacts</div>;
    }

    return (
        <div className="list-parent">
            {(error || wsError) && (
                <Alert
                    message={(error || wsError).message}
                    status={(error || wsError).status}
                    onClose={() => {
                        clearError();
                        clearWsError();
                    }}
                />
            )}
            <div className="list">
                <ListGroup>
                    {contacts.data.map((contact) => (
                        <ListGroup.Item
                            key={contact.id}
                            action
                            onClick={() => handleUserClick(contact.to)}
                            className="bg-body-tertiary hover-border text-start">
                            <div className="d-flex justify-content-between">
                                {contact.toUsername}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default ContactsList;
