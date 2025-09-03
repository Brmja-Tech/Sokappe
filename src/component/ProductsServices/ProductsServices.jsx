import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./ProductsServices.css";
import { Link } from "react-router-dom";
import axios from "axios";

const ProductsServices = ({
  status = false,
  ouroffers = false,
  tittle,
  relatedServices = null,
  dataType = "services", // "services" or "products"
}) => {
  const { t, i18n } = useTranslation("global");
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";

  // Helper function to get display value for location fields
  const getDisplayValue = (field) => {
    return field?.name || field || "";
  };

  // state
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serviceRatings, setServiceRatings] = useState({});

  // fetch service ratings
  const fetchServiceRatings = useCallback(
    async (serviceIds) => {
      try {
        const ratingPromises = serviceIds.map((serviceId) =>
          axios
            .get(
              `${process.env.REACT_APP_BASE_URL}/ratings/services/${serviceId}`,
              {
                headers: {
                  Accept: "application/json",
                  "Accept-Language": i18n.language,
                },
              }
            )
            .catch(() => ({ data: { data: { average_rating: 0 } } }))
        );

        const ratingResponses = await Promise.all(ratingPromises);
        const ratings = {};

        serviceIds.forEach((serviceId, index) => {
          const response = ratingResponses[index];
          if (response?.data?.status === 200) {
            ratings[serviceId] = response.data.data?.average_rating || 0;
          } else {
            ratings[serviceId] = 0;
          }
        });

        setServiceRatings(ratings);
      } catch (error) {
        console.error("Error fetching service ratings:", error);
      }
    },
    [i18n.language]
  );

  // fetch services
  const fetchServices = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/services/allServices`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );
        if (res.data?.status === 200) {
          const servicesData = res.data.data.data || res.data.data || [];
          setServices(servicesData);

          // Fetch ratings for services
          if (servicesData.length > 0) {
            fetchServiceRatings(servicesData.map((service) => service.id));
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    },
    [i18n.language, fetchServiceRatings]
  );

  useEffect(() => {
    // If relatedServices are provided, use them directly
    if (
      relatedServices &&
      Array.isArray(relatedServices) &&
      relatedServices.length > 0
    ) {
      setServices(relatedServices);
      setLoading(false);

      // Fetch ratings for related services
      if (dataType === "services") {
        fetchServiceRatings(relatedServices.map((service) => service.id));
      }
    } else if (!relatedServices) {
      // Only fetch from API if no related data is provided
      fetchServices(1);
    } else {
      fetchServices(1);
    }
  }, [
    i18n.language,
    relatedServices,
    dataType,
    fetchServices,
    fetchServiceRatings,
  ]);

  // If relatedServices are provided and empty, don't render anything
  if (
    relatedServices &&
    Array.isArray(relatedServices) &&
    relatedServices.length === 0
  ) {
    return null;
  }

  return (
    <div className="products py-5">
      <div className="container">
        <div className="row">
          <div className="col-xl-5 col-lg-4 col-md-12 col-12">
            <h4 className="mb-4 main-color title">
              <img src="/layout.gif" alt="--" /> {tittle}
            </h4>
          </div>
          {!status && (
            <div className="col-xl-7 col-lg-8 col-md-12 col-12 text-end">
              <div
                className={`d-inline-block ${
                  i18n.language === "ar" ? "float-start" : "float-end"
                }`}
              >
                <button
                  className="btn btn-categories"
                  onClick={() => (window.location.href = "/requestservice")}
                >
                  {t("products.allservices")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-fluid">
        {loading ? (
          <p className="text-center py-5">{t("loading")}...</p>
        ) : !Array.isArray(services) || services.length === 0 ? (
          <p className="text-center py-5">No services available</p>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            loop={relatedServices ? false : services.length > 4}
            key={swiperKey}
            dir={isRTL ? "rtl" : "ltr"}
            autoplay={
              relatedServices
                ? false
                : services.length > 4
                ? {
                    delay: 2500,
                    disableOnInteraction: false,
                  }
                : false
            }
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 4 },
            }}
          >
            {Array.isArray(services) && services.length > 0 ? (
              services.map((service) => {
                const hasOffers = ouroffers && service.discount_price;
                const oldPrice = hasOffers ? service.price : null;
                const currentPrice = hasOffers
                  ? service.discount_price
                  : service.price;

                return (
                  <SwiperSlide key={service.id}>
                    <Link
                      to={
                        dataType === "products"
                          ? `/productdetalis/${service.id}`
                          : `/servicedetails/${service.id}`
                      }
                    >
                      <div className="product_card border rounded-4 overflow-hidden position-relative">
                        {hasOffers && (
                          <div
                            className="position-absolute text-white px-2 py-1 small"
                            style={{
                              top: "10px",
                              [isRTL ? "right" : "left"]: "10px",
                              backgroundColor: "#dc3545",
                              borderRadius: "0.375rem",
                              zIndex: 10,
                            }}
                          >
                            {t("products.discount")}{" "}
                            {Math.round(
                              ((parseFloat(service.price) -
                                parseFloat(service.discount_price)) /
                                parseFloat(service.price)) *
                                100
                            )}
                            %
                          </div>
                        )}

                        <img
                          src={service.main_image}
                          alt={service.name}
                          className="img-fluid mb-3 rounded-4"
                        />
                        <div className="p-3">
                          <p className="line-height mb-1">{service.name}</p>
                          <small className="mb-2 d-block main-color fw-bold">
                            {getDisplayValue(service.country)} -{" "}
                            {getDisplayValue(service.governorate)}
                          </small>
                          <div className="text-sm d-flex justify-content-between align-items-center">
                            <div>
                              {t("products.startingFrom")}
                              {hasOffers && oldPrice ? (
                                <>
                                  <span className="mx-1 text-muted text-decoration-line-through">
                                    {oldPrice} {t("products.currency")}
                                  </span>
                                  <span className="fw-bold mx-1 main-color">
                                    {currentPrice} {t("products.currency")}
                                  </span>
                                </>
                              ) : (
                                <span className="fw-bold mx-1 main-color">
                                  {currentPrice} {t("products.currency")}
                                </span>
                              )}
                            </div>

                            {/* Service Rating Badge */}
                            {dataType === "services" &&
                              serviceRatings[service.id] > 0 && (
                                <div className="rating-badge">
                                  <i className="bi bi-star-fill text-warning me-1"></i>
                                  <span className="fw-bold text-warning">
                                    {serviceRatings[service.id].toFixed(1)}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })
            ) : (
              <div className="text-center py-5">
                <p>{t("loading")}...</p>
              </div>
            )}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default ProductsServices;
