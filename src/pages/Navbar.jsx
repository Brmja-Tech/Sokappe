import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FiUser, FiSearch } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import { useRef } from "react";
import axios from "axios";
import logo from "../assests/imgs/logo.svg";
import { useCart } from "../context/CartContext";
import { useNotifications } from "../context/NotificationContext";
import ChatIcon from "../component/ChatIcon/ChatIcon";

import styles from "./Navbar.module.css";

const Navbar = () => {
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const { cartCount, wishlistItems } = useCart();
  const { unreadCount, notifications, markAsRead, formatNotificationTime } =
    useNotifications();

  const [isMobileScrolled, setIsMobileScrolled] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check auth status when language changes
  useEffect(() => {
    checkAuthStatus();
  }, [i18n.language]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const storedUserData = localStorage.getItem("userData");

    if (token && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setUserData(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing userData:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setIsAuthenticated(false);
        setUserData(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserData(null);
    }
  };

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

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );
        toast.success(t("topnav.logoutSuccess"));
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    // Clear local storage and state regardless of API response
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setIsAuthenticated(false);
    setUserData(null);
    window.location.href = "/";
  };

  const getProfileRoute = () => {
    if (!userData) return "/login";

    switch (userData.type) {
      case "individual":
        return "/individualprofile";
      case "company":
        return "/companyprofile";
      case "individual_vendor":
        return "/vendorprofile";
      default:
        return "/login";
    }
  };

  return (
    <div
      className={`navbar navbar-expand-xl ${
        isMobileScrolled ? "fixed-top" : ""
      }`}
    >
      <div className="container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand main-color fw-bold" to="/">
          <img src={logo} style={{ width: "75px" }} alt="logo" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ borderColor: theme === "dark" ? "#777" : "#ddd" }}
        >
          <span>
            <i
              className="bi bi-list"
              style={{
                color: theme === "dark" ? "var(--basic-color)" : "#000",
              }}
            ></i>
          </span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav align-items-center list-unstyled mx-auto mb-0 d-flex gap-1 p-0">
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
                className="dropdown-menu custom-dropdown"
                style={{
                  backgroundColor: `${
                    theme === "dark"
                      ? "var(--dark-color)"
                      : "var(--basic-color)"
                  }`,
                }}
                aria-labelledby="navbarDropdown"
                data-bs-popper="static"
              >
                <Link
                  className="dropdown-item"
                  to="/requestcategories"
                  style={{
                    fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                  }}
                >
                  {t("navbar.newMarket")}
                </Link>
                <Link
                  className="dropdown-item"
                  to="/requestcategories"
                  style={{
                    fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                  }}
                >
                  {t("navbar.usedMarket")}
                </Link>
                <Link
                  className="dropdown-item"
                  to="/requestcategories"
                  style={{
                    fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                  }}
                >
                  {t("navbar.openMarket")}
                </Link>
                <Link
                  className="dropdown-item"
                  to="/requestservice"
                  style={{
                    fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                  }}
                >
                  {t("navbar.servicesMarket")}
                </Link>
              </div>
            </li>
            <li className="nav-item">
              <Link to="/aboutus" className="nav-link">
                {t("navbar.aboutUs")}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contactus" className="nav-link">
                {t("navbar.contactUs")}
              </Link>
            </li>

            {/* Collapsible Action Items */}
            <li className="d-xl-none">
              <Link className="add" to="/offer-request-service">
                <i className="bi bi-handshake"></i> {t("navbar.offerRequest")}
              </Link>
            </li>

            {/* Collapsible Cart */}
            <li className="d-xl-none">
              <Link className="add" to="/cart">
                <div className={styles.mobileCounter}>
                  <i className="bi bi-cart3"></i> {t("navbar.cart")}
                  {cartCount > 0 && (
                    <span
                      className={`${styles.cartWishlistCounter} ${styles.cartCounter}`}
                    >
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            </li>

            {/* Collapsible Wishlist */}
            <li className="d-xl-none">
              <Link className="add" to="/wishlist">
                <div className={styles.mobileCounter}>
                  <i className="bi bi-heart"></i> {t("navbar.wishlist")}
                  {wishlistItems.length > 0 && (
                    <span
                      className={`${styles.cartWishlistCounter} ${styles.wishlistCounter}`}
                    >
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
              </Link>
            </li>

            {/* Collapsible Notifications */}
            {isAuthenticated && (
              <li className="d-xl-none">
                <Link className="add" to="/notifications">
                  <div className={styles.mobileCounter}>
                    <i className="bi bi-bell"></i>{" "}
                    {t("notifications.notifications")}
                    {unreadCount > 0 && (
                      <span
                        className={`${styles.cartWishlistCounter} ${styles.notificationCounter}`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )}

            {/* Collapsible Profile Dropdown */}
            <li className="nav-item dropdown d-xl-none">
              <button
                className="nav-link dropdown-toggle bg-transparent border-0 d-flex align-items-center gap-1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Profile"
                style={{
                  color: `${theme === "dark" ? "var(--basic-color)" : "#000"}`,
                }}
              >
                <FiUser />
              </button>
              <ul
                className="dropdown-menu custom-dropdown"
                style={{
                  backgroundColor: `${
                    theme === "dark"
                      ? "var(--dark-color)"
                      : "var(--basic-color)"
                  }`,
                }}
                data-bs-popper="static"
              >
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link
                        to={getProfileRoute()}
                        className="dropdown-item"
                        style={{
                          fontSize: `${
                            i18n.language === "ar" ? "12px" : "14px"
                          }`,
                        }}
                      >
                        {t("topnav.profile")}
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item"
                        style={{
                          fontSize: `${
                            i18n.language === "ar" ? "12px" : "14px"
                          }`,
                        }}
                      >
                        {t("topnav.logout")}
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link
                      to="/login"
                      className="dropdown-item"
                      style={{
                        fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                      }}
                    >
                      {t("sign.login")}
                    </Link>
                  </li>
                )}
              </ul>
            </li>

            {/* Collapsible Language Switcher */}
            <li className="nav-item dropdown d-xl-none">
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
                className="dropdown-menu custom-dropdown"
                style={{
                  backgroundColor: `${
                    theme === "dark"
                      ? "var(--dark-color)"
                      : "var(--basic-color)"
                  }`,
                }}
                data-bs-popper="static"
              >
                <li>
                  <button
                    onClick={() => changeLanguage("en")}
                    className="dropdown-item"
                    style={{
                      fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                    }}
                  >
                    {i18n.language === "en" ? "English" : "الإنجليزية"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => changeLanguage("ar")}
                    className="dropdown-item"
                    style={{
                      fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                    }}
                  >
                    {i18n.language === "ar" ? "العربية" : "Arabic"}
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Desktop Only - Action Items */}
        <ul className="actions list-unstyled p-0 d-none d-xl-flex align-items-center gap-3 m-0">
          <li>
            <Link className="add" to="/offer-request-service">
              <i className="bi bi-handshake"></i> {t("navbar.offerRequest")}
            </Link>
          </li>
          <li>|</li>

          {/* Cart Icon */}
          <li>
            <Link
              to="/cart"
              className={styles.cartWishlistIcon}
              title={t("navbar.cart")}
            >
              <i className="bi bi-cart3"></i>
              {cartCount > 0 && (
                <span
                  className={`${styles.cartWishlistCounter} ${styles.cartCounter}`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </li>

          {/* Wishlist Icon */}
          <li>
            <Link
              to="/wishlist"
              className={styles.cartWishlistIcon}
              title={t("navbar.wishlist")}
            >
              <i className="bi bi-heart"></i>
              {wishlistItems.length > 0 && (
                <span
                  className={`${styles.cartWishlistCounter} ${styles.wishlistCounter}`}
                >
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          </li>

          {/* Notifications Icon */}
          {isAuthenticated && (
            <>
              <li>|</li>
              <li className="nav-item dropdown">
                <button
                  className={`${styles.cartWishlistIcon} dropdown-toggle border-0 bg-transparent`}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  title={t("notifications.notifications")}
                >
                  <i className="bi bi-bell"></i>
                  {unreadCount > 0 && (
                    <span
                      className={`${styles.cartWishlistCounter} ${styles.notificationCounter}`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              </li>
            </>
          )}

          {/* Chat Icon */}
          {isAuthenticated && (
            <>
              <li>|</li>
              <li>
                <ChatIcon />
              </li>
            </>
          )}

          {/* Desktop Only - Profile Dropdown */}
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle bg-transparent border-0 d-flex align-items-center gap-1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Profile"
              style={{
                color: `${theme === "dark" ? "var(--basic-color)" : "#000"}`,
              }}
            >
              <FiUser />
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end custom-dropdown"
              style={{
                backgroundColor: `${
                  theme === "dark" ? "var(--dark-color)" : "var(--basic-color)"
                }`,
              }}
              data-bs-popper="static"
            >
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to={getProfileRoute()}
                      className="dropdown-item"
                      style={{
                        fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                      }}
                    >
                      {t("topnav.profile")}
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item"
                      style={{
                        fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                      }}
                    >
                      {t("topnav.logout")}
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="dropdown-item"
                    style={{
                      fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                    }}
                  >
                    {t("sign.login")}
                  </Link>
                </li>
              )}
            </ul>
          </li>

          {/* Desktop Only - Language Switcher */}
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
              className="dropdown-menu dropdown-menu-end custom-dropdown"
              style={{
                backgroundColor: `${
                  theme === "dark" ? "var(--dark-color)" : "var(--basic-color)"
                }`,
              }}
              data-bs-popper="static"
            >
              <li>
                <button
                  onClick={() => changeLanguage("en")}
                  className="dropdown-item"
                  style={{
                    fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                  }}
                >
                  {i18n.language === "en" ? "English" : "الإنجليزية"}
                </button>
              </li>
              <li>
                <button
                  onClick={() => changeLanguage("ar")}
                  className="dropdown-item"
                  style={{
                    fontSize: `${i18n.language === "ar" ? "12px" : "14px"}`,
                  }}
                >
                  {i18n.language === "ar" ? "العربية" : "Arabic"}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
