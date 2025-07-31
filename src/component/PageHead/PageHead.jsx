import React from "react";
import "../PageHead/PageHead.css";
import { useTranslation } from "react-i18next";

export default function PageHead({ header }) {
  const { t, i18n } = useTranslation("global");
  return (
    <div className="breadcrumb">
      <div className="container">
        <h4 className="mt-2">
            {t("navbar.home")} / <span style={{ color: "#0A6E58" }}>{header}</span>
        </h4>
      </div>
    </div>
  );
}
