import React, { useState } from "react";
import PageHeadProfile from "../../component/PageHeadProfile/PageHeadProfile";
import profile from "../../assests/imgs/WhatsApp Image 3.jpg";
import { FaStar, FaPhone } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./AdOwnerProfile.css";

export default function AdOwnerProfile() {
  const [activeTab, setActiveTab] = useState("ads");

  return (
    <>
      <PageHeadProfile name="mahmoud amged" rate={4.8} img={profile} />

      <section className="profile-tabs-section">
        <div className="container">
          {/* Tabs Navigation */}
          <div className="profile-tabs-navigation">
            <button
              className={`profile-tab-btn ${
                activeTab === "ads" ? "active" : ""
              }`}
              onClick={() => setActiveTab("ads")}
            >
              الإعلانات
            </button>
            <button
              className={`profile-tab-btn ${
                activeTab === "services" ? "active" : ""
              }`}
              onClick={() => setActiveTab("services")}
            >
              الخدمات
            </button>
            <button
              className={`profile-tab-btn ${
                activeTab === "ratings" ? "active" : ""
              }`}
              onClick={() => setActiveTab("ratings")}
            >
              التقييمات
            </button>
          </div>

          {/* Tabs Content */}
          <div className="profile-tab-content">
            {/* Ads Tab */}
            {activeTab === "ads" && (
              <div className="ads-tab">
                <div className="row">
                  {/* Swiper Section - 8 columns */}
                  <div className="col-lg-8">
                    <div className="profile-ads-swiper-section">
                      <Swiper
                        modules={[Autoplay, Navigation, Pagination]}
                        spaceBetween={20}
                        slidesPerView={1}
                        loop={true}
                        autoplay={{
                          delay: 3000,
                          disableOnInteraction: false,
                        }}
                        pagination={{ clickable: true }}
                        navigation={true}
                        breakpoints={{
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
                        className="profile-ads-swiper"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                          <SwiperSlide key={item}>
                            <div className="profile-ad-card">
                              <img
                                src="/car.png"
                                alt="ad"
                                className="profile-ad-image"
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>

                  {/* Statistics Section - 4 columns */}
                  <div className="col-lg-4">
                    <div className="profile-stats-section">
                      <div className="profile-stat-card">
                        <h5 className="border-bottom mb-2">إحصائيات</h5>
                        <div className="profile-stat-header d-flex justify-content-between align-items-center">
                          <h5 className="m-0 p-0">التقييمات</h5>
                          <div className="profile-rating-display">
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star" />
                            <span>4.8</span>
                          </div>
                        </div>
                        <div className="profile-stat-header d-flex justify-content-between align-items-center">
                          <h5 className="m-0 p-0">الخدمات المنشورة</h5>
                          <div className="profile-stat-number">24</div>
                        </div>
                      </div>
                      <div className="profile-stat-card">
                        <button className="profile-contact-btn">
                          <FaPhone className="profile-phone-icon" />
                          تحدث مع مقدم الخدمة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div className="services-tab">
                <div className="row">
                  <div className="col-lg-8">
                    <div className="profile-services-grid">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <div key={item} className="profile-service-card">
                          <img
                            src="/car.png"
                            alt="service"
                            className="profile-service-image"
                          />
                          <div className="profile-service-content">
                            <h6>خدمة صيانة السيارات</h6>
                            <p className="profile-service-owner">
                              Nine One One
                            </p>
                            <div className="profile-rating">
                              <FaStar className="profile-star filled" />
                              <FaStar className="profile-star filled" />
                              <FaStar className="profile-star filled" />
                              <FaStar className="profile-star filled" />
                              <FaStar className="profile-star" />
                              <span>(12)</span>
                            </div>
                            <div className="profile-price">
                              يبدأ من <span>200 ريال</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div className="profile-stats-section">
                      <div className="profile-stat-card">
                        <h5 className="border-bottom mb-2">إحصائيات</h5>
                        <div className="profile-stat-header d-flex justify-content-between align-items-center">
                          <h5 className="m-0 p-0">التقييمات</h5>
                          <div className="profile-rating-display">
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star" />
                            <span>4.8</span>
                          </div>
                        </div>
                        <div className="profile-stat-header d-flex justify-content-between align-items-center">
                          <h5 className="m-0 p-0">الخدمات المنشورة</h5>
                          <div className="profile-stat-number">24</div>
                        </div>
                      </div>
                      <div className="profile-stat-card">
                        <button className="profile-contact-btn">
                          <FaPhone className="profile-phone-icon" />
                          تحدث مع مقدم الخدمة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ratings Tab */}
            {activeTab === "ratings" && (
              <div className="ratings-tab">
                <div className="row">
                  {/* Ratings List - 8 columns */}
                  <div className="col-lg-8">
                    <div className="profile-ratings-list">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <div key={item} className="profile-rating-item">
                          <div className="profile-rating-header">
                            <img
                              src="/avatar.webp"
                              alt="user"
                              className="profile-user-avatar"
                            />
                            <div className="profile-user-info">
                              <h6>أحمد محمد</h6>
                              <span className="profile-rating-date">
                                15 مارس 2024
                              </span>
                            </div>
                          </div>
                          <div className="profile-rating-stars">
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                          </div>
                          <p className="profile-rating-description">
                            خدمة ممتازة وسعر مناسب، أنصح بالتعامل معهم
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statistics Section - 4 columns */}
                  <div className="col-lg-4">
                    <div className="profile-stats-section">
                      <div className="profile-stat-card">
                        <h5 className="border-bottom mb-2">إحصائيات</h5>
                        <div className="profile-stat-header d-flex justify-content-between align-items-center">
                          <h5 className="m-0 p-0">التقييمات</h5>
                          <div className="profile-rating-display">
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star filled" />
                            <FaStar className="profile-star" />
                            <span>4.8</span>
                          </div>
                        </div>
                        <div className="profile-stat-header d-flex justify-content-between align-items-center">
                          <h5 className="m-0 p-0">الخدمات المنشورة</h5>
                          <div className="profile-stat-number">24</div>
                        </div>
                      </div>
                      <div className="profile-stat-card">
                        <button className="profile-contact-btn">
                          <FaPhone className="profile-phone-icon" />
                          تحدث مع مقدم الخدمة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
