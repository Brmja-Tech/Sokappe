import React, { useEffect, useState } from "react";
import styles from "./ServiceDetalis.module.css";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useChat } from "../../context/ChatContext";

// Icons
import ProductsServices from "../../component/ProductsServices/ProductsServices";

export default function ServiceDetalis() {
  const { t, i18n } = useTranslation("global");
  const { id } = useParams();
  const navigate = useNavigate();
  const { chats } = useChat();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Service request states
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'accepted', 'rejected', null
  const [requestId, setRequestId] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Rating states
  const [ratings, setRatings] = useState({
    average_rating: 0,
    ratings: [],
  });
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

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

  // Handle chat with service owner
  const handleChatWithOwner = (ownerId) => {
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (!userData || !userData.token) {
      toast.error(t("sign.login") + " " + t("sign.haveAccount"));
      return;
    }

    // Check if there's an existing chat with this owner
    const existingChat = findExistingChat(ownerId);

    if (existingChat) {
      // Navigate to existing chat
      navigate(`/chats/${existingChat.chat_id}`, {
        state: {
          otherUserId: ownerId,
          otherUserName: existingChat.other_user_name,
        },
      });
    } else {
      // Navigate to new chat
      navigate(`/chats/new?other_user_id=${ownerId}`);
    }

    // Scroll to top of the page
    window.scrollTo(0, 0);
  };

  // Find existing chat with specific user
  const findExistingChat = (otherUserId) => {
    // Search in the chats from context
    return chats.find(
      (chat) =>
        chat.other_user_id === otherUserId ||
        chat.other_user_id === parseInt(otherUserId) ||
        String(chat.other_user_id) === String(otherUserId)
    );
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
            // toast.success(t("servicePage.requestAccepted"));
          }
        } else if (serverStatus === "reject" || serverStatus === "rejected") {
          if (previousStatus !== "rejected") {
            // toast.error(t("servicePage.requestRejected"));
          }
        } else if (serverStatus === "completed") {
          if (previousStatus !== "completed") {
            // toast.success(t("servicePage.requestCompleted"));
          }
        }
      }
    } catch (error) {
      console.error("Error checking request status from server:", error);
    }
  };

  // Fetch service ratings
  const fetchRatings = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/ratings/services/${id}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data?.status === 200) {
        setRatings({
          average_rating: response.data.data?.average_rating || 0,
          ratings: response.data.data?.ratings || [],
        });
      }
    } catch (error) {
      console.error("Error fetching service ratings:", error);
      // Set default values if error occurs
      setRatings({
        average_rating: 0,
        ratings: [],
      });
    }
  };

  // Submit rating
  const submitRating = async () => {
    if (userRating === 0) {
      toast.error(t("productDetails.ratingRequired"));
      return;
    }

    try {
      setRatingLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));

      if (!userData || !userData.token) {
        toast.error(t("sign.login") + " " + t("sign.haveAccount"));
        return;
      }

      const response = await axios.post(
        `${
          process.env.REACT_APP_BASE_URL
        }/ratings/services?service_id=${id}&rating=${userRating}&comment=${encodeURIComponent(
          userComment
        )}`,
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
        toast.success(t("productDetails.ratingSubmitted"));
        setUserRating(0);
        setUserComment("");
        setShowRatingForm(false);
        // Refresh ratings
        await fetchRatings();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("productDetails.ratingError"));
      }
    } finally {
      setRatingLoading(false);
    }
  };

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, interactive = false }) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${
              star <= rating ? styles.starFilled : styles.starEmpty
            } ${interactive ? styles.starInteractive : ""}`}
            onClick={interactive ? () => onRatingChange(star) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Chat functions

  useEffect(() => {
    if (id) {
      fetchServiceDetails();
      checkRequestStatus();
      fetchRatings();
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
      <section className={styles.mainContainer}>
        <h1 className={styles.title}>{service.name}</h1>

        <div className={styles.contentGrid}>
          <div className={styles.gallerySection}>
            <div className={styles.swiperContainer}>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                className={styles.mainSwiper}
              >
                {allImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className={styles.imageFrame}>
                      <img
                        src={img}
                        alt={`${service.name} - عرض ${index + 1}`}
                        className={styles.mainImg}
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

          <div className={styles.sidePanel}>
            <div className={styles.infoCard}>
              <div className={styles.priceBox}>
                {service.discount_price &&
                service.discount_price !== service.price ? (
                  <div>
                    <span className={styles.oldPrice}>
                      {service.price} {t("servicePage.currency")}
                    </span>
                    <span className={styles.currentPrice}>
                      {service.discount_price} {t("servicePage.currency")}
                    </span>
                  </div>
                ) : (
                  <span className={styles.currentPrice}>
                    {service.price} {t("servicePage.currency")}
                  </span>
                )}
              </div>

              {/* Service Request Button - Always visible */}
              <button
                className={styles.requestBtn}
                onClick={sendServiceRequest}
                disabled={requestLoading || requestStatus === "pending"}
              >
                <i className={`bi bi-send-fill ${styles.btnIcon}`}></i>
                {requestLoading
                  ? t("servicePage.sending")
                  : t("servicePage.sendRequest")}
              </button>

              {/* Display current request status */}
              {requestStatus && (
                <div className={styles.requestStatusContainer}>
                  <div className={styles.statusLabel}>
                    Status:{" "}
                    <span
                      className={`${styles.statusValue} ${styles[requestStatus]}`}
                    >
                      {requestStatus === "pending" && "Pending"}
                      {requestStatus === "accepted" && "Accepted"}
                      {requestStatus === "rejected" && "Rejected"}
                      {requestStatus === "completed" && "Completed"}
                    </span>
                  </div>

                  {/* Cancel button for pending requests */}
                  {requestStatus === "pending" && (
                    <button
                      className={styles.cancelRequestBtn}
                      onClick={cancelServiceRequest}
                      disabled={cancelLoading}
                    >
                      <i
                        className={`bi bi-x-circle-fill ${styles.btnIcon}`}
                      ></i>
                      {cancelLoading
                        ? t("servicePage.cancelling")
                        : t("servicePage.cancelRequest")}
                    </button>
                  )}
                </div>
              )}

              <div className={styles.safetyTips}>
                <h3 className={styles.tipsHeading}>
                  <i className={`bi bi-lightbulb ${styles.tipsIcon}`}></i>
                  {t("servicePage.generalTips")}
                </h3>
                <ul className={styles.tipsList}>
                  <li className={styles.tipItem}>
                    <i
                      className={`bi bi-check-circle-fill ${styles.tipBullet}`}
                    ></i>
                    {t("servicePage.tips.1")}
                  </li>
                  <li className={styles.tipItem}>
                    <i
                      className={`bi bi-check-circle-fill ${styles.tipBullet}`}
                    ></i>
                    {t("servicePage.tips.2")}
                  </li>
                  <li className={styles.tipItem}>
                    <i
                      className={`bi bi-check-circle-fill ${styles.tipBullet}`}
                    ></i>
                    {t("servicePage.tips.3")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.specsSection}>
            <div className={styles.specsCard}>
              <h2 className={styles.sectionHeader}>
                <i
                  className={`bi bi-info-circle-fill ${styles.sectionIcon}`}
                ></i>
                {t("servicePage.information")}
              </h2>
              <div className={styles.specsTable}>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>
                    {t("servicePage.serviceCountry")}:
                  </span>
                  <span className={styles.specValue}>{service.country}</span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>
                    {t("servicePage.serviceGovernorate")}:
                  </span>
                  <span className={styles.specValue}>
                    {service.governorate}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>
                    {t("servicePage.serviceCenterGov")}:
                  </span>
                  <span className={styles.specValue}>{service.centerGov}</span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>
                    {t("servicePage.serviceAddress")}:
                  </span>
                  <span className={styles.specValue}>{service.address}</span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>
                    {t("servicePage.serviceDelivery")}:
                  </span>
                  <span className={styles.specValue}>
                    {service.delivery_days} {t("servicePage.days")}
                  </span>
                </div>
                {service.discount_expires_at && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>
                      {t("servicePage.serviceDiscountExpires")}:
                    </span>
                    <span className="text-danger">
                      {new Date(
                        service.discount_expires_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.descCard}>
              <h2 className={styles.sectionHeader}>
                <i className={`bi bi-file-text-fill ${styles.sectionIcon}`}></i>
                {t("servicePage.description")}
              </h2>
              <div className={styles.descContent}>
                {service.description.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sellerSection}>
            <Link
              to={`/serviceownerprofile/${service.id}`}
              className={styles.sellerLink}
            >
              <div className={styles.sellerCard}>
                <h3 className={styles.sectionHeader}>
                  <i className={`bi bi-person-fill ${styles.sectionIcon}`}></i>
                  {t("servicePage.seller")}
                </h3>
                <div className={styles.sellerProfile}>
                  <img
                    src={service.owner.avatar || "/avatar.webp"}
                    alt={`${service.owner.username}`}
                    className={styles.sellerAvatar}
                  />
                  <div className={styles.sellerInfo}>
                    <h4 className={styles.sellerName}>
                      {service.owner.username}
                    </h4>
                    <div className={styles.sellerMeta}>
                      <span className={styles.sellerLocation}>
                        <i
                          className={`bi bi-geo-alt-fill ${styles.locationIcon}`}
                        ></i>
                        {service.owner.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Chat with Service Owner Button */}
            <div className={styles.chatSection}>
              <button
                className={styles.chatWithOwnerBtn}
                onClick={() => handleChatWithOwner(service.owner.id)}
                title={t("chat.chatWith") + " " + t("chat.serviceOwner")}
              >
                <i className="bi bi-chat-dots-fill"></i>
                {t("chat.chatWith")} {t("chat.serviceOwner")}
              </button>
            </div>

            <div className={styles.locationCard}>
              <h3 className={styles.sectionHeader}>
                <i className={`bi bi-map-fill ${styles.sectionIcon}`}></i>
                {t("servicePage.location")}
              </h3>
              <div className={styles.addressBox}>
                <i className={`bi bi-geo-alt-fill ${styles.addressIcon}`}></i>
                <span>{service.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <section className={styles.ratingsSection}>
          <div className="container">
            <div className={styles.ratingsContainer}>
              <div className={styles.ratingsHeader}>
                <h2 className={styles.ratingsTitle}>
                  <i className="bi bi-star-fill me-2"></i>
                  {t("productDetails.ratings")}
                </h2>

                {/* Average Rating Display */}
                <div className={styles.averageRating}>
                  <div className={styles.averageScore}>
                    <span className={styles.scoreNumber}>
                      {(ratings.average_rating || 0).toFixed(1)}
                    </span>
                    <span className={styles.scoreMax}>/5</span>
                  </div>
                  <StarRating
                    rating={Math.round(ratings.average_rating || 0)}
                  />
                  <span className={styles.ratingCount}>
                    ({(ratings.ratings || []).length}{" "}
                    {t("productDetails.reviews")})
                  </span>
                </div>
              </div>

              {/* Rating Form */}
              <div className={styles.ratingForm}>
                <button
                  className={styles.rateButton}
                  onClick={() => setShowRatingForm(!showRatingForm)}
                >
                  <i className="bi bi-star me-2"></i>
                  {t("productDetails.rateProduct")}
                </button>

                {showRatingForm && (
                  <div className={styles.ratingFormContent}>
                    <div className={styles.ratingInput}>
                      <label className={styles.ratingLabel}>
                        {t("productDetails.yourRating")}:
                      </label>
                      <StarRating
                        rating={userRating}
                        onRatingChange={setUserRating}
                        interactive={true}
                      />
                    </div>

                    <div className={styles.commentInput}>
                      <label className={styles.commentLabel}>
                        {t("productDetails.yourComment")}:
                      </label>
                      <textarea
                        className={styles.commentTextarea}
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder={t("productDetails.commentPlaceholder")}
                        rows="3"
                      />
                    </div>

                    <div className={styles.ratingActions}>
                      <button
                        className={styles.submitRatingBtn}
                        onClick={submitRating}
                        disabled={ratingLoading || userRating === 0}
                      >
                        {ratingLoading ? (
                          <>
                            <i className="bi bi-hourglass-split me-2"></i>
                            {t("productDetails.submitting")}
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            {t("productDetails.submitRating")}
                          </>
                        )}
                      </button>
                      <button
                        className={styles.cancelRatingBtn}
                        onClick={() => {
                          setShowRatingForm(false);
                          setUserRating(0);
                          setUserComment("");
                        }}
                      >
                        {t("productDetails.cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className={styles.reviewsList}>
                <h3 className={styles.reviewsTitle}>
                  {t("productDetails.customerReviews")}
                </h3>
                <div className={styles.reviewsContainer}>
                  {ratings.ratings && ratings.ratings.length > 0 ? (
                    ratings.ratings.map((review) => (
                      <div key={review.id} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewerInfo}>
                            <div className={styles.reviewerAvatar}>
                              {review.user?.name?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </div>
                            <div className={styles.reviewerDetails}>
                              <div className={styles.reviewerName}>
                                {review.user?.name || "Anonymous"}
                              </div>
                              <div className={styles.reviewRating}>
                                <StarRating rating={review.rating} />
                                <div className={styles.reviewDate}>
                                  {new Date(
                                    review.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <div className={styles.reviewComment}>
                            <p>{review.comment}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noReviews}>
                      <i className="bi bi-chat-square-text"></i>
                      <p>{t("productDetails.noReviews")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
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
