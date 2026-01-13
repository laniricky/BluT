import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'username avatar')
            .populate('video', 'title thumbnail')
            .limit(20);

        // Count unread
        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            read: false
        });

        res.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark notification read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.json({ success: true, data: notification });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark all read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { $set: { read: true } }
        );

        res.json({ success: true, message: 'All marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
