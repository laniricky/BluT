import api from './axios';

// Get all conversations for the logged-in user
export const getConversations = async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
};

// Get messages for a specific conversation
export const getMessages = async (conversationId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${conversationId}`, {
        params: { page, limit },
    });
    return response.data;
};

// Send a new message
export const sendMessage = async (receiverId, content) => {
    const response = await api.post('/messages', {
        receiverId,
        content,
    });
    return response.data;
};

// Mark conversation as read
export const markAsRead = async (conversationId) => {
    const response = await api.patch(`/messages/${conversationId}/read`);
    return response.data;
};

// Delete a message
export const deleteMessage = async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
};

// Get total unread count
export const getUnreadCount = async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
};
