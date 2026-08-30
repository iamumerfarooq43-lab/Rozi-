import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyBp0L3ncTO1UKZOXwrFpdPtWy3TdJBG7yM",
    authDomain: "rozi-1156e.firebaseapp.com",
    projectId: "rozi-1156e",
    storageBucket: "rozi-1156e.firebasestorage.app",
    messagingSenderId: "201079731827",
    appId: "1:201079731827:web:3cc59a6d6eb92b80351c06",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };