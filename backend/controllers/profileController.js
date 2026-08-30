import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';

// GET /api/profile — get logged in captain's profile
export const getProfile = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
        id, name, email, phone, age, profile_picture,
        tier, rating, acceptance_rate, is_active, currency, created_at
       FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/profile — update personal info
export const updateProfile = async (req, res) => {
    const { name, phone, age } = req.body;

    try {
        await pool.query(
            `UPDATE users SET
        name  = COALESCE(?, name),
        phone = COALESCE(?, phone),
        age   = COALESCE(?, age)
       WHERE id = ?`,
            [name || null, phone || null, age || null, req.user.id]
        );

        const [rows] = await pool.query(
            `SELECT 
        id, name, email, phone, age, profile_picture,
        tier, rating, acceptance_rate, is_active, currency, created_at
       FROM users WHERE id = ?`,
            [req.user.id]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/profile/password — change password
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both fields are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hash, req.user.id]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/profile/avatar — upload profile picture
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please select an image.' });
        }

        const imageUrl = req.file.path;

        if (!imageUrl) {
            return res.status(500).json({ message: 'Upload succeeded but no image URL was returned by Cloudinary.' });
        }

        await pool.query(
            'UPDATE users SET profile_picture = ? WHERE id = ?',
            [imageUrl, req.user.id]
        );

        res.json({ profile_picture: imageUrl });
    } catch (err) {
        res.status(500).json({
            message:
                err.message.includes('Cloudinary') || err.message.includes('cloudinary')
                    ? 'Cloudinary upload failed. Check your Cloudinary credentials.'
                    : 'Failed to upload avatar. Please try again.',
            error: err.message,
        });
    }
};

export const deleteAvatar = async (req, res) => {
    try {
        const [[user]] = await pool.query(
            'SELECT profile_picture FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user?.profile_picture) {
            return res.status(400).json({ message: 'No avatar to delete' });
        }

        // Extract Cloudinary public_id from the stored URL
        const urlParts = user.profile_picture.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `rozi/avatars/${fileWithExt.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);

        await pool.query(
            'UPDATE users SET profile_picture = NULL WHERE id = ?',
            [req.user.id]
        );

        res.json({ message: 'Avatar deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};