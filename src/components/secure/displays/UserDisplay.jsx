import { useEffect } from 'react';
import api from '../../../api/config';
import { USERS } from '../../../api/routes';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import Alert from '../../controls/Alert';

const UserDisplay = ({ userId }) => {
    const { error, handleError, clearError } = useErrorHandler();

    useEffect(() => {
        const fetchIncomingRequests = async () => {
            try {
                if (userId) {
                    const response = await api.get(USERS.GET_BY_ID(userId))
                    console.log(response)
                }
            } catch (err) {
                handleError(err, 'DANGER');
            }
        };
        fetchIncomingRequests();
    }, []);

    if (!userId) {
        return (
            <div className="chat-container bg-body-tertiary border rounded-3 ms-3">
                {error && (
                    <Alert
                        message={error.message}
                        status={error.status}
                        onClose={clearError}
                    />
                )}

            </div>
        )
    }

    return (
        <div className="chat-container bg-body-tertiary border rounded-3 ms-3">
            {error && (
                <Alert
                    message={error.message}
                    status={error.status}
                    onClose={clearError}
                />
            )}

            <div>User ID: {userId}</div>
        </div>

    );
};

export default UserDisplay;
