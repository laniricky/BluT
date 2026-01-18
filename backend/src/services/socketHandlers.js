import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// Store active socket connections: userId -> socketId
const userSockets = new Map();

export const setupSocketHandlers = (io) => {
    // Socket.IO authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`User connected: ${userId} (socket: ${socket.id})`);

        // Store user's socket connection
        userSockets.set(userId, socket.id);

        // Emit connection success
        socket.emit('connected', { userId });

        // Join user to their personal room
        socket.join(`user:${userId}`);

        // Handle joining a conversation
        socket.on('join_conversation', (conversationId) => {
            console.log(`User ${userId} joining conversation ${conversationId}`);
            socket.join(`conversation:${conversationId}`);
        });

        // Handle leaving a conversation
        socket.on('leave_conversation', (conversationId) => {
            console.log(`User ${userId} leaving conversation ${conversationId}`);
            socket.leave(`conversation:${conversationId}`);
        });

        // Handle sending a message (real-time)
        socket.on('send_message', async (data) => {
            try {
                const { conversationId, receiverId, content } = data;

                // Create message in database
                const message = await Message.create({
                    conversationId,
                    sender: userId,
                    receiver: receiverId,
                    content,
                });

                // Populate sender details
                await message.populate('sender', 'username avatar');
                await message.populate('receiver', 'username avatar');

                // Update conversation
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    conversation.lastMessage = message._id;
                    await conversation.incrementUnread(receiverId);
                }

                // Emit to conversation room (both sender and receiver)
                io.to(`conversation:${conversationId}`).emit('new_message', {
                    message,
                    conversationId,
                });

                // Also emit to receiver's personal room for notification
                io.to(`user:${receiverId}`).emit('message_notification', {
                    message,
                    conversationId,
                    sender: {
                        _id: userId,
                        username: message.sender.username,
                        avatar: message.sender.avatar,
                    },
                });

                // Send confirmation to sender
                socket.emit('message_sent', {
                    success: true,
                    message,
                });
            } catch (error) {
                console.error('Send message socket error:', error);
                socket.emit('message_error', {
                    error: 'Failed to send message',
                    details: error.message,
                });
            }
        });

        // Handle typing indicator
        socket.on('typing', ({ conversationId, receiverId }) => {
            io.to(`user:${receiverId}`).emit('user_typing', {
                conversationId,
                userId,
            });
        });

        // Handle stop typing
        socket.on('stop_typing', ({ conversationId, receiverId }) => {
            io.to(`user:${receiverId}`).emit('user_stop_typing', {
                conversationId,
                userId,
            });
        });

        // Handle messages marked as read
        socket.on('mark_as_read', async ({ conversationId, receiverId }) => {
            try {
                // Update read status in database
                await Message.updateMany(
                    {
                        conversationId,
                        receiver: userId,
                        read: false,
                    },
                    {
                        $set: {
                            read: true,
                            readAt: new Date(),
                        },
                    }
                );

                // Reset unread count
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    await conversation.resetUnread(userId);
                }

                // Notify sender that messages were read
                io.to(`user:${receiverId}`).emit('messages_read', {
                    conversationId,
                    readBy: userId,
                });

                socket.emit('mark_read_success', { conversationId });
            } catch (error) {
                console.error('Mark as read error:', error);
                socket.emit('mark_read_error', {
                    error: 'Failed to mark as read',
                });
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId} (socket: ${socket.id})`);
            userSockets.delete(userId);
        });
    });
};

// Helper function to get socket ID for a user
export const getUserSocketId = (userId) => {
    return userSockets.get(userId);
};

// Helper function to check if user is online
export const isUserOnline = (userId) => {
    return userSockets.has(userId);
};
