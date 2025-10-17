// server.js
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// === Inicializar Firebase Admin ===
const serviceAccount = JSON.parse(process.env.FIREBASE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// === Endpoint para recibir y enviar notificaciones ===
app.post("/api/enviarNotificacion", async (req, res) => {
  try {
    const { title, body } = req.body;

    const message = {
      notification: { title, body },
      topic: "alertas",
    };

    await admin.messaging().send(message);

    res.json({ success: true, message: "Notificación enviada correctamente" });
  } catch (error) {
    console.error("❌ Error al enviar notificación:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Puerto dinámico para Render ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});


// === Suscribir token al tema ===
app.post("/api/suscribir", async (req, res) => {
  const { token } = req.body;
  try {
    await admin.messaging().subscribeToTopic(token, "alertas");
    res.json({ success: true, message: "Token suscrito al tema alertas" });
  } catch (error) {
    console.error("❌ Error al suscribir token:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
