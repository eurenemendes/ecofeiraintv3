import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyA2_RRnOFy_xbZLtiQRav9oxJ7H4ut13D4",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "ecofeira-a05e8.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "ecofeira-a05e8",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "ecofeira-a05e8.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "349676062186",
  appId: process.env.FIREBASE_APP_ID || "1:349676062186:web:31e39e8a4aa35245e95e93",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-XHP8SLYYGV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
// Solicita acesso à pasta de dados do aplicativo (AppData) e arquivos criados pelo app
googleProvider.addScope('https://www.googleapis.com/auth/drive.appdata');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider };
export type { User };