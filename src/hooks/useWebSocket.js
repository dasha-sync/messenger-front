import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useErrorHandler } from './useErrorHandler';

export const useWebSocket = (chatId, onMessageReceived) => {
    const { error, handleError, clearError } = useErrorHandler();
    const stompClient = useRef(null);
    const subscriptionRef = useRef(null);
    const isConnected = useRef(false);

    const connect = useCallback(() => {
        if (stompClient.current && isConnected.current) {
            console.log('Already connected');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            stompClient.current = new Client({
                webSocketFactory: () => {
                    return new SockJS('http://localhost:8080/ws', null, {
                        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
                        withCredentials: true // Важно! Это позволит отправлять куки
                    });
                },
                connectHeaders: {}, // Пустые заголовки, так как куки будут отправлены автоматически
                onConnect: () => {
                    console.log('Connected to WebSocket');
                    isConnected.current = true;
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('STOMP error:', frame);
                    isConnected.current = false;
                    reject(frame);
                },
                onWebSocketError: (event) => {
                    console.error('WebSocket error:', event);
                    isConnected.current = false;
                    reject(event);
                },
                onWebSocketClose: (event) => {
                    console.log('WebSocket closed:', event);
                    isConnected.current = false;
                    if (subscriptionRef.current) {
                        subscriptionRef.current.unsubscribe();
                        subscriptionRef.current = null;
                    }
                }
            });

            stompClient.current.activate();
        });
    }, []);

    const subscribe = useCallback((callback) => {
        if (!stompClient.current || !isConnected.current) {
            console.error('Not connected to WebSocket');
            return null;
        }

        const subscription = stompClient.current.subscribe(
            `/topic/secured/chats/${chatId}/messages`,
            (message) => {
                try {
                    const body = JSON.parse(message.body);
                    callback(body);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            }
        );

        subscriptionRef.current = subscription;
        return subscription;
    }, [chatId]);

    const publish = useCallback((destination, body) => {
        if (!stompClient.current || !isConnected.current) {
            console.error('Not connected to WebSocket');
            return;
        }

        stompClient.current.publish({
            destination,
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        });
    }, []);

    const disconnect = useCallback(() => {
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
        }
        if (stompClient.current) {
            stompClient.current.deactivate();
            isConnected.current = false;
        }
    }, []);

    useEffect(() => {
        if (chatId) {
            connect()
                .then(() => {
                    subscribe((message) => {
                        console.log('Received message:', message);
                        if (onMessageReceived) {
                            onMessageReceived(message);
                        }
                    });
                })
                .catch((error) => {
                    handleError(error, 'DANGER');
                });
        }

        return () => {
            disconnect();
        };
    }, [chatId, connect, subscribe, disconnect, handleError, onMessageReceived]);

    return {
        error,
        clearError,
        publish,
        isConnected: isConnected.current
    };
};
