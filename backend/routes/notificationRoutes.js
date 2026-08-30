import express from 'express';


import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // match your existing import style
import { registerToken } from '../controllers/deviceTokenController.js';


const router = express.Router();

router.get('/', authMiddleware, fetchNotifications);
router.put('/:id/read', authMiddleware, markNotificationRead);
router.put('/read-all', authMiddleware, markAllNotificationsRead);
router.post('/register-token', authMiddleware, registerToken);





export default router;