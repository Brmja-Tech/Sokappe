import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BiArrowBack, BiHome, BiError } from "react-icons/bi";
import styles from "./NotFound.module.css";

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("global");

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Error Icon */}
        <div className={styles.iconContainer}>
          <BiError className={styles.errorIcon} />
        </div>

        {/* Error Code */}
        <h1 className={styles.errorCode}>404</h1>

        {/* Error Message */}
        <h2 className={styles.errorTitle}>
          {t("notFound.title") || "الصفحة غير موجودة"}
        </h2>

        <p className={styles.errorMessage}>
          {t("notFound.message") ||
            "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها."}
        </p>

        {/* Action Buttons */}
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.button} ${styles.backButton}`}
            onClick={handleGoBack}
          >
            <BiArrowBack className={styles.buttonIcon} />
            {t("notFound.goBack") || "العودة للخلف"}
          </button>

          <button
            className={`${styles.button} ${styles.homeButton}`}
            onClick={handleGoHome}
          >
            <BiHome className={styles.buttonIcon} />
            {t("notFound.goHome") || "الذهاب للرئيسية"}
          </button>
        </div>

        {/* Decorative Elements */}
        <div className={styles.decorativeElements}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
          <div className={styles.circle3}></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
