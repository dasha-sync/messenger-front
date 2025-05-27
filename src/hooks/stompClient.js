// stompClient.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class StompClientManager {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
    }

    getJwtToken() {
        const cookies = document.cookie.split(';');
        const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
        return jwtCookie ? jwtCookie.trim().substring(4) : null;
    }

    connect() {
        if (this.client && this.connected) {
            console.log('Already connected');
            return Promise.resolve();
        }

        const token = this.getJwtToken();
        if (!token) {
            console.error('No JWT token found');
            return Promise.reject(new Error('No JWT token found'));
        }

        return new Promise((resolve, reject) => {
            this.client = new Client({
                webSocketFactory: () => {
                    return new SockJS('http://localhost:8080/ws', null, {
                        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
                        withCredentials: true
                    });
                },
                connectHeaders: {
                    'Authorization': `Bearer ${token}`
                },
                onConnect: () => {
                    console.log('Connected to WebSocket');
                    this.connected = true;
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('STOMP error:', frame);
                    this.connected = false;
                    reject(frame);
                },
                onWebSocketError: (event) => {
                    console.error('WebSocket error:', event);
                    this.connected = false;
                    reject(event);
                },
                onWebSocketClose: (event) => {
                    console.log('WebSocket closed:', event);
                    this.connected = false;
                    this.subscriptions.clear();
                }
            });

            this.client.activate();
        });
    }

    publish(destination, body) {
        if (!this.client || !this.connected) {
            console.error('Not connected to WebSocket');
            return;
        }

        this.client.publish({
            destination,
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        });
    }

    disconnect() {
        if (this.client) {
            this.subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
            this.subscriptions.clear();
            this.client.deactivate();
            this.connected = false;
        }
    }

    subscribe(destination, callback) {
        if (!this.client || !this.connected) {
            console.error('Not connected to WebSocket');
            return null;
        }

        const subscription = this.client.subscribe(destination, (message) => {
            try {
                const body = JSON.parse(message.body);
                callback(body);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        this.subscriptions.set(destination, subscription);
        return subscription;
    }

    unsubscribe(destination) {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    isConnected() {
        return this.connected;
    }
}

// Создаем единственный экземпляр менеджера
const stompManager = new StompClientManager();

export default stompManager;
