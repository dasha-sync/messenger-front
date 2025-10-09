const BASE = {
    AUTH: '/auth',
    SECURED: '/secured',
    CHATS: '/secured/chats',
    MESSAGES: '/secured/chats/{chatId}/messages',
    USERS: '/secured/users',
    REQUESTS: '/secured/requests',
    CONTACTS: '/secured/contacts',
    USER_REQUESTS: '/secured/user_requests'
};

// Функция для замены параметров в URL
const replaceParams = (url, params) => {
    let result = url;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`{${key}}`, value);
    });
    return result;
};

// Аутентификация
export const AUTH = {
    SIGNUP: `${BASE.AUTH}/signup`,
    SIGNIN: `${BASE.AUTH}/signin`,
    CHECK: `${BASE.AUTH}/check`,
    SIGNOUT: `${BASE.AUTH}/signout`,
};

// Чаты
export const CHATS = {
    LIST: BASE.CHATS,
    CREATE: `${BASE.CHATS}/create`,
    GET_BY_ID: (chatId) => replaceParams(`${BASE.CHATS}/{chatId}`, { chatId }),
    DELETE: (chatId) => replaceParams(`${BASE.CHATS}/{chatId}/destroy`, { chatId }),
};

// Сообщения
export const MESSAGES = {
    LIST: (chatId) => replaceParams(`${BASE.MESSAGES}`, { chatId }),
    CREATE: (chatId) => replaceParams(`${BASE.MESSAGES}/create`, { chatId }),
    UPDATE: (chatId, messageId) => replaceParams(`${BASE.MESSAGES}/{messageId}/update`, { chatId, messageId }),
    DELETE: (chatId, messageId) => replaceParams(`${BASE.MESSAGES}/{messageId}/destroy`, { chatId, messageId }),
};

// Пользователи
export const USERS = {
    LIST: BASE.USERS,
    DELETE: `${BASE.USERS}/destroy`,
    GET_BY_ID: (userId) => replaceParams(`${BASE.USERS}/{userId}`, { userId }),
    UPDATE: `${BASE.USERS}/update`,
    RELATIONS: (userId) => replaceParams(`${BASE.USERS}/{userId}/relations`, { userId }),
};

// Запросы
export const REQUESTS = {
    LIST: BASE.REQUESTS,
    USER_REQUESTS: BASE.USER_REQUESTS,
    GET_BY_ID: (requestId) => replaceParams(`${BASE.REQUESTS}/{requestId}`, { requestId }),
    CREATE: (userId) => replaceParams(`${BASE.USERS}/{userId}/requests/create`, { userId }),
    APPROVE: (requestId) => replaceParams(`${BASE.REQUESTS}/{requestId}/approve`, { requestId }),
    REJECT: (requestId) => replaceParams(`${BASE.REQUESTS}/{requestId}/reject`, { requestId }),
    DELETE: (requestId) => replaceParams(`${BASE.REQUESTS}/{requestId}/destroy`, { requestId }),
};

// Контакты
export const CONTACTS = {
    LIST: BASE.CONTACTS,
    DELETE: (contactId) => replaceParams(`${BASE.CONTACTS}/{contactId}/destroy`, { contactId }),
};

// WebSocket
export const WS = '/ws';

/*

import { CHATS, MESSAGES, AUTH } from '../api/routes';
import api from '../api/config';

// Примеры использования:

// Аутентификация
const signin = async (credentials) => {
    const response = await api.post(AUTH.SIGNIN, credentials);
    return response.data;
};

// Работа с чатами
const getChats = async () => {
    const response = await api.get(CHATS.LIST);
    return response.data;
};

const getChatById = async (chatId) => {
    const response = await api.get(CHATS.GET_BY_ID(chatId));
    return response.data;
};

// Работа с сообщениями
const getMessages = async (chatId) => {
    const response = await api.get(MESSAGES.LIST(chatId));
    return response.data;
};

const createMessage = async (chatId, messageData) => {
    const response = await api.post(MESSAGES.CREATE(chatId), messageData);
    return response.data;
};

// Работа с запросами
const approveRequest = async (requestId) => {
    const response = await api.post(REQUESTS.APPROVE(requestId));
    return response.data;
};

*/
