import express from 'express';
import { getVideos, getVideoById, createVideo, deleteVideo, toggleLike, addView, getRecommendations } from '../controllers/videoController.js';
import { addComment, getComments, deleteComment, updateComment, toggleCommentLike, toggleCommentDislike } from '../controllers/commentController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { uploadVideo } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getVideos);
router.post('/', protect, uploadVideo, createVideo);
router.get('/:id', optionalProtect, getVideoById);
router.delete('/:id', protect, deleteVideo);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/view', addView);
router.get('/:id/recommendations', getRecommendations);

// Comment Routes
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);
router.route('/comments/:id')
    .delete(protect, deleteComment)
    .put(protect, updateComment);

router.post('/comments/:id/like', protect, toggleCommentLike);
router.post('/comments/:id/dislike', protect, toggleCommentDislike); // /api/videos/comments/:id

export default router;
