import { precacheAndRoute } from 'workbox-precaching';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Required by injectManifest — Workbox injects the PWA precache list here
precacheAndRoute(self.__WB_MANIFEST);

// Firebase Messaging setup (modular SDK, ESM-compatible)
const firebaseApp = initializeApp({
    apiKey: "AIzaSyBp0L3ncTO1UKZOXwrFpdPtWy3TdJBG7yM",
    authDomain: "rozi-1156e.firebaseapp.com",
    projectId: "rozi-1156e",
    storageBucket: "rozi-1156e.firebasestorage.app",
    messagingSenderId: "201079731827",
    appId: "1:201079731827:web:3cc59a6d6eb92b80351c06",
});

const messaging = getMessaging(firebaseApp);

onBackgroundMessage(messaging, (payload) => {
    console.log('Background message received:', payload);
    const { title, body } = payload.notification;

    self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
    });
});