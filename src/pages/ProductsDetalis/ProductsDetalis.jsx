import React from 'react';
import ProductDetalisPageHead from '../../component/ProductDetalisPageHead/ProductDetalisPageHead';
import "../ProductsDetalis/ProductsDetalis.css";
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Icons
import share from "../../assests/imgs/share.svg";
import heart from "../../assests/imgs/heart.svg";
import group from "../../assests/imgs/Group.svg";
import retrun from "../../assests/imgs/return.svg";
import car from "../../assests/imgs/car.svg";
import latop from "../../assests/imgs/22.svg";
import ProductsServices from '../../component/ProductsServices/ProductsServices';

export default function ProductsDetalis() {
  const { t, i18n } = useTranslation("global");
  
  const product = {
    title: "لاب اتش بي حالة جيده استعمال خفيف",
    price: "5000 جنيه مصري",
    description: "لاب توب HP بحالة جيدة، استعمال خفيف، مواصفات عالية، يعمل بكفاءة.",
    seller: {
      name: "اسلام جمال",
      avatar: latop,
      rating: 4,
      location: "الجيزة - الهرم"
    },
    details: [
      { question: "هل لديك خدمة توصيل؟", answer: "لا" },
      { question: "هل يوجد ضمان؟", answer: "نعم، 6 أشهر" },
      { question: "الحالة", answer: "مستعمل - بحالة جيدة" },
      { question: "القسم", answer: "لابتوب" },
      { question: "الصيانة", answer: "متوفرة" },
      { question: "سوق المستعمل", answer: "نعم" }
    ],
    postedHours: 12
  };

  const images = [latop, latop, latop, latop];

  return (
    <>
      <ProductDetalisPageHead 
        services={t("products.newmarket")} 
        flitercategory={t("products.latop")} 
        Products={t("productsDetalis")}
      />

      <section className="container products-details-container">
        <h4 className="product-title">{product.title}</h4>
        
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div className="action-buttons">
            <button className="action-button">
              <img src={share} alt="Share" />
              {t("productDetails.share")}
            </button>
            <button className="action-button">
              <img src={heart} alt="Favorite" />
              {t("productDetails.addToFavorites")}
            </button>
            <button className="action-button">
              <img src={group} alt="Highlight" />
              {t("productDetails.highlight")}
            </button>
            <button className="action-button">
              <img src={retrun} alt="Repost" />
              {t("productDetails.repost")}
            </button>
          </div>

          <div className="d-flex align-items-center">
            <button className="action-button">
              <img src={car} alt="Shipping" />
              {t("productDetails.shipping")}
            </button>
            <div className="time-posted ms-2">
              {t("productDetails.posted", { hours: product.postedHours })}
            </div>
          </div>
        </div>

        {/* الصف الأول (الصور والمعلومات الأساسية) */}
        <div className="product-row">
          <div className="product-col-8">
            <div className="product-images">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={50}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
              >
                {images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img src={img} alt={`Product ${index + 1}`} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
          
          <div className="product-col-4">
            <div className="product-info-box">
              <h4 className="price">{product.price}</h4>
              <button className="contact-seller">
                {t("productDetails.contactSeller")}
              </button>
              
              <div className="general-tips">
                <h5>{t("productDetails.generalTips")}</h5>
                <ul>
                  {t("productDetails.tips", { returnObjects: true }).map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="product-row">
          <div className="product-col-8">
            <div className="details-section">
              <h4>{t("productDetails.information")}</h4>
              <div className="details-row">
                {product.details.map((detail, index) => (
                  <div className="detail-col-6" key={index}>
                    <div className="detail-item">
                      <span>{detail.question}</span>
                      <span>{detail.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="description-box">
              <h4>{t("productDetails.description")}</h4>
              <p>{product.description}</p>
            </div>
          </div>
          
          <div className="product-col-4">
            <div className="seller-box">
              <h4>{t("productDetails.seller")}</h4>
              <div className="seller-header">
                <img src={product.seller.avatar} alt="Seller" className="seller-avatar" />
                <div>
                  <h6>{product.seller.name}</h6>
                  <div className="seller-rating">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`fa fa-star${i < product.seller.rating ? '' : '-o'}`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="location-box">
              <h4>{t("productDetails.location")}</h4>
              <p className="location-text">{product.seller.location}</p>
            </div>
          </div>
        </div>
      </section>

      <ProductsServices tittle={t("products.similarproduct")}  status = {true}/>

    </>
  );
}