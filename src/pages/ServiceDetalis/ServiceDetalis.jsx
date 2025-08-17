import React, { useState, useEffect } from "react";
import ProductDetalisPageHead from "../../component/ProductDetalisPageHead/ProductDetalisPageHead";
import "../ProductsDetalis/ProductsDetalis.css";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

// Icons
import share from "../../assests/imgs/share.svg";
import heart from "../../assests/imgs/heart.svg";
import group from "../../assests/imgs/Group.svg";
import retrun from "../../assests/imgs/return.svg";
import car from "../../assests/imgs/car.svg";
import latop from "../../assests/imgs/22.svg";
import ProductsServices from "../../component/ProductsServices/ProductsServices";

export default function ServiceDetalis() {
  const { t, i18n } = useTranslation("global");
  const { id } = useParams();

  // State for service data
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/services/${id}`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );

        if (response.data.status === 200) {
          setService(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
        setError("Failed to load service details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceDetails();
    }
  }, [id, i18n.language]);

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="text-center py-5">
        <p className="text-danger">{error || "Service not found"}</p>
      </div>
    );
  }

  // Prepare images array
  const images = service.main_image
    ? [service.main_image, ...(service.other_images || [])]
    : [latop]; // fallback image

  return (
    <>
      <ProductDetalisPageHead
        services={t("products.newmarket")}
        flitercategory={t("products.latop")}
        Products={t("productsDetalis")}
      />

      <section className="container products-details-container">
        <h4 className="product-title">{service.name}</h4>

        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div className="action-buttons">
            <button className="action-button">
              <img src={share} alt="Share" />
              {t("productDetails.share")}
            </button>
            <button className="action-button">
              <img src={heart} alt="Favorite" />
              {t("productDetails.addToFavorites")}
            </button>
            <button className="action-button">
              <img src={group} alt="Highlight" />
              {t("productDetails.highlight")}
            </button>
            <button className="action-button">
              <img src={retrun} alt="Repost" />
              {t("productDetails.repost")}
            </button>
          </div>

          <div className="d-flex align-items-center">
            <button className="action-button">
              <img src={car} alt="Shipping" />
              {t("productDetails.shipping")}
            </button>
            <div className="time-posted ms-2">
              {t("productDetails.posted", { hours: 12 })}
            </div>
          </div>
        </div>

        <div className="product-row">
          <div className="product-col-8">
            <div className="product-images">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={50}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
              >
                {images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img src={img} alt={`Product ${index + 1}`} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          <div className="product-col-4">
            <div className="product-info-box">
              <h4 className="price">
                {service.price} {t("products.currency")}
              </h4>
              <button className="contact-seller">
                {t("productDetails.contactSeller")}
              </button>

              <div className="general-tips">
                <h5>{t("productDetails.generalTips")}</h5>
                <ul>
                  {Array.isArray(
                    t("productDetails.tips", { returnObjects: true })
                  ) ? (
                    t("productDetails.tips", { returnObjects: true }).map(
                      (tip, index) => <li key={index}>{tip}</li>
                    )
                  ) : (
                    <>
                      <li>{t("productDetails.tip1")}</li>
                      <li>{t("productDetails.tip2")}</li>
                      <li>{t("productDetails.tip3")}</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="product-row">
          <div className="product-col-8">
            <div className="details-section">
              <h4>{t("productDetails.information")}</h4>
              <div className="details-row">
                <div className="detail-col-6">
                  <div className="detail-item">
                    <span>{t("productDetails.category")}</span>
                    <span>{service.category?.name || "Service"}</span>
                  </div>
                </div>
                <div className="detail-col-6">
                  <div className="detail-item">
                    <span>{t("productDetails.price")}</span>
                    <span>
                      {service.price} {t("products.currency")}
                    </span>
                  </div>
                </div>
                <div className="detail-col-6">
                  <div className="detail-item">
                    <span>{t("productDetails.deliveryDays")}</span>
                    <span>{service.delivery_days || "N/A"}</span>
                  </div>
                </div>
                <div className="detail-col-6">
                  <div className="detail-item">
                    <span>{t("productDetails.discountPrice")}</span>
                    <span>{service.discount_price || "N/A"}</span>
                  </div>
                </div>
                <div className="detail-col-6">
                  <div className="detail-item">
                    <span>{t("productDetails.country")}</span>
                    <span>{service.country}</span>
                  </div>
                </div>
                <div className="detail-col-6">
                  <div className="detail-item">
                    <span>{t("productDetails.governorate")}</span>
                    <span>{service.governorate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="description-box">
              <h4>{t("productDetails.description")}</h4>
              <p>{service.description}</p>
            </div>
          </div>

          <div className="product-col-4">
            <Link to="/adownerprofile">
              <div className="seller-box">
                <h4>{t("productDetails.seller")}</h4>
                <div className="seller-header">
                  <img src={latop} alt="Seller" className="seller-avatar" />
                  <div>
                    <h6>Service Provider</h6>
                    <div className="seller-rating">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fa fa-star${i < 4 ? "" : "-o"}`}
                        ></i>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            <div className="location-box">
              <h4>{t("productDetails.location")}</h4>
              <p className="location-text">
                {service.country} - {service.governorate}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProductsServices tittle={t("products.similarproduct")} status={true} />
    </>
  );
}
