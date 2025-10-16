// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyALgkNevjqgsm4vy1hSeHWl2wVqgTLFRCc",
  authDomain: "mujersegura.web.app",
  projectId: "mujersegura",
  storageBucket: "mujersegura.appspot.com",
  messagingSenderId: "1056297896059",
  appId: "1:1056297896059:web:ded9ff0648998d80aabade",
  measurementId: "G-7NPLW1XCC5"
};

// Inicializa Firebase (evita duplicados)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Servicios globales
const auth = firebase.auth();
const db = firebase.firestore();
