import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import styles from "./ProductsNewMarket.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const ProductsNewMarket = () => {
  const { t, i18n } = useTranslation("global");
  const { addToCart, addToWishlist, isInCart, isInWishlist } = useCart();
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productRatings, setProductRatings] = useState({});

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/products/condition?condition=new`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );

        if (response.data?.status === 200) {
          setProducts(response.data.data);
          // Fetch ratings for all products
          const productIds = response.data.data.map((product) => product.id);
          fetchProductRatings(productIds);
        } else {
          setError(response.data?.message || "Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching new products:", error);
        if (error.response?.status === 404) {
          setError(
            "Products endpoint not found. Please check the API configuration."
          );
        } else if (error.response?.status >= 500) {
          setError(
            t("settings.serverError") + ". " + t("settings.pleaseTryAgainLater")
          );
        } else {
          setError(
            t("settings.failedToLoadProducts") +
              ". " +
              t("settings.pleaseTryAgainLater")
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, [i18n.language]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleAddToWishlist = (product) => {
    addToWishlist(product);
  };

  // Fetch ratings for all products
  const fetchProductRatings = async (productIds) => {
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
  };

  // Only enable loop if we have enough slides
  const shouldEnableLoop = products.length > 4;

  if (loading) {
    return (
      <div className={styles.products + " py-5"}>
        <div className="container">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.products + " py-5"}>
        <div className="container">
          <div className="text-center">
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.products + " py-5"}>
        <div className="container">
          <div className="text-center">
            <div className="alert alert-info" role="alert">
              No new products available at the moment.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.products + " py-5"}>
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-xl-5 col-lg-4 col-md-12 col-12">
            <h4 className="mb-4 main-color title">
              <img src="/layout.gif" alt="--" /> {t("products.newmarket")}
            </h4>
          </div>
          <div className="col-xl-7 col-lg-8 col-md-12 col-12 text-end">
            <div
              className={`d-inline-block ${
                i18n.language === "ar" ? "float-start" : "float-end"
              }`}
            >
              <button
                className={styles.btnCategories}
                onClick={() => (window.location.href = "/requestcategories")}
              >
                {t("products.allcategories")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          loop={shouldEnableLoop}
          key={swiperKey}
          dir={isRTL ? "rtl" : "ltr"}
          autoplay={
            shouldEnableLoop
              ? {
                  delay: 2500,
                  disableOnInteraction: false,
                }
              : false
          }
          pagination={{ clickable: true }}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            576: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            992: {
              slidesPerView: 4,
            },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <Link to={`/productdetalis/${product.id}`}>
                <div
                  className={
                    styles.productCard + " border rounded-4 overflow-hidden"
                  }
                >
                  <div className={styles.productImageWrapper}>
                    {/* Action Buttons */}
                    <div className={styles.productActions}>
                      <button
                        className={`${styles.actionBtn} ${
                          styles.addToCartBtn
                        } ${isInCart(product.id) ? styles.inCart : ""}`}
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
                        className={`${styles.actionBtn} ${styles.wishlistBtn} ${
                          isInWishlist(product.id) ? styles.inWishlist : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToWishlist(product);
                        }}
                        disabled={isInWishlist(product.id)}
                        title={
                          isInWishlist(product.id)
                            ? t("products.alreadyInWishlist")
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
                      src={product.main_image || "/car.png"}
                      alt={product.name}
                      className="img-fluid mb-3 rounded-4"
                    />
                  </div>

                  <div className="p-3">
                    <p className="line-height mb-1 fw-bold">{product.name}</p>

                    {/* Owner Username */}
                    <small className="mb-2 d-block main-color fw-bold">
                      {product.owner?.username || "Unknown"}
                    </small>

                    {/* Governorate and Center */}
                    <div className="mb-2">
                      <small className="text-muted d-block">
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        {product.governorate?.name}, {product.center_gov?.name}
                      </small>
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                      <span className="fw-bold fs-6 main-color">
                        {product.price} {t("products.currency")}
                      </span>
                    </div>

                    {/* Rating, Warranty and Delivery */}
                    <div
                      className={styles.productBadges + " d-flex gap-2 mt-3"}
                    >
                      {/* Rating Badge */}
                      {productRatings[product.id] > 0 && (
                        <span className={`${styles.badge} ${styles.rating}`}>
                          <i className="bi bi-star-fill me-1"></i>
                          {productRatings[product.id].toFixed(1)}
                        </span>
                      )}

                      {/* Warranty Badge */}
                      <span
                        className={`${styles.badge} ${
                          product.has_warranty
                            ? styles.warranty
                            : styles.noWarranty
                        }`}
                      >
                        <i className="bi bi-shield-check me-1"></i>
                        {product.has_warranty
                          ? t("products.warranty")
                          : t("products.noWarranty")}
                      </span>

                      {/* Delivery Badge */}
                      <span
                        className={`${styles.badge} ${
                          product.has_delivery
                            ? styles.delivery
                            : styles.noDelivery
                        }`}
                      >
                        <i className="bi bi-truck me-1"></i>
                        {product.has_delivery
                          ? t("products.delivery")
                          : t("products.noDelivery")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductsNewMarket;
