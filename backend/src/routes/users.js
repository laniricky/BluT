import express from 'express';
import { getUserProfile, updateProfile, toggleFollow, addToWatchHistory, getWatchHistory, getUserVideos } from '../controllers/userController.js';
import { getCreatorStats } from '../controllers/dashboardController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/history', protect, getWatchHistory);
// Dashboard Routes
router.get('/dashboard/stats', protect, getCreatorStats);



export default router;
