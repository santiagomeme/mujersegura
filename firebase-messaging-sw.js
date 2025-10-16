// === firebase-messaging-sw.js ===
// Esto NO usa módulos. Es el formato correcto para service workers con Firebase compat.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAyS2PlL0HT6h-qRlAXaH9OkAErBskPLUk",
  authDomain: "delicias-al-paladar-689f1.firebaseapp.com",
  projectId: "delicias-al-paladar-689f1",
  storageBucket: "delicias-al-paladar-689f1.firebasestorage.app",
  messagingSenderId: "1056297896059",
  appId: "1:1056297896059:web:064ff624eacb8566aabade",
  measurementId: "G-KT73MRTHF0"
});

const messaging = firebase.messaging();

// Escuchar mensajes cuando llegan en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('📦 Mensaje recibido en segundo plano:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
