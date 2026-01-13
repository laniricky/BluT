import express from 'express';
import { getUserProfile, updateProfile, toggleSubscribe, getUserVideos, addToWatchHistory, getWatchHistory } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { getCreatorStats } from '../controllers/dashboardController.js';

const router = express.Router();

// Public routes (some with optional auth for context)
router.get('/:username', optionalAuth, getUserProfile);
router.get('/:id/videos', getUserVideos);

// Protected routes
router.put('/profile', protect, updateProfile);

// Watch History Routes
router.post('/history/:videoId', protect, addToWatchHistory);
router.get('/history', protect, getWatchHistory);

// Dashboard Routes
router.get('/dashboard/stats', protect, getCreatorStats);

router.post('/:id/subscribe', protect, toggleSubscribe);

export default router;
