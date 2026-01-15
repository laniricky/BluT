import Like from '../models/Like.js';
import Analytics from '../models/Analytics.js';
import Follow from '../models/Follow.js';

/**
 * Calculate algorithmic score for a video
 * @param {Object} video - Video object with populated user and metadata
 * @param {String} userId - Optional current user ID for personalization
 * @returns {Number} - Calculated score (0-100)
 */
export const calculateVideoScore = async (video, userId = null) => {
    try {
        const now = Date.now();
        const videoAge = now - new Date(video.createdAt).getTime();
        const hoursOld = videoAge / (1000 * 60 * 60);

        // 1. ENGAGEMENT VELOCITY (40% weight)
        // Calculate likes/views ratio within first 24 hours
        let engagementVelocity = 0;
        if (hoursOld <= 24) {
            const likesCount = await Like.countDocuments({ video: video._id });
            const views = video.views || 1; // Avoid division by zero
            engagementVelocity = (likesCount / views) * 100; // Convert to percentage
        } else {
            // For older videos, look at historical engagement in first 24h
            const firstDayEnd = new Date(new Date(video.createdAt).getTime() + 24 * 60 * 60 * 1000);
            const earlyLikes = await Like.countDocuments({
                video: video._id,
                createdAt: { $lte: firstDayEnd }
            });
            const views = video.views || 1;
            engagementVelocity = (earlyLikes / views) * 100;
        }

        // 2. WATCH TIME & COMPLETION RATE (30% weight)
        // Analyze analytics data to find average watch time
        let watchTimeScore = 0;
        const analyticsData = await Analytics.aggregate([
            {
                $match: {
                    video: video._id,
                    type: 'view'
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]);

        if (analyticsData.length > 0 && video.views > 0) {
            // Simple heuristic: more views = better retention
            // In a real system, you'd track actual watch time from player events
            const viewCount = analyticsData[0].count;
            watchTimeScore = Math.min((viewCount / video.views) * 100, 100);
        } else {
            // Default score for new videos
            watchTimeScore = 50;
        }

        // 3. RECENCY DECAY (20% weight)
        // Newer content gets higher scores, with exponential decay
        let recencyScore = 100;
        if (hoursOld > 1) {
            // Decay formula: 100 * e^(-0.01 * hours)
            // After 24h: ~78, After 72h: ~48, After 168h (1 week): ~18
            recencyScore = 100 * Math.exp(-0.01 * hoursOld);
        }

        // 4. USER AFFINITY (10% weight)
        // Boost videos from creators the user follows
        let affinityScore = 0;
        if (userId) {
            const isFollowing = await Follow.exists({
                follower: userId,
                following: video.user._id || video.user
            });
            affinityScore = isFollowing ? 100 : 0;
        }

        // CALCULATE WEIGHTED FINAL SCORE
        const weights = {
            engagement: 0.40,
            watchTime: 0.30,
            recency: 0.20,
            affinity: 0.10
        };

        const finalScore =
            (engagementVelocity * weights.engagement) +
            (watchTimeScore * weights.watchTime) +
            (recencyScore * weights.recency) +
            (affinityScore * weights.affinity);

        return Math.round(finalScore * 100) / 100; // Round to 2 decimals
    } catch (error) {
        console.error('Error calculating video score:', error);
        return 0;
    }
};

/**
 * Rank a list of videos using algorithmic scoring
 * @param {Array} videos - Array of video objects
 * @param {String} userId - Optional current user ID
 * @returns {Array} - Videos sorted by score (highest first) with score attached
 */
export const rankVideos = async (videos, userId = null) => {
    try {
        // Calculate scores for all videos in parallel
        const scoredVideos = await Promise.all(
            videos.map(async (video) => {
                const score = await calculateVideoScore(video, userId);
                return {
                    ...video,
                    algorithmicScore: score
                };
            })
        );

        // Sort by score descending
        scoredVideos.sort((a, b) => b.algorithmicScore - a.algorithmicScore);

        return scoredVideos;
    } catch (error) {
        console.error('Error ranking videos:', error);
        return videos; // Return original order on error
    }
};
