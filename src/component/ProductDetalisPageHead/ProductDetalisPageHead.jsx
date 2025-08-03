import React from "react";
import "../ProductDetalisPageHead/ProductDetalisPageHead.css";
import { useTranslation } from "react-i18next";

export default function ProductDetalisPageHead({ services, flitercategory , Products }) {
  const { t, i18n } = useTranslation("global");
  return (
    <div className="breadcrumb">
      <div className="container">
        <h4 className="mt-2">
            {t("navbar.home")} / <span style={{ color: "#000" }}>{services}</span> / <span style={{ color: "#000" }}>{flitercategory}</span> / <span style={{ color: "#0A6E58" }}>{Products}</span>
        </h4>
      </div>
    </div>
  );
}
