importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyB0r_m8CAFy9iwGttf-z07zYg8IZSU9wYs",
  authDomain:        "bodyplan-8f1db.firebaseapp.com",
  projectId:         "bodyplan-8f1db",
  storageBucket:     "bodyplan-8f1db.firebasestorage.app",
  messagingSenderId: "455607823720",
  appId:             "1:455607823720:web:f49574e310bb0cff617add"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'BodyPlan', {
    body: body || 'Tienes una nueva notificación',
    icon: '/logo.png',
    data: payload.data
  });
});