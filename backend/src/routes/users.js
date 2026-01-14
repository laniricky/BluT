import express from 'express';
import { getUserProfile, updateProfile, toggleFollow, addToWatchHistory, getWatchHistory, getUserVideos } from '../controllers/userController.js';
import { getCreatorStats } from '../controllers/dashboardController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/history', protect, getWatchHistory);
router.post('/history/:videoId', protect, addToWatchHistory);
// Dashboard Routes
router.get('/dashboard/stats', protect, getCreatorStats);



// Public Routes
router.get('/:username', optionalProtect, getUserProfile);
router.get('/:id/videos', optionalProtect, getUserVideos);

export default router;
