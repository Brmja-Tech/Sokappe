import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useTranslation } from "react-i18next";
import { useBanner } from "../../context/BannerContext";
import "swiper/css";
import "swiper/css/pagination";
import "./AdsServices.css";
import { Link } from "react-router-dom";

const AdsServices = () => {
  const { t, i18n } = useTranslation("global");
  const { serviceBanners, loading } = useBanner();
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";

  // Extract all images from service banners
  const serviceImages = serviceBanners.reduce((images, banner) => {
    if (banner.images && Array.isArray(banner.images)) {
      return [...images, ...banner.images];
    }
    return images;
  }, []);

  // Fallback to default ads if no banners are loaded
  const ads =
    serviceImages.length > 0 ? serviceImages : ["/ads/ad1.jpg", "/ads/ad2.jpg"];

  if (loading) {
    return (
      <div className="ads py-5">
        <div className="container">
          <h4 className="mb-3">{t("ads.services")}</h4>
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ads py-5">
      <div className="container">
        <h4 className="mb-3">{t("ads.services")}</h4>
        <Link to="/Offer-Request-Service">
          <Swiper
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={20}
            key={swiperKey}
            dir={isRTL ? "rtl" : "ltr"}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={true}
            pagination={{ clickable: true }}
          >
            {ads.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`Service Banner ${index + 1}`}
                  className="w-100 rounded shadow-sm"
                  style={{ maxHeight: "350px", objectFit: "cover" }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Link>
      </div>
    </div>
  );
};

export default AdsServices;
