import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FiUser, FiX } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import { useRef } from "react";
import axios from "axios";
import logo from "../assests/imgs/logo.svg";
import { useCart } from "../context/CartContext";
import { useNotifications } from "../context/NotificationContext";
import { useWishlist } from "../context/WishlistContext";
import ChatIcon from "../component/ChatIcon/ChatIcon";

import styles from "./Navbar.module.css";

const Navbar = () => {
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { unreadCount, notifications, markAsRead, formatNotificationTime } =
    useNotifications();

  const [isMobileScrolled, setIsMobileScrolled] = useState(false);
  const [theme] = useState(() => localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

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

  // Handle sidebar close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        overlayRef.current &&
        !overlayRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

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

  // const toggleTheme = () => {
  //   setTheme((prev) => (prev === "light" ? "dark" : "light"));
  // };

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

  const handleNotificationClick = async (notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }

    // Navigate to request details page
    if (notification.service_request_id) {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData && userData.token) {
          navigate(`/request-details/${notification.service_request_id}`);
        } else {
          // If not logged in, show login message
          toast.error(t("notifications.loginRequired"));
        }
      } catch (error) {
        console.error("Error navigating to request details:", error);
      }
    }
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  return (
    <>
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
            className={`${styles.sidebarToggle} navbar-toggler`}
            type="button"
            onClick={toggleSidebar}
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
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center gap-1 bg-transparent border-0"
                  id="navbarDropdown"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {t("navbar.categories")}
                  <FiChevronDown />
                </button>
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
                <Link
                  className={`add ${styles.toggleOfferRequest}`}
                  to="/offer-request-service"
                >
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
                <li className="nav-item dropdown d-xl-none">
                  <button
                    className="nav-link dropdown-toggle bg-transparent border-0 d-flex align-items-center gap-1"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                    aria-label="Notifications"
                    style={{
                      color: `${
                        theme === "dark" ? "var(--basic-color)" : "#000"
                      }`,
                    }}
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
                  <ul
                    className={`dropdown-menu ${styles.notificationsDropdown}`}
                    style={{
                      backgroundColor: `${
                        theme === "dark"
                          ? "var(--dark-color)"
                          : "var(--basic-color)"
                      }`,
                    }}
                    data-bs-popper="static"
                  >
                    <div className={styles.dropdownHeader}>
                      <h6>
                        <i className="bi bi-bell me-2"></i>
                        {t("notifications.notifications")}
                        {unreadCount > 0 && (
                          <span className={styles.unreadBadge}>
                            {unreadCount} {t("notifications.new")}
                          </span>
                        )}
                      </h6>
                    </div>

                    <div className={styles.notificationsList}>
                      {notifications.length > 0 ? (
                        notifications.slice(0, 3).map((notification) => (
                          <div
                            key={notification.id}
                            className={`${styles.notificationItem} ${
                              !notification.read_at ? styles.unread : ""
                            }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            title={
                              notification.service_request_id
                                ? t("notifications.clickToViewDetails")
                                : ""
                            }
                          >
                            <div className={styles.notificationContent}>
                              <div className={styles.notificationHeader}>
                                <div className={styles.notificationService}>
                                  <i className="bi bi-gear-fill me-2"></i>
                                  <strong>
                                    {notification.service_name ||
                                      t("notifications.service")}
                                  </strong>
                                </div>
                                <div className={styles.notificationTime}>
                                  {formatNotificationTime(
                                    notification.created_at
                                  )}
                                </div>
                              </div>

                              <div className={styles.notificationBody}>
                                <div className={styles.notificationStatus}>
                                  <span
                                    className={`${styles.statusBadge} ${
                                      notification.status === "accepted" ||
                                      notification.status === "accept"
                                        ? styles.statusSuccess
                                        : notification.status === "rejected" ||
                                          notification.status === "reject"
                                        ? styles.statusDanger
                                        : notification.status === "completed"
                                        ? styles.statusPrimary
                                        : styles.statusSecondary
                                    }`}
                                  >
                                    {notification.status === "accepted" ||
                                    notification.status === "accept"
                                      ? t("notifications.accepted")
                                      : notification.status === "rejected" ||
                                        notification.status === "reject"
                                      ? t("notifications.rejected")
                                      : notification.status === "completed"
                                      ? t("notifications.completed")
                                      : notification.status || "info"}
                                  </span>
                                </div>

                                {notification.reason && (
                                  <div className={styles.notificationReason}>
                                    <small className="text-muted">
                                      {notification.reason}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>

                            {!notification.read_at && (
                              <div className={styles.unreadIndicator}>
                                <i className="bi bi-circle-fill"></i>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className={styles.emptyNotifications}>
                          <i className="bi bi-bell-slash"></i>
                          <p>{t("notifications.noNotifications")}</p>
                        </div>
                      )}
                    </div>

                    <div className={styles.dropdownFooter}>
                      <Link to="/notifications" className={styles.viewAllBtn}>
                        {t("notifications.viewAll")}
                      </Link>
                    </div>
                  </ul>
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
                    color: `${
                      theme === "dark" ? "var(--basic-color)" : "#000"
                    }`,
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
                          fontSize: `${
                            i18n.language === "ar" ? "12px" : "14px"
                          }`,
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
                    data-bs-auto-close="outside"
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
                  <div
                    className={`dropdown-menu ${styles.notificationsDropdown}`}
                  >
                    <div className={styles.dropdownHeader}>
                      <h6>
                        <i className="bi bi-bell me-2"></i>
                        {t("notifications.notifications")}
                        {unreadCount > 0 && (
                          <span className={styles.unreadBadge}>
                            {unreadCount} {t("notifications.new")}
                          </span>
                        )}
                      </h6>
                    </div>

                    <div className={styles.notificationsList}>
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`${styles.notificationItem} ${
                              !notification.read_at ? styles.unread : ""
                            }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            title={
                              notification.service_request_id
                                ? t("notifications.clickToViewDetails")
                                : ""
                            }
                          >
                            <div className={styles.notificationContent}>
                              <div className={styles.notificationHeader}>
                                <div className={styles.notificationService}>
                                  <i className="bi bi-gear-fill me-2"></i>
                                  <strong>
                                    {notification.service_name ||
                                      t("notifications.service")}
                                  </strong>
                                </div>
                                <div className={styles.notificationTime}>
                                  {formatNotificationTime(
                                    notification.created_at
                                  )}
                                </div>
                              </div>

                              <div className={styles.notificationBody}>
                                <div className={styles.notificationStatus}>
                                  <span
                                    className={`${styles.statusBadge} ${
                                      notification.status === "accepted" ||
                                      notification.status === "accept"
                                        ? styles.statusSuccess
                                        : notification.status === "rejected" ||
                                          notification.status === "reject"
                                        ? styles.statusDanger
                                        : notification.status === "completed"
                                        ? styles.statusPrimary
                                        : styles.statusSecondary
                                    }`}
                                  >
                                    {notification.status === "accepted" ||
                                    notification.status === "accept"
                                      ? t("notifications.accepted")
                                      : notification.status === "rejected" ||
                                        notification.status === "reject"
                                      ? t("notifications.rejected")
                                      : notification.status === "completed"
                                      ? t("notifications.completed")
                                      : notification.status || "info"}
                                  </span>
                                </div>

                                {notification.reason && (
                                  <div className={styles.notificationReason}>
                                    <small className="text-muted">
                                      {notification.reason}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>

                            {!notification.read_at && (
                              <div className={styles.unreadIndicator}>
                                <i className="bi bi-circle-fill"></i>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className={styles.emptyNotifications}>
                          <i className="bi bi-bell-slash"></i>
                          <p>{t("notifications.noNotifications")}</p>
                        </div>
                      )}
                    </div>

                    <div className={styles.dropdownFooter}>
                      <Link to="/notifications" className={styles.viewAllBtn}>
                        {t("notifications.viewAll")}
                      </Link>
                    </div>
                  </div>
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
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          ref={overlayRef}
          className={styles.sidebarOverlay}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <Link className={styles.sidebarLogo} to="/" onClick={closeSidebar}>
            <img src={logo} alt="logo" />
          </Link>
          <button
            className={styles.sidebarClose}
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <FiX />
          </button>
        </div>

        <div className={styles.sidebarContent}>
          <nav className={styles.sidebarNav}>
            <ul className={styles.sidebarMenu}>
              <li className={styles.sidebarMenuItem}>
                <Link
                  to="/"
                  className={styles.sidebarLink}
                  onClick={closeSidebar}
                >
                  <i className="bi bi-house"></i>
                  {t("navbar.home")}
                </Link>
              </li>

              <li className={styles.sidebarMenuItem}>
                <div className={styles.sidebarDropdown}>
                  <button
                    className={styles.sidebarDropdownToggle}
                    onClick={toggleCategories}
                  >
                    <i className="bi bi-grid"></i>
                    {t("navbar.categories")}
                    <FiChevronDown
                      className={`${styles.dropdownArrow} ${
                        isCategoriesOpen ? styles.rotated : ""
                      }`}
                    />
                  </button>
                  <ul
                    className={`${styles.sidebarDropdownMenu} ${
                      isCategoriesOpen ? styles.dropdownOpen : ""
                    }`}
                  >
                    <li>
                      <Link
                        to="/requestcategories"
                        onClick={closeSidebar}
                        className={styles.sidebarDropdownLink}
                      >
                        {t("navbar.newMarket")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/requestcategories"
                        onClick={closeSidebar}
                        className={styles.sidebarDropdownLink}
                      >
                        {t("navbar.usedMarket")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/requestcategories"
                        onClick={closeSidebar}
                        className={styles.sidebarDropdownLink}
                      >
                        {t("navbar.openMarket")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/requestservice"
                        onClick={closeSidebar}
                        className={styles.sidebarDropdownLink}
                      >
                        {t("navbar.servicesMarket")}
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              <li className={styles.sidebarMenuItem}>
                <Link
                  to="/aboutus"
                  className={styles.sidebarLink}
                  onClick={closeSidebar}
                >
                  <i className="bi bi-info-circle"></i>
                  {t("navbar.aboutUs")}
                </Link>
              </li>

              <li className={styles.sidebarMenuItem}>
                <Link
                  to="/contactus"
                  className={styles.sidebarLink}
                  onClick={closeSidebar}
                >
                  <i className="bi bi-envelope"></i>
                  {t("navbar.contactUs")}
                </Link>
              </li>

              <li className={styles.sidebarMenuItem}>
                <Link
                  to="/offer-request-service"
                  className={`${styles.sidebarLink} ${styles.toggleOfferRequest}`}
                  onClick={closeSidebar}
                >
                  <i className="bi bi-handshake"></i>
                  {t("navbar.offerRequest")}
                </Link>
              </li>

              <li className={styles.sidebarMenuItem}>
                <Link
                  to="/cart"
                  className={styles.sidebarLink}
                  onClick={closeSidebar}
                >
                  <div className={styles.sidebarLinkContent}>
                    <div>
                      <i className="bi bi-cart3"></i>
                      {t("navbar.cart")}
                    </div>
                    {cartCount > 0 && (
                      <span className={styles.sidebarCounter}>{cartCount}</span>
                    )}
                  </div>
                </Link>
              </li>

              <li className={styles.sidebarMenuItem}>
                <Link
                  to="/wishlist"
                  className={styles.sidebarLink}
                  onClick={closeSidebar}
                >
                  <div className={styles.sidebarLinkContent}>
                    <div>
                      <i className="bi bi-heart"></i>
                      {t("navbar.wishlist")}
                    </div>
                    {wishlistItems.length > 0 && (
                      <span className={styles.sidebarCounter}>
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                </Link>
              </li>

              {isAuthenticated && (
                <li className={styles.sidebarMenuItem}>
                  <Link
                    to="/notifications"
                    className={styles.sidebarLink}
                    onClick={closeSidebar}
                  >
                    <div className={styles.sidebarLinkContent}>
                      <div>
                        <i className="bi bi-bell"></i>
                        {t("notifications.notifications")}
                      </div>
                      {unreadCount > 0 && (
                        <span className={styles.sidebarCounter}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              )}

              {isAuthenticated && (
                <li className={styles.sidebarMenuItem}>
                  <Link
                    to="/chats"
                    className={styles.sidebarLink}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-chat-dots"></i>
                    {t("chat.chats")}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.sidebarUserSection}>
              {isAuthenticated ? (
                <>
                  <Link
                    to={getProfileRoute()}
                    className={styles.sidebarUserLink}
                    onClick={closeSidebar}
                  >
                    <i className="bi bi-person"></i>
                    {t("topnav.profile")}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeSidebar();
                    }}
                    className={styles.sidebarLogoutBtn}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    {t("topnav.logout")}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className={styles.sidebarUserLink}
                  onClick={closeSidebar}
                >
                  <i className="bi bi-box-arrow-in-right"></i>
                  {t("sign.login")}
                </Link>
              )}
            </div>

            <div className={styles.sidebarLanguageSection}>
              <button
                onClick={() => changeLanguage("en")}
                className={`${styles.sidebarLanguageBtn} ${
                  i18n.language === "en" ? styles.active : ""
                }`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage("ar")}
                className={`${styles.sidebarLanguageBtn} ${
                  i18n.language === "ar" ? styles.active : ""
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
