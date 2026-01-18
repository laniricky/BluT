import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    getUnreadCount,
} from '../controllers/messageController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all conversations for logged-in user
router.get('/conversations', getConversations);

// Get total unread count
router.get('/unread-count', getUnreadCount);

// Get messages for a specific conversation
router.get('/:conversationId', getMessages);

// Send a new message
router.post('/', sendMessage);

// Mark conversation as read
router.patch('/:conversationId/read', markAsRead);

// Delete a message
router.delete('/:messageId', deleteMessage);

export default router;
