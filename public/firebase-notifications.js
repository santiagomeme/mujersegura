// === firebase-notifications.js ===

// Verifica compatibilidad del navegador
if (!("Notification" in window)) {
  console.warn("🚫 Este navegador no soporta notificaciones.");
}

// Registrar el Service Worker
navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then((registration) => {
    console.log('✅ Service Worker registrado correctamente:', registration);

    const messaging = firebase.messaging();

    // Solicitar permiso de notificaciones
    return Notification.requestPermission().then((permission) => {
      console.log("📢 Permiso del usuario:", permission);
      if (permission === 'granted') {
        // Obtener token
        return messaging.getToken({
          vapidKey: "BPVaoMqxMRLGAXw-DQtYqwmTHV0PwUi6vp6PNNGm-QtKH8imwViYndOOo-5aUTq1qS35xB1MWnbqIfJwlPhrBOE",
          serviceWorkerRegistration: registration
        });
      } else {
        throw new Error("Permiso denegado para notificaciones");
      }
    });
  })
  .then((token) => {
    if (token) {
      console.log("✅ Token FCM obtenido:", token);

      // 🔹 Guardar token en Firestore
      const db = firebase.firestore();
      const userId = firebase.auth().currentUser?.uid || token; // usar UID si hay usuario autenticado
      db.collection("tokensFCM").doc(userId).set({
        token,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => console.log("💾 Token guardado en Firestore correctamente"))
      .catch((err) => console.error("❌ Error al guardar token:", err));
    } else {
      console.warn("⚠️ No se pudo generar token (token vacío o nulo).");
    }
  })
  .catch((err) => {
    console.error("❌ Error al registrar o solicitar token:", err);
  });

// Escuchar mensajes cuando la app está abierta (foreground)
if (firebase.messaging.isSupported()) {
  const messaging = firebase.messaging();
  messaging.onMessage((payload) => {
    console.log("📩 Notificación recibida en primer plano:", payload);
    const { title, body, icon } = payload.notification;
    new Notification(title, { body, icon: icon || '/icon.png' });
  });
}
