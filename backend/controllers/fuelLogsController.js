import pool from '../config/db.js';

// GET /api/fuel-logs — get all fuel logs for logged-in user
export const getFuelLogs = async (req, res) => {
    const { start_date, end_date } = req.query;

    let query = `
    SELECT id, date, amount, liters, notes
    FROM fuel_logs
    WHERE user_id = ?
  `;
    const params = [req.user.id];

    if (start_date) {
        query += ' AND date >= ?';
        params.push(start_date);
    }
    if (end_date) {
        query += ' AND date <= ?';
        params.push(end_date);
    }

    query += ' ORDER BY date DESC';

    try {
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/fuel-logs — log a new fuel expense
export const createFuelLog = async (req, res) => {
    const { date, amount, liters, notes } = req.body;

    if (!date || !amount) {
        return res.status(400).json({ message: 'date and amount are required' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO fuel_logs (user_id, date, amount, liters, notes)
       VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, date, amount, liters || null, notes || null]
        );

        const [rows] = await pool.query(
            'SELECT * FROM fuel_logs WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// DELETE /api/fuel-logs/:id — delete a fuel log
export const deleteFuelLog = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await pool.query(
            'SELECT * FROM fuel_logs WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Fuel log not found' });
        }
        await pool.query(
            'DELETE FROM fuel_logs WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        res.json({ message: 'Fuel log deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};