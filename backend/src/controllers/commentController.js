import Comment from '../models/Comment.js';
import Video from '../models/Video.js';
import Notification from '../models/Notification.js';

// @desc    Add comment to video
// @route   POST /api/videos/:id/comments
// @access  Private
export const addComment = async (req, res) => {
    try {
        const { content, parentId, timestamp } = req.body;
        const videoId = req.params.id;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        const comment = await Comment.create({
            content,
            video: videoId,
            user: req.user.id,
            parentId: parentId || null, // Handle replies
            timestamp: timestamp || null,
        });

        // Populate user details for immediate display
        await comment.populate('user', 'username avatar');

        // Create Notification (if not self-comment)
        if (video.user.toString() !== req.user.id) {
            await Notification.create({
                recipient: video.user,
                sender: req.user.id,
                type: 'comment',
                video: video._id,
                comment: comment._id
            });
        }

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
            .sort({ createdAt: -1 }) // Newest first
            .lean();

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

// @desc    Update comment
// @route   PUT /api/videos/comments/:id
// @access  Private
export const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check ownership
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to edit this comment' });
        }

        comment.content = content;
        comment.isEdited = true;
        await comment.save();

        await comment.populate('user', 'username avatar');

        res.json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Toggle comment like
// @route   POST /api/videos/comments/:id/like
// @access  Private
export const toggleCommentLike = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check if already liked
        if (comment.likes.includes(req.user.id)) {
            comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
        } else {
            comment.likes.push(req.user.id);
            // Remove from dislikes if present
            comment.dislikes = comment.dislikes.filter(id => id.toString() !== req.user.id);
        }

        await comment.save();

        res.json({
            success: true,
            data: comment.likes
        });
    } catch (error) {
        console.error('Toggle comment like error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Toggle comment dislike
// @route   POST /api/videos/comments/:id/dislike
// @access  Private
export const toggleCommentDislike = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check if already disliked
        if (comment.dislikes.includes(req.user.id)) {
            comment.dislikes = comment.dislikes.filter(id => id.toString() !== req.user.id);
        } else {
            comment.dislikes.push(req.user.id);
            // Remove from likes if present
            comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
        }

        await comment.save();

        res.json({
            success: true,
            data: comment.dislikes
        });
    } catch (error) {
        console.error('Toggle comment dislike error:', error);
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
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this comment' });
        }

        // Delete all replies first if any (simple approach)
        await Comment.deleteMany({ parentId: comment._id });
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
// @desc    Toggle comment pin
// @route   POST /api/videos/comments/:id/pin
// @access  Private
export const togglePin = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('video'); // Need video to check owner

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check if user is the VIDEO OWNER
        if (comment.video.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only the video owner can pin comments' });
        }

        // Unpin any other pinned comment on this video if pinning (optional, but good UX to have max 1 pin)
        if (!comment.isPinned) {
            await Comment.updateMany(
                { video: comment.video._id, isPinned: true },
                { $set: { isPinned: false } }
            );
        }

        comment.isPinned = !comment.isPinned;
        await comment.save();

        res.json({
            success: true,
            data: { isPinned: comment.isPinned }
        });
    } catch (error) {
        console.error('Toggle pin error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Toggle creator heart
// @route   POST /api/videos/comments/:id/heart
// @access  Private
export const toggleHeart = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('video');

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check if user is the VIDEO OWNER
        if (comment.video.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only the video owner can give a heart' });
        }

        comment.isHearted = !comment.isHearted;
        await comment.save();

        // Notification logic could go here (notify comment author that creator hearted their comment)

        res.json({
            success: true,
            data: { isHearted: comment.isHearted }
        });
    } catch (error) {
        console.error('Toggle heart error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


