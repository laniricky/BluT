import express from 'express';
import Analytics from '../models/Analytics.js';
import Video from '../models/Video.js';
import Follow from '../models/Follow.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get analytics for a specific video
// @route   GET /api/analytics/video/:videoId
// @access  Private (video owner only)
router.get('/video/:videoId', protect, async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check ownership
        if (video.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view analytics for this video'
            });
        }

        // Get views and likes analytics
        const viewsCount = await Analytics.countDocuments({
            video: req.params.videoId,
            type: 'view'
        });

        const likesCount = await Analytics.countDocuments({
            video: req.params.videoId,
            type: 'like'
        });

        // Get views over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const viewsOverTime = await Analytics.aggregate([
            {
                $match: {
                    video: video._id,
                    type: 'view',
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$date' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                video: {
                    id: video._id,
                    title: video.title
                },
                totalViews: viewsCount,
                totalLikes: likesCount,
                viewsOverTime
            }
        });
    } catch (error) {
        console.error('Get video analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// @desc    Get aggregated analytics for a creator
// @route   GET /api/analytics/creator
// @access  Private
router.get('/creator', protect, async (req, res) => {
    try {
        // Get all videos by this creator
        const videos = await Video.find({ user: req.user.id });
        const videoIds = videos.map(v => v._id);

        // Total views across all videos
        const totalViews = await Analytics.countDocuments({
            video: { $in: videoIds },
            type: 'view'
        });

        // Total likes across all videos
        const totalLikes = await Analytics.countDocuments({
            video: { $in: videoIds },
            type: 'like'
        });

        // Followers count
        const followersCount = await Follow.countDocuments({
            following: req.user.id
        });

        // Views over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const viewsOverTime = await Analytics.aggregate([
            {
                $match: {
                    video: { $in: videoIds },
                    type: 'view',
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$date' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Top performing videos (by views)
        const topVideos = await Analytics.aggregate([
            {
                $match: {
                    video: { $in: videoIds },
                    type: 'view'
                }
            },
            {
                $group: {
                    _id: '$video',
                    views: { $sum: 1 }
                }
            },
            {
                $sort: { views: -1 }
            },
            {
                $limit: 5
            }
        ]);

        // Populate video details for top videos
        const topVideosWithDetails = await Promise.all(
            topVideos.map(async (item) => {
                const video = await Video.findById(item._id).select('title thumbnailUrl createdAt');
                const likes = await Analytics.countDocuments({
                    video: item._id,
                    type: 'like'
                });
                return {
                    ...video.toObject(),
                    views: item.views,
                    likes
                };
            })
        );

        res.json({
            success: true,
            data: {
                totalVideos: videos.length,
                totalViews,
                totalLikes,
                followersCount,
                viewsOverTime,
                topVideos: topVideosWithDetails
            }
        });
    } catch (error) {
        console.error('Get creator analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

export default router;
