import express from 'express';
import { getPlatforms, createPlatform, updatePlatform, deletePlatform } from '../controllers/platformsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getPlatforms);
router.post('/', createPlatform);
router.put('/:id', updatePlatform);
router.delete('/:id', deletePlatform);

export default router;