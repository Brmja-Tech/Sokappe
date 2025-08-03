import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./ProductsNewMarket.css";
import { Link } from "react-router-dom";

const ProductsNewMarket = () => {
  const { t, i18n } = useTranslation("global");
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";
  // You can map this if dynamic
  const cards = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="products py-5">
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-xl-5 col-lg-4 col-md-12 col-12">
            <h4 className="mb-4 main-color title"><img src="/layout.gif" alt="--"/> {t("products.newmarket")}</h4>
          </div>
          <div className="col-xl-7 col-lg-8 col-md-12 col-12 text-end">
    <div className={`d-inline-block ${i18n.language === 'ar' ? 'float-start' : 'float-end'}`}>
      <button className="btn btn-categories">
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
          {cards.map((item, index) => (
            <SwiperSlide key={index}>
              <Link to="/productdetalis">

              <div className="product_card border rounded-4 overflow-hidden">
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
                      <span className="fw-bold mx-1 main-color">
                        130 {t("products.currency")}
                      </span>
                    </div>
                    {/* <div>
                      <Link className="view_details">
                        <i
                          className={`text-sm bi ${
                            i18n.language === "ar"
                              ? "bi-arrow-left"
                              : "bi-arrow-right"
                          }`}
                        ></i>
                      </Link>
                    </div> */}
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
