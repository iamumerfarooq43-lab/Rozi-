import pool from '../config/db.js';

// GET /api/analytics/weekly — daily earnings for past 30 days
export const getWeeklyAnalytics = async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await pool.query(
            `SELECT 
        DATE(date) AS day,
        COALESCE(SUM(gross_amount), 0) AS total,
        COALESCE(SUM(ride_count), 0) AS rides
       FROM earnings
       WHERE user_id = ?
         AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(date)
       ORDER BY day ASC`,
            [userId]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/analytics/monthly — per platform comparison this month
export const getMonthlyAnalytics = async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await pool.query(
            `SELECT
        p.name AS platform,
        p.color,
        COALESCE(SUM(e.gross_amount), 0) AS total,
        COALESCE(SUM(e.ride_count), 0) AS rides,
        COALESCE(SUM(e.hours_worked), 0) AS hours,
        CASE 
          WHEN COALESCE(SUM(e.hours_worked), 0) > 0 
          THEN ROUND(SUM(e.gross_amount) / SUM(e.hours_worked), 0)
          ELSE 0
        END AS per_hour
       FROM earnings e
       INNER JOIN platforms p ON e.platform_id = p.id
       WHERE e.user_id = ?
         AND MONTH(e.date) = MONTH(CURDATE())
         AND YEAR(e.date) = YEAR(CURDATE())
       GROUP BY p.id, p.name, p.color
       ORDER BY total DESC`,
            [userId]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};