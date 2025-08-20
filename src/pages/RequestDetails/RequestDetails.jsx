import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./RequestDetails.css";

const RequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("global");

  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <div className="request-details-page">
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
        <div className="request-details-page">
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
      <div className="request-details-page">
        {/* Header */}
        <div className="request-header">
          <button
            className="btn btn-outline-secondary btn-sm back-btn"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            {t("requestDetails.goBack")}
          </button>

          <h1 className="request-title">
            <i className="bi bi-file-text me-3"></i>
            {t("requestDetails.title")}
          </h1>

          <span
            className={`status-badge status-${getStatusColor(
              requestData.status
            )}`}
          >
            {getStatusText(requestData.status)}
          </span>
        </div>

        {/* Request Details Card */}
        <div className="request-card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="bi bi-info-circle me-2"></i>
              {t("requestDetails.requestInfo")}
            </h2>
          </div>

          <div className="card-body">
            <div className="details-grid">
              <div className="detail-item">
                <label className="detail-label">
                  {t("requestDetails.requestId")}:
                </label>
                <span className="detail-value">#{requestData.id}</span>
              </div>

              <div className="detail-item">
                <label className="detail-label">
                  {t("requestDetails.status.label")}:
                </label>
                <span
                  className={`detail-value status-badge status-${getStatusColor(
                    requestData.status
                  )}`}
                >
                  {getStatusText(requestData.status)}
                </span>
              </div>

              <div className="detail-item">
                <label className="detail-label">
                  {t("requestDetails.startedAt")}:
                </label>
                <span className="detail-value">
                  {formatDate(requestData.started_at)}
                </span>
              </div>

              {requestData.price && (
                <div className="detail-item">
                  <label className="detail-label">
                    {t("requestDetails.price")}:
                  </label>
                  <span className="detail-value price-value">
                    {requestData.price} {t("requestDetails.currency")}
                  </span>
                </div>
              )}

              {requestData.notes && (
                <div className="detail-item full-width">
                  <label className="detail-label">
                    {t("requestDetails.notes")}:
                  </label>
                  <div className="detail-value notes-value">
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
            className="request-card clickable-service-card"
            onClick={() =>
              navigate(`/servicedetails/${requestData.service.id}`)
            }
            style={{ cursor: "pointer" }}
            title={t("requestDetails.clickToViewService")}
          >
            <div className="card-header">
              <h2 className="card-title">
                <i className="bi bi-gear me-2"></i>
                {t("requestDetails.serviceInfo")}
              </h2>
              <i className="bi bi-arrow-right service-arrow"></i>
            </div>

            <div className="card-body">
              <div className="service-details">
                <div className="detail-item">
                  <label className="detail-label">
                    {t("requestDetails.serviceName")}:
                  </label>
                  <span className="detail-value service-name">
                    {requestData.service.name}
                  </span>
                </div>

                <div className="detail-item">
                  <label className="detail-label">
                    {t("requestDetails.serviceId")}:
                  </label>
                  <span className="detail-value">
                    #{requestData.service.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Provider Details Card */}
        {requestData.service?.provider && (
          <div className="request-card">
            <div className="card-header">
              <h2 className="card-title">
                <i className="bi bi-person me-2"></i>
                {t("requestDetails.providerInfo")}
              </h2>
            </div>

            <div className="card-body">
              <div className="provider-details">
                <div className="detail-item">
                  <label className="detail-label">
                    {t("requestDetails.providerName")}:
                  </label>
                  <span className="detail-value provider-name">
                    {requestData.service.provider.name}
                  </span>
                </div>

                <div className="detail-item">
                  <label className="detail-label">
                    {t("requestDetails.providerId")}:
                  </label>
                  <span className="detail-value">
                    #{requestData.service.provider.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
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
    </div>
  );
};

export default RequestDetails;
