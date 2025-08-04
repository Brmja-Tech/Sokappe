import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./Login.css";
import logo from "../../assests/imgs/logo.svg";

const Login = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";

  return (
    <div className="login-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="login-container">
        <img className="login-logo" src={logo} alt="Logo" />
        <h5 className="login-title">{t("sign.login")}</h5>

        <div className="login-subtitle">
          <span>{t("sign.noAccount")}</span>
          <Link to="/register" className="create-account mx-1">
            {t("sign.createAccount")}
          </Link>
        </div>

        <form className="login-form">
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

          <div className="form-group">
            <label className="form-label">{t("sign.password")}</label>
            <input
              className="form-input"
              autoComplete="off"
              type="password"
              name="password"
              placeholder={t("sign.password")}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
            />
          </div>

          <Link to="/forgot-password" className="forgot-password">
            {t("sign.forgotPassword")}
          </Link>

          <button type="submit" className="login-button">
            {t("sign.login")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
