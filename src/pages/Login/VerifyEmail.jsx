import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const VerifyEmail = () => {
  const { t, i18n } = useTranslation("global");
  return (
    <div
      className="registration_forms py-4"
      style={{ backgroundImage: "url('/verify-email.jpg')" }}
    >
      <form>
        <img className="logo" src="/logo-white.png" alt="--" />
        <h5 className="text-center mt-2 mb-3 fw-bold">
          {t("sign.emailConfirmation")}
        </h5>
        <span className="text-sm text-center d-block">
          {t("sign.checkEmailAndEnterCode")}
        </span>
        <label>{t("sign.confirmationCode")}</label>
        <input
          autoComplete="off"
          type="text"
          name="confirmationCode"
          placeholder={t("sign.confirmationCode")}
        />
        <Link className="resend_code fw-bold text-sm main-color">
          {t("sign.resendConfirmationCode")}
        </Link>
        <div className="text-center">
          <button type="submit">{t("sign.confirm")}</button>
        </div>
      </form>
    </div>
  );
};

export default VerifyEmail;
