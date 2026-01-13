import Video from '../models/Video.js';
import Like from '../models/Like.js';
import Subscription from '../models/Subscription.js';
import fs from 'fs';
import path from 'path';

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
export const getVideos = async (req, res) => {
    try {
        let query = {};
        if (req.query.search) {
            query = { $text: { $search: req.query.search } };
        }

        const videos = await Video.find(query)
            .populate('user', 'username') // Populate user details
            .sort({ createdAt: -1 }); // Newest first

        res.json({
            success: true,
            count: videos.length,
            data: videos
        });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
export const getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('user', 'username avatar'); // Removed subscribersCount population, will calculate manually

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Get likes count
        const likesCount = await Like.countDocuments({ video: req.params.id });

        // Get subscribers count for the creator
        const subscribersCount = await Subscription.countDocuments({ channel: video.user._id });

        // Check if current user is subscribed
        let isLiked = false;
        let isSubscribed = false;

        if (req.user) {
            isLiked = await Like.exists({
                user: req.user._id,
                video: req.params.id
            });

            isSubscribed = await Subscription.exists({
                subscriber: req.user._id,
                channel: video.user._id
            });
        }

        res.json({
            success: true,
            data: {
                ...video.toObject(),
                likesCount,
                isLiked: !!isLiked,
                user: {
                    ...video.user.toObject(),
                    subscribersCount,
                    isSubscribed: !!isSubscribed
                }
            }
        });
    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Upload new video
// @route   POST /api/videos
// @access  Private
export const createVideo = async (req, res) => {
    try {
        if (!req.files || !req.files.video || !req.files.thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'Please upload both video and thumbnail files'
            });
        }

        const videoFile = req.files.video[0];
        const thumbnailFile = req.files.thumbnail[0];

        // Construct URLs (assuming local storage)
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const videoUrl = `${baseUrl}/uploads/videos/${videoFile.filename}`;
        const thumbnailUrl = `${baseUrl}/uploads/thumbnails/${thumbnailFile.filename}`;

        const video = await Video.create({
            title: req.body.title,
            description: req.body.description,
            videoUrl: videoUrl,
            thumbnailUrl: thumbnailUrl,
            user: req.user._id,
            duration: '00:00' // Placeholder for now
        });

        res.status(201).json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Create video error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check ownership
        if (video.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this video'
            });
        }

        // Delete files
        // Helper to safe delete
        const safeUnlink = (filePath) => {
            // Construct absolute path from relative URL usually stored in DB
            // For this project, DB stores e.g., http://localhost:5000/uploads/videos/filename.mp4
            // We need c:\DEV\BluT\backend\uploads\videos\filename.mp4
            try {
                const urlParts = filePath.split('/uploads/');
                if (urlParts.length > 1) {
                    const relativePath = 'uploads/' + urlParts[1];
                    const absolutePath = path.join(path.resolve(), relativePath);
                    if (fs.existsSync(absolutePath)) {
                        fs.unlinkSync(absolutePath);
                    }
                }
            } catch (err) {
                console.error('File delete error:', err);
            }
        };

        safeUnlink(video.videoUrl);
        safeUnlink(video.thumbnailUrl);

        await video.deleteOne();
        await Like.deleteMany({ video: video._id }); // Remove associated likes

        res.json({
            success: true,
            message: 'Video removed'
        });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Add view to video
// @route   POST /api/videos/:id/view
// @access  Public
export const addView = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        video.views += 1;
        await video.save();

        res.json({
            success: true,
            views: video.views
        });
    } catch (error) {
        console.error('Add view error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Toggle like video
// @route   POST /api/videos/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if already liked
        const existingLike = await Like.findOne({
            user: req.user.id,
            video: req.params.id
        });

        if (existingLike) {
            await Like.findByIdAndDelete(existingLike._id);
            return res.json({
                success: true,
                message: 'Video unliked',
                isLiked: false
            });
        } else {
            await Like.create({
                user: req.user.id,
                video: req.params.id
            });
            return res.json({
                success: true,
                message: 'Video liked',
                isLiked: true
            });
        }
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
