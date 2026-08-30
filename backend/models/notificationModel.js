import pool from '../config/db.js';

export const getNotificationsByUser = async (userId, limit = 20, offset = 0) => {
    const [rows] = await pool.query(
        `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    );
    return rows;
};

export const getUnreadCount = async (userId) => {
    const [rows] = await pool.query(
        `SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = FALSE`,
        [userId]
    );
    return rows[0].unreadCount;
};

export const createNotification = async (userId, title, message, type = 'general') => {
    const [result] = await pool.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
        [userId, title, message, type]
    );
    return result.insertId;
};

export const markAsRead = async (notificationId, userId) => {
    const [result] = await pool.query(
        `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
    );
    return result.affectedRows;
};

export const markAllAsRead = async (userId) => {
    const [result] = await pool.query(
        `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`,
        [userId]
    );
    return result.affectedRows;
};