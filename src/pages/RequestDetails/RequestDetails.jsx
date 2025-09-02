import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import styles from "./RequestDetails.module.css";

const RequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("global");

  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [userType, setUserType] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Fetch request details
  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));

      if (!userData || !userData.token) {
        setError(t("requestDetails.loginRequired"));
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/request/services/request/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data?.status === 200) {
        setRequestData(response.data.data);
      } else {
        setError(t("requestDetails.fetchError"));
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      if (error.response?.status === 401) {
        setError(t("requestDetails.unauthorized"));
      } else if (error.response?.status === 404) {
        setError(t("requestDetails.notFound"));
      } else {
        setError(t("requestDetails.fetchError"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId, i18n.language]);

  // Get user type from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.type) {
      setUserType(userData.type);
    }
  }, []);

  // Open confirmation modal
  const openConfirmModal = (action) => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  // Handle request action (accept/reject)
  const handleRequestAction = async (action) => {
    try {
      setActionLoading(true);
      setShowConfirmModal(false);

      const userData = JSON.parse(localStorage.getItem("userData"));

      if (!userData || !userData.token) {
        setError(t("requestDetails.loginRequired"));
        return;
      }

      const formData = new FormData();
      formData.append("action", action);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/request/services/respond/${requestId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data?.status === 200) {
        // Update request status locally
        setRequestData((prev) => ({
          ...prev,
          status: action === "accept" ? "accepted" : "rejected",
        }));
      } else {
        setError(t("requestDetails.actions.actionError"));
      }
    } catch (error) {
      console.error("Error performing action:", error);
      setError(t("requestDetails.actions.actionError"));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "accept":
        return "success";
      case "rejected":
      case "reject":
        return "danger";
      case "completed":
        return "primary";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "accept":
        return t("requestDetails.status.accepted");
      case "rejected":
      case "reject":
        return t("requestDetails.status.rejected");
      case "completed":
        return t("requestDetails.status.completed");
      case "pending":
        return t("requestDetails.status.pending");
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t("requestDetails.notAvailable");

    try {
      // Handle both date formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing DD/MM/YYYY HH:MM format
        const [datePart, timePart] = dateString.split(" ");
        const [day, month, year] = datePart.split("/");
        const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
        const fullDateTime = timePart
          ? `${formattedDate}T${timePart}`
          : formattedDate;
        return new Date(fullDateTime).toLocaleDateString(i18n.language, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: timePart ? "numeric" : undefined,
          minute: timePart ? "numeric" : undefined,
        });
      }

      return date.toLocaleDateString(i18n.language, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Check if user can perform actions on this request
  const canPerformActions = () => {
    // Only company or individual_vendor can perform actions
    return (
      (userType === "company" || userType === "individual_vendor") &&
      requestData?.status === "pending"
    );
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">{t("requestDetails.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className={styles.requestDetailsPage}>
          <div className="alert alert-danger text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
          <div className="text-center mt-3">
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2"></i>
              {t("requestDetails.goBack")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="container py-5">
        <div className={styles.requestDetailsPage}>
          <div className="alert alert-warning text-center">
            <i className="bi bi-info-circle me-2"></i>
            {t("requestDetails.noData")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className={styles.requestDetailsPage}>
        {/* Header */}
        <div className={styles.requestHeader}>
          <button
            className={`btn btn-outline-secondary btn-sm ${styles.backBtn}`}
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            {t("requestDetails.goBack")}
          </button>

          <h1 className={styles.requestTitle}>
            <i className="bi bi-file-text me-3"></i>
            {t("requestDetails.title")}
          </h1>

          <span
            className={`${styles.statusBadge} ${
              styles[
                `status${
                  getStatusColor(requestData.status).charAt(0).toUpperCase() +
                  getStatusColor(requestData.status).slice(1)
                }`
              ]
            }`}
          >
            {getStatusText(requestData.status)}
          </span>
        </div>

        {/* Request Details Card */}
        <div className={styles.requestCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <i className="bi bi-info-circle me-2"></i>
              {t("requestDetails.requestInfo")}
            </h2>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>
                  {t("requestDetails.requestId")}:
                </label>
                <span className={styles.detailValue}>#{requestData.id}</span>
              </div>

              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>
                  {t("requestDetails.status.label")}:
                </label>
                <span
                  className={`${styles.detailValue} ${styles.statusBadge} ${
                    styles[
                      `status${
                        getStatusColor(requestData.status)
                          .charAt(0)
                          .toUpperCase() +
                        getStatusColor(requestData.status).slice(1)
                      }`
                    ]
                  }`}
                >
                  {getStatusText(requestData.status)}
                </span>
              </div>

              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>
                  {t("requestDetails.startedAt")}:
                </label>
                <span className={styles.detailValue}>
                  {formatDate(requestData.started_at)}
                </span>
              </div>

              {requestData.price && (
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>
                    {t("requestDetails.price")}:
                  </label>
                  <span
                    className={`${styles.detailValue} ${styles.priceValue}`}
                  >
                    {requestData.price} {t("requestDetails.currency")}
                  </span>
                </div>
              )}

              {requestData.notes && (
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                  <label className={styles.detailLabel}>
                    {t("requestDetails.notes")}:
                  </label>
                  <div className={`${styles.detailValue} ${styles.notesValue}`}>
                    {requestData.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Details Card */}
        {requestData.service && (
          <div
            className={`${styles.requestCard} ${styles.clickableServiceCard}`}
            onClick={() =>
              navigate(`/servicedetails/${requestData.service.id}`)
            }
            style={{ cursor: "pointer" }}
            title={t("requestDetails.clickToViewService")}
          >
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <i className="bi bi-gear me-2"></i>
                {t("requestDetails.serviceInfo")}
              </h2>
              <i className={`bi bi-arrow-right ${styles.serviceArrow}`}></i>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.serviceDetails}>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>
                    {t("requestDetails.serviceName")}:
                  </label>
                  <span
                    className={`${styles.detailValue} ${styles.serviceName}`}
                  >
                    {requestData.service.name}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>
                    {t("requestDetails.serviceId")}:
                  </label>
                  <span className={styles.detailValue}>
                    #{requestData.service.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Party Details Card - Shows provider or requester based on type */}
        {requestData.other_party && (
          <div className={styles.requestCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <i className="bi bi-person me-2"></i>
                {requestData.other_party.type === "provider"
                  ? t("requestDetails.requesterInfo")
                  : t("requestDetails.providerInfo")}
              </h2>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.providerDetails}>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>
                    {requestData.other_party.type === "provider"
                      ? t("requestDetails.requesterName")
                      : t("requestDetails.providerName")}
                    :
                  </label>
                  <span
                    className={`${styles.detailValue} ${styles.providerName}`}
                  >
                    {requestData.other_party.name}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>
                    {requestData.other_party.type === "provider"
                      ? t("requestDetails.requesterId")
                      : t("requestDetails.providerId")}
                    :
                  </label>
                  <span className={styles.detailValue}>
                    #{requestData.other_party.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Action Buttons - Only for company/individual_vendor when status is pending */}
        {canPerformActions() && (
          <div className={styles.requestActionButtons}>
            <h3 className={styles.actionTitle}>
              <i className="bi bi-gear me-2"></i>
              {t("requestDetails.actions.title") || "Request Actions"}
            </h3>
            <div className={styles.actionButtonsGrid}>
              <button
                className={`btn btn-success ${styles.actionBtn}`}
                onClick={() => openConfirmModal("accept")}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {t("requestDetails.actions.accepting")}
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    {t("requestDetails.actions.accept")}
                  </>
                )}
              </button>

              <button
                className={`btn btn-danger ${styles.actionBtn}`}
                onClick={() => openConfirmModal("reject")}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {t("requestDetails.actions.rejecting")}
                  </>
                ) : (
                  <>
                    <i className="bi bi-x-circle me-2"></i>
                    {t("requestDetails.actions.reject")}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className={styles.actionButtons}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>
            {t("requestDetails.goBack")}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/notifications")}
          >
            <i className="bi bi-bell me-2"></i>
            {t("requestDetails.backToNotifications")}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>
                <i className="bi bi-question-circle me-2"></i>
                {t("requestDetails.actions.confirmTitle") || "Confirm Action"}
              </h4>
              <button
                type="button"
                className={styles.btnClose}
                onClick={() => setShowConfirmModal(false)}
              ></button>
            </div>
            <div className={styles.modalBody}>
              <p>
                {pendingAction === "accept"
                  ? t("requestDetails.actions.confirmAccept") ||
                    "Are you sure you want to accept this request?"
                  : t("requestDetails.actions.confirmReject") ||
                    "Are you sure you want to reject this request?"}
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                {t("requestDetails.actions.cancel") || "Cancel"}
              </button>
              <button
                type="button"
                className={`btn ${
                  pendingAction === "accept" ? "btn-success" : "btn-danger"
                }`}
                onClick={() => handleRequestAction(pendingAction)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {pendingAction === "accept"
                      ? t("requestDetails.actions.accepting")
                      : t("requestDetails.actions.rejecting")}
                  </>
                ) : (
                  <>
                    {pendingAction === "accept"
                      ? t("requestDetails.actions.accept")
                      : t("requestDetails.actions.reject")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetails;
