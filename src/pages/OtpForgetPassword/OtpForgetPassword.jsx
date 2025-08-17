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
    <div className="auth-code-verification" dir={isRTL ? "rtl" : "ltr"}>
      <div className="auth-code-card">
        <img className="auth-code-logo" src={logo} alt="Logo" />
        <h2 className="auth-code-heading">{t("sign.emailConfirmation")}</h2>

        <p className="auth-code-instruction">
          {t("sign.checkEmailAndEnterCode")}
        </p>

        <form className="auth-code-form" onSubmit={handleSubmit}>
          <div className="auth-code-field">
            <label className="auth-code-label">{t("sign.confirmationCode")}</label>
            <div className="auth-code-inputs">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="auth-code-digit"
                  type="text"
                  maxLength="1"
                  value={value}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  autoComplete="off"
                  dir={isRTL ? "rtl" : "ltr"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              ))}
            </div>
          </div>

          {isResendActive ? (
            <button
              type="button"
              className="auth-code-resend"
              onClick={handleResend}
            >
              {t("sign.resendConfirmationCode")}
            </button>
          ) : (
            <p className="auth-code-timer">
              {t("sign.resendAfter")} {timer} {t("sign.seconds")}
            </p>
          )}

          <button type="submit" className="auth-code-submit">
            {t("sign.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpForgetPassword;