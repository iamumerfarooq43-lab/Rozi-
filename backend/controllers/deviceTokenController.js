import { saveDeviceToken } from '../models/deviceTokenModel.js';

export const registerToken = async (req, res) => {
    try {
        const userId = req.user.id; // match your actual req.user field
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return res.status(400).json({ success: false, message: 'fcmToken is required' });
        }

        await saveDeviceToken(userId, fcmToken);
        res.status(200).json({ success: true, message: 'Device token registered' });
    } catch (error) {
        console.error('Register token error:', error);
        res.status(500).json({ success: false, message: 'Failed to register token' });
    }
};