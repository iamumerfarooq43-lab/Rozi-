import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { verifyGoogleToken } from '../utils/googleAuth.js';

// ─── REGISTER ───────────────────────────────────────────
export const register = async (req, res) => {
    // Step 1: Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const { name, email, password } = req.body;

    try {
        // Step 2: Check if email already exists in the database
        const [existingUser] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        // Step 3: Hash the password before saving
        // 12 = salt rounds (how complex the hash is)
        const passwordHash = await bcrypt.hash(password, 12);

        // Step 4: Insert new user into MySQL
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, passwordHash]
        );

        const newUserId = result.insertId;

        // Step 5: Insert default platforms for the new user
        await pool.query(
            `INSERT INTO platforms (user_id, name, type, color) VALUES
        (?, 'Indrive', 'ride', '#22c55e'),
        (?, 'Careem', 'both', '#1db954'),
        (?, 'Yango', 'ride', '#f59e0b'),
        (?, 'Foodpanda', 'delivery', '#ec4899'),
        (?, 'Bykea', 'both', '#3b82f6')`,
            [newUserId, newUserId, newUserId, newUserId, newUserId]
        );

        // Step 6: Return success response (never return the password hash)
        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                id: newUserId,
                name,
                email
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again.',
            error: error.message
        });
    }
};

// ─── LOGIN ───────────────────────────────────────────────
export const login = async (req, res) => {
    // Step 1: Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const { email, password } = req.body;

    try {
        // Step 2: Find user by email
        const [rows] = await pool.query(
            'SELECT id, name, email, password_hash, currency FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            // User not found — but we say "Invalid email or password"
            // Never tell the attacker which one was wrong
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = rows[0];

        // Step 3: Compare submitted password with stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Step 4: Sign a JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },   // payload — data inside the token
            process.env.JWT_SECRET,               // secret key from .env
            { expiresIn: process.env.JWT_EXPIRES_IN }  // e.g. '7d'
        );

        // Step 5: Return token + user info (never return password_hash)
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                currency: user.currency
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again.',
            error: error.message
        });
    }
};


// ─── GOOGLE SIGN-IN ───────────────────────────────────────
export const googleSignIn = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({
            success: false,
            message: 'Google idToken is required'
        });
    }

    try {
        // Step 1: Verify the token with Google and extract profile info
        const { googleId, email, name, picture } = await verifyGoogleToken(idToken);

        // Step 2: Check if a user already exists with this google_id
        const [existingGoogleUser] = await pool.query(
            'SELECT id, name, email, currency FROM users WHERE google_id = ?',
            [googleId]
        );

        if (existingGoogleUser.length > 0) {
            const user = existingGoogleUser[0];

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    currency: user.currency
                }
            });
        }

        // Step 3: Check if email already exists as a password-based account
        const [existingByEmail] = await pool.query(
            'SELECT id, google_id FROM users WHERE email = ?',
            [email]
        );

        if (existingByEmail.length > 0) {
            // Option A: block auto-linking, ask user to log in with password
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists. Please log in with your password instead.'
            });
        }

        // Step 4: No existing user — create a new Google-only account
        const [result] = await pool.query(
            'INSERT INTO users (name, email, google_id, profile_picture) VALUES (?, ?, ?, ?)',
            [name, email, googleId, picture]
        );

        const newUserId = result.insertId;

        // Step 5: Insert default platforms, same as regular signup
        await pool.query(
            `INSERT INTO platforms (user_id, name, type, color) VALUES
        (?, 'Indrive', 'ride', '#22c55e'),
        (?, 'Careem', 'both', '#1db954'),
        (?, 'Yango', 'ride', '#f59e0b'),
        (?, 'Foodpanda', 'delivery', '#ec4899'),
        (?, 'Bykea', 'both', '#3b82f6')`,
            [newUserId, newUserId, newUserId, newUserId, newUserId]
        );

        // Step 6: Sign JWT and return
        const token = jwt.sign(
            { id: newUserId, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            data: {
                id: newUserId,
                name,
                email
            }
        });

    } catch (error) {
        console.error('Google sign-in error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired Google token',
            error: error.message
        });
    }
};