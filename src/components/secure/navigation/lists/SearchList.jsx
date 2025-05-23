import { useState, useEffect } from 'react';
import { ListGroup, Form, Spinner } from 'react-bootstrap';
import api from '../../../../api/config';
import { USERS } from '../../../../api/routes';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import Alert from '../../../../components/controls/Alert';

const SearchList = () => {
    const { error, handleError, clearError } = useErrorHandler();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Data fetching on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.post(USERS.LIST, {
                    username: "",
                    email: ""
                });
                setUsers(response.data);
            } catch (err) {
                handleError(err, 'DANGER');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);


    const lowerSearch = searchTerm.toLowerCase();

    const usersByUsername = users?.data ? users.data.filter(user =>
        user.username.toLowerCase().includes(lowerSearch)
    ) : [];

    const usersByEmail = users?.data ? users.data.filter(user =>
        user.email.toLowerCase().includes(lowerSearch) &&
        !usersByUsername.some(u => u.id === user.id)
    ) : [];

    const filteredUsers = [...usersByUsername, ...usersByEmail];

    const handleChatClick = (chatId) => {
        console.log("Clicked chat:", chatId);
        // chat navigation/opening logic
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (!filteredUsers.length) {
        return (
            <div className="list-parent">
                {error && (
                    <Alert
                        message={error.message}
                        status={error.status}
                        onClose={clearError}
                    />
                )}
                <Form.Control
                    type="text"
                    placeholder="Find by username or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-3 bg-body-secondary search"
                />
                <div className="text-info">Nothing found</div>
            </div>
        );
    }

    return (
        <div className="list-parent">
            {error && (
                <Alert
                    message={error.message}
                    status={error.status}
                    onClose={clearError}
                />
            )}
            <Form.Control
                type="text"
                placeholder="Find by username or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3 bg-body-secondary search"
            />
            <div className="list">
                <ListGroup>
                    {filteredUsers.map((user) => (
                        <ListGroup.Item
                            key={user.id}
                            action
                            onClick={() => handleChatClick(user.id)}
                            className="bg-body-secondary hover-border text-start">
                            {user.username} - {user.email}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default SearchList;
