import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./Changepassword.css";
import logo from "../../assests/imgs/logo.svg";

const ChangePassword = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";

  return (
    <div className="change-password-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="change-password-container">
        <img className="change-password-logo" src={logo} alt="Logo" />
        <h5 className="change-password-title">{t("sign.newPassword")}</h5>

        <div className="change-password-subtitle">
          {t("sign.resetPasswordHelp")}
        </div>

        <form className="change-password-form">
          <div className="form-group">
            <label className="form-label">{t("sign.newPassword")}</label>
            <input
              className="form-input"
              autoComplete="off"
              type="password"
              name="newPassword"
              placeholder={t("sign.newPassword")}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("sign.confirmPassword")}</label>
            <input
              className="form-input"
              autoComplete="off"
              type="password"
              name="confirmPassword"
              placeholder={t("sign.confirmPassword")}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
            />
          </div>

          <button type="submit" className="change-password-button">
            {t("sign.changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
