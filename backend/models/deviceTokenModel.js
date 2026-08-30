import pool from '../config/db.js'; // match your actual import path

export const saveDeviceToken = async (userId, fcmToken) => {
    // Upsert: if token already exists, just update timestamp; otherwise insert
    const [result] = await pool.query(
        `INSERT INTO device_tokens (user_id, fcm_token) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
        [userId, fcmToken]
    );
    return result;
};

export const getTokensByUser = async (userId) => {
    const [rows] = await pool.query(
        `SELECT fcm_token FROM device_tokens WHERE user_id = ?`,
        [userId]
    );
    return rows.map(row => row.fcm_token);
};

export const deleteToken = async (fcmToken) => {
    await pool.query(`DELETE FROM device_tokens WHERE fcm_token = ?`, [fcmToken]);
};