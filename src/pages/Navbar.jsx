import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FiUser, FiSearch } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import { useRef } from "react";
const Navbar = () => {
  const { t, i18n } = useTranslation("global");
  const [isMobileScrolled, setIsMobileScrolled] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY >= 100;
      setIsMobileScrolled(scrolled);
    };

    handleScroll(); // initial check

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div
      className={`navbar navbar-expand-lg ${
        isMobileScrolled ? "fixed-top" : ""
      }`}
    >
      <div className="container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand main-color fw-bold" to="/">
          Sokappe
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{borderColor: theme === "dark" ? "#777" : "#ddd"}}
        >
          <span>
            <i
              className="bi bi-list"
              style={{
                color: theme === "dark" ? "var(--basic-color)" : "#000"
              }}
            ></i>
          </span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav align-items-center list-unstyled mx-auto mb-0 d-flex gap-3 p-0">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                {t("navbar.home")}
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center gap-1"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {t("navbar.categories")}
                <FiChevronDown />
              </a>
              <div
                className="dropdown-menu"
                style={{
                  backgroundColor: `${
                    theme === "dark" ? "var(--dark-color)" : "var(--basic-color)"
                  }`,
                }}
                aria-labelledby="navbarDropdown"
              >
                
                <Link className="dropdown-item" style={{ fontSize: `${i18n.language === "ar" ? "12px":"14px"}` }}>
                  {t("navbar.professionalMarket")}
                </Link>
                <Link className="dropdown-item" style={{ fontSize: `${i18n.language === "ar" ? "12px":"14px"}` }}>
                  {t("navbar.usedMarket")}
                </Link>
                <Link className="dropdown-item" style={{ fontSize: `${i18n.language === "ar" ? "12px":"14px"}` }}>
                  {t("navbar.servicesMarket")}
                </Link>
              </div>
            </li>
            <li className="nav-item">
              <Link to="/" className="nav-link">
                {t("navbar.services")}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/" className="nav-link">
                {t("navbar.aboutUs")}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/" className="nav-link">
                {t("navbar.contactUs")}
              </Link>
            </li>
            
          </ul>
        </div>

        <ul className="actions list-unstyled p-0 d-flex align-items-center gap-3 m-0">
          <li>
            <Link className="add" to="/publish_ad">
              <i className="bi bi-plus"></i> {t("navbar.add")}
            </Link>
          </li>
          <li>|</li>
          <li>
            <FiSearch />
          </li>
          <li>
            <Link
              to="/login"
              style={{
                color: `${theme === "dark" ? "var(--basic-color)" : "#000"}`,
              }}
            >
              <FiUser />
            </Link>
          </li>

          {/* Language Switcher */}
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle bg-transparent border-0 d-flex align-items-center gap-1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Language"
            >
              {i18n.language === "ar" ? "العربية" : "English"}
              <FiChevronDown />
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              style={{
                backgroundColor: `${
                  theme === "dark" ? "var(--dark-color)" : "var(--basic-color)"
                }`,
              }}
            >
              <li>
                <button
                  onClick={() => changeLanguage("en")}
                  className="dropdown-item"
                  style={{ fontSize: `${i18n.language === "ar" ? "12px":"14px"}` }}
                >
                  {i18n.language === "en" ? "English" : "الإنجليزية"}
                </button>
              </li>
              <li>
                <button
                  onClick={() => changeLanguage("ar")}
                  className="dropdown-item"
                  style={{ fontSize: `${i18n.language === "ar" ? "12px":"14px"}` }}
                >
                  {i18n.language === "ar" ? "العربية" : "Arabic"}
                </button>
              </li>
            </ul>
          </li>

          {/* Custom Theme Switch */}
          <li>
            <div className="switch">
              <input
                type="checkbox"
                className="switch__input"
                id="Switch"
                onChange={toggleTheme}
                checked={theme === "dark"}
              />
              <label className="switch__label" htmlFor="Switch">
                <span className="switch__indicator"></span>
                <span className="switch__decoration"></span>
              </label>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
