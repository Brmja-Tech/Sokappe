// config/firebase-messaging.js
/* eslint-disable no-restricted-globals */
import { getApps, initializeApp, getApp } from "firebase/app";
import { getMessaging, isSupported, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDBR3mmjW66b_ACdLr4ahD1e-3cfDIGTjs",
  authDomain: "sokeappchat.firebaseapp.com",
  databaseURL: "https://sokeappchat-default-rtdb.firebaseio.com",
  projectId: "sokeappchat",
  storageBucket: "sokeappchat.firebasestorage.app",
  messagingSenderId: "1066343562125",
  appId: "1:1066343562125:web:98d33bf05684d3e6b25bc4",
};

const VAPID_KEY =
  "BGi1w7YKEftzF0p4nb4CvVMo4W4xIBrhQvDnflmc-NFr2cRnVJX4zYK7Ec6J7BqyW94DjKfrHKsvqQ0mC7oZo3o";

export async function initPushAndGetToken() {
  console.log("🚀 بدء تهيئة Firebase Messaging...");

  // 1) دعم المتصفح
  const supported = await isSupported().catch(() => false);
  console.log("🌐 دعم المتصفح:", supported);
  if (!supported) {
    console.error("❌ المتصفح لا يدعم Firebase Messaging");
    return { token: null, reason: "unsupported" };
  }

  // 2) HTTPS + SW من الجذر - السماح بـ HTTP في التطوير فقط
  // eslint-disable-next-line no-restricted-globals
  if (
    typeof window !== "undefined" &&
    window.location.protocol !== "https:" &&
    process.env.NODE_ENV === "production"
  ) {
    console.error("❌ يتطلب HTTPS للحصول على FCM token في الإنتاج");
    return { token: null, reason: "insecure" };
  }

  // في بيئة التطوير، نسمح بـ HTTP
  if (
    typeof window !== "undefined" &&
    window.location.protocol !== "https:" &&
    process.env.NODE_ENV === "development"
  ) {
    console.warn("⚠️ تحذير: FCM يعمل على HTTP في بيئة التطوير فقط");
  }

  let reg;
  try {
    console.log("🔧 تسجيل Service Worker...");
    reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });
    console.log("✅ تم تسجيل Service Worker:", reg);
    await navigator.serviceWorker.ready;
    console.log("✅ Service Worker جاهز");
  } catch (error) {
    console.error("❌ خطأ في تسجيل Service Worker:", error);
    return { token: null, reason: "service_worker_error" };
  }

  // 3) نفس Firebase app (بدون تهيئة مزدوجة)
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  console.log("🔥 Firebase App:", app);

  // 4) إذن المستخدم
  console.log("🔔 طلب إذن الإشعارات...");
  const permission = await Notification.requestPermission();
  console.log("📋 حالة الإذن:", permission);
  if (permission !== "granted") {
    console.error("❌ تم رفض إذن الإشعارات");
    return { token: null, reason: "denied" };
  }

  // 5) getToken مع الـ reg + VAPID
  try {
    console.log("🎫 الحصول على FCM Token...");
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg,
    });

    if (token) {
      console.log("✅ تم الحصول على FCM Token بنجاح");
      console.log("📱 Token length:", token.length);
      return { token, reason: "ok" };
    } else {
      console.error("❌ لم يتم الحصول على token");
      return { token: null, reason: "null_token" };
    }
  } catch (error) {
    console.error("❌ خطأ في الحصول على FCM Token:", error);
    return { token: null, reason: "get_token_error" };
  }
}
