import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useTranslation } from "react-i18next";
import { useBanner } from "../../context/BannerContext";
import "swiper/css";
import "swiper/css/pagination";
import "./Ads.css";

const Ads = () => {
  const { i18n } = useTranslation();
  const { getAllBannerImages, loading, error } = useBanner();
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";

  // Get all banner images from context
  const allBannerImages = getAllBannerImages();

  // Fallback to default ads if no banners are loaded
  const ads =
    allBannerImages.length > 0
      ? allBannerImages
      : ["/ads/ad1.jpg", "/ads/ad2.jpg"];

  if (loading) {
    return (
      <div className="ads py-5">
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
    console.error("Banner error:", error);
    // Fallback to default ads on error
  }

  return (
    <div className="ads py-5">
      <div className="container">
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
                alt={`Banner ${index + 1}`}
                className="w-100 rounded shadow-sm"
                style={{ maxHeight: "350px", objectFit: "cover" }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Ads;
