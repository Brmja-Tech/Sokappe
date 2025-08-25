import React from "react";
import "./PageHeadProfile.css";
import { useTranslation } from "react-i18next";

export default function PageHeadProfile({ name, rate, img }) {
  const { t, i18n } = useTranslation("global");
  return (
    <div className="profile-breadcrumb">
      <div className="profile-container">
        <div className="profile-head-flex">
          <img src={img} alt={name} className="profile-head-avatar" />
          <div>
            <h4 className="profile-head-name">{name}</h4>
            {rate !== undefined && (
              <div className="profile-head-rate">
                <span className="star">★</span>
                <span>{rate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
