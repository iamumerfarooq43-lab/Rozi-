import pool from '../config/db.js';

// GET /api/platforms — get all platforms for logged-in user
export const getPlatforms = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM platforms WHERE user_id = ? ORDER BY name ASC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/platforms — add a new platform
export const createPlatform = async (req, res) => {
    const { name, type, color } = req.body;
    if (!name || !type) {
        return res.status(400).json({ message: 'Name and type are required' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO platforms (user_id, name, type, color) VALUES (?, ?, ?, ?)',
            [req.user.id, name, type, color || '#6366f1']
        );
        const [rows] = await pool.query('SELECT * FROM platforms WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/platforms/:id — update a platform
export const updatePlatform = async (req, res) => {
    const { id } = req.params;
    const { name, type, color, is_active } = req.body;
    try {
        const [existing] = await pool.query(
            'SELECT * FROM platforms WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Platform not found' });
        }
        await pool.query(
            'UPDATE platforms SET name = ?, type = ?, color = ?, is_active = ? WHERE id = ? AND user_id = ?',
            [
                name ?? existing[0].name,
                type ?? existing[0].type,
                color ?? existing[0].color,
                is_active ?? existing[0].is_active,
                id,
                req.user.id,
            ]
        );
        const [updated] = await pool.query('SELECT * FROM platforms WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// DELETE /api/platforms/:id — delete a platform
export const deletePlatform = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await pool.query(
            'SELECT * FROM platforms WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Platform not found' });
        }
        await pool.query('DELETE FROM platforms WHERE id = ? AND user_id = ?', [id, req.user.id]);
        res.json({ message: 'Platform deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};