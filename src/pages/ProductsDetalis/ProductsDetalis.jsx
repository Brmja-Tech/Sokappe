import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

// Icons
import ProductsServices from "../../component/ProductsServices/ProductsServices";

export default function ProductsDetalis() {
  const { t, i18n } = useTranslation("global");
  const { id } = useParams();
  const { addToCart, addToWishlist, isInCart, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle add to cart
  const handleAddToCart = () => {
    addToCart(product);
  };

  // Handle add to wishlist
  const handleAddToWishlist = () => {
    addToWishlist(product);
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
    }
  }, [id, i18n.language]);

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
                    <i className={`bi ${isInCart(product.id) ? "bi-check-circle-fill" : "bi-cart-plus"}`}></i>
                    {isInCart(product.id) ? t("products.inCart") : t("products.addToCart")}
                  </button>

                  <button 
                    className={`${styles.actionBtn} ${styles.wishlistBtn} ${
                      isInWishlist(product.id) ? styles.inWishlist : ""
                    }`}
                    onClick={handleAddToWishlist}
                    disabled={isInWishlist(product.id)}
                    title={
                      isInWishlist(product.id)
                        ? t("products.alreadyInWishlist")
                        : t("products.addToWishlist")
                    }
                  >
                    <i className={`bi ${isInWishlist(product.id) ? "bi-heart-fill" : "bi-heart"}`}></i>
                    {isInWishlist(product.id) ? t("products.inWishlist") : t("products.addToWishlist")}
                  </button>
                </div>
              ) : (
                // For Used Products: Contact Seller + Cart + Wishlist buttons
                <div className={styles.actionButtons}>
                  <button className={styles.contactBtn}>
                    <i className={`bi bi-envelope-fill ${styles.btnIcon}`}></i>
                    {t("productDetails.contactSeller")}
                  </button>

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
                    <i className={`bi ${isInCart(product.id) ? "bi-check-circle-fill" : "bi-cart-plus"}`}></i>
                    {isInCart(product.id) ? t("products.inCart") : t("products.addToCart")}
                  </button>

                  <button 
                    className={`${styles.actionBtn} ${styles.wishlistBtn} ${
                      isInWishlist(product.id) ? styles.inWishlist : ""
                    }`}
                    onClick={handleAddToWishlist}
                    disabled={isInWishlist(product.id)}
                    title={
                      isInWishlist(product.id)
                        ? t("products.alreadyInWishlist")
                        : t("products.addToWishlist")
                    }
                  >
                    <i className={`bi ${isInWishlist(product.id) ? "bi-heart-fill" : "bi-heart"}`}></i>
                    {isInWishlist(product.id) ? t("products.inWishlist") : t("products.addToWishlist")}
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

      <ProductsServices
        tittle={t("products.similarproduct")}
        status={true}
        relatedServices={similarProducts}
        dataType="products"
      />
    </>
  );
}
