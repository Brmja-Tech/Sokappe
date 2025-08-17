import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./ProductsServices.css";
import { Link } from "react-router-dom";
import axios from "axios";

const ProductsServices = ({ status = false, ouroffers = false, tittle }) => {
  const { t, i18n } = useTranslation("global");
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";

  // state
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  // fetch services
  const fetchServices = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/services/allServices?page=${page}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );
      if (res.data?.status === 200) {
        setServices(res.data.data.data);
        setPagination(res.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(1);
  }, [i18n.language]);

  // Handle page change
  const handlePageChange = (page) => {
    fetchServices(page);
  };

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
                <button className="btn btn-categories">
                  {t("products.allcategories")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-fluid">
        {loading ? (
          <p className="text-center py-5">{t("loading")}...</p>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            loop={true}
            key={swiperKey}
            dir={isRTL ? "rtl" : "ltr"}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
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
            {services.map((service) => {
              const hasOffers = ouroffers && service.discount_price;
              const oldPrice = hasOffers ? service.price : null;
              const currentPrice = hasOffers
                ? service.discount_price
                : service.price;

              return (
                <SwiperSlide key={service.id}>
                  <Link to={`/servicedetails/${service.id}`}>
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
                          {t("products.discount")} 65%
                        </div>
                      )}

                      <img
                        src={service.main_image || "/car.png"}
                        alt={service.name}
                        className="img-fluid mb-3 rounded-4"
                      />
                      <div className="p-3">
                        <p className="line-height mb-1">{service.name}</p>
                        <small className="mb-2 d-block main-color fw-bold">
                          {service.country} - {service.governorate}
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
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default ProductsServices;
