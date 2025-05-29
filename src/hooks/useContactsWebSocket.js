import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useErrorHandler } from './useErrorHandler';

export const useContactsWebSocket = (onContactUpdate) => {
    const { error, handleError, clearError } = useErrorHandler();
    const stompClient = useRef(null);
    const subscriptionRef = useRef(null);
    const isConnected = useRef(false);

    const connect = useCallback(() => {
        if (stompClient.current && isConnected.current) {
            console.log('Already connected to contacts WebSocket');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            stompClient.current = new Client({
                webSocketFactory: () => {
                    return new SockJS('http://localhost:8080/ws', null, {
                        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
                        withCredentials: true
                    });
                },
                connectHeaders: {},
                onConnect: () => {
                    console.log('Connected to contacts WebSocket');
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

    const subscribe = useCallback(() => {
        if (!stompClient.current || !isConnected.current) {
            console.error('Not connected to WebSocket');
            return null;
        }

        const username = sessionStorage.getItem("username");
        if (!username) {
            console.error('No username found in session storage');
            return null;
        }

        const subscription = stompClient.current.subscribe(
            `/topic/contacts/${username}`,
            (message) => {
                try {
                    const contactUpdate = JSON.parse(message.body);
                    if (contactUpdate.action === 'DELETE' || contactUpdate.action === 'CREATE') {
                        onContactUpdate(contactUpdate);
                    }
                } catch (error) {
                    console.error('Error parsing contact update message:', error);
                }
            }
        );

        subscriptionRef.current = subscription;
        return subscription;
    }, [onContactUpdate]);

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
        connect()
            .then(() => {
                subscribe();
            })
            .catch((error) => {
                handleError(error, 'DANGER');
            });

        return () => {
            disconnect();
        };
    }, [connect, subscribe, disconnect, handleError]);

    return {
        error,
        clearError,
        isConnected: isConnected.current
    };
};
