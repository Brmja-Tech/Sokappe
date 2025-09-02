import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Hero.css";
import { FiSearch } from "react-icons/fi";
const Hero = () => {
  const { t } = useTranslation("global");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("shop");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      let searchParams = new URLSearchParams();
      searchParams.set("name", searchQuery.trim());
      searchParams.set("page", "1");

      if (activeTab === "services") {
        searchParams.set("type", "service");
        navigate(`/search?${searchParams.toString()}`);
      } else if (activeTab === "used") {
        searchParams.set("type", "product");
        searchParams.set("condition", "used");
        navigate(`/search?${searchParams.toString()}`);
      } else {
        // shop tab
        searchParams.set("type", "product");
        searchParams.set("condition", "new");
        navigate(`/search?${searchParams.toString()}`);
      }
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

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
                className={`nav-link ${activeTab === "shop" ? "active" : ""}`}
                id="shop-tab"
                type="button"
                role="tab"
                aria-controls="shop"
                aria-selected={activeTab === "shop"}
                onClick={() => handleTabChange("shop")}
              >
                {t("hero.shop")}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === "used" ? "active" : ""}`}
                id="used-tab"
                type="button"
                role="tab"
                aria-controls="used"
                aria-selected={activeTab === "used"}
                onClick={() => handleTabChange("used")}
              >
                {t("hero.used")}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeTab === "services" ? "active" : ""
                }`}
                id="services-tab"
                type="button"
                role="tab"
                aria-controls="services"
                aria-selected={activeTab === "services"}
                onClick={() => handleTabChange("services")}
              >
                {t("hero.services")}
              </button>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            <div
              className={`tab-pane fade p-3 ${
                activeTab === "shop" ? "show active" : ""
              }`}
              id="shop"
              role="tabpanel"
              aria-labelledby="shop-tab"
            >
              <form onSubmit={handleSearch}>
                <FiSearch />
                <input
                  type="text"
                  placeholder={t("hero.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">{t("hero.searchButton")}</button>
              </form>
            </div>
            <div
              className={`tab-pane fade p-3 ${
                activeTab === "used" ? "show active" : ""
              }`}
              id="used"
              role="tabpanel"
              aria-labelledby="used-tab"
            >
              <form onSubmit={handleSearch}>
                <FiSearch />
                <input
                  type="text"
                  placeholder={t("hero.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">{t("hero.searchButton")}</button>
              </form>
            </div>
            <div
              className={`tab-pane fade p-3 ${
                activeTab === "services" ? "show active" : ""
              }`}
              id="services"
              role="tabpanel"
              aria-labelledby="services-tab"
            >
              <form onSubmit={handleSearch}>
                <FiSearch />
                <input
                  type="text"
                  placeholder={t("hero.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">{t("hero.searchButton")}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
