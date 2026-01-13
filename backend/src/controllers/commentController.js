import Comment from '../models/Comment.js';
import Video from '../models/Video.js';

// @desc    Add comment to video
// @route   POST /api/videos/:id/comments
// @access  Private
export const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const videoId = req.params.id;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        const comment = await Comment.create({
            content,
            video: videoId,
            user: req.user.id
        });

        // Populate user details for immediate display
        await comment.populate('user', 'username avatar');

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get comments for a video
// @route   GET /api/videos/:id/comments
// @access  Public
export const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ video: req.params.id })
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 }); // Newest first

        res.json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete comment
// @route   DELETE /api/videos/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check ownership (User can delete own comment)
        // Future: Video owner can delete any comment on their video
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();

        res.json({
            success: true,
            message: 'Comment deleted',
            commentId: req.params.id
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
