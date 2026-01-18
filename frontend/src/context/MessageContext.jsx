import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    getConversations as fetchConversations,
    getMessages as fetchMessages,
    sendMessage as sendMessageAPI,
    markAsRead as markAsReadAPI,
    getUnreadCount,
} from '../api/message';
import {
    initializeSocket,
    disconnectSocket,
    getSocket,
    joinConversation,
    leaveConversation,
    sendTyping,
    sendStopTyping,
} from '../utils/socket';

const MessageContext = createContext(null);

export const useMessages = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessages must be used within MessageProvider');
    }
    return context;
};

export const MessageProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [totalUnread, setTotalUnread] = useState(0);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    // Initialize socket connection
    useEffect(() => {
        if (isAuthenticated) {
            const token = localStorage.getItem('token');
            if (token) {
                const newSocket = initializeSocket(token);
                setSocket(newSocket);

                // Socket event listeners
                newSocket.on('new_message', handleNewMessage);
                newSocket.on('message_notification', handleMessageNotification);
                newSocket.on('user_typing', handleUserTyping);
                newSocket.on('user_stop_typing', handleUserStopTyping);
                newSocket.on('messages_read', handleMessagesRead);

                return () => {
                    newSocket.off('new_message', handleNewMessage);
                    newSocket.off('message_notification', handleMessageNotification);
                    newSocket.off('user_typing', handleUserTyping);
                    newSocket.off('user_stop_typing', handleUserStopTyping);
                    newSocket.off('messages_read', handleMessagesRead);
                };
            }
        } else {
            disconnectSocket();
            setSocket(null);
        }
    }, [isAuthenticated]);

    // Load conversations on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadConversations();
            loadUnreadCount();
        } else {
            setConversations([]);
            setMessages([]);
            setActiveConversation(null);
            setTotalUnread(0);
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Socket event handlers
    const handleNewMessage = useCallback((data) => {
        const { message, conversationId } = data;

        // Add message to active conversation
        if (activeConversation?._id === conversationId) {
            setMessages((prev) => [...prev, message]);
        }

        // Update conversation list
        setConversations((prev) => {
            const updated = prev.map((conv) => {
                if (conv._id === conversationId) {
                    return {
                        ...conv,
                        lastMessage: message,
                        updatedAt: message.createdAt,
                    };
                }
                return conv;
            });

            // Sort by most recent
            return updated.sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
        });
    }, [activeConversation]);

    const handleMessageNotification = useCallback((data) => {
        const { conversationId } = data;

        // Increment unread count for this conversation
        setConversations((prev) =>
            prev.map((conv) => {
                if (conv._id === conversationId) {
                    return {
                        ...conv,
                        unreadCount: (conv.unreadCount || 0) + 1,
                    };
                }
                return conv;
            })
        );

        // Update total unread
        setTotalUnread((prev) => prev + 1);
    }, []);

    const handleUserTyping = useCallback(({ conversationId, userId }) => {
        if (activeConversation?._id === conversationId) {
            setTypingUsers((prev) => new Set(prev).add(userId));
        }
    }, [activeConversation]);

    const handleUserStopTyping = useCallback(({ conversationId, userId }) => {
        if (activeConversation?._id === conversationId) {
            setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    }, [activeConversation]);

    const handleMessagesRead = useCallback(({ conversationId }) => {
        // Update read status for messages
        setMessages((prev) =>
            prev.map((msg) =>
                msg.conversationId === conversationId
                    ? { ...msg, read: true, readAt: new Date() }
                    : msg
            )
        );
    }, []);

    // Load conversations
    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await fetchConversations();
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load messages for a conversation
    const loadMessages = async (conversationId) => {
        try {
            const data = await fetchMessages(conversationId);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    // Send a message
    const sendMessage = async (receiverId, content) => {
        try {
            const data = await sendMessageAPI(receiverId, content);
            if (data.success) {
                // Optimistically add message
                setMessages((prev) => [...prev, data.message]);

                // Update or create conversation
                setConversations((prev) => {
                    const exists = prev.find((c) => c._id === data.conversation._id);
                    if (exists) {
                        return prev
                            .map((c) =>
                                c._id === data.conversation._id
                                    ? { ...c, lastMessage: data.message }
                                    : c
                            )
                            .sort(
                                (a, b) =>
                                    new Date(b.updatedAt) - new Date(a.updatedAt)
                            );
                    } else {
                        return [
                            {
                                _id: data.conversation._id,
                                otherUser: data.message.receiver,
                                lastMessage: data.message,
                                unreadCount: 0,
                                updatedAt: data.message.createdAt,
                            },
                            ...prev,
                        ];
                    }
                });

                return { success: true, message: data.message };
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            return { success: false, error: error.message };
        }
    };

    // Mark conversation as read
    const markConversationAsRead = async (conversationId) => {
        try {
            await markAsReadAPI(conversationId);

            // Update unread count locally
            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv._id === conversationId) {
                        const oldUnread = conv.unreadCount || 0;
                        setTotalUnread((total) => Math.max(0, total - oldUnread));
                        return { ...conv, unreadCount: 0 };
                    }
                    return conv;
                })
            );

            // Update messages
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.conversationId === conversationId && msg.receiver === user.id
                        ? { ...msg, read: true, readAt: new Date() }
                        : msg
                )
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Load unread count
    const loadUnreadCount = async () => {
        try {
            const data = await getUnreadCount();
            if (data.success) {
                setTotalUnread(data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    // Select conversation
    const selectConversation = async (conversation) => {
        // Leave previous conversation room
        if (activeConversation) {
            leaveConversation(activeConversation._id);
        }

        setActiveConversation(conversation);

        if (conversation) {
            // Join new conversation room
            joinConversation(conversation._id);

            // Load messages
            await loadMessages(conversation._id);

            // Mark as read
            if (conversation.unreadCount > 0) {
                await markConversationAsRead(conversation._id);
            }
        }
    };

    // Typing indicators
    const startTyping = (conversationId, receiverId) => {
        sendTyping(conversationId, receiverId);
    };

    const stopTyping = (conversationId, receiverId) => {
        sendStopTyping(conversationId, receiverId);
    };

    const value = {
        conversations,
        activeConversation,
        messages,
        totalUnread,
        typingUsers,
        loading,
        loadConversations,
        selectConversation,
        sendMessage,
        markConversationAsRead,
        startTyping,
        stopTyping,
    };

    return (
        <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
    );
};
