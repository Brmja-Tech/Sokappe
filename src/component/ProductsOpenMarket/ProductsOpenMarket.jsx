import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./ProductsOpenMarket.css";
import { Link } from "react-router-dom";
import axios from "axios";

const ProductsOpenMarket = () => {
  const { t, i18n } = useTranslation("global");
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function to check if delivery/warranty is available
  const isAvailable = (value) => {
    return value === "1" || value === 1 || value === true;
  };

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
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    },
    [i18n.language]
  );

  useEffect(() => {
    fetchProducts();
  }, [i18n.language]);

  return (
    <div className="products py-5">
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
              <button className="btn btn-categories">
                {t("products.allcategories")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="products-container">
        {loading ? (
          <p className="loading-message">{t("loading")}...</p>
        ) : products.length === 0 ? (
          <p className="empty-message">No products available</p>
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
                  className="product-link"
                >
                  <div className="product-card">
                    <div className="product-image-wrapper">
                      <img
                        src={
                          product.main_image ||
                          product.other_images[0] ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                    </div>
                    <div className="product-content">
                      <h3 className="product-title">{product.name}</h3>
                      <div className="product-price">
                        {product.price} {t("products.currency")}
                      </div>
                      <div className="product-meta">
                        <span className="meta-item">
                          <i className="bi bi-info-circle"></i>
                          {product.condition}
                        </span>
                        <span className="meta-item">
                          <i className="bi bi-geo-alt"></i>
                          {product.address}
                        </span>
                      </div>
                      <div className="product-badges">
                        <span
                          className={`badge ${
                            isAvailable(product.has_delivery)
                              ? "delivery"
                              : "no-delivery"
                          }`}
                        >
                          <i className="bi bi-truck"></i>
                          {isAvailable(product.has_delivery)
                            ? t("products.delivery")
                            : t("products.noDelivery")}
                        </span>
                        <span
                          className={`badge ${
                            isAvailable(product.has_warranty)
                              ? "warranty"
                              : "no-warranty"
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
