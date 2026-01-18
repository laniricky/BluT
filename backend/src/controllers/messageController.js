import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// Get all conversations for the logged-in user
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate('participants', 'username avatar bio')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender receiver',
                    select: 'username avatar',
                },
            })
            .sort({ updatedAt: -1 });

        // Format conversations with unread counts
        const formattedConversations = conversations.map((conv) => {
            const otherUser = conv.participants.find(
                (p) => p._id.toString() !== userId
            );

            return {
                _id: conv._id,
                otherUser,
                lastMessage: conv.lastMessage,
                unreadCount: conv.getUnreadCount(userId),
                updatedAt: conv.updatedAt,
            };
        });

        res.json({
            success: true,
            conversations: formattedConversations,
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
            error: error.message,
        });
    }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verify user is part of the conversation
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to conversation',
            });
        }

        // Get messages
        const messages = await Message.find({
            conversationId,
            deleted: false,
        })
            .populate('sender', 'username avatar')
            .populate('receiver', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments({
            conversationId,
            deleted: false,
        });

        res.json({
            success: true,
            messages: messages.reverse(), // Reverse to show oldest first
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message,
        });
    }
};

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found',
            });
        }

        // Prevent sending message to yourself
        if (senderId === receiverId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot send message to yourself',
            });
        }

        // Find or create conversation
        const conversation = await Conversation.findOrCreateConversation(
            senderId,
            receiverId
        );

        // Create message
        const message = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            receiver: receiverId,
            content,
        });

        // Populate sender and receiver details
        await message.populate('sender', 'username avatar');
        await message.populate('receiver', 'username avatar');

        // Update conversation
        conversation.lastMessage = message._id;
        await conversation.incrementUnread(receiverId);

        res.status(201).json({
            success: true,
            message,
            conversation,
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message,
        });
    }
};

// Mark messages in a conversation as read
export const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Verify conversation exists and user is a participant
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to conversation',
            });
        }

        // Mark all unread messages as read
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
        await conversation.resetUnread(userId);

        res.json({
            success: true,
            message: 'Messages marked as read',
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message,
        });
    }
};

// Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        // Only sender can delete their message
        if (message.sender.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to delete this message',
            });
        }

        // Soft delete
        message.deleted = true;
        message.deletedAt = new Date();
        await message.save();

        res.json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message',
            error: error.message,
        });
    }
};

// Get total unread count across all conversations
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({
            participants: userId,
        });

        let totalUnread = 0;
        conversations.forEach((conv) => {
            totalUnread += conv.getUnreadCount(userId);
        });

        res.json({
            success: true,
            unreadCount: totalUnread,
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
            error: error.message,
        });
    }
};
