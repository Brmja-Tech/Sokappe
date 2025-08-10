import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Login.css";
import logo from "../../assests/imgs/logo.svg";

const Login = () => {
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/login`,
        formDataToSend,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data.status === 200) {
        // Store data in localStorage
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("userType", response.data.data.type);
        localStorage.setItem("userData", JSON.stringify(response.data.data));

        toast.success(response.data.message || "Login successful!");

        // Redirect to home page
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="login-container">
        <img className="login-logo" src={logo} alt="Logo" />
        <h5 className="login-title">{t("sign.login")}</h5>

        <div className="login-subtitle">
          <span>{t("sign.noAccount")}</span>
          <Link to="/createaccount" className="create-account mx-1">
            {t("sign.createAccount")}
          </Link>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t("sign.email")}</label>
            <input
              className="form-input"
              autoComplete="off"
              type="email"
              name="email"
              placeholder={t("sign.email")}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
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
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
            />
          </div>

          <Link to="/resetpassword" className="forgot-password">
            {t("sign.forgotPassword")}
          </Link>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? t("sign.loggingIn") || "Logging in..." : t("sign.login")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
