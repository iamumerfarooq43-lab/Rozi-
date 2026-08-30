import { messaging, getToken } from '../firebase.js';
import api from '../services/api.js';

const VAPID_KEY = "BMgYnLCqxWLNHw3-W77LyIvJ0GMpj0e6Aw3B4uSlV-RU8zTqx3FxJ44B3OtgPBwsd-RVzZrppX2qgmG2QVbJBw4";

export const requestNotificationPermission = async () => {
    try {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.log('This browser does not support notifications or service workers');
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return;
        }

        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const registration = await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        if (token) {
            await api.post('/notifications/register-token', { fcmToken: token });
            console.log('FCM token registered successfully');
        }
    } catch (error) {
        console.error('Error getting notification permission/token:', error);
    }
};