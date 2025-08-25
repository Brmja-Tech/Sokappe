import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaShoppingCart,
  FaMapMarkerAlt,
  FaCreditCard,
  FaBox,
  FaCalendarAlt,
} from "react-icons/fa";
import "./IndividualProfile.css";

export default function IndividualProfile() {
  const { t, i18n } = useTranslation("global");
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const isRTL = i18n.language === "ar";

  // Profile form state
  const [profileData, setProfileData] = useState({
    username: {
      ar: "",
      en: "",
    },
    email: "",
    phone: "",
    age: "",
    national_id: "",
    address: {
      ar: "",
      en: "",
    },
    country: "",
    governorate: "",
    centerGov: "",
    country_id: "",
    governorate_id: "",
    center_gov_id: "",
  });

  // Notifications form state
  const [notificationsData, setNotificationsData] = useState({
    email: "",
  });

  // Service Requests state
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsCurrentPage, setRequestsCurrentPage] = useState(1);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // API Data States for location
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [centerGovernorates, setCenterGovernorates] = useState([]);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
    fetchCountries();
  }, []);

  // Watch for language changes and refresh data
  useEffect(() => {
    if (
      profileData.username &&
      (profileData.username.ar || profileData.username.en)
    ) {
      console.log("Language changed to:", i18n.language);
      console.log("Refreshing profile data for new language...");

      // Only refresh if we already have data
      fetchProfileData();
      fetchCountries();

      // Also refresh location data if we have the IDs
      if (profileData.country_id) {
        fetchGovernorates(profileData.country_id);
      }
      if (profileData.governorate_id) {
        fetchCenterGovernorates(profileData.governorate_id);
      }
    }
  }, [i18n.language]);

  // Fetch requests when tab changes
  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    }
  }, [activeTab]);

  // Fetch orders when tab changes
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  // Refetch requests when page changes
  useEffect(() => {
    if (activeTab === "requests" && requestsCurrentPage > 1) {
      fetchRequests();
    }
  }, [requestsCurrentPage]);

  // Fetch governorates when country_id changes
  useEffect(() => {
    if (profileData.country_id) {
      fetchGovernorates(profileData.country_id);
    }
  }, [profileData.country_id]);

  // Fetch center governorates when governorate_id changes
  useEffect(() => {
    if (profileData.governorate_id) {
      fetchCenterGovernorates(profileData.governorate_id);
    }
  }, [profileData.governorate_id]);

  // Remove the complex ID finding useEffects since we get IDs directly from API

  const fetchProfileData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        toast.error(t("settings.authenticationRequired"));
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data.status === 200) {
        const data = response.data.data;

        // Set profile data with location IDs from API response
        setProfileData({
          username: {
            ar: data.username?.ar || "",
            en: data.username?.en || "",
          },
          email: data.email || "",
          phone: data.phone || "",
          age: data.age || "",
          national_id: data.national_id || "",
          address: {
            ar: data.address?.ar || "",
            en: data.address?.en || "",
          },
          country: data.country || "",
          governorate: data.governorate || "",
          centerGov: data.centerGov || "",
          country_id: data.country_id || "",
          governorate_id: data.governorate_id || "",
          center_gov_id: data.centerGov_id || "", // Note: API uses centerGov_id
        });

        // Set notifications email
        setNotificationsData({
          email: data.email || "",
        });

        // Only clear location arrays if this is not a language change refresh
        // This prevents losing location data when switching languages
        if (
          !profileData.username ||
          (!profileData.username.ar && !profileData.username.en)
        ) {
          setGovernorates([]);
          setCenterGovernorates([]);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(t("settings.failedToLoadProfileData"));
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/countries`
      );
      setCountries(response.data.data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchGovernorates = async (countryId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/governorates?country_id=${countryId}`
      );
      setGovernorates(response.data.data);
      // Only reset governorate and centerGov when user changes country (not during initial load)
      if (profileData.country_id && profileData.country_id !== countryId) {
        setProfileData((prev) => ({
          ...prev,
          governorate: "",
          governorate_id: "",
          centerGov: "",
          center_gov_id: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching governorates:", error);
    }
  };

  const fetchCenterGovernorates = async (governorateId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/centergovernorates?governorate_id=${governorateId}`
      );
      setCenterGovernorates(response.data.data);
      // Only reset centerGov when user changes governorate (not during initial load)
      if (
        profileData.governorate_id &&
        profileData.governorate_id !== governorateId
      ) {
        setProfileData((prev) => ({
          ...prev,
          centerGov: "",
          center_gov_id: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching center governorates:", error);
    }
  };

  // Fetch service requests
  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        toast.error(t("settings.authenticationRequired"));
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/request/services/my-requests?page=${requestsCurrentPage}`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data.status === 200) {
        setRequests(response.data.data.data || []);
        setRequestsTotalPages(response.data.data.pagination?.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error(t("settings.failedToLoadRequests"));
    } finally {
      setRequestsLoading(false);
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        toast.error(t("settings.authenticationRequired"));
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user/orders`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data.status === 200) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(t("settings.failedToLoadOrders"));
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationsInputChange = (field, value) => {
    setNotificationsData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle requests page change
  const handleRequestsPageChange = (newPage) => {
    setRequestsCurrentPage(newPage);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        toast.error("Authentication required");
        return;
      }

      const formDataToSend = new FormData();
      const currentLang = i18n.language; // 'en' or 'ar'

      // Send data with language-specific keys for username and address
      formDataToSend.append(`username[ar]`, profileData.username.ar);
      formDataToSend.append(`username[en]`, profileData.username.en);
      formDataToSend.append(`email`, profileData.email);
      formDataToSend.append(`phone`, profileData.phone);
      formDataToSend.append(`age`, profileData.age);
      formDataToSend.append(`national_id`, profileData.national_id);
      formDataToSend.append(`address[ar]`, profileData.address.ar);
      formDataToSend.append(`address[en]`, profileData.address.en);
      formDataToSend.append(`country`, profileData.country);
      formDataToSend.append(`governorate`, profileData.governorate);
      formDataToSend.append(`centerGov`, profileData.centerGov);
      formDataToSend.append(`country_id`, profileData.country_id);
      formDataToSend.append(`governorate_id`, profileData.governorate_id);
      formDataToSend.append(`center_gov_id`, profileData.center_gov_id);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/profile`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data.status === 200) {
        toast.success(t("settings.profileUpdatedSuccessfully"));

        // Since backend is not updating location data properly,
        // we'll update the local state with the new data we sent
        const updatedProfileData = {
          ...profileData,
          // Keep the updated values we just sent
          username: {
            ar: profileData.username.ar,
            en: profileData.username.en,
          },
          email: profileData.email,
          phone: profileData.phone,
          age: profileData.age,
          national_id: profileData.national_id,
          address: {
            ar: profileData.address.ar,
            en: profileData.address.en,
          },
          country: profileData.country,
          governorate: profileData.governorate,
          centerGov: profileData.centerGov,
          country_id: profileData.country_id,
          governorate_id: profileData.governorate_id,
          center_gov_id: profileData.center_gov_id,
        };

        // Update local state with the new data immediately
        setProfileData(updatedProfileData);

        // Refresh location data to ensure dropdowns are populated
        await fetchCountries();

        // If we have country_id, fetch governorates
        if (profileData.country_id) {
          await fetchGovernorates(profileData.country_id);
        }

        // If we have governorate_id, fetch center governorates
        if (profileData.governorate_id) {
          await fetchCenterGovernorates(profileData.governorate_id);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || t("settings.failedToUpdateProfile")
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status text in Arabic
  const getStatusText = (status) => {
    const statusMap = {
      pending: "قيد الانتظار",
      completed: "مكتمل",
      cancelled: "ملغي",
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      delivered: "تم التوصيل",
    };
    return statusMap[status] || status;
  };

  // Helper function to get payment method text in Arabic
  const getPaymentMethodText = (method) => {
    const methodMap = {
      cash_on_delivery: "الدفع عند الاستلام",
      cash: "نقداً",
      card: "بطاقة ائتمان",
      bank_transfer: "تحويل بنكي",
    };
    return methodMap[method] || method;
  };

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h4 className="mt-2">
            {t("navbar.home")} /{" "}
            <span style={{ color: "#0A6E58" }}>{t("navbar.Profile")}</span>
          </h4>
        </div>
      </div>

      <div className="container profile-settings-container">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3">
            <div className="profile-settings-sidebar">
              <div className="profile-settings-title">
                {t("settings.title")}
              </div>
              <div
                className="profile-settings-tabs"
                style={{ textAlign: isRTL ? "right" : "left" }}
              >
                <button
                  className={`profile-settings-tab-btn${
                    activeTab === "profile" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {t("settings.profileTab")}
                </button>
                <button
                  className={`profile-settings-tab-btn${
                    activeTab === "notifications" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("notifications")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {t("settings.notificationsTab")}
                </button>
                <button
                  className={`profile-settings-tab-btn${
                    activeTab === "requests" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("requests")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {t("settings.myRequestsTab")}
                </button>
                <button
                  className={`profile-settings-tab-btn${
                    activeTab === "orders" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("orders")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  <FaShoppingCart className="tab-icon" />
                  {t("orders.title")}
                </button>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="col-md-9">
            <div className="profile-settings-content">
              {activeTab === "profile" && (
                <div className="profile-settings-profile-tab">
                  {profileLoading ? (
                    <div className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="profile-settings-avatar-wrapper">
                        <img
                          src="/avatar.webp"
                          alt="avatar"
                          className="profile-settings-avatar"
                        />
                      </div>
                      <form
                        className="profile-settings-form"
                        onSubmit={handleProfileSubmit}
                      >
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.name")} - {t("settings.arabic")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              placeholder={t("settings.namePlaceholder")}
                              value={profileData.username.ar}
                              onChange={(e) =>
                                handleProfileInputChange("username", {
                                  ...profileData.username,
                                  ar: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.name")} - {t("settings.english")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              placeholder={t("settings.namePlaceholder")}
                              value={profileData.username.en}
                              onChange={(e) =>
                                handleProfileInputChange("username", {
                                  ...profileData.username,
                                  en: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.age")}
                            </label>
                            <input
                              type="number"
                              className="form-control profile-settings-input"
                              placeholder={t("settings.agePlaceholder")}
                              value={profileData.age}
                              onChange={(e) =>
                                handleProfileInputChange("age", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.email")}
                            </label>
                            <input
                              type="email"
                              className="form-control profile-settings-input"
                              placeholder={t("settings.emailPlaceholder")}
                              value={profileData.email}
                              onChange={(e) =>
                                handleProfileInputChange(
                                  "email",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.phone")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              placeholder={t("settings.phonePlaceholder")}
                              value={profileData.phone}
                              onChange={(e) =>
                                handleProfileInputChange(
                                  "phone",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("profile.nationalId")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              placeholder="National ID"
                              value={profileData.national_id}
                              onChange={(e) =>
                                handleProfileInputChange(
                                  "national_id",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("sign.country")}
                            </label>
                            <select
                              className="form-control profile-settings-input"
                              value={profileData.country_id || ""}
                              onChange={(e) => {
                                const countryId = e.target.value;
                                const country = countries.find(
                                  (c) => c.id == countryId
                                );
                                handleProfileInputChange(
                                  "country_id",
                                  countryId
                                );
                                handleProfileInputChange(
                                  "country",
                                  country ? country.name : ""
                                );
                              }}
                              required
                            >
                              <option value="">
                                {t("sign.selectCountry")}
                              </option>
                              {countries.map((country) => (
                                <option key={country.id} value={country.id}>
                                  {country.name || country.code}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("sign.governorate")}
                            </label>
                            <select
                              className="form-control profile-settings-input"
                              value={profileData.governorate_id || ""}
                              onChange={(e) => {
                                const governorateId = e.target.value;
                                const governorate = governorates.find(
                                  (g) => g.id == governorateId
                                );
                                handleProfileInputChange(
                                  "governorate_id",
                                  governorateId
                                );
                                handleProfileInputChange(
                                  "governorate",
                                  governorate ? governorate.name : ""
                                );
                              }}
                              required
                              disabled={!profileData.country_id}
                            >
                              <option value="">
                                {t("sign.selectGovernorate")}
                              </option>
                              {governorates.map((governorate) => (
                                <option
                                  key={governorate.id}
                                  value={governorate.id}
                                >
                                  {governorate.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("sign.centerGovernorate")}
                            </label>
                            <select
                              className="form-control profile-settings-input"
                              value={profileData.center_gov_id || ""}
                              onChange={(e) => {
                                const centerGovId = e.target.value;
                                const centerGov = centerGovernorates.find(
                                  (c) => c.id == centerGovId
                                );
                                handleProfileInputChange(
                                  "center_gov_id",
                                  centerGovId
                                );
                                handleProfileInputChange(
                                  "centerGov",
                                  centerGov ? centerGov.name : ""
                                );
                              }}
                              required
                              disabled={!profileData.governorate_id}
                            >
                              <option value="">
                                {t("sign.selectCenterGovernorate")}
                              </option>
                              {centerGovernorates.map((center) => (
                                <option key={center.id} value={center.id}>
                                  {center.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("sign.address")} - {t("settings.arabic")}
                            </label>
                            <input
                              className="form-control profile-settings-input"
                              rows="3"
                              placeholder="Address"
                              value={profileData.address.ar}
                              onChange={(e) =>
                                handleProfileInputChange("address", {
                                  ...profileData.address,
                                  ar: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("sign.address")} - {t("settings.english")}
                            </label>
                            <input
                              className="form-control profile-settings-input"
                              placeholder="Address"
                              value={profileData.address.en}
                              onChange={(e) =>
                                handleProfileInputChange("address", {
                                  ...profileData.address,
                                  en: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="col-12 text-end">
                            <button
                              type="submit"
                              className="profile-settings-save-btn"
                              disabled={loading}
                            >
                              {loading ? "Updating..." : t("settings.saveBtn")}
                            </button>
                          </div>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              )}
              {activeTab === "notifications" && (
                <div className="profile-settings-notifications-tab">
                  <form
                    className="profile-settings-form"
                    style={{ maxWidth: 500, margin: "0 auto" }}
                  >
                    <div className="mb-3">
                      <label className="profile-settings-label">
                        {t("settings.notificationsEmail")}
                      </label>
                      <input
                        type="email"
                        className="form-control profile-settings-input"
                        placeholder={t(
                          "settings.notificationsEmailPlaceholder"
                        )}
                        value={notificationsData.email}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <div
                        className="profile-settings-notify-desc"
                        style={{ color: "#0A6E58", fontWeight: 600 }}
                      >
                        {t("settings.notificationsDesc")}
                      </div>
                    </div>
                  </form>
                </div>
              )}
              {activeTab === "requests" && (
                <div className="profile-requests-tab">
                  <div className="mb-4">
                    <h4>{t("settings.myRequestsTab")}</h4>
                  </div>

                  {requestsLoading ? (
                    <div className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          {t("settings.loading")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {requests.length > 0 ? (
                        <div className="row">
                          {requests.map((request) => (
                            <div
                              key={request.id}
                              className="col-md-6 col-lg-4 mb-3"
                            >
                              <div className="profile-requests-card">
                                <div className="profile-requests-content">
                                  <div className="profile-requests-header">
                                    <h6 className="profile-requests-title">
                                      {request.service?.name ||
                                        t("settings.unknown")}
                                    </h6>
                                    <span
                                      className={`profile-requests-status profile-requests-status-${request.status}`}
                                    >
                                      {request.status}
                                    </span>
                                  </div>
                                  <div className="profile-requests-details">
                                    <p className="profile-requests-info">
                                      <strong>
                                        {t("settings.requester")}:
                                      </strong>{" "}
                                      {request.other_party?.name ||
                                        t("settings.unknown")}
                                    </p>
                                    <p className="profile-requests-info">
                                      <strong>
                                        {t("settings.startedAt")}:
                                      </strong>{" "}
                                      {request.started_at ||
                                        t("settings.notAvailable")}
                                    </p>
                                  </div>
                                  <div className="profile-requests-actions">
                                    <button
                                      className="profile-requests-view-btn"
                                      onClick={() => {
                                        window.location.href = `/request-details/${request.id}`;
                                      }}
                                    >
                                      {t("settings.viewDetails")}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted">
                          <p>{t("settings.noRequestsFound")}</p>
                        </div>
                      )}

                      {/* Pagination */}
                      {requestsTotalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                          <nav>
                            <ul className="pagination">
                              <li
                                className={`page-item ${
                                  requestsCurrentPage === 1 ? "disabled" : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    handleRequestsPageChange(
                                      requestsCurrentPage - 1
                                    )
                                  }
                                  disabled={requestsCurrentPage === 1}
                                >
                                  {t("settings.previous")}
                                </button>
                              </li>
                              {Array.from(
                                { length: requestsTotalPages },
                                (_, i) => i + 1
                              ).map((page) => (
                                <li
                                  key={page}
                                  className={`page-item ${
                                    page === requestsCurrentPage ? "active" : ""
                                  }`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() =>
                                      handleRequestsPageChange(page)
                                    }
                                  >
                                    {page}
                                  </button>
                                </li>
                              ))}
                              <li
                                className={`page-item ${
                                  requestsCurrentPage === requestsTotalPages
                                    ? "disabled"
                                    : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    handleRequestsPageChange(
                                      requestsCurrentPage + 1
                                    )
                                  }
                                  disabled={
                                    requestsCurrentPage === requestsTotalPages
                                  }
                                >
                                  {t("settings.next")}
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              {activeTab === "orders" && (
                <div className="profile-orders-tab">
                  <div className="mb-4">
                    <h4>{t("orders.title")}</h4>
                  </div>

                  {ordersLoading ? (
                    <div className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">جاري التحميل...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {orders.length > 0 ? (
                        <div className="orders-container">
                          {orders.map((order) => (
                            <div key={order.id} className="order-card">
                              <div className="order-header">
                                <div className="order-info">
                                  <div className="order-id">
                                    <FaShoppingCart className="order-icon" />
                                    <span>
                                      {t("orders.orderNumber")}: {order.id}
                                    </span>
                                  </div>
                                </div>
                                <div className="order-status">
                                  <span
                                    className={`status-badge ${order.status}`}
                                  >
                                    {getStatusText(order.status)}
                                  </span>
                                </div>
                              </div>

                              <div className="order-details">
                                <div className="order-location">
                                  <FaMapMarkerAlt className="detail-icon" />
                                  <div className="location-info">
                                    <div className="location-text">
                                      {t("orders.address")}
                                    </div>
                                    <div className="location-details">
                                      {order.address}
                                    </div>
                                    <div className="location-details">
                                      {order.country}, {order.governorate},{" "}
                                      {order.center_gov}
                                    </div>
                                  </div>
                                </div>

                                <div className="order-payment">
                                  <FaCreditCard className="detail-icon" />
                                  <div className="payment-info">
                                    <div className="payment-method">
                                      {t("orders.paymentMethod")}
                                    </div>
                                    <div className="location-details">
                                      {getPaymentMethodText(
                                        order.payment_method
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="order-total">
                                <div className="total-label">
                                  {t("orders.total")}:
                                </div>
                                <div className="total-amount">
                                  {order.total_amount}
                                </div>
                              </div>

                              {order.items && order.items.length > 0 ? (
                                <div className="order-items">
                                  <div className="items-title">
                                    {t("orders.requestedProducts")}
                                  </div>
                                  <div className="items-grid">
                                    {order.items.map((item, index) => (
                                      <div key={index} className="item-card">
                                        <div className="item-name">
                                          {item.product.name}
                                        </div>
                                        <div className="item-description">
                                          {item.product.description}
                                        </div>
                                        <div className="item-details">
                                          <div className="item-price">
                                            {t("orders.price")}:{" "}
                                            {item.product.price}
                                          </div>
                                          <div className="item-quantity">
                                            {t("orders.quantity")}:{" "}
                                            {item.quantity}
                                          </div>
                                          <div className="item-total">
                                            {t("orders.total")}: {item.total}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="no-items">
                                  <FaBox className="no-items-icon" />
                                  <span>{t("orders.noProductsInOrder")}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-orders">
                          <FaShoppingCart className="no-orders-icon" />
                          <p>{t("orders.noOrdersFound")}</p>
                          <small>{t("orders.noOrdersDescription")}</small>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
