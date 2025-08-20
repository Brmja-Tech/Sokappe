import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import "./Notifications.css";

const Notifications = () => {
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    getNotificationsByStatus,
    formatNotificationTime,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    setFilteredNotifications(getNotificationsByStatus(activeFilter));
  }, [notifications, activeFilter]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }

    // Navigate to request details page
    if (notification.service_request_id) {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData && userData.token) {
          navigate(`/request-details/${notification.service_request_id}`);
        } else {
          // If not logged in, show login message
          alert(t("notifications.loginRequired"));
        }
      } catch (error) {
        console.error("Error navigating to request details:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
      case "accept":
        return "success";
      case "rejected":
      case "reject":
        return "danger";
      case "completed":
        return "primary";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "accepted":
      case "accept":
        return t("notifications.accepted");
      case "rejected":
      case "reject":
        return t("notifications.rejected");
      case "completed":
        return t("notifications.completed");
      default:
        return status;
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="notifications-page">
        <div className="notifications-header">
          <h1 className="notifications-title">
            <i className="bi bi-bell me-3"></i>
            {t("notifications.notifications")}
          </h1>

          {unreadCount > 0 && (
            <span className="unread-badge">
              {unreadCount} {t("notifications.unread")}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={markAllAsRead}
            >
              <i className="bi bi-check-all me-2"></i>
              {t("notifications.markAllRead")}
            </button>
          )}

          {notifications.length > 0 && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={clearAllNotifications}
            >
              <i className="bi bi-trash me-2"></i>
              {t("notifications.clearAll")}
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="notifications-filters">
          <button
            className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            {t("notifications.all")} ({notifications.length})
          </button>
          <button
            className={`filter-btn ${
              activeFilter === "unread" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("unread")}
          >
            {t("notifications.unread")} (
            {getNotificationsByStatus("unread").length})
          </button>
          <button
            className={`filter-btn ${activeFilter === "read" ? "active" : ""}`}
            onClick={() => setActiveFilter("read")}
          >
            {t("notifications.read")} ({getNotificationsByStatus("read").length}
            )
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="instructions-box">
            <i className="bi bi-info-circle me-2"></i>
            <span>{t("notifications.clickInstructions")}</span>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bell-slash empty-icon"></i>
              <h3>{t("notifications.noNotifications")}</h3>
              <p className="text-muted">
                {activeFilter === "unread" &&
                  t("notifications.noUnreadNotifications")}
                {activeFilter === "read" &&
                  t("notifications.noReadNotifications")}
                {activeFilter === "all" && t("notifications.noNotifications")}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  !notification.read_at ? "unread" : "read"
                }`}
                onClick={() => handleNotificationClick(notification)}
                title={
                  notification.service_request_id
                    ? t("notifications.clickToViewDetails")
                    : ""
                }
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <div className="notification-service">
                      <i className="bi bi-gear-fill me-2"></i>
                      <strong>{notification.service_name}</strong>
                    </div>
                    <div className="notification-time">
                      {formatNotificationTime(notification.created_at)}
                    </div>
                  </div>

                  <div className="notification-body">
                    <div className="notification-status">
                      <span
                        className={`status-badge status-${getStatusColor(
                          notification.status
                        )}`}
                      >
                        {getStatusText(notification.status)}
                      </span>
                    </div>

                    {notification.reason && (
                      <div className="notification-reason">
                        <small className="text-muted">
                          {notification.reason}
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                {!notification.read_at && (
                  <div className="unread-indicator">
                    <i className="bi bi-circle-fill"></i>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {loading && notifications.length > 0 && (
          <div className="text-center mt-3">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
