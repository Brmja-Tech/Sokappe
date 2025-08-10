import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Createaccount.css";
import logo from "../../assests/imgs/logo.svg";

const Createaccount = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/register/start`,
        { email }
      );

      toast.success(res.data.message || t("sign.emailSent"));
      localStorage.setItem("registerEmail", email);
      navigate("/otp");
    } catch (err) {
      toast.error(err.response?.data?.message || t("sign.errorOccurred"));
    }
  };

  return (
    <div className="signup-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="signup-container">
        <img className="signup-logo" src={logo} alt="Logo" />
        <h5 className="signup-title">{t("sign.createAccount")}</h5>

        <div className="signup-subtitle">
          <span>{t("sign.haveAccount")}</span>
          <Link to="/login" className="login-link mx-1">
            {t("sign.login")}
          </Link>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
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

          <button type="submit" className="signup-button">
            {t("sign.createAccount")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Createaccount;
