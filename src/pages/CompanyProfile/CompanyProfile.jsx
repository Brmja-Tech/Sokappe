import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./CompanyProfile.css";
import { FiCamera, FiPlus } from "react-icons/fi";

export default function CompanyProfile() {
  const { t, i18n } = useTranslation("global");
  const [activeTab, setActiveTab] = useState("profile");
  const isRTL = i18n.language === "ar";

  // Dummy data for services
  const services = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h4 className="mt-2">
            {t("navbar.home")} /{" "}
            <span style={{ color: "#0A6E58" }}>{t("navbar.Profile")}</span>
          </h4>
        </div>
      </div>

      <div className="container profile-settings-container">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3">
            <div className="profile-settings-sidebar">
              <div className="profile-settings-title">
                {t("settings.title")}
              </div>
              <div
                className="profile-settings-tabs"
                style={{ textAlign: isRTL ? "right" : "left" }}
              >
                <button
                  className={`profile-settings-tab-btn${
                    activeTab === "profile" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {t("settings.profileTab")}
                </button>
                <button
                  className={`profile-settings-tab-btn${
                    activeTab === "notifications" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("notifications")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {t("settings.notificationsTab")}
                </button>
                <button
                  className={`profile-settings-tab-btn${
                    activeTab === "identity" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("identity")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {t("settings.identityTab")}
                </button>
                <button
                  className={`profile-settings-tab-btn${
                    activeTab === "services" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("services")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {t("settings.myServicesTab")}
                </button>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="col-md-9">
            <div className="profile-settings-content">
              {activeTab === "profile" && (
                <div className="profile-settings-profile-tab">
                  <div className="profile-settings-avatar-wrapper">
                    <img
                      src="/avatar.webp"
                      alt="avatar"
                      className="profile-settings-avatar"
                    />
                  </div>
                  <form className="profile-settings-form">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.name")}
                        </label>
                        <input
                          type="text"
                          className="form-control profile-settings-input"
                          placeholder={t("settings.namePlaceholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.age")}
                        </label>
                        <input
                          type="number"
                          className="form-control profile-settings-input"
                          placeholder={t("settings.agePlaceholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.email")}
                        </label>
                        <input
                          type="email"
                          className="form-control profile-settings-input"
                          placeholder={t("settings.emailPlaceholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.phone")}
                        </label>
                        <input
                          type="text"
                          className="form-control profile-settings-input"
                          placeholder={t("settings.phonePlaceholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.jobTitle")}
                        </label>
                        <input
                          type="text"
                          className="form-control profile-settings-input"
                          placeholder={t("settings.jobTitlePlaceholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.accountType")}
                        </label>
                        <select className="form-control profile-settings-input">
                          <option>{t("settings.accountTypeIndividual")}</option>
                          <option>{t("settings.accountTypeCompany")}</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="profile-settings-label">
                          {t("settings.bio")}
                        </label>
                        <textarea
                          className="form-control profile-settings-input"
                          rows="3"
                          placeholder={t("settings.bioPlaceholder")}
                        ></textarea>
                      </div>
                      <div className="col-12 text-end">
                        <button
                          type="submit"
                          className="profile-settings-save-btn"
                        >
                          {t("settings.saveBtn")}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              {activeTab === "notifications" && (
                <div className="profile-settings-notifications-tab">
                  <form
                    className="profile-settings-form"
                    style={{ maxWidth: 500, margin: "0 auto" }}
                  >
                    <div className="mb-3">
                      <label className="profile-settings-label">
                        {t("settings.notificationsEmail")}
                      </label>
                      <input
                        type="email"
                        className="form-control profile-settings-input"
                        placeholder={t(
                          "settings.notificationsEmailPlaceholder"
                        )}
                      />
                    </div>
                    <div className="mb-3">
                      <div
                        className="profile-settings-notify-desc"
                        style={{ color: "#0A6E58", fontWeight: 600 }}
                      >
                        {t("settings.notificationsDesc")}
                      </div>
                    </div>
                    <div className="text-end">
                      <button
                        type="submit"
                        className="profile-settings-save-btn"
                      >
                        {t("settings.saveBtn")}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {activeTab === "identity" && (
                <div className="company-identity-tab">
                  <form className="company-identity-form">
                    <div className="mb-3">
                      <label className="company-identity-label">
                        {t("identity.taxNumber")}
                      </label>
                      <input
                        type="text"
                        className="form-control company-identity-input"
                        placeholder={t("identity.taxNumberPlaceholder")}
                      />
                    </div>
                    <div className="company-identity-upload-section">
                      <h6 className="company-identity-upload-title">
                        {t("identity.companyLogo")}
                      </h6>
                      <div className="company-identity-upload-container">
                        <div className="company-identity-card-upload">
                          <div className="company-identity-card-upload-body">
                            <div className="company-identity-image-upload-container">
                              <FiCamera className="company-identity-camera-icon" />
                              <p className="company-identity-upload-text">
                                {t("identity.uploadLogo")}
                              </p>
                              <FiPlus className="company-identity-plus-icon" />
                              <input
                                type="file"
                                accept="image/*"
                                className="company-identity-file-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="company-identity-upload-section">
                      <h6 className="company-identity-upload-title">
                        {t("identity.taxRecord")}
                      </h6>
                      <div className="company-identity-upload-container">
                        <div className="company-identity-card-upload">
                          <div className="company-identity-card-upload-body">
                            <div className="company-identity-image-upload-container">
                              <FiCamera className="company-identity-camera-icon" />
                              <p className="company-identity-upload-text">
                                {t("identity.taxRecordFront")}
                              </p>
                              <FiPlus className="company-identity-plus-icon" />
                              <input
                                type="file"
                                accept="image/*"
                                className="company-identity-file-input"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="company-identity-card-upload">
                          <div className="company-identity-card-upload-body">
                            <div className="company-identity-image-upload-container">
                              <FiCamera className="company-identity-camera-icon" />
                              <p className="company-identity-upload-text">
                                {t("identity.taxRecordBack")}
                              </p>
                              <FiPlus className="company-identity-plus-icon" />
                              <input
                                type="file"
                                accept="image/*"
                                className="company-identity-file-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="company-identity-upload-section">
                      <h6 className="company-identity-upload-title">
                        {t("identity.taxCard")}
                      </h6>
                      <div className="company-identity-upload-container">
                        <div className="company-identity-card-upload">
                          <div className="company-identity-card-upload-body">
                            <div className="company-identity-image-upload-container">
                              <FiCamera className="company-identity-camera-icon" />
                              <p className="company-identity-upload-text">
                                {t("identity.taxCardFront")}
                              </p>
                              <FiPlus className="company-identity-plus-icon" />
                              <input
                                type="file"
                                accept="image/*"
                                className="company-identity-file-input"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="company-identity-card-upload">
                          <div className="company-identity-card-upload-body">
                            <div className="company-identity-image-upload-container">
                              <FiCamera className="company-identity-camera-icon" />
                              <p className="company-identity-upload-text">
                                {t("identity.taxCardBack")}
                              </p>
                              <FiPlus className="company-identity-plus-icon" />
                              <input
                                type="file"
                                accept="image/*"
                                className="company-identity-file-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-end mt-4">
                      <button
                        type="submit"
                        className="company-identity-submit-btn"
                      >
                        {t("identity.submitBtn")}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {activeTab === "services" && (
                <div className="company-services-tab">
                  <div className="row company-services-grid">
                    {services.map((item, idx) => (
                      <div className="col-md-6 col-lg-4 mb-4" key={idx}>
                        <div className="company-services-card">
                          <img
                            src="/car.png"
                            alt="service"
                            className="company-services-img"
                          />
                          <div className="company-services-content">
                            <h6 className="company-services-title">
                              Mercedes-Benz GLA 200 AMG 2023
                            </h6>
                            <p className="company-services-owner">
                              Nine One One
                            </p>
                            <div className="company-services-rating">
                              <span className="company-services-star">★</span>
                              <span className="company-services-star">★</span>
                              <span className="company-services-star">★</span>
                              <span className="company-services-star">★</span>
                              <span className="company-services-star empty">
                                ★
                              </span>
                              <span className="mx-2">(16)</span>
                            </div>
                            <div className="company-services-price">
                              {t("products.startingFrom")}{" "}
                              <span>130 {t("products.currency")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
