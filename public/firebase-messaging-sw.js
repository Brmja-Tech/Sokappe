/* global self, importScripts, firebase */
/* eslint-disable no-restricted-globals */
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDBR3mmjW66b_ACdLr4ahD1e-3cfDIGTjs",
  authDomain: "sokeappchat.firebaseapp.com",
  projectId: "sokeappchat",
  messagingSenderId: "1066343562125",
  appId: "1:1066343562125:web:98d33bf05684d3e6b25bc4",
});

const messaging = firebase.messaging();

// Notifications in background (التاب مقفول / بالخلفية)
messaging.onBackgroundMessage((payload) => {
  console.log("📨 إشعار جديد في الخلفية:", payload);

  const n = payload.notification || {};
  const title = n.title || "Sokappe";
  const body = n.body || "";
  const icon = n.icon || "/icon-192.png";
  const click_action = (payload?.data && payload.data.click_action) || "/";

  // Show notification
  self.registration.showNotification(title, {
    body,
    icon,
    data: {
      click_action,
      ...payload.data, // Include all data for the app
    },
  });

  // Send message to all clients (tabs/windows)
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "NEW_NOTIFICATION",
        payload: payload,
      });
    });
  });
});

self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ تم النقر على الإشعار:", event.notification.data);

  event.notification.close();
  const url = event.notification?.data?.click_action || "/";

  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      // Check if there's already a window/tab open with the target URL
      const targetClient = clients.find(
        (client) => client.url.includes(url) && "focus" in client
      );

      if (targetClient) {
        // If so, just focus it
        return targetClient.focus();
      }

      // If not, open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Listen for messages from the main app
self.addEventListener("message", (event) => {
  console.log("📨 رسالة من التطبيق الرئيسي:", event.data);

  if (event.data && event.data.type === "GET_NOTIFICATIONS") {
    // Handle any requests from the main app
  }
});
