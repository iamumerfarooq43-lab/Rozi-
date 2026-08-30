import {
    getNotificationsByUser,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from '../models/notificationModel.js';

export const fetchNotifications = async (req, res) => {
    try {
        const userId = req.user.id; // adjust to req.user._id if that's your convention
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const notifications = await getNotificationsByUser(userId, limit, offset);
        const unreadCount = await getUnreadCount(userId);

        res.status(200).json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const affectedRows = await markAsRead(id, userId);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await markAllAsRead(userId);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
};