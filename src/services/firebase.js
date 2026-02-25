import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB0r_m8CAFy9iwGttf-z07zYg8IZSU9wYs",
  authDomain: "bodyplan-8f1db.firebaseapp.com",
  projectId: "bodyplan-8f1db",
  storageBucket: "bodyplan-8f1db.firebasestorage.app",
  messagingSenderId: "455607823720",
  appId: "1:455607823720:web:f49574e310bb0cff617add",
  measurementId: "G-EW39VVYL93"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };