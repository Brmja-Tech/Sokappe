import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageHeadProfile from "../../component/PageHeadProfile/PageHeadProfile";
import {
  FaStar,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useTranslation } from "react-i18next";

import "swiper/css";
import "./ServiceOwnerProfile.css";

export default function ServiceOwnerProfile() {
  const { t, i18n } = useTranslation("global");
  const [activeTab, setActiveTab] = useState("owner");
  const [ownerData, setOwnerData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const { id } = useParams();

  useEffect(() => {
    fetchOwnerData();
  }, [id, currentPage]);

  const fetchOwnerData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/services/user/show/owner/${id}?page=${currentPage}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );
      const data = await response.json();

      if (data.status === 200) {
        setOwnerData(data.data.user);
        setServices(data.data.services.data || []);
        setTotalPages(data.data.services.pagination.last_page || 1);
        setTotalServices(data.data.services.pagination.total || 0);
      }
    } catch (error) {
      console.error("Error fetching owner data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <FaChevronLeft />
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <FaChevronRight />
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="error-container">
        <p>{t("common.noDataFound")}</p>
      </div>
    );
  }

  return (
    <>
      <PageHeadProfile name={ownerData.username} img="/avatar.webp" />

      <section className="profile-tabs-section">
        <div className="container">
          {/* Tabs Navigation */}
          <div className="profile-tabs-navigation">
            <button
              className={`profile-tab-btn ${
                activeTab === "owner" ? "active" : ""
              }`}
              onClick={() => setActiveTab("owner")}
            >
              <FaUser className="tab-icon" />
              {t("profile.ownerInfo")}
            </button>
            <button
              className={`profile-tab-btn ${
                activeTab === "services" ? "active" : ""
              }`}
              onClick={() => setActiveTab("services")}
            >
              <FaBuilding className="tab-icon" />
              {t("profile.services")} ({totalServices})
            </button>
          </div>

          {/* Tabs Content */}
          <div className="profile-tab-content">
            {/* Owner Info Tab */}
            {activeTab === "owner" && (
              <div className="owner-tab">
                <div className="row">
                  <div className="col-lg-8">
                    <div className="owner-info-card">
                      <div className="owner-header">
                        <div className="owner-avatar">
                          <img
                            src="/avatar.webp"
                            alt="owner"
                            className="owner-image"
                          />
                        </div>
                        <div className="owner-details">
                          <h3 className="owner-name">{ownerData.username}</h3>
                          <p className="owner-type">
                            {ownerData.type === "individual_vendor"
                              ? t("profile.individualVendor")
                              : t("profile.company")}
                          </p>
                          <p className="owner-bio">
                            {ownerData.country} - {ownerData.governorate} -{" "}
                            {ownerData.centerGov}
                          </p>
                        </div>
                      </div>

                      <div className="owner-contact-info">
                        <div className="contact-item">
                          <FaMapMarkerAlt className="contact-icon" />
                          <span>{ownerData.address}</span>
                        </div>
                        <div className="contact-item">
                          <FaPhone className="contact-icon" />
                          <span>{ownerData.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div className="profile-stats-section">
                      <div className="profile-stat-card">
                        <h5 className="border-bottom mb-3">
                          {t("profile.statistics")}
                        </h5>
                        <div className="profile-stat-header d-flex justify-content-between align-items-center mb-3">
                          <h6 className="m-0">{t("profile.ratings")}</h6>
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
                          <h6 className="m-0">{t("profile.services")}</h6>
                          <div className="profile-stat-number">
                            {totalServices}
                          </div>
                        </div>
                      </div>
                      <div className="profile-stat-card">
                        <button className="profile-contact-btn">
                          <FaPhone className="profile-phone-icon" />
                          {t("profile.contactServiceOwner")}
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
                      {services.map((service) => (
                        <div key={service.id} className="profile-service-card">
                          <div className="service-images-swiper">
                            <Swiper
                              modules={[Autoplay]}
                              spaceBetween={0}
                              slidesPerView={1}
                              loop={true}
                              autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                              }}
                              className="service-images-swiper"
                            >
                              <SwiperSlide>
                                <img
                                  src={service.main_image}
                                  alt={service.name}
                                  className="service-main-image"
                                />
                              </SwiperSlide>
                              {service.other_images &&
                                service.other_images.map((image, index) => (
                                  <SwiperSlide key={index}>
                                    <img
                                      src={image}
                                      alt={`${service.name} ${index + 2}`}
                                      className="service-main-image"
                                    />
                                  </SwiperSlide>
                                ))}
                            </Swiper>
                          </div>

                          <div className="service-content">
                            <h5 className="service-title">{service.name}</h5>
                            <p className="service-description">
                              {service.description}
                            </p>

                            <div className="service-details">
                              <div className="service-location">
                                <FaMapMarkerAlt className="location-icon" />
                                <span>
                                  {service.governorate}, {service.centerGov}
                                </span>
                              </div>

                              <div className="service-address">
                                <span className="address-text">
                                  {service.address}
                                </span>
                              </div>
                            </div>

                            <div className="service-features">
                              {service.delivery_days && (
                                <span className="feature-badge delivery">
                                  {t("service.deliveryWithin")}{" "}
                                  {service.delivery_days} {t("service.days")}
                                </span>
                              )}
                              {service.discount_price && (
                                <span className="feature-badge discount">
                                  {t("service.discount")}{" "}
                                  {parseFloat(service.price) -
                                    parseFloat(service.discount_price)}{" "}
                                  {t("service.currency")}
                                </span>
                              )}
                            </div>

                            <div className="service-price">
                              <span className="price-label">
                                {t("service.price")}:
                              </span>
                              <span className="price-value">
                                {service.discount_price ? (
                                  <>
                                    <span className="original-price">
                                      {service.price}
                                    </span>
                                    <span className="discount-price">
                                      {service.discount_price}
                                    </span>
                                  </>
                                ) : (
                                  service.price
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="pagination-container">
                        <div className="pagination-info">
                          {t("common.showing")} {services.length}{" "}
                          {t("common.of")} {totalServices}{" "}
                          {t("profile.service")}
                        </div>
                        <div className="pagination-buttons">
                          {renderPagination()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-lg-4">
                    <div className="profile-stats-section">
                      <div className="profile-stat-card">
                        <h5 className="border-bottom mb-3">
                          {t("profile.statistics")}
                        </h5>
                        <div className="profile-stat-header d-flex justify-content-between align-items-center mb-3">
                          <h6 className="m-0">{t("profile.ratings")}</h6>
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
                          <h6 className="m-0">{t("profile.services")}</h6>
                          <div className="profile-stat-number">
                            {totalServices}
                          </div>
                        </div>
                      </div>
                      <div className="profile-stat-card">
                        <button className="profile-contact-btn">
                          <FaPhone className="profile-phone-icon" />
                          {t("profile.contactServiceOwner")}
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
