import User from '../models/User.js';
import Video from '../models/Video.js';
import Subscription from '../models/Subscription.js';

// @route   GET /api/users/:username
// @desc    Get user profile data
// @access  Public
export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get subscriber count
        const subscribersCount = await Subscription.countDocuments({ channel: user._id });

        // Get video count
        const videosCount = await Video.countDocuments({ user: user._id });

        // Check if current logged-in user is subscribed
        let isSubscribed = false;
        if (req.user) {
            isSubscribed = await Subscription.exists({
                subscriber: req.user._id,
                channel: user._id,
            });
        }

        res.json({
            success: true,
            user: {
                ...user.toObject(),
                subscribersCount,
                videosCount,
                isSubscribed: !!isSubscribed,
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving profile' });
    }
};

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { bio, avatar } = req.body;

        // Find user and update
        const user = await User.findById(req.user.id);

        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        res.json({
            success: true,
            user: user.toPublicJSON(),
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
};

// @route   POST /api/users/:id/subscribe
// @desc    Subscribe/Unsubscribe to a user
// @access  Private
export const toggleSubscribe = async (req, res) => {
    try {
        const channelId = req.params.id;

        if (channelId === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot subscribe to yourself' });
        }

        const channel = await User.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }

        const existingSub = await Subscription.findOne({
            subscriber: req.user.id,
            channel: channelId,
        });

        if (existingSub) {
            // Unsubscribe
            await Subscription.findByIdAndDelete(existingSub._id);
            return res.json({ success: true, message: 'Unsubscribed', isSubscribed: false });
        } else {
            // Subscribe
            await Subscription.create({
                subscriber: req.user.id,
                channel: channelId,
            });
            return res.json({ success: true, message: 'Subscribed', isSubscribed: true });
        }
    } catch (error) {
        console.error('Subscribe toggle error:', error);
        res.status(500).json({ success: false, message: 'Server error toggling subscription' });
    }
};

// @route   POST /api/users/history/:videoId
// @desc    Add video to watch history
// @access  Private
export const addToWatchHistory = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { progress } = req.body;
        const user = await User.findById(req.user.id);

        const existingItemIndex = user.watchHistory.findIndex(item => item.video.toString() === videoId);

        if (existingItemIndex > -1) {
            // Update existing entry
            user.watchHistory[existingItemIndex].viewedAt = Date.now();
            user.watchHistory[existingItemIndex].lastViewed = Date.now();
            if (progress !== undefined) {
                user.watchHistory[existingItemIndex].progress = progress;
            }

            // Move to top
            const item = user.watchHistory.splice(existingItemIndex, 1)[0];
            user.watchHistory.unshift(item);

        } else {
            // Add new entry
            user.watchHistory.unshift({
                video: videoId,
                viewedAt: Date.now(),
                lastViewed: Date.now(),
                progress: progress || 0,
            });
        }

        // Limit history to 50 items
        if (user.watchHistory.length > 50) {
            user.watchHistory = user.watchHistory.slice(0, 50);
        }

        await user.save();

        res.json({ success: true, message: 'Added to history' });
    } catch (error) {
        console.error('Add to history error:', error);
        res.status(500).json({ success: false, message: 'Server error adding to history' });
    }
};

// @route   GET /api/users/history
// @desc    Get user watch history
// @access  Private
export const getWatchHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'watchHistory.video',
                populate: { path: 'user', select: 'username avatar' }
            });

        // Filter out null videos (deleted videos)
        const history = user.watchHistory.filter(item => item.video);

        res.json({
            success: true,
            history
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving history' });
    }
};

export const getUserVideos = async (req, res) => {
    try {
        const videos = await Video.find({ user: req.params.id })
            .sort({ createdAt: -1 })
            .populate('user', 'username avatar');

        res.json({
            success: true,
            videos,
        });
    } catch (error) {
        console.error('Get user videos error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving user videos' });
    }
};
