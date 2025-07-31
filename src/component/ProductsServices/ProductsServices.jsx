import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./ProductsServices.css";
import { Link } from "react-router-dom";

const ProductsServices = ({ status = false, ouroffers = false, tittle }) => {
  const { t, i18n } = useTranslation("global");
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";
  // You can map this if dynamic
  const cards = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="products py-5">
      <div className="container">
        <div className="row">
          <div className="col-xl-5 col-lg-4 col-md-12 col-12">
            <h4 className="mb-4 main-color title">
              <img src="/layout.gif" alt="--" /> {tittle}
            </h4>
          </div>
          {status ? (
            ""
          ) : (
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
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          loop={true}
          key={swiperKey}
          dir={isRTL ? "rtl" : "ltr"}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
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
          {cards.map((item, index) => {
            const hasOffers = ouroffers === true;
            const oldPrice = hasOffers ? 200 : null;
            const currentPrice = 130;

            return (
              <SwiperSlide key={index}>
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
                      خصم 65%
                    </div>
                  )}

                  <img
                    src="/car.png"
                    alt="--"
                    className="img-fluid mb-3 rounded-4"
                  />
                  <div className="p-3">
                    <p className="line-height mb-1">
                      Mercedes-Benz GLA 200 AMG 2023
                    </p>
                    <small className="mb-2 d-block main-color fw-bold">
                      Nine One One
                    </small>
                    <div className="d-inline-block mb-2 rates">
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-secondary"></i>
                      <span className="mx-2">(16)</span>
                    </div>

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
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductsServices;
