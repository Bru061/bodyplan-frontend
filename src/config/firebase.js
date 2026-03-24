import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            "AIzaSyB0r_m8CAFy9iwGttf-z07zYg8IZSU9wYs",
  authDomain:        "bodyplan-8f1db.firebaseapp.com",
  projectId:         "bodyplan-8f1db",
  storageBucket:     "bodyplan-8f1db.firebasestorage.app",
  messagingSenderId: "455607823720",
  appId:             "1:455607823720:web:f49574e310bb0cff617add",
  measurementId:     "G-EW39VVYL93"
};

const app       = initializeApp(firebaseConfig);
const auth      = getAuth(app);
const provider  = new GoogleAuthProvider();
const messaging = getMessaging(app);

const VAPID_KEY = "BLsbVfLbVP-rtahgI88uOX3ebN605XVCS2dZ-ichMoU88R163zh6Wsc-nSntZfIqgP90XZZLrbLKuQ8lRE0SpgA";

export const solicitarTokenFCM = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    return await getToken(messaging, { vapidKey: VAPID_KEY });
  } catch (err) {
    console.error("Error obteniendo token FCM", err);
    return null;
  }
};

export const onMensajeForeground = (callback) => {
  return onMessage(messaging, callback);
};

export { auth, provider, signInWithPopup };