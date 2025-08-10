import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Changepassword.css";
import logo from "../../assests/imgs/logo.svg";

const ChangePassword = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = localStorage.getItem("resetEmail"); // الإيميل اللي مخزنينه
    if (!email) {
      toast.error(t("sign.emailMissing"));
      return navigate("/reset-password");
    }

    if (password !== confirmPassword) {
      toast.error(t("sign.passwordsNotMatch"));
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/change-password`,
        {
          email,
          password,
          password_confirmation: confirmPassword
        }
      );

      toast.success(res.data.message || t("sign.passwordChanged"));
      localStorage.removeItem("resetEmail"); // نمسحه عشان الأمان
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || t("sign.errorOccurred"));
    }
  };

  return (
    <div className="change-password-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="change-password-container">
        <img className="change-password-logo" src={logo} alt="Logo" />
        <h5 className="change-password-title">{t("sign.newPassword")}</h5>

        <div className="change-password-subtitle">
          {t("sign.resetPasswordHelp")}
        </div>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t("sign.newPassword")}</label>
            <input
              className="form-input"
              autoComplete="off"
              type="password"
              name="newPassword"
              placeholder={t("sign.newPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
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
