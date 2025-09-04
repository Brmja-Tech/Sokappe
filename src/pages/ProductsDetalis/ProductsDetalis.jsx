import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ProductsDetalis.module.css";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { toast } from "react-toastify";

// Icons
import ProductsServices from "../../component/ProductsServices/ProductsServices";

export default function ProductsDetalis() {
  const { t, i18n } = useTranslation("global");
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rating states
  const [ratings, setRatings] = useState({
    average_rating: 0,
    ratings: [],
  });
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  // Handle add to cart
  const handleAddToCart = () => {
    addToCart(product);
  };

  // Handle toggle wishlist
  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  // Handle chat with product owner
  const handleChatWithOwner = (ownerId) => {
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (!userData || !userData.token) {
      toast.error(t("sign.login") + " " + t("sign.haveAccount"));
      return;
    }

    // Navigate to chat with owner
    navigate(`/chats/new?other_user_id=${ownerId}`);
  };

  // Fetch product ratings
  const fetchRatings = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/ratings/products/${id}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data?.status === 200) {
        const data = response.data.data || {};
        setRatings({
          average_rating: data.average_rating || 0,
          ratings: data.ratings || [],
        });
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      // Set default values on error
      setRatings({
        average_rating: 0,
        ratings: [],
      });
    }
  }, [id, i18n.language]);

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
        `${process.env.REACT_APP_BASE_URL}/ratings/products`,
        {
          product_id: id,
          rating: userRating,
          comment: userComment,
        },
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
        fetchRatings(); // Refresh ratings
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

  // Star rating component
  const StarRating = ({ rating, onRatingChange, interactive = false }) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${
              star <= rating ? styles.starFilled : styles.starEmpty
            } ${interactive ? styles.starInteractive : ""}`}
            onClick={() => interactive && onRatingChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Helper function to check if delivery/warranty is available
  const isAvailable = (value) => {
    return value === "1" || value === 1 || value === true;
  };

  // Helper function to get display value for location fields
  const getDisplayValue = (field, fallbackKey) => {
    return field?.name || field || t(fallbackKey);
  };

  // Fetch product details and similar products
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/products/showWithSimilar?id=${id}`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );

        if (response.data?.status === 200) {
          setProduct(response.data.data.product);
          setSimilarProducts(response.data.data.similar_products);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError(t("settings.failedToLoadProductDetails"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
      fetchRatings(); // Fetch ratings when component mounts
    }
  }, [id, i18n.language, fetchRatings, t]);

  // Show loading state
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger" role="alert">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  // Prepare images array
  const images =
    product.other_images && product.other_images.length > 0
      ? [product.main_image, ...product.other_images].filter(Boolean)
      : [product.main_image].filter(Boolean);

  return (
    <>
      <section className={styles.mainContainer}>
        <h1 className={styles.title}>{product.name}</h1>

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
                {images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className={styles.imageFrame}>
                      <img
                        src={img}
                        alt={`${product.name} - عرض ${index + 1}`}
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
                <span className={styles.currentPrice}>
                  {product.price} {t("products.currency")}
                </span>
              </div>

              {/* Conditional Buttons based on Product Condition */}
              {product.condition === "New" ? (
                // For New Products: Only Cart and Wishlist buttons
                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.actionBtn} ${styles.cartBtn} ${
                      isInCart(product.id) ? styles.inCart : ""
                    }`}
                    onClick={handleAddToCart}
                    disabled={isInCart(product.id)}
                    title={
                      isInCart(product.id)
                        ? t("products.alreadyInCart")
                        : t("products.addToCart")
                    }
                  >
                    <i
                      className={`bi ${
                        isInCart(product.id)
                          ? "bi-check-circle-fill"
                          : "bi-cart-plus"
                      }`}
                    ></i>
                    {isInCart(product.id)
                      ? t("products.inCart")
                      : t("products.addToCart")}
                  </button>

                  <button
                    className={`${styles.actionBtn} ${styles.wishlistBtn} ${
                      isInWishlist(product.id) ? styles.inWishlist : ""
                    }`}
                    onClick={handleToggleWishlist}
                    title={
                      isInWishlist(product.id)
                        ? t("wishlist.removeFromWishlist")
                        : t("products.addToWishlist")
                    }
                  >
                    <i
                      className={`bi ${
                        isInWishlist(product.id) ? "bi-heart-fill" : "bi-heart"
                      }`}
                    ></i>
                    {isInWishlist(product.id)
                      ? t("products.inWishlist")
                      : t("products.addToWishlist")}
                  </button>
                </div>
              ) : (
                // For Used Products: Contact Seller + Cart + Wishlist buttons
                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.actionBtn} ${styles.cartBtn} ${
                      isInCart(product.id) ? styles.inCart : ""
                    }`}
                    onClick={handleAddToCart}
                    disabled={isInCart(product.id)}
                    title={
                      isInCart(product.id)
                        ? t("products.alreadyInCart")
                        : t("products.addToCart")
                    }
                  >
                    <i
                      className={`bi ${
                        isInCart(product.id)
                          ? "bi-check-circle-fill"
                          : "bi-cart-plus"
                      }`}
                    ></i>
                    {isInCart(product.id)
                      ? t("products.inCart")
                      : t("products.addToCart")}
                  </button>

                  <button
                    className={`${styles.actionBtn} ${styles.wishlistBtn} ${
                      isInWishlist(product.id) ? styles.inWishlist : ""
                    }`}
                    onClick={handleToggleWishlist}
                    title={
                      isInWishlist(product.id)
                        ? t("wishlist.removeFromWishlist")
                        : t("products.addToWishlist")
                    }
                  >
                    <i
                      className={`bi ${
                        isInWishlist(product.id) ? "bi-heart-fill" : "bi-heart"
                      }`}
                    ></i>
                    {isInWishlist(product.id)
                      ? t("products.inWishlist")
                      : t("products.addToWishlist")}
                  </button>
                </div>
              )}

              <div className={styles.safetyTips}>
                <h3 className={styles.tipsHeading}>
                  <i className={`bi bi-lightbulb ${styles.tipsIcon}`}></i>
                  {t("productDetails.generalTips")}
                </h3>
                <ul className={styles.tipsList}>
                  <li className={styles.tipItem}>
                    <i
                      className={`bi bi-check-circle-fill ${styles.tipBullet}`}
                    ></i>
                    {t("productDetails.tips.1")}
                  </li>
                  <li className={styles.tipItem}>
                    <i
                      className={`bi bi-check-circle-fill ${styles.tipBullet}`}
                    ></i>
                    {t("productDetails.tips.2")}
                  </li>
                  <li className={styles.tipItem}>
                    <i
                      className={`bi bi-check-circle-fill ${styles.tipBullet}`}
                    ></i>
                    {t("productDetails.tips.3")}
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
                {t("productDetails.information")}
              </h2>
              <div className={styles.specsTable}>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>{t("condition")}:</span>
                  <span className={styles.specValue}>{product.condition}</span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>{t("category")}:</span>
                  <span className={styles.specValue}>
                    {getDisplayValue(product.category, "noCategory")}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>{t("hasDelivery")}:</span>
                  <span className={styles.specValue}>
                    {isAvailable(product.has_delivery)
                      ? t("products.delivery")
                      : t("products.noDelivery")}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>{t("hasWarranty")}:</span>
                  <span className={styles.specValue}>
                    {isAvailable(product.has_warranty)
                      ? product.warranty_period
                      : t("products.noWarranty")}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>{t("country")}:</span>
                  <span className={styles.specValue}>
                    {getDisplayValue(product.country, "noCountry")}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>{t("governorate")}:</span>
                  <span className={styles.specValue}>
                    {getDisplayValue(product.governorate, "noGovernorate")}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>
                    {t("centerGovernorate")}:
                  </span>
                  <span className={styles.specValue}>
                    {getDisplayValue(product.center_gov, "noCenterGovernorate")}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>{t("address")}:</span>
                  <span className={styles.specValue}>{product.address}</span>
                </div>
              </div>
            </div>

            <div className={styles.descCard}>
              <h2 className={styles.sectionHeader}>
                <i className={`bi bi-file-text-fill ${styles.sectionIcon}`}></i>
                {t("productDetails.description")}
              </h2>
              <div className={styles.descContent}>{product.description}</div>
            </div>
          </div>

          <div className={styles.sellerSection}>
            <Link
              to={`/adownerprofile/${product.owner.id}`}
              className={styles.sellerLink}
            >
              <div className={styles.sellerCard}>
                <h3 className={styles.sectionHeader}>
                  <i className={`bi bi-person-fill ${styles.sectionIcon}`}></i>
                  {t("productDetails.seller")}
                </h3>
                <div className={styles.sellerProfile}>
                  <img
                    src="/avatar.webp"
                    alt={`${product.owner.username}`}
                    className={styles.sellerAvatar}
                  />
                  <div className={styles.sellerInfo}>
                    <h4 className={styles.sellerName}>
                      {product.owner.username}
                    </h4>
                    <div className={styles.sellerMeta}>
                      <span className={styles.sellerLocation}>
                        <i
                          className={`bi bi-geo-alt-fill ${styles.locationIcon}`}
                        ></i>
                        {product.owner.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Chat with Product Owner Button - Only show for used products */}
            {product.condition === "Used" && (
              <div className={styles.chatSection}>
                <button
                  className={styles.chatWithOwnerBtn}
                  onClick={() => handleChatWithOwner(product.owner.id)}
                  title={t("chat.chatWith") + " " + t("chat.productOwner")}
                >
                  <i className="bi bi-chat-dots-fill"></i>
                  {t("chat.chatWith")} {t("chat.productOwner")}
                </button>
              </div>
            )}

            <div className={styles.locationCard}>
              <h3 className={styles.sectionHeader}>
                <i className={`bi bi-map-fill ${styles.sectionIcon}`}></i>
                {t("productDetails.location")}
              </h3>
              <div className={styles.addressBox}>
                <i className={`bi bi-geo-alt-fill ${styles.addressIcon}`}></i>
                <span>{product.address}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <StarRating rating={Math.round(ratings.average_rating || 0)} />
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

              {(ratings.ratings || []).length > 0 ? (
                <div className={styles.reviewsContainer}>
                  {(ratings.ratings || []).map((review) => (
                    <div key={review.id} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewerInfo}>
                          <div className={styles.reviewerAvatar}>
                            {review.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className={styles.reviewerDetails}>
                            <h4 className={styles.reviewerName}>
                              {review.user.name}
                            </h4>
                            <div className={styles.reviewRating}>
                              <StarRating rating={review.rating} />
                              <span className={styles.reviewDate}>
                                {new Date(
                                  review.created_at
                                ).toLocaleDateString()}
                              </span>
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
                  ))}
                </div>
              ) : (
                <div className={styles.noReviews}>
                  <i className="bi bi-star"></i>
                  <p>{t("productDetails.noReviews")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ProductsServices
        tittle={t("products.similarproduct")}
        status={true}
        relatedServices={similarProducts}
        dataType="products"
      />
    </>
  );
}
