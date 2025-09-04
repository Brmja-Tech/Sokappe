import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./ProductsOpenMarket.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const ProductsOpenMarket = () => {
  const { t, i18n } = useTranslation("global");
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productRatings, setProductRatings] = useState({});

  // Helper function to check if delivery/warranty is available
  const isAvailable = (value) => {
    return value === "1" || value === 1 || value === true;
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleToggleWishlist = (product) => {
    toggleWishlist(product);
  };

  // Fetch ratings for all products
  const fetchProductRatings = useCallback(
    async (productIds) => {
      try {
        const ratingPromises = productIds.map(async (productId) => {
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_BASE_URL}/ratings/products/${productId}`,
              {
                headers: {
                  Accept: "application/json",
                  "Accept-Language": i18n.language,
                },
              }
            );
            if (response.data?.status === 200) {
              return {
                productId,
                average_rating: response.data.data?.average_rating || 0,
              };
            }
          } catch (error) {
            console.error(
              `Error fetching rating for product ${productId}:`,
              error
            );
          }
          return { productId, average_rating: 0 };
        });

        const ratings = await Promise.all(ratingPromises);
        const ratingsMap = {};
        ratings.forEach(({ productId, average_rating }) => {
          ratingsMap[productId] = average_rating;
        });
        setProductRatings(ratingsMap);
      } catch (error) {
        console.error("Error fetching product ratings:", error);
      }
    },
    [i18n.language]
  );

  const fetchProducts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/products`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );
        if (res.data?.status === 200) {
          // Handle different possible data structures
          const productsData = res.data.data?.data || res.data.data || [];
          setProducts(productsData);
          // Fetch ratings for all products
          const productIds = productsData.map((product) => product.id);
          fetchProductRatings(productIds);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    },
    [i18n.language, fetchProductRatings]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className={styles.products}>
      <div className="container">
        <div className="row">
          <div className="col-xl-5 col-lg-4 col-md-12 col-12">
            <h4 className="mb-4 main-color title">
              <img src="/layout.gif" alt="--" /> {t("products.openmarket")}
            </h4>
          </div>
          <div className="col-xl-7 col-lg-8 col-md-12 col-12 text-end">
            <div
              className={`d-inline-block ${
                i18n.language === "ar" ? "float-start" : "float-end"
              }`}
            >
              <button
                className={styles["btn-categories"]}
                onClick={() => (window.location.href = "/requestcategories")}
              >
                {t("products.allcategories")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles["products-container"]}>
        {loading ? (
          <p className={styles["loading-message"]}>{t("loading")}...</p>
        ) : products.length === 0 ? (
          <p className={styles["empty-message"]}>
            {t("settings.noProductsAvailable")}
          </p>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            loop={products.length > 4}
            key={swiperKey}
            dir={isRTL ? "rtl" : "ltr"}
            autoplay={
              products.length > 4
                ? {
                    delay: 2500,
                    disableOnInteraction: false,
                  }
                : false
            }
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 4 },
            }}
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <Link
                  to={`/productdetalis/${product.id}`}
                  className={styles["product-link"]}
                >
                  <div className={styles["product-card"]}>
                    <div className={styles["product-image-wrapper"]}>
                      {/* Action Buttons */}
                      <div className={styles["product-actions"]}>
                        <button
                          className={`${styles["action-btn"]} ${
                            styles["add-to-cart-btn"]
                          } ${isInCart(product.id) ? styles["in-cart"] : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
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
                        </button>

                        <button
                          className={`${styles["action-btn"]} ${
                            styles["wishlist-btn"]
                          } ${
                            isInWishlist(product.id)
                              ? styles["in-wishlist"]
                              : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleWishlist(product);
                          }}
                          title={
                            isInWishlist(product.id)
                              ? t("wishlist.removeFromWishlist")
                              : t("products.addToWishlist")
                          }
                        >
                          <i
                            className={`bi ${
                              isInWishlist(product.id)
                                ? "bi-heart-fill"
                                : "bi-heart"
                            }`}
                          ></i>
                        </button>
                      </div>

                      <img
                        src={
                          product.main_image ||
                          product.other_images?.[0] ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        className={styles["product-image"]}
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                    </div>
                    <div className={styles["product-content"]}>
                      <h3 className={styles["product-title"]}>
                        {product.name}
                      </h3>

                      <div className={styles["product-price"]}>
                        {product.price} {t("products.currency")}
                      </div>
                      <div className={styles["product-meta"]}>
                        <span className={styles["meta-item"]}>
                          <i className="bi bi-info-circle"></i>
                          {product.condition}
                        </span>
                        <div className="mb-2">
                          <small className="text-muted d-block">
                            <i className="bi bi-geo-alt-fill me-1"></i>
                            {product.governorate?.name},{" "}
                            {product.center_gov?.name}
                          </small>
                        </div>
                      </div>
                      <div className={styles["product-badges"]}>
                        {/* Rating Badge */}
                        {productRatings[product.id] > 0 && (
                          <span className={`${styles.badge} ${styles.rating}`}>
                            <i className="bi bi-star-fill"></i>
                            {productRatings[product.id].toFixed(1)}
                          </span>
                        )}

                        <span
                          className={`${styles.badge} ${
                            isAvailable(product.has_delivery)
                              ? styles.delivery
                              : styles["no-delivery"]
                          }`}
                        >
                          <i className="bi bi-truck"></i>
                          {isAvailable(product.has_delivery)
                            ? t("products.delivery")
                            : t("products.noDelivery")}
                        </span>
                        <span
                          className={`${styles.badge} ${
                            isAvailable(product.has_warranty)
                              ? styles.warranty
                              : styles["no-warranty"]
                          }`}
                        >
                          <i className="bi bi-shield-check"></i>
                          {isAvailable(product.has_warranty)
                            ? t("products.warranty")
                            : t("products.noWarranty")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default ProductsOpenMarket;
