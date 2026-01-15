import Video from '../models/Video.js';
import Like from '../models/Like.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import Analytics from '../models/Analytics.js';
import { rankVideos } from '../services/feedService.js';
import fs from 'fs';
import path from 'path';

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
export const getVideos = async (req, res) => {
    try {
        let query = { visibility: 'public' }; // Default to public only
        if (req.query.search) {
            query = { $text: { $search: req.query.search } };
        }

        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        if (req.query.tag) {
            query.tags = { $in: [req.query.tag] };
        }

        // Date Filtering
        if (req.query.uploadDate) {
            const now = new Date();
            let dateQuery = {};

            switch (req.query.uploadDate) {
                case 'hour':
                    dateQuery = { $gte: new Date(now.getTime() - 60 * 60 * 1000) };
                    break;
                case 'today':
                    dateQuery = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
                    break;
                case 'week':
                    const weekAgo = new Date(now.setDate(now.getDate() - 7));
                    dateQuery = { $gte: weekAgo };
                    break;
                case 'month':
                    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                    dateQuery = { $gte: monthAgo };
                    break;
                case 'year':
                    const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
                    dateQuery = { $gte: yearAgo };
                    break;
            }
            if (Object.keys(dateQuery).length > 0) {
                query.createdAt = dateQuery;
            }
        }

        // Determine sorting
        const sortBy = req.query.sortBy || 'relevance';
        const order = req.query.order === 'asc' ? 1 : -1;

        let sortOptions = {};
        if (sortBy === 'views') {
            sortOptions = { views: order };
        } else if (sortBy === 'createdAt') {
            sortOptions = { createdAt: order };
        } else if (sortBy === 'relevance' && req.query.search) {
            // Sort by text score if searching
            sortOptions = { score: { $meta: "textScore" } };
        } else {
            // Default fallback
            sortOptions = { createdAt: -1 };
        }

        // Projection for text score
        const projection = req.query.search ? { score: { $meta: "textScore" } } : {};

        const videos = await Video.find(query, projection)
            .populate('user', 'username') // Populate user details
            .sort(sortOptions)
            .lean();

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

        // Get followers count for the creator
        const followersCount = await Follow.countDocuments({ following: video.user._id });

        // Check if current user is following
        let isLiked = false;
        let isFollowing = false;
        let isFollower = false;

        // Access Control for Private Videos
        if (video.visibility === 'private') {
            if (!req.user || (req.user._id.toString() !== video.user._id.toString() && req.user.role !== 'admin')) {
                return res.status(403).json({
                    success: false,
                    message: 'This video is private'
                });
            }
        }

        if (req.user) {
            isLiked = await Like.exists({
                user: req.user._id,
                video: req.params.id
            });

            isFollowing = await Follow.exists({
                follower: req.user._id,
                following: video.user._id
            });

            isFollower = await Follow.exists({
                follower: video.user._id,
                following: req.user._id
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
                    followersCount,
                    isFollowing: !!isFollowing,
                    isFollower: !!isFollower
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

        const tagsInput = req.body.tags;
        let tagsArray = [];
        if (typeof tagsInput === 'string') {
            tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        } else if (Array.isArray(tagsInput)) {
            tagsArray = tagsInput;
        }

        const video = await Video.create({
            title: req.body.title,
            description: req.body.description,
            tags: tagsArray,
            category: req.body.category || 'Other',
            videoUrl: videoUrl,
            thumbnailUrl: thumbnailUrl,
            user: req.user._id,
            duration: req.body.duration || '00:00',
            durationSec: req.body.durationSec || 0,
            visibility: req.body.visibility || 'public'
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

        // Log Analytics
        try {
            await Analytics.create({
                video: video._id,
                user: req.user ? req.user.id : undefined, // Log user if authenticated
                type: 'view',
                date: new Date()
            });
        } catch (err) {
            console.error('Analytics log error:', err);
            // Don't fail the request if logging fails
        }

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

            // Create Notification (if not self-like)
            if (video.user.toString() !== req.user.id) {
                await Notification.create({
                    recipient: video.user,
                    sender: req.user.id,
                    type: 'like',
                    video: video._id
                });
            }

            // Log Analytics (Like)
            try {
                await Analytics.create({
                    video: video._id,
                    user: req.user.id,
                    type: 'like',
                    date: new Date()
                });
            } catch (err) {
                console.error('Analytics like log error:', err);
            }

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

// @desc    Get video recommendations
// @route   GET /api/videos/:id/recommendations
// @access  Public
export const getRecommendations = async (req, res) => {
    try {
        const currentVideo = await Video.findById(req.params.id);

        if (!currentVideo) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Strategy: Get videos from same creator + videos with similar view counts
        const sameCreatorVideos = await Video.find({
            user: currentVideo.user,
            _id: { $ne: req.params.id }, // Exclude current video
            visibility: 'public' // Ensure recommendations are public
        })
            .populate('user', 'username avatar')
            .limit(5)
            .sort({ createdAt: -1 })
            .lean();

        // Get videos with similar view counts (±20%)
        const minViews = currentVideo.views * 0.8;
        const maxViews = currentVideo.views * 1.2;

        const similarVideos = await Video.find({
            _id: { $ne: req.params.id },
            user: { $ne: currentVideo.user }, // From different creators
            views: { $gte: minViews, $lte: maxViews },
            visibility: 'public' // Ensure recommendations are public
        })
            .populate('user', 'username avatar')
            .limit(5)
            .sort({ createdAt: -1 });

        // Combine and shuffle
        let recommendations = [...sameCreatorVideos, ...similarVideos];

        // Shuffle array
        recommendations = recommendations.sort(() => Math.random() - 0.5);

        // Limit to 10
        recommendations = recommendations.slice(0, 10);

        res.json({
            success: true,
            count: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Log generic interaction
// @route   POST /api/videos/:id/analytics
// @access  Public (or Private? Public for views/clicks matches view logic)
export const logInteraction = async (req, res) => {
    try {
        const { type, metadata } = req.body;
        const videoId = req.params.id;

        // Basic validation
        if (!['scene_click'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid interaction type' });
        }

        await Analytics.create({
            video: videoId,
            user: req.user ? req.user.id : undefined,
            type: type,
            metadata: metadata || {},
            date: new Date()
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Log interaction error:', error);
        // Don't crash for analytics failure, but return error
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get algorithmic feed
// @route   GET /api/videos/feed/algorithmic
// @access  Public
export const getAlgorithmicFeed = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const category = req.query.category;

        // Build query for public videos
        let query = { visibility: 'public' };
        if (category && category !== 'All') {
            query.category = category;
        }

        // Fetch videos with populated user data
        const videos = await Video.find(query)
            .populate('user', 'username avatar')
            .limit(limit)
            .lean();

        // Rank videos using algorithmic scoring
        const userId = req.user ? req.user.id : null;
        const rankedVideos = await rankVideos(videos, userId);

        res.json({
            success: true,
            count: rankedVideos.length,
            data: rankedVideos
        });
    } catch (error) {
        console.error('Get algorithmic feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get following feed (chronological)
// @route   GET /api/videos/feed/following
// @access  Private
export const getFollowingFeed = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const category = req.query.category;

        // Get list of users the current user follows
        const following = await Follow.find({ follower: req.user.id })
            .select('following')
            .lean();

        const followingIds = following.map(f => f.following);

        if (followingIds.length === 0) {
            return res.json({
                success: true,
                count: 0,
                data: [],
                message: 'Not following anyone yet'
            });
        }

        // Build query for videos from followed users
        let query = {
            user: { $in: followingIds },
            visibility: 'public'
        };

        if (category && category !== 'All') {
            query.category = category;
        }

        // Fetch videos in reverse chronological order
        const videos = await Video.find(query)
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({
            success: true,
            count: videos.length,
            data: videos
        });
    } catch (error) {
        console.error('Get following feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get random shorts (videos <= 60s)
// @route   GET /api/videos/shorts
// @access  Public
export const getShorts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Aggregate pipeline to get random sample of shorts
        const shorts = await Video.aggregate([
            {
                $match: {
                    durationSec: { $lte: 60 },
                    visibility: 'public'
                }
            },
            { $sample: { size: limit } }, // Random selection
        ]);

        // Populate user details (aggregate returns plain objects, need populate equivalent)
        // Since aggregate doesn't use Mongoose populate, we use model.populate
        await Video.populate(shorts, { path: 'user', select: 'username avatar followersCount' });

        // Add user-specific fields if authenticated
        // Note: For aggregate results, we need to manually checking following/likes status if needed
        // For MVP shorts feed, we might skip like/follow status or do it in bulk
        // Let's do a simple map if user exists
        if (req.user) {
            for (let video of shorts) {
                const isLiked = await Like.exists({ user: req.user._id, video: video._id });
                const isFollowing = await Follow.exists({ follower: req.user._id, following: video.user._id });
                video.isLiked = !!isLiked;
                video.user.isFollowing = !!isFollowing;
            }
        }

        res.json({
            success: true,
            count: shorts.length,
            data: shorts
        });
    } catch (error) {
        console.error('Get shorts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
