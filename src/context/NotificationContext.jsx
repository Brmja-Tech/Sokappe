import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

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
        const unread = notificationsData.filter(notification => !notification.read_at).length;
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
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        return;
      }

      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

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
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString()
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
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    
    // Update unread count if the removed notification was unread
    const removedNotification = notifications.find(n => n.id === notificationId);
    if (removedNotification && !removedNotification.read_at) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Get notifications by status (all, unread, read)
  const getNotificationsByStatus = (status = 'all') => {
    switch (status) {
      case 'unread':
        return notifications.filter(notification => !notification.read_at);
      case 'read':
        return notifications.filter(notification => notification.read_at);
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
      return 'just now';
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
