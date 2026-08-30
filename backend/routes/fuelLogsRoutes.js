import express from 'express';
import { getFuelLogs, createFuelLog, deleteFuelLog } from '../controllers/fuelLogsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getFuelLogs);
router.post('/', createFuelLog);
router.delete('/:id', deleteFuelLog);

export default router;