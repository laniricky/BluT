import User from '../models/User.js';
import Video from '../models/Video.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';

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

        // Get follower count
        const followersCount = await Follow.countDocuments({ following: user._id });

        // Get video count
        const videosCount = await Video.countDocuments({ user: user._id });

        // Check if current logged-in user is following
        let isFollowing = false;
        let isFollower = false;
        if (req.user) {
            isFollowing = await Follow.exists({
                follower: req.user._id,
                following: user._id,
            });

            isFollower = await Follow.exists({
                follower: user._id,
                following: req.user._id,
            });
        }

        res.json({
            success: true,
            user: {
                ...user.toObject(),
                followersCount,
                videosCount,
                isFollowing: !!isFollowing,
                isFollower: !!isFollower,
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

// @route   POST /api/users/:id/follow
// @desc    Follow/Unfollow a user
// @access  Private
export const toggleFollow = async (req, res) => {
    try {
        const followingId = req.params.id;

        if (followingId === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
        }

        const userToFollow = await User.findById(followingId);
        if (!userToFollow) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const existingFollow = await Follow.findOne({
            follower: req.user.id,
            following: followingId,
        });

        if (existingFollow) {
            // Unfollow
            await Follow.findByIdAndDelete(existingFollow._id);
            return res.json({ success: true, message: 'Unfollowed', isFollowing: false });
        } else {
            // Follow
            await Follow.create({
                follower: req.user.id,
                following: followingId,
            });

            // Create Notification
            await Notification.create({
                recipient: followingId,
                sender: req.user.id,
                type: 'follow'
            });

            return res.json({ success: true, message: 'Followed', isFollowing: true });
        }
    } catch (error) {
        console.error('Follow toggle error:', error);
        res.status(500).json({ success: false, message: 'Server error toggling follow' });
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

// @route   GET /api/users/:id/followers
// @desc    Get user followers
// @access  Public
export const getUserFollowers = async (req, res) => {
    try {
        const followers = await Follow.find({ following: req.params.id })
            .populate('follower', 'username avatar bio')
            .sort({ createdAt: -1 });

        const formattedFollowers = followers.map(f => f.follower);

        res.json({
            success: true,
            followers: formattedFollowers
        });
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving followers' });
    }
};

// @route   GET /api/users/:id/following
// @desc    Get user following
// @access  Public
export const getUserFollowing = async (req, res) => {
    try {
        const following = await Follow.find({ follower: req.params.id })
            .populate('following', 'username avatar bio')
            .sort({ createdAt: -1 });

        const formattedFollowing = following.map(f => f.following);

        res.json({
            success: true,
            following: formattedFollowing
        });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving following' });
    }
};
