import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import pool from '../config/db.js';
import { googleSignIn } from '../controllers/authController.js';

const router = Router();

// ─── Validation rules ────────────────────────────────────

const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
];

// ─── Routes ──────────────────────────────────────────────

// GET /api/auth/google — Google OAuth2 login
router.post('/google', googleSignIn);

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

// GET /api/auth/me — protected route
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, currency, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: error.message
        });
    }
});

export default router;