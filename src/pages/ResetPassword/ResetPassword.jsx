import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./ResetPassword.css";
import logo from "../../assests/imgs/logo.svg";

const ResetPassword = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";

  return (
    <div className="reset-password-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="reset-password-container">
        <img className="reset-password-logo" src={logo} alt="Logo" />
        <h5 className="reset-password-title">{t("sign.resetPassword")}</h5>

        <div className="reset-password-subtitle">
          {t("sign.weWillHelpYouReset")}
        </div>

        <form className="reset-password-form">
          <div className="form-group">
            <label className="form-label">{t("sign.email")}</label>
            <input
              className="form-input"
              autoComplete="off"
              type="email"
              name="email"
              placeholder={t("sign.email")}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
            />
          </div>

          <Link to="/login" className="remember-password-link">
            {t("sign.rememberPassword")}
          </Link>

          <button type="submit" className="reset-password-button">
            {t("sign.reset")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
