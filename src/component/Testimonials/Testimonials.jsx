import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./Testimonials.css";

const Testimonials = () => {
  const { t, i18n } = useTranslation("global");
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";
  // You can map this if dynamic
  const cards = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="testimonials py-5">
      <div className="container">
        <h4 className="mb-4 main-color text-center title">
          <img src="/good-review.gif" alt="--"/> {t("testimonials.sectionTitle")}
        </h4>
        <p className="text-center gray-color">
          {t("testimonials.sectionSubtitle")}
        </p>
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
              <div className="testimonial_card">
                <div className="stars">
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star text-warning"></i>
                </div>
                <p className="line-height gray-color my-3">
                  {t("testimonials.feedback")}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <img
                        className="d-block"
                        src="/avatar.webp"
                        style={{
                          width: "30px",
                          height: "30px",
                          objectFit:"cover",
                          borderRadius: "50%",
                        }}
                        alt="--"
                      />
                    </div>
                    <div className="mx-1">
                      <b className="d-block text-sm">
                        {t("testimonials.name")}
                      </b>
                      <span className="d-block text-sm gray-color">
                        {t("testimonials.date")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <img src="/quote.png" alt="--" />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Testimonials;