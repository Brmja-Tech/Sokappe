import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./OtpVerifyEmail.css";
import logo from "../../assests/imgs/logo.svg";

const OtpVerifyEmail = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);

  // ⏳ Timer countdown
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

      // Auto-focus to next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace - go to previous input
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

      // Focus on the next empty input or the last one
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
      navigate("/register");
    } catch (err) {
      toast.error(err.response?.data?.message || t("sign.errorOccurred"));
    }
  };

  // 📩 Resend code
  const handleResend = async () => {
    const email = localStorage.getItem("registerEmail");

    if (!email) {
      toast.error(t("sign.emailMissing"));
      return navigate("/createaccount");
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/register/start`,
        { email }
      );

      toast.success(res.data.message || t("sign.emailSent"));
      setTimer(60); // Reset timer
    } catch (err) {
      toast.error(err.response?.data?.message || t("sign.errorOccurred"));
    }
  };

  return (
    <div className={`otp-verification ${isRTL ? "rtl" : "ltr"}`}>
      <div className="otp-verification__card">
        <img className="otp-verification__logo" src={logo} alt="Logo" />
        <h2 className="otp-verification__title">{t("sign.emailConfirmation")}</h2>

        <p className="otp-verification__subtitle">
          {t("sign.checkEmailAndEnterCode")}
        </p>

        <form className="otp-verification__form" onSubmit={handleSubmit}>
          <div className="otp-verification__form-group">
            <label className="otp-verification__label">
              {t("sign.confirmationCode")}
            </label>
            <div className="otp-verification__inputs">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="otp-verification__input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={value}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  autoComplete="one-time-code"
                  dir={isRTL ? "rtl" : "ltr"}
                />
              ))}
            </div>
          </div>

          {/* Timer or resend button */}
          {isResendActive ? (
            <button
              type="button"
              className="otp-verification__resend"
              onClick={handleResend}
            >
              {t("sign.resendConfirmationCode")}
            </button>
          ) : (
            <p className="otp-verification__timer">
              {t("sign.resendAfter")} {timer} {t("sign.seconds")}
            </p>
          )}

          <button type="submit" className="otp-verification__submit">
            {t("sign.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerifyEmail;