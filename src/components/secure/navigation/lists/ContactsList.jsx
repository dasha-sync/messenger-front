import { ListGroup } from 'react-bootstrap';

const ContactsList = () => {
    const mockData = {
        contacts: [
            { id: 1, name: 'Алиса', email: 'alice@example.com' },
            { id: 2, name: 'Боб', email: 'bob@example.com' },
            { id: 3, name: 'Карл', email: 'carl@example.com' },
        ],
    };

    const handleChatClick = (chatId) => {
        console.log("Clicked chat:", chatId);
        // тут можно сделать переход или открыть чат
    };

    return (
        <ListGroup>
            {mockData.contacts.map((contact) => (
                <ListGroup.Item key={contact.id} action
                    onClick={() => handleChatClick(contact.id)}
                    className="bg-body-secondary hover-border text-start">
                    {contact.name} - {contact.email}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default ContactsList;
