import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./OtpForgetPassword.css";
import logo from "../../assests/imgs/logo.svg";

const OtpForgetPassword = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      setIsResendActive(false);
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setIsResendActive(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const numbers = pastedData.replace(/\D/g, "").slice(0, 6);

    if (numbers.length > 0) {
      const newOtp = [...otp];
      numbers.split("").forEach((num, index) => {
        if (index < 6) {
          newOtp[index] = num;
        }
      });
      setOtp(newOtp);

      const nextEmptyIndex = newOtp.findIndex((val) => !val);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    const email = localStorage.getItem("registerEmail");

    if (!email) {
      toast.error(t("sign.emailMissing"));
      return navigate("/createaccount");
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/register/verify`,
        { email, code }
      );

      toast.success(res.data.message || t("sign.verificationSuccess"));
      navigate("/changepassword");
    } catch (err) {
      toast.error(err.response?.data?.message || t("sign.errorOccurred"));
    }
  };

  const handleResend = async () => {
    const email = localStorage.getItem("resetEmail");

    if (!email) {
      toast.error(t("sign.emailMissing"));
      return navigate("/createaccount");
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/resend-otp`,
        { email }
      );

      toast.success(res.data.message || t("sign.emailSent"));
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || t("sign.errorOccurred"));
    }
  };

  return (
    <div className="otp-verify-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="otp-verify-container">
        <img className="otp-verify-logo" src={logo} alt="Logo" />
        <h5 className="otp-verify-title">{t("sign.emailConfirmation")}</h5>

        <div className="otp-verify-subtitle">
          {t("sign.checkEmailAndEnterCode")}
        </div>

        <form className="otp-verify-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t("sign.confirmationCode")}</label>
            <div className="otp-input-container">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="otp-input"
                  type="text"
                  maxLength="1"
                  value={value}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  autoComplete="off"
                  dir={isRTL ? "rtl" : "ltr"}
                  style={{ textAlign: "center" }}
                />
              ))}
            </div>
          </div>

          {/* عداد أو زر إعادة الإرسال */}
          {isResendActive ? (
            <button
              type="button"
              className="resend-code-link"
              onClick={handleResend}
            >
              {t("sign.resendConfirmationCode")}
            </button>
          ) : (
            <p className="timer-text">
              {t("sign.resendAfter")} {timer} {t("sign.seconds")}
            </p>
          )}

          <button type="submit" className="otp-verify-button">
            {t("sign.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpForgetPassword;
