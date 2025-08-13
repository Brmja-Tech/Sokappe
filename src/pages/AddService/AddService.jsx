import React from "react";
import PageHead from "../../component/PageHead/PageHead";
import { useTranslation } from "react-i18next";
import { FiCamera, FiPlus } from "react-icons/fi";
import "./AddService.css";

export default function AddService() {
  const { t } = useTranslation("global");

  return (
    <>
      <PageHead header={t("navbar.addService")} />
      <section className="add-service-section">
        <div className="container">
          <div className="row g-4">
            {/* Service Section */}
            <div className="col-lg-6">
              <label htmlFor="service-name">{t("addService.section")}</label>
              <select className="form-select" id="service-name">
                <option value="">{t("addService.section")}</option>
                <option value="electronics">الإلكترونيات</option>
                <option value="furniture">الأثاث</option>
                <option value="clothing">الملابس</option>
                <option value="automotive">السيارات</option>
                <option value="real-estate">العقارات</option>
                <option value="services">الخدمات</option>
              </select>
            </div>

            {/* Category */}
            <div className="col-lg-6">
              <label htmlFor="Category-name">{t("addService.category")}</label>
              <select className="form-select" id="Category-name">
                <option value="">{t("addService.category")}</option>
                <option value="new">جديد</option>
                <option value="used">مستعمل</option>
                <option value="refurbished">مجدد</option>
              </select>
            </div>

            {/* Location */}
            <div className="col-lg-6">
              <label htmlFor="location">{t("addService.location")}</label>
              <input
                type="text"
                className="form-control"
                id="location"
                placeholder={t("addService.location")}
              />
            </div>

            {/* Price */}
            <div className="col-lg-6">
              <label htmlFor="Price">{t("addService.Price")}</label>
              <input
                type="text"
                className="form-control"
                id="Price"
                placeholder={t("addService.Price")}
              />
            </div>

            {/* Status */}
            <div className="col-lg-6">
              <label htmlFor="status">{t("addService.status")}</label>
              <input
                type="text"
                className="form-control"
                id="status"
                placeholder={t("addService.status")}
              />
            </div>

            {/* City */}
            <div className="col-lg-6">
              <label htmlFor="city">{t("addService.city")}</label>
              <input
                type="text"
                className="form-control"
                id="city"
                placeholder={t("addService.city")}
              />
            </div>

            {/* Region */}
            <div className="col-lg-6">
              <label htmlFor="region">{t("addService.region")}</label>
              <input
                type="text"
                className="form-control"
                id="region"
                placeholder={t("addService.region")}
              />
            </div>

            {/* Delivery Service */}
            <div className="col-lg-6">
              <label htmlFor="deliveryservice">
                {t("addService.deliveryservice")}
              </label>
              <select className="form-select" id="deliveryservice">
                <option value="">{t("addService.deliveryservice")}</option>
                <option value="available">متاح</option>
                <option value="not-available">غير متاح</option>
                <option value="conditional">مشروط</option>
              </select>
            </div>

            {/* Description */}
            <div className="col-lg-12">
              <label htmlFor="description">{t("addService.description")}</label>
              <textarea
                className="form-control"
                id="description"
                placeholder={t("addService.description")}
              />
            </div>
          </div>

          {/* Images */}
          <div className="row my-4">
            {[...Array(4)].map((_, index) => (
              <div className="col-lg-3 col-md-6 mb-4" key={index}>
                <div className="card-add-ad">
                  <div className="card-add-ad-body">
                    <div className="image-upload-container">
                      <FiCamera className="camera-icon" />
                      <p className="upload-text">{t("addAd.uploadImage")}</p>
                      <FiPlus className="plus-icon" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="file-input" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="col-lg-12 text-center">
              <button className="btn btn-primary btn-publish">
                {t("addService.addService")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
