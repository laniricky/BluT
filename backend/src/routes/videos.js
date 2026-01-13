import express from 'express';
import { getVideos, getVideoById, createVideo, deleteVideo, toggleLike, addView } from '../controllers/videoController.js';
import { addComment, getComments, deleteComment } from '../controllers/commentController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { uploadVideo } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getVideos);
router.post('/', protect, uploadVideo, createVideo);
router.get('/:id', optionalProtect, getVideoById);
router.delete('/:id', protect, deleteVideo);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/view', addView);

// Comment Routes
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);
router.delete('/comments/:id', protect, deleteComment); // /api/videos/comments/:id

export default router;
