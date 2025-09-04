import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Login.css";
import logo from "../../assests/imgs/logo.svg";
import { initPushAndGetToken } from "../../config/firebase-messaging";

const Login = () => {
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // دالة لتوليد FCM token مؤقت
  const generateTemporaryFCMToken = () => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `temp_fcm_${timestamp}_${randomString}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // حاول تجيب الـ token
      const fcmResult = await initPushAndGetToken();
      let fcmToken = fcmResult?.token || localStorage.getItem("fcm_token");

      if (!fcmToken) {
        fcmToken = generateTemporaryFCMToken();
      }

      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("fcm_token", fcmToken);

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

        // حفظ FCM token إذا اتجاب
        if (fcmResult?.token) {
          localStorage.setItem("fcm_token", fcmResult.token);
        }

        toast.success(response.data.message || "Login successful!");
        window.location.href = "/";
      } else {
        toast.error(response.data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error(
          t("sign.networkError") ||
            "Network error. Please check your connection."
        );
      } else {
        toast.error(
          t("sign.unexpectedError") ||
            "An unexpected error occurred. Please try again."
        );
      }
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
            <div className="password-input-container">
              <input
                className="form-input password-input"
                autoComplete="off"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("sign.password")}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                dir={isRTL ? "rtl" : "ltr"}
                style={{ textAlign: isRTL ? "right" : "left" }}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={
                  showPassword ? t("sign.hidePassword") : t("sign.showPassword")
                }
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="1"
                      y1="1"
                      x2="23"
                      y2="23"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
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
