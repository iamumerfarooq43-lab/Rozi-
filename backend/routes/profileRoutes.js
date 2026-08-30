import express from 'express';
import {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar
} from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/avatar', deleteAvatar);


export default router;