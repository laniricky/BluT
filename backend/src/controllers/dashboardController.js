import Video from '../models/Video.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Follow from '../models/Follow.js';
import Analytics from '../models/Analytics.js';

// @route   GET /api/dashboard/stats
// @desc    Get creator dashboard statistics with advanced analytics
// @access  Private (Creator only ideally, but User for now)
export const getCreatorStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Total Followers
        const followersCount = await Follow.countDocuments({ following: userId });

        // 2. Get all videos by user
        const videos = await Video.find({ user: userId }).sort({ createdAt: -1 });
        const videoIds = videos.map(v => v._id);

        // 3. Calculate Total Views
        const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);

        // 4. Calculate Total Likes
        const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

        // 5. Calculate Total Comments
        const totalComments = await Comment.countDocuments({ video: { $in: videoIds } });

        // 6. Calculate Overall Engagement Rate
        const overallEngagementRate = totalViews > 0
            ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(2)
            : 0;

        // 7. Get Previous Period Stats for Trend Calculation (30-60 days ago)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // Previous period views
        const previousPeriodViews = await Analytics.countDocuments({
            video: { $in: videoIds },
            type: 'view',
            date: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        });

        // Current period views
        const currentPeriodViews = await Analytics.countDocuments({
            video: { $in: videoIds },
            type: 'view',
            date: { $gte: thirtyDaysAgo }
        });

        // Calculate views trend
        const viewsTrend = previousPeriodViews > 0
            ? (((currentPeriodViews - previousPeriodViews) / previousPeriodViews) * 100).toFixed(1)
            : currentPeriodViews > 0 ? 100 : 0;

        // Previous period likes
        const previousPeriodLikes = await Analytics.countDocuments({
            video: { $in: videoIds },
            type: 'like',
            date: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        });

        // Current period likes
        const currentPeriodLikes = await Analytics.countDocuments({
            video: { $in: videoIds },
            type: 'like',
            date: { $gte: thirtyDaysAgo }
        });

        // Calculate likes trend
        const likesTrend = previousPeriodLikes > 0
            ? (((currentPeriodLikes - previousPeriodLikes) / previousPeriodLikes) * 100).toFixed(1)
            : currentPeriodLikes > 0 ? 100 : 0;

        // 8. Get Follower Growth Over Time (Last 30 Days)
        const followerGrowth = await Follow.aggregate([
            {
                $match: {
                    following: userId,
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    newFollowers: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Calculate cumulative follower count for chart
        let cumulativeFollowers = followersCount - followerGrowth.reduce((sum, day) => sum + day.newFollowers, 0);
        const followerGrowthData = followerGrowth.map(day => {
            cumulativeFollowers += day.newFollowers;
            return {
                date: day._id,
                followers: cumulativeFollowers,
                newFollowers: day.newFollowers
            };
        });

        // Calculate follower trend
        const followersAtStartOfPeriod = followersCount - followerGrowth.reduce((sum, day) => sum + day.newFollowers, 0);
        const followersTrend = followersAtStartOfPeriod > 0
            ? (((followersCount - followersAtStartOfPeriod) / followersAtStartOfPeriod) * 100).toFixed(1)
            : followersCount > 0 ? 100 : 0;

        // 9. Video Stats with Enhanced Metrics
        const videosWithStats = await Promise.all(videos.map(async (video) => {
            const likesCount = await Like.countDocuments({ video: video._id });
            const commentsCount = await Comment.countDocuments({ video: video._id });
            const engagementRate = video.views > 0
                ? (((likesCount + commentsCount) / video.views) * 100).toFixed(2)
                : 0;

            return {
                ...video.toObject(),
                likesCount,
                commentsCount,
                engagementRate
            };
        }));

        // 10. Daily Stats for Charts (Last 30 days)
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

        const chartData = dailyStats.map(stat => ({
            date: stat._id,
            views: stat.views,
            likes: stat.likes,
            engagementRate: stat.views > 0 ? ((stat.likes / stat.views) * 100).toFixed(2) : 0
        }));

        // 11. Top Scenes (Interaction Analytics)
        const topScenes = await Analytics.aggregate([
            {
                $match: {
                    type: 'scene_click',
                    video: { $in: videoIds }
                }
            },
            {
                $group: {
                    _id: "$metadata.sceneTitle",
                    count: { $sum: 1 },
                    videoId: { $first: "$video" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "videos",
                    localField: "videoId",
                    foreignField: "_id",
                    as: "videoInfo"
                }
            },
            {
                $project: {
                    sceneTitle: "$_id",
                    count: 1,
                    videoTitle: { $arrayElemAt: ["$videoInfo.title", 0] }
                }
            }
        ]);

        // 12. Top Performing Videos (by engagement)
        const topVideos = videosWithStats
            .sort((a, b) => parseFloat(b.engagementRate) - parseFloat(a.engagementRate))
            .slice(0, 5)
            .map(v => ({
                _id: v._id,
                title: v.title,
                thumbnailUrl: v.thumbnailUrl,
                views: v.views,
                likesCount: v.likesCount,
                commentsCount: v.commentsCount,
                engagementRate: v.engagementRate
            }));

        res.json({
            success: true,
            stats: {
                // Overview Stats
                totalViews,
                totalLikes,
                totalComments,
                followersCount,
                videoCount: videos.length,
                overallEngagementRate,

                // Trend Indicators
                viewsTrend: parseFloat(viewsTrend),
                likesTrend: parseFloat(likesTrend),
                followersTrend: parseFloat(followersTrend),

                // Chart Data
                chartData,
                followerGrowthData,

                // Video Lists
                videos: videosWithStats,
                topVideos,
                topScenes
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error getting dashboard stats' });
    }
};
