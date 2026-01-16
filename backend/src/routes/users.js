import express from 'express';
import { getUserProfile, updateProfile, toggleFollow, addToWatchHistory, getWatchHistory, getUserVideos, getUserFollowers, getUserFollowing } from '../controllers/userController.js';
import { getCreatorStats } from '../controllers/dashboardController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { uploadProfile } from '../middleware/upload.js';

const router = express.Router();

router.put('/profile', protect, uploadProfile, updateProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/history', protect, getWatchHistory);
router.post('/history/:videoId', protect, addToWatchHistory);
// Dashboard Routes
router.get('/dashboard/stats', protect, getCreatorStats);



// Public Routes
router.get('/:username', optionalProtect, getUserProfile);
router.get('/:id/videos', optionalProtect, getUserVideos);
router.get('/:id/followers', optionalProtect, getUserFollowers);
router.get('/:id/following', optionalProtect, getUserFollowing);

export default router;
