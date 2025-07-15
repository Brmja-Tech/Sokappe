import React from "react";
import { useTranslation } from "react-i18next";
import "./Hero.css";
import { FiSearch } from "react-icons/fi";
const Hero = () => {
  const { t, i18n } = useTranslation("global");

  return (
    <div className="hero">
      <video
        className="w-100"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{ objectFit: "cover" }}
      >
        <source src="/hero-vid.mp4" type="video/mp4" />
      </video>
      <div className="text">
        <h3 className="line-height">{t("hero.headline")}</h3>
        <small className="line-height">{t("hero.subheadline")}</small>
        <div className="forms">
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active"
                id="shop-tab"
                data-bs-toggle="tab"
                data-bs-target="#shop"
                type="button"
                role="tab"
                aria-controls="shop"
                aria-selected="true"
              >
                {t("hero.shop")}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="used-tab"
                data-bs-toggle="tab"
                data-bs-target="#used"
                type="button"
                role="tab"
                aria-controls="used"
                aria-selected="false"
              >
                {t("hero.used")}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="services-tab"
                data-bs-toggle="tab"
                data-bs-target="#services"
                type="button"
                role="tab"
                aria-controls="services"
                aria-selected="false"
              >
                {t("hero.services")}
              </button>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            <div
              className="tab-pane fade show active p-3"
              id="shop"
              role="tabpanel"
              aria-labelledby="shop-tab"
            >
              <form>
                <FiSearch />
                <input type="text" placeholder={t("hero.searchPlaceholder")} />
                <button>{t("hero.searchButton")}</button>
              </form>
            </div>
            <div
              className="tab-pane fade p-3"
              id="used"
              role="tabpanel"
              aria-labelledby="used-tab"
            >
              <form>
                <FiSearch />
                <input type="text" placeholder={t("hero.searchPlaceholder")} />
                <button>{t("hero.searchButton")}</button>
              </form>
            </div>
            <div
              className="tab-pane fade p-3"
              id="services"
              role="tabpanel"
              aria-labelledby="services-tab"
            >
              <form>
                <FiSearch />
                <input type="text" placeholder={t("hero.searchPlaceholder")} />
                <button>{t("hero.searchButton")}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
