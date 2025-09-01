import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyDBR3mmjW66b_ACdLr4ahD1e-3cfDIGTjs",
    authDomain: "sokeappchat.firebaseapp.com",
    databaseURL: "https://sokeappchat-default-rtdb.firebaseio.com",
    projectId: "sokeappchat",
    storageBucket: "sokeappchat.firebasestorage.app",
    messagingSenderId: "1066343562125",
    appId: "1:1066343562125:web:98d33bf05684d3e6b25bc4",
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data?.status === 200) {
        const notificationsData = response.data.data || [];
        setNotifications(notificationsData);

        // Calculate unread count
        const unread = notificationsData.filter(
          (notification) => !notification.read_at
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Add a new notification
  const addNotification = (notification) => {
    console.log("➕ إضافة إشعار جديد:", notification);
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        return;
      }

      // Update local state immediately for better UX
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // You might want to add an API call here to mark as read on server
      // await axios.post(`${process.env.REACT_APP_BASE_URL}/notifications/${notificationId}/read`, {}, {
      //   headers: {
      //     Authorization: `Bearer ${userData.token}`,
      //     Accept: "application/json",
      //     "Accept-Language": i18n.language,
      //   },
      // });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        return;
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        }))
      );

      setUnreadCount(0);

      // You might want to add an API call here to mark all as read on server
      // await axios.post(`${process.env.REACT_APP_BASE_URL}/notifications/mark-all-read`, {}, {
      //   headers: {
      //     Authorization: `Bearer ${userData.token}`,
      //     Accept: "application/json",
      //     "Accept-Language": i18n.language,
      //   },
      // });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Remove a notification
  const removeNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );

    // Update unread count if the removed notification was unread
    const removedNotification = notifications.find(
      (n) => n.id === notificationId
    );
    if (removedNotification && !removedNotification.read_at) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Get notifications by status (all, unread, read)
  const getNotificationsByStatus = (status = "all") => {
    switch (status) {
      case "unread":
        return notifications.filter((notification) => !notification.read_at);
      case "read":
        return notifications.filter((notification) => notification.read_at);
      default:
        return notifications;
    }
  };

  // Format notification time
  const formatNotificationTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  // Fetch notifications on mount and when language changes
  useEffect(() => {
    fetchNotifications();
  }, [i18n.language]);

  // Initialize Firebase messaging for real-time notifications
  useEffect(() => {
    const initializeFirebaseMessaging = async () => {
      try {
        // Initialize Firebase app
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        // Listen for foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log("📨 إشعار جديد في المقدمة:", payload);

          // Extract notification data from payload
          const notificationData = payload.data || {};
          const notification = {
            id: notificationData.id || Date.now(),
            service_name: notificationData.service_name || "Service",
            status: notificationData.status || "info",
            reason: notificationData.reason || "",
            service_request_id: notificationData.service_request_id || null,
            created_at: notificationData.created_at || new Date().toISOString(),
            read_at: null, // New notifications are unread
          };

          // Add notification to context
          addNotification(notification);
        });

        return unsubscribe;
      } catch (error) {
        console.error("❌ خطأ في تهيئة Firebase messaging:", error);
      }
    };

    // Listen for messages from Service Worker
    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === "NEW_NOTIFICATION") {
        console.log("📨 إشعار جديد من Service Worker:", event.data.payload);

        const payload = event.data.payload;
        const notificationData = payload.data || {};
        const notification = {
          id: notificationData.id || Date.now(),
          service_name: notificationData.service_name || "Service",
          status: notificationData.status || "info",
          reason: notificationData.reason || "",
          service_request_id: notificationData.service_request_id || null,
          created_at: notificationData.created_at || new Date().toISOString(),
          read_at: null, // New notifications are unread
        };

        // Add notification to context
        addNotification(notification);
      }
    };

    // Only initialize if user is authenticated
    const userData = localStorage.getItem("userData");
    if (userData) {
      // Initialize Firebase messaging
      const unsubscribeFirebase = initializeFirebaseMessaging();

      // Add Service Worker message listener
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage
      );

      // Cleanup function
      return () => {
        if (unsubscribeFirebase) {
          unsubscribeFirebase();
        }
        navigator.serviceWorker.removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      };
    }
  }, []);

  const value = {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getNotificationsByStatus,
    formatNotificationTime,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
