import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ChangePassword = () => {
  const { t, i18n } = useTranslation("global");
  return (
    <div
      className="registration_forms py-4"
      style={{ backgroundImage: "url('/new-password-bg.jpg')" }}
    >
      <form>
        <img className="logo" src="/logo-white.png" alt="--" />
        <h5 className="text-center mt-2 mb-3 fw-bold">
          {t("sign.newPassword")}
        </h5>
        <span className="text-sm text-center d-block">
          {t("sign.resetPasswordHelp")}
        </span>
        <label>{t("sign.newPassword")}</label>
        <input
          autoComplete="off"
          type="password"
          name="newPassword"
          placeholder={t("sign.newPassword")}
        />
        <label>{t("sign.confirmPassword")}</label>
        <input
          autoComplete="off"
          type="password"
          name="confirmPassword"
          placeholder={t("sign.confirmPassword")}
        />

        <div className="text-center">
          <button type="submit">{t("sign.changePassword")}</button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
