import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import "./CompanyProfile.css";
import { FiCamera } from "react-icons/fi";

export default function CompanyProfile() {
  const { t, i18n } = useTranslation("global");
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
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
    company_name: {
      ar: "",
      en: "",
    },
    company_type: {
      ar: "",
      en: "",
    },
    bio: "",
    tax_number: "",
    whatsapp_number: "",
    account_type: "",
  });

  // Company images state
  const [companyImages, setCompanyImages] = useState({
    company_logo_image: "",
    tax_record_front: "",
    tax_record_back: "",
    tax_card_front: "",
    tax_card_back: "",
  });

  // Notifications form state
  const [notificationsData, setNotificationsData] = useState({
    email: "",
  });

  // Services and Products state
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // API Data States for location
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [centerGovernorates, setCenterGovernorates] = useState([]);

  // Dummy data for services
  const dummyServices = [1, 2, 3, 4, 5, 6, 7, 8];

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

  // Fetch services or products when tab changes
  useEffect(() => {
    if (activeTab === "services" && profileData.account_type) {
      if (profileData.account_type === "service") {
        fetchServices();
      } else {
        fetchProducts();
      }
    }
  }, [activeTab, profileData.account_type]);

  // Refetch data when page changes
  useEffect(() => {
    if (activeTab === "services" && profileData.account_type) {
      if (profileData.account_type === "service") {
        fetchServices();
      } else {
        fetchProducts();
      }
    }
  }, [currentPage]);

  const fetchProfileData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        toast.error("Authentication required");
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
        const user = data.user;
        const company = data.company;

        // Set profile data with location IDs from API response
        setProfileData({
          username: {
            ar: user.username?.ar || "",
            en: user.username?.en || "",
          },
          email: user.email || "",
          phone: user.phone || "",
          age: user.age || "",
          national_id: user.national_id || "",
          address: {
            ar: user.address?.ar || "",
            en: user.address?.en || "",
          },
          country: user.country || "",
          governorate: user.governorate || "",
          centerGov: user.centerGov || "",
          country_id: user.country_id || "",
          governorate_id: user.governorate_id || "",
          center_gov_id: user.centerGov_id || "",
          company_name: {
            ar: company.company_name?.ar || "",
            en: company.company_name?.en || "",
          },
          company_type: {
            ar: company.company_type?.ar || "",
            en: company.company_type?.en || "",
          },
          bio: company.bio || "",
          tax_number: company.tax_number || "",
          whatsapp_number: company.whatsapp_number || "",
          account_type: user.account_type || "",
        });

        // Set company images
        setCompanyImages({
          company_logo_image: company.company_logo_image || "",
          tax_record_front: company.tax_record_front || "",
          tax_record_back: company.tax_record_back || "",
          tax_card_front: company.tax_card_front || "",
          tax_card_back: company.tax_card_back || "",
        });

        // Set notifications email
        setNotificationsData({
          email: user.email || "",
        });

        // Only clear location arrays if this is not a language change refresh
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
      toast.error("Failed to load profile data");
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

  // Fetch services for service accounts
  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/services/my-services?per_page=10&page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data.status === 200) {
        setServices(response.data.data.data || []);
        setTotalPages(response.data.data.meta?.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch products for physical accounts
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/products/my-products?per_page=10&page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data.status === 200) {
        setProducts(response.data.data.data || []);
        setTotalPages(response.data.data.meta?.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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

  // Helper function to get localized name
  const getLocalizedName = (item) => {
    if (!item || !item.name) return "";

    // If name is an object with ar/en properties
    if (typeof item.name === "object" && item.name.ar && item.name.en) {
      return i18n.language === "ar" ? item.name.ar : item.name.en;
    }

    // If name is a string, return it directly
    if (typeof item.name === "string") {
      return item.name;
    }

    // Fallback to empty string
    return "";
  };

  // Helper function to get localized description
  const getLocalizedDescription = (item) => {
    if (!item || !item.description) return "";

    // If description is an object with ar/en properties
    if (
      typeof item.description === "object" &&
      item.description.ar &&
      item.description.en
    ) {
      return i18n.language === "ar" ? item.description.ar : item.description.en;
    }

    // If description is a string, return it directly
    if (typeof item.description === "string") {
      return item.description;
    }

    // Fallback to empty string
    return "";
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

      // Send data with language-specific keys for username, address, company_name, and company_type
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
      formDataToSend.append(`company_name[ar]`, profileData.company_name.ar);
      formDataToSend.append(`company_name[en]`, profileData.company_name.en);
      formDataToSend.append(`company_type[ar]`, profileData.company_type.ar);
      formDataToSend.append(`company_type[en]`, profileData.company_type.en);
      formDataToSend.append(`bio`, profileData.bio);
      formDataToSend.append(`tax_number`, profileData.tax_number);
      formDataToSend.append(`whatsapp_number`, profileData.whatsapp_number);

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
        toast.success("Profile updated successfully!");

        // Update local state with the new data we sent
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
          company_name: {
            ar: profileData.company_name.ar,
            en: profileData.company_name.en,
          },
          company_type: {
            ar: profileData.company_type.ar,
            en: profileData.company_type.en,
          },
          bio: profileData.bio,
          tax_number: profileData.tax_number,
          whatsapp_number: profileData.whatsapp_number,
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
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
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
                    activeTab === "services" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("services")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {profileData.account_type === "service"
                    ? t("settings.myServicesTab")
                    : t("settings.myProductsTab")}
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
                          src={
                            companyImages.company_logo_image || "/avatar.webp"
                          }
                          alt="company logo"
                          className="profile-settings-avatar"
                        />
                      </div>
                      <form
                        className="profile-settings-form"
                        onSubmit={handleProfileSubmit}
                      >
                        <div className="row g-3">
                          {/* Company Name */}
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.companyName")} -{" "}
                              {t("settings.arabic")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              placeholder={t("settings.companyNamePlaceholder")}
                              value={profileData.company_name.ar}
                              onChange={(e) =>
                                handleProfileInputChange("company_name", {
                                  ...profileData.company_name,
                                  ar: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.companyName")} -{" "}
                              {t("settings.english")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              placeholder={t("settings.companyNamePlaceholder")}
                              value={profileData.company_name.en}
                              onChange={(e) =>
                                handleProfileInputChange("company_name", {
                                  ...profileData.company_name,
                                  en: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          {/* Company Type */}
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.companyType")} -{" "}
                              {t("settings.arabic")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              placeholder={t("settings.companyTypePlaceholder")}
                              value={profileData.company_type.ar}
                              onChange={(e) =>
                                handleProfileInputChange("company_type", {
                                  ...profileData.company_type,
                                  ar: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.companyType")} -{" "}
                              {t("settings.english")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              placeholder={t("settings.companyTypePlaceholder")}
                              value={profileData.company_type.en}
                              onChange={(e) =>
                                handleProfileInputChange("company_type", {
                                  ...profileData.company_type,
                                  en: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          {/* Owner Name */}
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
                          {/* Age */}
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
                          {/* Email */}
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
                          {/* Phone */}
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
                          {/* National ID */}
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
                          {/* Tax Number */}
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("identity.taxNumber")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              placeholder={t("identity.taxNumberPlaceholder")}
                              value={profileData.tax_number}
                              onChange={(e) =>
                                handleProfileInputChange(
                                  "tax_number",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          {/* WhatsApp Number */}
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.whatsappNumber")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              placeholder={t(
                                "settings.whatsappNumberPlaceholder"
                              )}
                              value={profileData.whatsapp_number}
                              onChange={(e) =>
                                handleProfileInputChange(
                                  "whatsapp_number",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          {/* Account Type (Read Only) */}
                          <div className="col-md-6">
                            <label className="profile-settings-label">
                              {t("settings.accountType")}
                            </label>
                            <input
                              type="text"
                              className="form-control profile-settings-input"
                              value={profileData.account_type}
                              readOnly
                              disabled
                            />
                          </div>
                          {/* Country */}
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
                          {/* Governorate */}
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
                          {/* Center Governorate */}
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
                          {/* Address */}
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
                          {/* Bio */}
                          <div className="col-12">
                            <label className="profile-settings-label">
                              {t("settings.bio")}
                            </label>
                            <textarea
                              className="form-control profile-settings-input"
                              rows="3"
                              placeholder={t("settings.bioPlaceholder")}
                              value={profileData.bio}
                              onChange={(e) =>
                                handleProfileInputChange("bio", e.target.value)
                              }
                            ></textarea>
                          </div>

                          {/* Company Logo Upload */}
                          <div className="col-12">
                            <label className="profile-settings-label">
                              {t("identity.companyLogo")}
                            </label>
                            <div className="company-logo-upload-container">
                              {companyImages.company_logo_image ? (
                                <div className="company-logo-preview">
                                  <img
                                    src={companyImages.company_logo_image}
                                    alt="Company Logo"
                                    className="company-logo-preview-image"
                                  />
                                  <div className="company-logo-overlay">
                                    <FiCamera className="company-logo-camera-icon" />
                                    <p className="company-logo-upload-text">
                                      {t("identity.changeLogo")}
                                    </p>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="company-logo-file-input"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        // Here you can handle the file upload
                                        // For now, we'll just show a preview
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                          setCompanyImages((prev) => ({
                                            ...prev,
                                            company_logo_image: e.target.result,
                                          }));
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="company-logo-upload-placeholder">
                                  <FiCamera className="company-logo-camera-icon" />
                                  <p className="company-logo-upload-text">
                                    {t("identity.uploadLogo")}
                                  </p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="company-logo-file-input"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                          setCompanyImages((prev) => ({
                                            ...prev,
                                            company_logo_image: e.target.result,
                                          }));
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Identity Documents Display */}
                          <div className="col-12">
                            <h6 className="identity-documents-title">
                              {t("identity.documents")}
                            </h6>
                            <div className="identity-documents-grid">
                              {/* Tax Record Front */}
                              <div className="identity-document-item">
                                <label className="identity-document-label">
                                  {t("identity.taxRecordFront")}
                                </label>
                                {companyImages.tax_record_front ? (
                                  <img
                                    src={companyImages.tax_record_front}
                                    alt="Tax Record Front"
                                    className="identity-document-image"
                                  />
                                ) : (
                                  <div className="identity-document-placeholder">
                                    <FiCamera className="identity-document-camera-icon" />
                                    <p className="identity-document-text">
                                      {t("identity.noImage")}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Tax Record Back */}
                              <div className="identity-document-item">
                                <label className="identity-document-label">
                                  {t("identity.taxRecordBack")}
                                </label>
                                {companyImages.tax_record_back ? (
                                  <img
                                    src={companyImages.tax_record_back}
                                    alt="Tax Record Back"
                                    className="identity-document-image"
                                  />
                                ) : (
                                  <div className="identity-document-placeholder">
                                    <FiCamera className="identity-document-camera-icon" />
                                    <p className="identity-document-text">
                                      {t("identity.noImage")}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Tax Card Front */}
                              <div className="identity-document-item">
                                <label className="identity-document-label">
                                  {t("identity.taxCardFront")}
                                </label>
                                {companyImages.tax_card_front ? (
                                  <img
                                    src={companyImages.tax_card_front}
                                    alt="Tax Card Front"
                                    className="identity-document-image"
                                  />
                                ) : (
                                  <div className="identity-document-placeholder">
                                    <FiCamera className="identity-document-camera-icon" />
                                    <p className="identity-document-text">
                                      {t("identity.noImage")}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Tax Card Back */}
                              <div className="identity-document-item">
                                <label className="identity-document-label">
                                  {t("identity.taxCardBack")}
                                </label>
                                {companyImages.tax_card_back ? (
                                  <img
                                    src={companyImages.tax_card_back}
                                    alt="Tax Card Back"
                                    className="identity-document-image"
                                  />
                                ) : (
                                  <div className="identity-document-placeholder">
                                    <FiCamera className="identity-document-camera-icon" />
                                    <p className="identity-document-text">
                                      {t("identity.noImage")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
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
              {activeTab === "services" && (
                <div className="company-services-tab">
                  <div className="mb-4">
                    <h4>
                      {profileData.account_type === "service"
                        ? t("settings.myServicesTab")
                        : t("settings.myProductsTab")}
                    </h4>
                  </div>

                  {servicesLoading || productsLoading ? (
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
                      {profileData.account_type === "service" ? (
                        // Services Grid
                        <div className="row company-services-grid">
                          {services.length > 0 ? (
                            services.map((service) => (
                              <div
                                className="col-md-6 col-lg-4 mb-4"
                                key={service.id}
                              >
                                <div
                                  className="company-services-card clickable-card"
                                  onClick={() =>
                                    (window.location.href = `/servicedetails/${service.id}`)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <img
                                    src={
                                      typeof service.main_image === "string"
                                        ? service.main_image
                                        : "/car.png"
                                    }
                                    alt={getLocalizedName(service)}
                                    className="company-services-img"
                                  />
                                  <div className="company-services-content">
                                    <h6 className="company-services-title">
                                      {getLocalizedName(service)}
                                    </h6>
                                    <p className="company-services-description">
                                      {getLocalizedDescription(service)}
                                    </p>
                                    <div className="company-services-location">
                                      <small className="text-muted">
                                        {service.country?.name ||
                                          service.country ||
                                          ""}{" "}
                                        -{" "}
                                        {service.governorate?.name ||
                                          service.governorate ||
                                          ""}{" "}
                                        -{" "}
                                        {service.center_gov?.name ||
                                          service.centerGov?.name ||
                                          service.centerGov ||
                                          ""}
                                      </small>
                                    </div>
                                    <div className="company-services-price">
                                      {t("products.startingFrom")}{" "}
                                      <span>
                                        {service.price || "0"}{" "}
                                        {t("products.currency")}
                                      </span>
                                    </div>
                                    {service.discount_price && (
                                      <div className="company-services-discount">
                                        <small className="text-danger">
                                          {t("products.discountPrice")}:{" "}
                                          {service.discount_price}{" "}
                                          {t("products.currency")}
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-12 text-center">
                              <p className="text-muted">No services found</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Products Grid
                        <div className="row company-services-grid">
                          {products.length > 0 ? (
                            products.map((product) => (
                              <div
                                className="col-md-6 col-lg-4 mb-4"
                                key={product.id}
                              >
                                <div
                                  className="company-services-card clickable-card"
                                  onClick={() =>
                                    (window.location.href = `/productdetalis/${product.id}`)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <img
                                    src={
                                      typeof product.main_image === "string"
                                        ? product.main_image
                                        : "/car.png"
                                    }
                                    alt={getLocalizedName(product)}
                                    className="company-services-img"
                                  />
                                  <div className="company-services-content">
                                    <h6 className="company-services-title">
                                      {getLocalizedName(product)}
                                    </h6>
                                    <p className="company-services-description">
                                      {getLocalizedDescription(product)}
                                    </p>
                                    <div className="company-services-condition">
                                      <small className="text-primary font-weight-bold">
                                        {product.condition}
                                      </small>
                                    </div>
                                    <div className="company-services-price">
                                      {t("products.startingFrom")}{" "}
                                      <span>
                                        {product.price || "0"}{" "}
                                        {t("products.currency")}
                                      </span>
                                    </div>
                                    {product.discount_price && (
                                      <div className="company-services-discount">
                                        <small className="text-danger">
                                          {t("products.discountPrice")}:{" "}
                                          {product.discount_price}{" "}
                                          {t("products.currency")}
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-12 text-center">
                              <p className="text-muted">No products found</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                          <nav>
                            <ul className="pagination">
                              <li
                                className={`page-item ${
                                  currentPage === 1 ? "disabled" : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    handlePageChange(currentPage - 1)
                                  }
                                  disabled={currentPage === 1}
                                >
                                  {t("previous")}
                                </button>
                              </li>
                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                              ).map((page) => (
                                <li
                                  key={page}
                                  className={`page-item ${
                                    currentPage === page ? "active" : ""
                                  }`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </button>
                                </li>
                              ))}
                              <li
                                className={`page-item ${
                                  currentPage === totalPages ? "disabled" : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    handlePageChange(currentPage + 1)
                                  }
                                  disabled={currentPage === totalPages}
                                >
                                  {t("next")}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
