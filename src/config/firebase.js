import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDBR3mmjW66b_ACdLr4ahD1e-3cfDIGTjs",
  authDomain: "sokeappchat.firebaseapp.com",
  databaseURL: "https://sokeappchat-default-rtdb.firebaseio.com",
  projectId: "sokeappchat",
  storageBucket: "sokeappchat.firebasestorage.app",
  messagingSenderId: "1066343562125",
  appId: "1:1066343562125:web:98d33bf05684d3e6b25bc4",
  measurementId: "G-LN5Z0T5Y2J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
