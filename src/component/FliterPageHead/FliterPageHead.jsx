import React from "react";
import "../FliterPageHead/FliterPageHead.css";
import { useTranslation } from "react-i18next";

export default function FliterPageHead({ services, flitercategory }) {
  const { t, i18n } = useTranslation("global");
  return (
    <div className="breadcrumb">
      <div className="container">
        <h4 className="mt-2">
            {t("navbar.home")} / <span style={{ color: "#000" }}>{services}</span> / <span style={{ color: "#0A6E58" }}>{flitercategory}</span>
        </h4>
      </div>
    </div>
  );
}
