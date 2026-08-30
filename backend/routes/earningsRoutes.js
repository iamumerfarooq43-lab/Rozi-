import express from 'express';
import { getEarnings, createEarning, deleteEarning } from '../controllers/earningsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getEarnings);
router.post('/', createEarning);
router.delete('/:id', deleteEarning);

export default router;