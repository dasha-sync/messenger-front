import { useEffect } from 'react';
import api from '../../../api/config';
import { CHATS } from '../../../api/routes';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import Alert from '../../controls/Alert';

const ChatDisplay = ({ chatId }) => {
    const { error, handleError, clearError } = useErrorHandler();

    useEffect(() => {
        const fetchIncomingRequests = async () => {
            try {
                if (chatId) {
                    const response = await api.get(CHATS.GET_BY_ID(chatId))
                    console.log(response)
                }
            } catch (err) {
                handleError(err, 'DANGER');
            }
        };

        fetchIncomingRequests();
    }, []);

    if (!chatId) {
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

            <div>Chat ID: {chatId}</div>
        </div>

    );
};

export default ChatDisplay;
