import pool from '../config/db.js';



// GET /api/earnings — get all earnings with platform name (JOIN)
import { createNotification } from '../models/notificationModel.js';
import { sendPushNotification } from '../utils/sendPush.js';

export const createEarning = async (req, res) => {
    const { platform_id, date, gross_amount, ride_count, hours_worked, notes } = req.body;

    if (!platform_id || !date || !gross_amount) {
        return res.status(400).json({ message: 'platform_id, date, and gross_amount are required' });
    }

    try {
        // make sure the platform belongs to this user
        const [platform] = await pool.query(
            'SELECT * FROM platforms WHERE id = ? AND user_id = ?',
            [platform_id, req.user.id]
        );
        if (platform.length === 0) {
            return res.status(404).json({ message: 'Platform not found' });
        }

        const [result] = await pool.query(
            `INSERT INTO earnings (user_id, platform_id, date, gross_amount, ride_count, hours_worked, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, platform_id, date, gross_amount, ride_count || 0, hours_worked || null, notes || null]
        );

        // ← new: log + push notification
        await createNotification(
            req.user.id,
            'Earnings Added',
            `You logged Rs. ${gross_amount} from ${platform[0].name}.`,
            'earnings_alert'
        );
        await sendPushNotification(
            req.user.id,
            'Earnings Added',
            `You logged Rs. ${gross_amount} from ${platform[0].name}.`
        );

        // return the full row with JOIN so frontend gets platform info immediately
        const [rows] = await pool.query(
            `SELECT 
        e.id, e.date, e.gross_amount, e.ride_count, e.hours_worked, e.notes,
        p.id AS platform_id, p.name AS platform_name, p.color AS platform_color, p.type AS platform_type
       FROM earnings e
       INNER JOIN platforms p ON e.platform_id = p.id
       WHERE e.id = ?`,
            [result.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getEarnings = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
        e.id, e.date, e.gross_amount, e.ride_count, e.hours_worked, e.notes,
        p.id AS platform_id, p.name AS platform_name, p.color AS platform_color, p.type AS platform_type
       FROM earnings e
       INNER JOIN platforms p ON e.platform_id = p.id
       WHERE e.user_id = ?
       ORDER BY e.date DESC`,
            [req.user.id]
        );

        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// DELETE /api/earnings/:id — delete an earning entry
export const deleteEarning = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await pool.query(
            'SELECT * FROM earnings WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Earning not found' });
        }
        await pool.query('DELETE FROM earnings WHERE id = ? AND user_id = ?', [id, req.user.id]);
        res.json({ message: 'Earning deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};