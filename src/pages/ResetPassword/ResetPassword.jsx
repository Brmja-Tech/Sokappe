import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./ResetPassword.css";
import logo from "../../assests/imgs/logo.svg";

const ResetPassword = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/resend-otp`,
        { email }
      );

      toast.success(res.data.message || t("sign.emailSent"));
      localStorage.setItem("resetEmail", email);
      navigate("/otpforgetpassword");
    } catch (err) {
      toast.error(err.response?.data?.message || t("sign.errorOccurred"));
    }
  };

  return (
    <div className="reset-password-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="reset-password-container">
        <img className="reset-password-logo" src={logo} alt="Logo" />
        <h5 className="reset-password-title">{t("sign.resetPassword")}</h5>

        <div className="reset-password-subtitle">
          {t("sign.weWillHelpYouReset")}
        </div>

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t("sign.email")}</label>
            <input
              className="form-input"
              autoComplete="off"
              type="email"
              name="email"
              placeholder={t("sign.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
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
