import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./OtpVerifyEmail.css";
import logo from "../../assests/imgs/logo.svg";

const OtpVerifyEmail = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";

  return (
    <div className="otp-verify-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="otp-verify-container">
        <img className="otp-verify-logo" src={logo} alt="Logo" />
        <h5 className="otp-verify-title">{t("sign.emailConfirmation")}</h5>

        <div className="otp-verify-subtitle">
          {t("sign.checkEmailAndEnterCode")}
        </div>

        <form className="otp-verify-form">
          <div className="form-group">
            <label className="form-label">{t("sign.confirmationCode")}</label>
            <div className="otp-input-container">
              {[...Array(5)].map((_, index) => (
                <input
                  key={index}
                  className="otp-input"
                  type="text"
                  maxLength="1"
                  autoComplete="off"
                  dir={isRTL ? "rtl" : "ltr"}
                  style={{ textAlign: "center" }}
                />
              ))}
            </div>
          </div>

          <Link to="#" className="resend-code-link">
            {t("sign.resendConfirmationCode")}
          </Link>

          <button type="submit" className="otp-verify-button">
            {t("sign.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerifyEmail;
