import pool from '../config/db.js';
import { createNotification } from '../models/notificationModel.js';
import { sendPushNotification } from '../utils/sendPush.js';

export const getDashboardSummary = async (req, res) => {
    const { range = 'month' } = req.query;
    const userId = req.user.id;

    // Build date range based on query param
    let startDate, endDate;
    const today = new Date();

    if (range === 'today') {
        startDate = today.toISOString().split('T')[0];
        endDate = startDate;
    } else if (range === 'week') {
        const day = today.getDay();
        const diffToMonday = (day === 0 ? -6 : 1 - day);
        const monday = new Date(today);
        monday.setDate(today.getDate() + diffToMonday);
        startDate = monday.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
    } else {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
    }

    try {
        const [[earningsRow]] = await pool.query(
            `SELECT COALESCE(SUM(gross_amount), 0) AS total_earnings
       FROM earnings
       WHERE user_id = ? AND date BETWEEN ? AND ?`,
            [userId, startDate, endDate]
        );

        const [[fuelRow]] = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total_fuel
       FROM fuel_logs
       WHERE user_id = ? AND date BETWEEN ? AND ?`,
            [userId, startDate, endDate]
        );

        const [platformRows] = await pool.query(
            `SELECT 
        p.id, p.name, p.color, p.type,
        COALESCE(SUM(e.gross_amount), 0) AS total,
        COUNT(e.id) AS trips,
        COALESCE(SUM(e.hours_worked), 0) AS hours
       FROM earnings e
       INNER JOIN platforms p ON e.platform_id = p.id
       WHERE e.user_id = ? AND e.date BETWEEN ? AND ?
       GROUP BY p.id, p.name, p.color, p.type
       ORDER BY total DESC`,
            [userId, startDate, endDate]
        );

        const totalEarnings = Number(earningsRow.total_earnings);
        const totalFuel = Number(fuelRow.total_fuel);
        const netProfit = totalEarnings - totalFuel;

        // ← new: fuel log reminder check
        checkFuelReminder(userId).catch(err =>
            console.error('Fuel reminder check failed:', err)
        );

        res.json({
            range,
            startDate,
            endDate,
            totalEarnings,
            totalFuel,
            netProfit,
            platforms: platformRows,
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Checks if the user hasn't logged fuel in 3+ days, sends a reminder max once per day
const checkFuelReminder = async (userId) => {
    const [[lastLog]] = await pool.query(
        `SELECT MAX(date) AS last_date FROM fuel_logs WHERE user_id = ?`,
        [userId]
    );

    const lastDate = lastLog.last_date;
    const daysSince = lastDate
        ? Math.floor((new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24))
        : Infinity;

    if (daysSince < 3) return;

    const [alreadySentToday] = await pool.query(
        `SELECT id FROM notifications 
     WHERE user_id = ? AND type = 'fuel_reminder' AND DATE(created_at) = CURDATE()`,
        [userId]
    );

    if (alreadySentToday.length > 0) return;

    const message = "You haven't logged fuel in a few days — don't forget to track it!";
    await createNotification(userId, 'Fuel Log Reminder', message, 'fuel_reminder');
    await sendPushNotification(userId, 'Fuel Log Reminder', message);
};