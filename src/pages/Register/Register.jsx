import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./Register.css";
import logo from "../../assests/imgs/logo.svg";
import { FiCamera, FiPlus } from "react-icons/fi";

const Register = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const [tab, setTab] = useState("individual");
  const [step, setStep] = useState(1);

  const companyTypeOptions = [
    { value: "1", label: "شركة تجارية" },
    { value: "2", label: "شركة صناعية" },
    { value: "3", label: "شركة خدمات" },
  ];

  const renderIndividualForm = () => (
    <form className="register-form">
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.name")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.name")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.age")}</label>
          <input
            className="form-input"
            type="number"
            placeholder={t("profile.age")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.email")}</label>
          <input
            className="form-input"
            type="email"
            placeholder={t("profile.email")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.phone")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.phone")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.password")}</label>
          <input
            className="form-input"
            type="password"
            autoComplete="off"
            placeholder={t("sign.password")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.confirmPassword")}</label>
          <input
            className="form-input"
            type="password"
            autoComplete="off"
            placeholder={t("sign.confirmPassword")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
      </div>

      <button type="submit" className="register-button">
        {t("sign.register")}
      </button>
    </form>
  );

  const renderCompanyFormStep1 = () => (
    <form className="register-form">
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.company_name")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.company_name")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.account_username")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.account_username")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.email")}</label>
          <input
            className="form-input"
            type="email"
            placeholder={t("profile.email")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.phone")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.phone")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.company_type")}</label>
          <select
            className="form-input"
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            <option value="">{t("sign.company_type")}</option>
            {companyTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.phone")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.phone")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t("profile.bio")}</label>
        <textarea
          className="form-textarea"
          placeholder={t("profile.bio")}
          dir={isRTL ? "rtl" : "ltr"}
          style={{ textAlign: isRTL ? "right" : "left" }}
        ></textarea>
      </div>

      <button
        type="button"
        className="register-button"
        onClick={() => setStep(2)}
      >
        {t("sign.next")}
      </button>
    </form>
  );

  const renderCompanyFormStep2 = () => (
    <form className="register-form">
      <div className="form-group">
        <label className="form-label">{t("sign.taxNumber")}</label>
        <input
          className="form-input"
          type="text"
          placeholder={t("sign.taxNumber")}
          dir={isRTL ? "rtl" : "ltr"}
          style={{ textAlign: isRTL ? "right" : "left" }}
        />
      </div>

      <div className="upload-section">
        <h6 className="upload-title">{t("sign.companyLogo")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.uploadLogo")}</p>
                <FiPlus className="plus-icon" />
                <input type="file" accept="image/*" className="file-input" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <h6 className="upload-title">{t("sign.taxRecord")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxRecordFront")}</p>
                <FiPlus className="plus-icon" />
                <input type="file" accept="image/*" className="file-input" />
              </div>
            </div>
          </div>
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxRecordBack")}</p>
                <FiPlus className="plus-icon" />
                <input type="file" accept="image/*" className="file-input" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <h6 className="upload-title">{t("sign.taxCard")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxCardFront")}</p>
                <FiPlus className="plus-icon" />
                <input type="file" accept="image/*" className="file-input" />
              </div>
            </div>
          </div>
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxCardBack")}</p>
                <FiPlus className="plus-icon" />
                <input type="file" accept="image/*" className="file-input" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.password")}</label>
          <input
            className="form-input"
            type="password"
            autoComplete="off"
            placeholder={t("sign.password")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.confirmPassword")}</label>
          <input
            className="form-input"
            type="password"
            autoComplete="off"
            placeholder={t("sign.confirmPassword")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
        </div>
      </div>

      <div className="button-group">
        <button
          type="button"
          className="register-button-secondary"
          onClick={() => setStep(1)}
        >
          {t("sign.previous")}
        </button>
        <button type="submit" className="register-button">
          {t("sign.register")}
        </button>
      </div>
    </form>
  );

  return (
    <div className="register-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="register-container">
        <img className="register-logo" src={logo} alt="Logo" />

        <div className="register-tabs">
          <button
            className={`tab-button ${tab === "individual" ? "active" : ""}`}
            onClick={() => {
              setTab("individual");
              setStep(1);
            }}
          >
            {t("sign.individual")}
          </button>
          <button
            className={`tab-button ${tab === "company" ? "active" : ""}`}
            onClick={() => {
              setTab("company");
              setStep(1);
            }}
          >
            {t("sign.company")}
          </button>
        </div>

        {tab === "individual"
          ? renderIndividualForm()
          : step === 1
          ? renderCompanyFormStep1()
          : renderCompanyFormStep2()}

        <div className="login-link">
          <span>{t("sign.haveAccount")}</span>
          <Link to="/login" className="link">
            {t("sign.login")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
