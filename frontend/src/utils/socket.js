import { io } from 'socket.io-client';

// Socket instance
let socket = null;

// Initialize socket connection
export const initializeSocket = (token) => {
    if (socket?.connected) {
        return socket;
    }

    const SOCKET_URL = `http://${window.location.hostname}:5000`;

    socket = io(SOCKET_URL, {
        auth: {
            token,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    return socket;
};

// Get socket instance
export const getSocket = () => {
    return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.disconnect();
        socket = null;
    }
};

// Socket event helpers
export const joinConversation = (conversationId) => {
    socket?.emit('join_conversation', conversationId);
};

export const leaveConversation = (conversationId) => {
    socket?.emit('leave_conversation', conversationId);
};

export const sendTyping = (conversationId, receiverId) => {
    socket?.emit('typing', { conversationId, receiverId });
};

export const sendStopTyping = (conversationId, receiverId) => {
    socket?.emit('stop_typing', { conversationId, receiverId });
};

export const markMessagesAsRead = (conversationId, receiverId) => {
    socket?.emit('mark_as_read', { conversationId, receiverId });
};

export default socket;
