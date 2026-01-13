import express from 'express';
import { getNotifications, markNotificationRead, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);
router.put('/read-all', markAllRead);

export default router;
