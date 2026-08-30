import messaging from '../config/firebaseAdmin.js';
import { getTokensByUser, deleteToken } from '../models/deviceTokenModel.js';

export const sendPushNotification = async (userId, title, body) => {
    const tokens = await getTokensByUser(userId);

    console.log(`Sending push to user ${userId}, found ${tokens.length} token(s)`);

    if (tokens.length === 0) {
        console.log('No device tokens found — skipping push');
        return;
    }

    const message = {
        notification: { title, body },
    };

    for (const token of tokens) {
        try {
            const response = await messaging.send({ ...message, token });
            console.log('Push sent successfully:', response);
        } catch (error) {
            console.error('Push send error code:', error.code);
            console.error('Push send error message:', error.message);

            if (
                error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered'
            ) {
                console.log(`Removing stale token: ${token}`);
                await deleteToken(token);
            } else {
                console.error('Push send error (uncaught type):', error);
            }
        }
    }
};