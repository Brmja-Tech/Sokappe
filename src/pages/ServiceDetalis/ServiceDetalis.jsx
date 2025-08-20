import React, { useEffect, useState } from "react";
import "./ServiceDetalis.css";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

// Icons
import ProductsServices from "../../component/ProductsServices/ProductsServices";

export default function ServiceDetalis() {
  const { t, i18n } = useTranslation("global");
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Service request states
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'accepted', 'rejected', null
  const [requestId, setRequestId] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch service details
  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/services/show/${id}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data?.status === 200) {
        const serviceData = {
          ...response.data.data.service,
          related: response.data.data.related || [],
        };
        setService(serviceData);
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
      setError("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  // Send service request
  const sendServiceRequest = async () => {
    try {
      setRequestLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));

      if (!userData || !userData.token) {
        toast.error(t("sign.login") + " " + t("sign.haveAccount"));
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/request/services?service_id=${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data?.status === 201) {
        setRequestStatus("pending");
        setRequestId(response.data.data.id);

        // Save request to localStorage
        const requestData = {
          id: response.data.data.id,
          status: "pending",
          serviceId: id,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(
          `service_request_${id}`,
          JSON.stringify(requestData)
        );

        toast.success(t("servicePage.requestSent"));
      }
    } catch (error) {
      console.error("Error sending service request:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("servicePage.sendRequest") + " " + t("sign.failed"));
      }
    } finally {
      setRequestLoading(false);
    }
  };

  // Cancel service request
  const cancelServiceRequest = async () => {
    try {
      setCancelLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));

      if (!userData || !userData.token) {
        toast.error(t("sign.login") + " " + t("sign.haveAccount"));
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/request/services/cancel/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data?.status === 200) {
        setRequestStatus(null);
        setRequestId(null);

        // Remove request from localStorage
        localStorage.removeItem(`service_request_${id}`);

        toast.success(t("servicePage.cancelRequest") + " " + t("sign.success"));
      }
    } catch (error) {
      console.error("Error cancelling service request:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("servicePage.cancelRequest") + " " + t("sign.failed"));
      }
    } finally {
      setCancelLoading(false);
    }
  };

  // Check current request status
  const checkRequestStatus = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));

      if (!userData || !userData.token) {
        return;
      }

      // Check if there's a saved request in localStorage
      const savedRequest = localStorage.getItem(`service_request_${id}`);
      if (savedRequest) {
        try {
          const requestData = JSON.parse(savedRequest);
          // Verify the request is for the current service
          if (requestData.serviceId === id) {
            setRequestStatus(requestData.status);
            setRequestId(requestData.id);

            // Now check the actual status from the server
            await checkRequestStatusFromServer(requestData.id);
          } else {
            // Remove invalid request data
            localStorage.removeItem(`service_request_${id}`);
          }
        } catch (parseError) {
          // Remove corrupted data
          localStorage.removeItem(`service_request_${id}`);
        }
      }
    } catch (error) {
      console.error("Error checking request status:", error);
    }
  };

  // Check request status from server
  const checkRequestStatusFromServer = async (requestId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));

      if (!userData || !userData.token) {
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
        const serverStatus = response.data.data.status;
        const previousStatus = requestStatus;

        // Update status based on server response
        if (serverStatus === "accept" || serverStatus === "accepted") {
          setRequestStatus("accepted");
        } else if (serverStatus === "reject" || serverStatus === "rejected") {
          setRequestStatus("rejected");
        } else if (serverStatus === "completed") {
          setRequestStatus("completed");
        } else {
          setRequestStatus("pending");
        }

        // Update localStorage with new status
        const savedRequest = localStorage.getItem(`service_request_${id}`);
        if (savedRequest) {
          const requestData = JSON.parse(savedRequest);
          requestData.status = serverStatus;
          localStorage.setItem(
            `service_request_${id}`,
            JSON.stringify(requestData)
          );
        }

        // Show appropriate message based on status change
        if (serverStatus === "accept" || serverStatus === "accepted") {
          if (previousStatus !== "accepted") {
            toast.success(t("servicePage.requestAccepted"));
          }
        } else if (serverStatus === "reject" || serverStatus === "rejected") {
          if (previousStatus !== "rejected") {
            toast.error(t("servicePage.requestRejected"));
          }
        } else if (serverStatus === "completed") {
          if (previousStatus !== "completed") {
            toast.success(t("servicePage.requestCompleted"));
          }
        }
      }
    } catch (error) {
      console.error("Error checking request status from server:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchServiceDetails();
      checkRequestStatus();
    }
  }, [id, i18n.language]);

  // Periodic status check every 30 seconds if there's a pending request
  useEffect(() => {
    let intervalId;

    if (requestStatus === "pending" && requestId) {
      intervalId = setInterval(() => {
        checkRequestStatusFromServer(requestId);
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [requestStatus, requestId]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">{error || "Service not found"}</div>
      </div>
    );
  }

  // Prepare images array (main image + other images)
  const allImages = [
    service.main_image,
    ...(service.other_images || []),
  ].filter(Boolean);

  return (
    <>
      <section className="mainContainer">
        <h1 className="title">{service.name}</h1>

        <div className="contentGrid">
          <div className="gallerySection">
            <div className="swiperContainer">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                className="mainSwiper"
              >
                {allImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="imageFrame">
                      <img
                        src={img}
                        alt={`${service.name} - عرض ${index + 1}`}
                        className="mainImg"
                        onError={(e) =>
                          (e.target.src = "/placeholder-product.png")
                        }
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          <div className="sidePanel">
            <div className="infoCard">
              <div className="priceBox">
                {service.discount_price &&
                service.discount_price !== service.price ? (
                  <div>
                    <span className="oldPrice">
                      {service.price} {t("servicePage.currency")}
                    </span>
                    <span className="currentPrice">
                      {service.discount_price} {t("servicePage.currency")}
                    </span>
                  </div>
                ) : (
                  <span className="currentPrice">
                    {service.price} {t("servicePage.currency")}
                  </span>
                )}
              </div>

              <button className="contactBtn">
                <i className={`bi bi-envelope-fill btnIcon`}></i>
                {t("servicePage.contactSeller")}
              </button>

              {/* Service Request Buttons */}
              {!requestStatus ? (
                <button
                  className="requestBtn"
                  onClick={sendServiceRequest}
                  disabled={requestLoading}
                >
                  <i className={`bi bi-send-fill btnIcon`}></i>
                  {requestLoading
                    ? t("servicePage.sending")
                    : t("servicePage.sendRequest")}
                </button>
              ) : requestStatus === "pending" ? (
                <button
                  className="cancelRequestBtn"
                  onClick={cancelServiceRequest}
                  disabled={cancelLoading}
                >
                  <i className={`bi bi-x-circle-fill btnIcon`}></i>
                  {cancelLoading
                    ? t("servicePage.cancelling")
                    : t("servicePage.cancelRequest")}
                </button>
              ) : null}

              {/* Display current request status */}
              {requestStatus && (
                <div className={`requestStatus ${requestStatus}`}>
                  {requestStatus === "pending" && (
                    <div className="statusPending">
                      <i className="bi bi-clock-fill me-2"></i>
                      <span>{t("servicePage.requestSent")}</span>
                    </div>
                  )}
                  {requestStatus === "accepted" && (
                    <div className="statusAccepted">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      <span>{t("servicePage.requestAccepted")}</span>
                    </div>
                  )}
                  {requestStatus === "rejected" && (
                    <div className="statusRejected">
                      <i className="bi bi-x-circle-fill me-2"></i>
                      <span>{t("servicePage.requestRejected")}</span>
                    </div>
                  )}
                  {requestStatus === "completed" && (
                    <div className="statusCompleted">
                      <i className="bi bi-check2-all me-2"></i>
                      <span>{t("servicePage.requestCompleted")}</span>
                    </div>
                  )}

                  {/* Refresh Status Button - Only show for pending requests */}
                  {requestStatus === "pending" && (
                    <button
                      className="refreshStatusBtn"
                      onClick={() => checkRequestStatusFromServer(requestId)}
                      title={t("servicePage.refreshStatus")}
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                  )}
                </div>
              )}

              <div className="safetyTips">
                <h3 className="tipsHeading">
                  <i className={`bi bi-lightbulb tipsIcon`}></i>
                  {t("servicePage.generalTips")}
                </h3>
                <ul className="tipsList">
                  <li className="tipItem">
                    <i className={`bi bi-check-circle-fill tipBullet`}></i>
                    {t("servicePage.tips.1")}
                  </li>
                  <li className="tipItem">
                    <i className={`bi bi-check-circle-fill tipBullet`}></i>
                    {t("servicePage.tips.2")}
                  </li>
                  <li className="tipItem">
                    <i className={`bi bi-check-circle-fill tipBullet`}></i>
                    {t("servicePage.tips.3")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="detailsGrid">
          <div className="specsSection">
            <div className="specsCard">
              <h2 className="sectionHeader">
                <i className={`bi bi-info-circle-fill sectionIcon`}></i>
                {t("servicePage.information")}
              </h2>
              <div className="specsTable">
                <div className="specRow">
                  <span className="specLabel">
                    {t("servicePage.serviceCountry")}:
                  </span>
                  <span className="specValue">{service.country}</span>
                </div>
                <div className="specRow">
                  <span className="specLabel">
                    {t("servicePage.serviceGovernorate")}:
                  </span>
                  <span className="specValue">{service.governorate}</span>
                </div>
                <div className="specRow">
                  <span className="specLabel">
                    {t("servicePage.serviceCenterGov")}:
                  </span>
                  <span className="specValue">{service.centerGov}</span>
                </div>
                <div className="specRow">
                  <span className="specLabel">
                    {t("servicePage.serviceAddress")}:
                  </span>
                  <span className="specValue">{service.address}</span>
                </div>
                <div className="specRow">
                  <span className="specLabel">
                    {t("servicePage.serviceDelivery")}:
                  </span>
                  <span className="specValue">
                    {service.delivery_days} {t("servicePage.days")}
                  </span>
                </div>
                {service.discount_expires_at && (
                  <div className="specRow">
                    <span className="specLabel">
                      {t("servicePage.serviceDiscountExpires")}:
                    </span>
                    <span className="specValue text-danger">
                      {new Date(
                        service.discount_expires_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="descCard">
              <h2 className="sectionHeader">
                <i className={`bi bi-file-text-fill sectionIcon`}></i>
                {t("servicePage.description")}
              </h2>
              <div className="descContent">
                {service.description.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="sellerSection">
            <Link
              to={`/vendorprofile/${service.owner.id}`}
              className="sellerLink"
            >
              <div className="sellerCard">
                <h3 className="sectionHeader">
                  <i className={`bi bi-person-fill sectionIcon`}></i>
                  {t("servicePage.seller")}
                </h3>
                <div className="sellerProfile">
                  <img
                    src={service.owner.avatar || "/avatar.webp"}
                    alt={`${service.owner.username}`}
                    className="sellerAvatar"
                  />
                  <div className="sellerInfo">
                    <h4 className="sellerName">{service.owner.username}</h4>
                    <div className="sellerMeta">
                      <span className="sellerLocation">
                        <i className={`bi bi-geo-alt-fill locationIcon`}></i>
                        {service.owner.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <div className="locationCard">
              <h3 className="sectionHeader">
                <i className={`bi bi-map-fill sectionIcon`}></i>
                {t("servicePage.location")}
              </h3>
              <div className="addressBox">
                <i className={`bi bi-geo-alt-fill addressIcon`}></i>
                <span>{service.address}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {service.related && service.related.length > 0 && (
        <section className="my-5">
          <ProductsServices
            tittle={t("servicePage.similarproduct")}
            status={true}
            relatedServices={service.related}
          />
        </section>
      )}
    </>
  );
}
