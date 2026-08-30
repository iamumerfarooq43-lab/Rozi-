importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBp0L3ncTO1UKZOXwrFpdPtWy3TdJBG7yM",
    authDomain: "rozi-1156e.firebaseapp.com",
    projectId: "rozi-1156e",
    storageBucket: "rozi-1156e.firebasestorage.app",
    messagingSenderId: "201079731827",
    appId: "1:201079731827:web:3cc59a6d6eb92b80351c06",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);
    const { title, body } = payload.notification;

    self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
    });
});