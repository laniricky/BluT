import Video from '../models/Video.js';

import Like from '../models/Like.js';
import Follow from '../models/Follow.js';
import Analytics from '../models/Analytics.js';

// @route   GET /api/dashboard/stats
// @desc    Get creator dashboard statistics
// @access  Private (Creator only ideally, but User for now)
export const getCreatorStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Total Followers
        const followersCount = await Follow.countDocuments({ following: userId });

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

        // 6. Get Daily Stats for Charts (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyStats = await Analytics.aggregate([
            {
                $match: {
                    date: { $gte: thirtyDaysAgo },
                    video: { $in: videoIds }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        type: "$type"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    views: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", "view"] }, "$count", 0]
                        }
                    },
                    likes: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", "like"] }, "$count", 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format for frontend (fill in missing dates if needed, but for MVP returning sparse is fine)
        const chartData = dailyStats.map(stat => ({
            date: stat._id,
            views: stat.views,
            likes: stat.likes
        }));

        res.json({
            success: true,
            stats: {
                totalViews,
                totalLikes,
                totalLikes,
                followersCount,
                videos: videosWithStats,
                chartData
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error getting dashboard stats' });
    }
};
