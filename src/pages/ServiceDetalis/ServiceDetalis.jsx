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

// Icons
import ProductsServices from "../../component/ProductsServices/ProductsServices";

export default function ServiceDetalis() {
  const { t, i18n } = useTranslation("global");
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (id) {
      fetchServiceDetails();
    }
  }, [id, i18n.language]);

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
