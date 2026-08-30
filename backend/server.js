import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import platformsRoutes from './routes/platformsRoutes.js';
import earningsRoutes from './routes/earningsRoutes.js';
import fuelLogsRoutes from './routes/fuelLogsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { scheduleWeeklySummary } from './controllers/weeklySummaryJob.js';
import assistantRoutes from './routes/assistantRoutes.js';



const app = express();

// Security middleware
app.use(helmet());

scheduleWeeklySummary();

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}))

// Parse JSON bodies
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformsRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/fuel-logs', fuelLogsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assistant', assistantRoutes);




// ─── Test Routes ─────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Rozi API is running!'
    });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({
            success: true,
            message: 'Database connected!',
            result: rows[0].result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Rozi server running on port ${PORT}`);
});

