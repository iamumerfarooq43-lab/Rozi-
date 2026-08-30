import express from 'express';
import { getWeeklyAnalytics, getMonthlyAnalytics } from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/weekly', getWeeklyAnalytics);
router.get('/monthly', getMonthlyAnalytics);

export default router;