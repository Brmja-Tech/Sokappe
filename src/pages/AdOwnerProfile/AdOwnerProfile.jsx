import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageHeadProfile from "../../component/PageHeadProfile/PageHeadProfile";
import {
  FaStar,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaUser,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./AdOwnerProfile.css";

export default function AdOwnerProfile() {
  const [activeTab, setActiveTab] = useState("owner");
  const [ownerData, setOwnerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    fetchOwnerData();
  }, [id]);

  const fetchOwnerData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/products/product-owner/${id}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "ar",
          },
        }
      );
      const data = await response.json();

      if (data.status === 200) {
        setOwnerData(data.data.owner);
        setProducts(data.data.products.data || []);
      }
    } catch (error) {
      console.error("Error fetching owner data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="error-container">
        <p>لم يتم العثور على البيانات</p>
      </div>
    );
  }

  return (
    <>
      <PageHeadProfile
        name={ownerData.user.username}
        rate={4.8}
        img={ownerData.company_logo_image || "/avatar.webp"}
      />

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
              معلومات المالك
            </button>
            <button
              className={`profile-tab-btn ${
                activeTab === "products" ? "active" : ""
              }`}
              onClick={() => setActiveTab("products")}
            >
              <FaBuilding className="tab-icon" />
              المنتجات ({products.length})
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
                            src={ownerData.company_logo_image || "/avatar.webp"}
                            alt="owner"
                            className="owner-image"
                          />
                        </div>
                        <div className="owner-details">
                          <h3 className="owner-name">
                            {ownerData.user.username}
                          </h3>
                          <p className="owner-type">{ownerData.company_type}</p>
                          {ownerData.bio && (
                            <p className="owner-bio">{ownerData.bio}</p>
                          )}
                        </div>
                      </div>

                      <div className="owner-contact-info">
                        <div className="contact-item">
                          <FaMapMarkerAlt className="contact-icon" />
                          <span>{ownerData.user.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div className="profile-stats-section">
                      <div className="profile-stat-card">
                        <h5 className="border-bottom mb-3">إحصائيات</h5>
                        <div className="profile-stat-header d-flex justify-content-between align-items-center mb-3">
                          <h6 className="m-0">التقييمات</h6>
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
                          <h6 className="m-0">المنتجات</h6>
                          <div className="profile-stat-number">
                            {products.length}
                          </div>
                        </div>
                      </div>
                      <div className="profile-stat-card">
                        <button className="profile-contact-btn">
                          <FaPhone className="profile-phone-icon" />
                          تحدث مع صاحب المنتج
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="products-tab">
                <div className="row">
                  <div className="col-lg-8">
                    <div className="profile-products-grid">
                      {products.map((product) => (
                        <div key={product.id} className="profile-product-card">
                          <div className="product-images-swiper">
                            <Swiper
                              modules={[Autoplay]}
                              spaceBetween={0}
                              slidesPerView={1}
                              loop={true}
                              autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                              }}
                              className="product-images-swiper"
                            >
                              <SwiperSlide>
                                <img
                                  src={product.main_image}
                                  alt={product.name}
                                  className="product-main-image"
                                />
                              </SwiperSlide>
                              {product.other_images &&
                                product.other_images.map((image, index) => (
                                  <SwiperSlide key={index}>
                                    <img
                                      src={image}
                                      alt={`${product.name} ${index + 2}`}
                                      className="product-main-image"
                                    />
                                  </SwiperSlide>
                                ))}
                            </Swiper>
                          </div>

                          <div className="product-content">
                            <h5 className="product-title">{product.name}</h5>
                            <p className="product-description">
                              {product.description}
                            </p>

                            <div className="product-details">
                              <div className="product-location">
                                <FaMapMarkerAlt className="location-icon" />
                                <span>
                                  {product.governorate.name},{" "}
                                  {product.center_gov.name}
                                </span>
                              </div>

                              <div className="product-condition">
                                <span
                                  className={`condition-badge ${
                                    product.condition === "جديد"
                                      ? "new"
                                      : "used"
                                  }`}
                                >
                                  {product.condition}
                                </span>
                              </div>
                            </div>

                            <div className="product-features">
                              <span
                                className={`feature-badge ${
                                  product.has_delivery === 1
                                    ? "delivery"
                                    : "disabled"
                                }`}
                              >
                                {product.has_delivery === 1
                                  ? "توصيل"
                                  : "لا يوجد توصيل"}
                              </span>
                              <span
                                className={`feature-badge ${
                                  product.has_warranty === 1
                                    ? "warranty"
                                    : "disabled"
                                }`}
                              >
                                {product.has_warranty === 1
                                  ? `ضمان ${product.warranty_period}`
                                  : "لا يوجد ضمان"}
                              </span>
                            </div>

                            <div className="product-price">
                              <span className="price-label">السعر:</span>
                              <span className="price-value">
                                {product.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div className="profile-stats-section">
                      <div className="profile-stat-card">
                        <h5 className="border-bottom mb-3">إحصائيات</h5>
                        <div className="profile-stat-header d-flex justify-content-between align-items-center mb-3">
                          <h6 className="m-0">التقييمات</h6>
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
                          <h6 className="m-0">المنتجات</h6>
                          <div className="profile-stat-number">
                            {products.length}
                          </div>
                        </div>
                      </div>
                      <div className="profile-stat-card">
                        <button className="profile-contact-btn">
                          <FaPhone className="profile-phone-icon" />
                          تحدث مع صاحب المنتج
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
