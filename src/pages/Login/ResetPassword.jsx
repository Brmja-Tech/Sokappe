import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const { t, i18n } = useTranslation("global");
  return (
    <div
      className="registration_forms py-4"
      style={{ backgroundImage: "url('/change-password.jpg')" }}
    >
      <form>
        <img className="logo" src="/logo-white.png" alt="--" />
        <h5 className="text-center mt-2 mb-3 fw-bold">
          {t("sign.resetPassword")}
        </h5>
        <span className="text-sm text-center d-block">
          {t("sign.weWillHelpYouReset")}
        </span>
        <label>{t("sign.email")}</label>
        <input
          autoComplete="off"
          type="text"
          name="email"
          placeholder={t("sign.email")}
        />
        <Link className="resend_code fw-bold text-sm main-color">
          {t("sign.rememberPassword")}
        </Link>
        <div className="text-center">
          <button type="submit">{t("sign.reset")}</button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
