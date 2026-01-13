import Video from '../models/Video.js';
import Subscription from '../models/Subscription.js';
import Like from '../models/Like.js';

// @route   GET /api/dashboard/stats
// @desc    Get creator dashboard statistics
// @access  Private (Creator only ideally, but User for now)
export const getCreatorStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Total Subscribers
        const subscribersCount = await Subscription.countDocuments({ channel: userId });

        // 2. Get all videos by user to calculate views and likes
        const videos = await Video.find({ user: userId }).sort({ createdAt: -1 });

        // 3. Calculate Total Views
        const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);

        // 4. Calculate Total Likes (This is more complex, need to count likes for EACH video)
        // Optimization: We could store totalLikes on the User model or Video model, but for now we aggregate.
        // Or loop through videos and count. For MVP, let's do a separate query if needed, or just sum if we had it on video.
        // Since we don't store likesCount on Video document permanently (we count it dynamically in getVideoById), 
        // we can aggregate from the Like collection.
        const videoIds = videos.map(v => v._id);
        const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

        // 5. Recent Videos (return list with stats)
        // We want to attach individual likes count to each video for the dashboard table
        const videosWithStats = await Promise.all(videos.map(async (video) => {
            const likesCount = await Like.countDocuments({ video: video._id });
            return {
                ...video.toObject(),
                likesCount
            };
        }));

        res.json({
            success: true,
            stats: {
                totalViews,
                totalLikes,
                subscribersCount,
                videos: videosWithStats
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error getting dashboard stats' });
    }
};
