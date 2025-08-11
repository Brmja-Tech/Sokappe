import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Register.css";
import logo from "../../assests/imgs/logo.svg";
import { FiCamera, FiPlus, FiArrowLeft, FiArrowRight } from "react-icons/fi";

const Register = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const [tab, setTab] = useState("individual");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState("physical");

  // API Data States
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [centerGovernorates, setCenterGovernorates] = useState([]);

  // Form Data States
  const [formData, setFormData] = useState({
    type: "individual",
    account_type: "physical",
    email: "",
    username: { ar: "", en: "" },
    national_id: "",
    phone: "",
    age: "",
    password: "",
    password_confirmation: "",
    bio: { ar: "", en: "" },
    company_name: { ar: "", en: "" },
    company_type: { ar: "", en: "" },
    tax_number: "",
    store_name: { ar: "", en: "" },
    country_id: "",
    governorate_id: "",
    center_gov_id: "",
    address: { ar: "", en: "" },
    // Files
    national_id_front: null,
    national_id_back: null,
    company_logo_image: null,
    tax_record_front: null,
    tax_record_back: null,
    tax_card_front: null,
    tax_card_back: null,
    commercial_record_image: null,
    store_image: null,
  });

  // Reset form when tab changes
  const resetForm = () => {
    setFormData({
      type: tab,
      account_type: "physical",
      email: "",
      username: { ar: "", en: "" },
      national_id: "",
      phone: "",
      age: "",
      password: "",
      password_confirmation: "",
      bio: { ar: "", en: "" },
      company_name: { ar: "", en: "" },
      company_type: { ar: "", en: "" },
      tax_number: "",
      store_name: { ar: "", en: "" },
      country_id: "",
      governorate_id: "",
      center_gov_id: "",
      address: { ar: "", en: "" },
      national_id_front: null,
      national_id_back: null,
      company_logo_image: null,
      tax_record_front: null,
      tax_record_back: null,
      tax_card_front: null,
      tax_card_back: null,
      commercial_record_image: null,
      store_image: null,
    });
    setStep(1);
  };

  // Update formData type when tab changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      type: tab,
      account_type: tab === "individual" ? "physical" : "physical", // Reset to physical for non-individual types
    }));
  }, [tab]);

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch governorates when country changes
  useEffect(() => {
    if (formData.country_id) {
      fetchGovernorates(formData.country_id);
    }
  }, [formData.country_id]);

  // Fetch center governorates when governorate changes
  useEffect(() => {
    if (formData.governorate_id) {
      fetchCenterGovernorates(formData.governorate_id);
    }
  }, [formData.governorate_id]);

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
      setFormData((prev) => ({
        ...prev,
        governorate_id: "",
        center_gov_id: "",
      }));
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
      setFormData((prev) => ({ ...prev, center_gov_id: "" }));
    } catch (error) {
      console.error("Error fetching center governorates:", error);
    }
  };

  const handleInputChange = (field, value, lang = null) => {
    if (lang) {
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [lang]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileChange = (field, file) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add type
      formDataToSend.append("type", formData.type);

      // Only add account_type for company and individual_vendor, not for individual
      if (formData.type !== "individual") {
        formDataToSend.append("account_type", formData.account_type);
      }

      // Add common fields for all types
      if (formData.email) {
        formDataToSend.append("email", formData.email);
      }
      if (formData.username && typeof formData.username === "object") {
        if (formData.username.ar)
          formDataToSend.append("username[ar]", formData.username.ar);
        if (formData.username.en)
          formDataToSend.append("username[en]", formData.username.en);
      }
      if (formData.national_id) {
        formDataToSend.append("national_id", formData.national_id);
      }
      if (formData.phone) {
        formDataToSend.append("phone", formData.phone);
      }
      if (formData.age) {
        formDataToSend.append("age", formData.age);
      }
      if (formData.password) {
        formDataToSend.append("password", formData.password);
      }
      if (formData.password_confirmation) {
        formDataToSend.append(
          "password_confirmation",
          formData.password_confirmation
        );
      }
      if (formData.country_id) {
        formDataToSend.append("country_id", formData.country_id);
      }
      if (formData.governorate_id) {
        formDataToSend.append("governorate_id", formData.governorate_id);
      }
      if (formData.center_gov_id) {
        formDataToSend.append("center_gov_id", formData.center_gov_id);
      }
      if (formData.address && typeof formData.address === "object") {
        if (formData.address.ar)
          formDataToSend.append("address[ar]", formData.address.ar);
        if (formData.address.en)
          formDataToSend.append("address[en]", formData.address.en);
      }

      // Add type-specific fields
      if (formData.type === "company") {
        // Company specific fields
        if (formData.bio && typeof formData.bio === "object") {
          if (formData.bio.ar)
            formDataToSend.append("bio[ar]", formData.bio.ar);
          if (formData.bio.en)
            formDataToSend.append("bio[en]", formData.bio.en);
        }
        if (
          formData.company_name &&
          typeof formData.company_name === "object"
        ) {
          if (formData.company_name.ar)
            formDataToSend.append("company_name[ar]", formData.company_name.ar);
          if (formData.company_name.en)
            formDataToSend.append("company_name[en]", formData.company_name.en);
        }
        if (
          formData.company_type &&
          typeof formData.company_type === "object"
        ) {
          if (formData.company_type.ar)
            formDataToSend.append("company_type[ar]", formData.company_type.ar);
          if (formData.company_type.en)
            formDataToSend.append("company_type[en]", formData.company_type.en);
        }
        if (formData.tax_number) {
          formDataToSend.append("tax_number", formData.tax_number);
        }
        if (formData.company_logo_image) {
          formDataToSend.append(
            "company_logo_image",
            formData.company_logo_image
          );
        }
        if (formData.tax_record_front) {
          formDataToSend.append("tax_record_front", formData.tax_record_front);
        }
        if (formData.tax_record_back) {
          formDataToSend.append("tax_record_back", formData.tax_record_back);
        }
        if (formData.tax_card_front) {
          formDataToSend.append("tax_card_front", formData.tax_card_front);
        }
        if (formData.tax_card_back) {
          formDataToSend.append("tax_card_back", formData.tax_card_back);
        }
      } else if (formData.type === "individual_vendor") {
        // Individual vendor specific fields
        if (formData.bio && typeof formData.bio === "object") {
          if (formData.bio.ar)
            formDataToSend.append("bio[ar]", formData.bio.ar);
          if (formData.bio.en)
            formDataToSend.append("bio[en]", formData.bio.en);
        }
        if (formData.national_id_front) {
          formDataToSend.append(
            "national_id_front",
            formData.national_id_front
          );
        }
        if (formData.national_id_back) {
          formDataToSend.append("national_id_back", formData.national_id_back);
        }
        if (formData.tax_number) {
          formDataToSend.append("tax_number", formData.tax_number);
        }
        if (formData.tax_record_front) {
          formDataToSend.append("tax_record_front", formData.tax_record_front);
        }
        if (formData.tax_record_back) {
          formDataToSend.append("tax_record_back", formData.tax_record_back);
        }
        if (formData.tax_card_front) {
          formDataToSend.append("tax_card_front", formData.tax_card_front);
        }
        if (formData.tax_card_back) {
          formDataToSend.append("tax_card_back", formData.tax_card_back);
        }
        if (formData.commercial_record_image) {
          formDataToSend.append(
            "commercial_record_image",
            formData.commercial_record_image
          );
        }
        if (formData.store_name && typeof formData.store_name === "object") {
          if (formData.store_name.ar)
            formDataToSend.append("store_name[ar]", formData.store_name.ar);
          if (formData.store_name.en)
            formDataToSend.append("store_name[en]", formData.store_name.en);
        }
        if (formData.store_image) {
          formDataToSend.append("store_image", formData.store_image);
        }
        if (formData.company_logo_image) {
          formDataToSend.append(
            "company_logo_image",
            formData.company_logo_image
          );
        }
      }
      // For individual type, only common fields are needed

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/register/complete`,
        formDataToSend,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      toast.success(response.data.message || "Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  const renderIndividualForm = () => (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.name")} (العربية)</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.name")}
            value={formData.username.ar}
            onChange={(e) =>
              handleInputChange("username", e.target.value, "ar")
            }
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.name")} (English)</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.name")}
            value={formData.username.en}
            onChange={(e) =>
              handleInputChange("username", e.target.value, "en")
            }
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.age")}</label>
          <input
            className="form-input"
            type="number"
            placeholder={t("profile.age")}
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.email")}</label>
          <input
            className="form-input"
            type="email"
            placeholder={t("profile.email")}
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.phone")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.phone")}
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.national_id")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.national_id")}
            value={formData.national_id}
            onChange={(e) => handleInputChange("national_id", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.password")}</label>
          <input
            className="form-input"
            type="password"
            autoComplete="off"
            placeholder={t("sign.password")}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.confirmPassword")}</label>
          <input
            className="form-input"
            type="password"
            autoComplete="off"
            placeholder={t("sign.confirmPassword")}
            value={formData.password_confirmation}
            onChange={(e) =>
              handleInputChange("password_confirmation", e.target.value)
            }
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.country")}</label>
          <select
            className="form-input"
            value={formData.country_id}
            onChange={(e) => handleInputChange("country_id", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          >
            <option value="">{t("sign.selectCountry")}</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name || country.code}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.governorate")}</label>
          <select
            className="form-input"
            value={formData.governorate_id}
            onChange={(e) =>
              handleInputChange("governorate_id", e.target.value)
            }
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
            disabled={!formData.country_id}
          >
            <option value="">{t("sign.selectGovernorate")}</option>
            {governorates.map((governorate) => (
              <option key={governorate.id} value={governorate.id}>
                {governorate.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.centerGovernorate")}</label>
          <select
            className="form-input"
            value={formData.center_gov_id}
            onChange={(e) => handleInputChange("center_gov_id", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
            disabled={!formData.governorate_id}
          >
            <option value="">{t("sign.selectCenterGovernorate")}</option>
            {centerGovernorates.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.address")} (العربية)</label>
          <textarea
            className="form-textarea"
            placeholder={t("sign.address")}
            value={formData.address.ar}
            onChange={(e) => handleInputChange("address", e.target.value, "ar")}
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          ></textarea>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.address")} (English)</label>
          <textarea
            className="form-textarea"
            placeholder={t("sign.address")}
            value={formData.address.en}
            onChange={(e) => handleInputChange("address", e.target.value, "en")}
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          ></textarea>
        </div>
      </div>

      <button type="submit" className="register-button" disabled={loading}>
        {loading ? t("sign.registering") : t("sign.register")}
      </button>
    </form>
  );

  const renderCompanyFormStep1 = () => (
    <form className="register-form">
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            {t("sign.company_name")} (العربية)
          </label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.company_name")}
            value={formData.company_name.ar}
            onChange={(e) =>
              handleInputChange("company_name", e.target.value, "ar")
            }
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">
            {t("sign.company_name")} (English)
          </label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.company_name")}
            value={formData.company_name.en}
            onChange={(e) =>
              handleInputChange("company_name", e.target.value, "en")
            }
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            {t("sign.account_username")} (العربية)
          </label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.account_username")}
            value={formData.username.ar}
            onChange={(e) =>
              handleInputChange("username", e.target.value, "ar")
            }
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">
            {t("sign.account_username")} (English)
          </label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.account_username")}
            value={formData.username.en}
            onChange={(e) =>
              handleInputChange("username", e.target.value, "en")
            }
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.email")}</label>
          <input
            className="form-input"
            type="email"
            placeholder={t("profile.email")}
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.phone")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.phone")}
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            {t("sign.company_type")} (العربية)
          </label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.company_type")}
            value={formData.company_type.ar}
            onChange={(e) =>
              handleInputChange("company_type", e.target.value, "ar")
            }
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">
            {t("sign.company_type")} (English)
          </label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.company_type")}
            value={formData.company_type.en}
            onChange={(e) =>
              handleInputChange("company_type", e.target.value, "en")
            }
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.taxNumber")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.taxNumber")}
            value={formData.tax_number}
            onChange={(e) => handleInputChange("tax_number", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.national_id")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.national_id")}
            value={formData.national_id}
            onChange={(e) => handleInputChange("national_id", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.bio")} (العربية)</label>
          <textarea
            className="form-textarea"
            placeholder={t("profile.bio")}
            value={formData.bio.ar}
            onChange={(e) => handleInputChange("bio", e.target.value, "ar")}
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.bio")} (English)</label>
          <textarea
            className="form-textarea"
            placeholder={t("profile.bio")}
            value={formData.bio.en}
            onChange={(e) => handleInputChange("bio", e.target.value, "en")}
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          ></textarea>
        </div>
      </div>

      <button
        type="button"
        className="register-button"
        onClick={() => setStep(2)}
      >
        {t("sign.next")}
      </button>
    </form>
  );

  const renderCompanyFormStep2 = () => (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.national_id")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.national_id")}
            value={formData.national_id}
            onChange={(e) => handleInputChange("national_id", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.age")}</label>
          <input
            className="form-input"
            type="number"
            placeholder={t("profile.age")}
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.password")}</label>
          <input
            className="form-input"
            type="password"
            autoComplete="off"
            placeholder={t("sign.password")}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.confirmPassword")}</label>
          <input
            className="form-input"
            type="password"
            autoComplete="off"
            placeholder={t("sign.confirmPassword")}
            value={formData.password_confirmation}
            onChange={(e) =>
              handleInputChange("password_confirmation", e.target.value)
            }
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.country")}</label>
          <select
            className="form-input"
            value={formData.country_id}
            onChange={(e) => handleInputChange("country_id", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          >
            <option value="">{t("sign.selectCountry")}</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name || country.code}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.governorate")}</label>
          <select
            className="form-input"
            value={formData.governorate_id}
            onChange={(e) =>
              handleInputChange("governorate_id", e.target.value)
            }
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
            disabled={!formData.country_id}
          >
            <option value="">{t("sign.selectGovernorate")}</option>
            {governorates.map((governorate) => (
              <option key={governorate.id} value={governorate.id}>
                {governorate.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.centerGovernorate")}</label>
          <select
            className="form-input"
            value={formData.center_gov_id}
            onChange={(e) => handleInputChange("center_gov_id", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
            disabled={!formData.governorate_id}
          >
            <option value="">{t("sign.selectCenterGovernorate")}</option>
            {centerGovernorates.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.address")} (العربية)</label>
          <textarea
            className="form-textarea"
            placeholder={t("sign.address")}
            value={formData.address.ar}
            onChange={(e) => handleInputChange("address", e.target.value, "ar")}
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          ></textarea>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.address")} (English)</label>
          <textarea
            className="form-textarea"
            placeholder={t("sign.address")}
            value={formData.address.en}
            onChange={(e) => handleInputChange("address", e.target.value, "en")}
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          ></textarea>
        </div>
      </div>

      <div className="upload-section">
        <h6 className="upload-title">{t("sign.companyLogo")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.uploadLogo")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("company_logo_image", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <h6 className="upload-title">{t("sign.taxRecord")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxRecordFront")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("tax_record_front", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxRecordBack")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("tax_record_back", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <h6 className="upload-title">{t("sign.taxCard")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxCardFront")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("tax_card_front", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxCardBack")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("tax_card_back", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="button-group">
        <button
          type="button"
          className="register-button-secondary"
          onClick={() => setStep(1)}
        >
          {t("sign.previous")}
        </button>
        <button type="submit" className="register-button" disabled={loading}>
          {loading ? t("sign.registering") : t("sign.register")}
        </button>
      </div>
    </form>
  );

  const renderIndividualVendorFormStep1 = () => (
    <form className="register-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.name")} (العربية)</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.name")}
            value={formData.username.ar}
            onChange={(e) =>
              handleInputChange("username", e.target.value, "ar")
            }
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.name")} (English)</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.name")}
            value={formData.username.en}
            onChange={(e) =>
              handleInputChange("username", e.target.value, "en")
            }
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.age")}</label>
          <input
            className="form-input"
            type="number"
            placeholder={t("profile.age")}
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.email")}</label>
          <input
            className="form-input"
            type="email"
            placeholder={t("profile.email")}
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.phone")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("profile.phone")}
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.national_id")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.national_id")}
            value={formData.national_id}
            onChange={(e) => handleInputChange("national_id", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.taxNumber")}</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.taxNumber")}
            value={formData.tax_number}
            onChange={(e) => handleInputChange("tax_number", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.password")}</label>
          <input
            className="form-input"
            type="password"
            autoComplete="off"
            placeholder={t("sign.password")}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t("sign.confirmPassword")}</label>
        <input
          className="form-input"
          type="password"
          autoComplete="off"
          placeholder={t("sign.confirmPassword")}
          value={formData.password_confirmation}
          onChange={(e) =>
            handleInputChange("password_confirmation", e.target.value)
          }
          dir={isRTL ? "rtl" : "ltr"}
          style={{ textAlign: isRTL ? "right" : "left" }}
          required
        />
      </div>

      <button
        type="button"
        className="register-button"
        onClick={() => setStep(2)}
      >
        {t("sign.next")}
      </button>
    </form>
  );

  const renderIndividualVendorFormStep2 = () => (
    <form className="register-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.country")}</label>
          <select
            className="form-input"
            value={formData.country_id}
            onChange={(e) => handleInputChange("country_id", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
          >
            <option value="">{t("sign.selectCountry")}</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name || country.code}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.governorate")}</label>
          <select
            className="form-input"
            value={formData.governorate_id}
            onChange={(e) =>
              handleInputChange("governorate_id", e.target.value)
            }
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
            disabled={!formData.country_id}
          >
            <option value="">{t("sign.selectGovernorate")}</option>
            {governorates.map((governorate) => (
              <option key={governorate.id} value={governorate.id}>
                {governorate.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.centerGovernorate")}</label>
          <select
            className="form-input"
            value={formData.center_gov_id}
            onChange={(e) => handleInputChange("center_gov_id", e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            required
            disabled={!formData.governorate_id}
          >
            <option value="">{t("sign.selectCenterGovernorate")}</option>
            {centerGovernorates.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.address")} (العربية)</label>
          <textarea
            className="form-textarea"
            placeholder={t("sign.address")}
            value={formData.address.ar}
            onChange={(e) => handleInputChange("address", e.target.value, "ar")}
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.address")} (English)</label>
          <textarea
            className="form-textarea"
            placeholder={t("sign.address")}
            value={formData.address.en}
            onChange={(e) => handleInputChange("address", e.target.value, "en")}
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          ></textarea>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.bio")} (العربية)</label>
          <textarea
            className="form-textarea"
            placeholder={t("profile.bio")}
            value={formData.bio.ar}
            onChange={(e) => handleInputChange("bio", e.target.value, "ar")}
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.bio")} (English)</label>
          <textarea
            className="form-textarea"
            placeholder={t("profile.bio")}
            value={formData.bio.en}
            onChange={(e) => handleInputChange("bio", e.target.value, "en")}
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          ></textarea>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.storeName")} (العربية)</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.storeName")}
            value={formData.store_name.ar}
            onChange={(e) =>
              handleInputChange("store_name", e.target.value, "ar")
            }
            dir="rtl"
            style={{ textAlign: "right" }}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.storeName")} (English)</label>
          <input
            className="form-input"
            type="text"
            placeholder={t("sign.storeName")}
            value={formData.store_name.en}
            onChange={(e) =>
              handleInputChange("store_name", e.target.value, "en")
            }
            dir="ltr"
            style={{ textAlign: "left" }}
            required
          />
        </div>
      </div>

      <div className="form-buttons">
        <button
          type="button"
          className="register-button secondary"
          onClick={() => setStep(1)}
        >
          {t("sign.previous")}
        </button>
        <button
          type="button"
          className="register-button"
          onClick={() => setStep(3)}
        >
          {t("sign.next")}
        </button>
      </div>
    </form>
  );

  const renderIndividualVendorFormStep3 = () => (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="upload-section">
        <h6 className="upload-title">{t("sign.nationalId")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.nationalIdFront")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("national_id_front", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.nationalIdBack")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("national_id_back", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <h6 className="upload-title">{t("sign.taxRecord")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxRecordFront")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("tax_record_front", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxRecordBack")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("tax_record_back", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <h6 className="upload-title">{t("sign.taxCard")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxCardFront")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("tax_card_front", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.taxCardBack")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("tax_card_back", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <h6 className="upload-title">{t("sign.commercialRecord")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">
                  {t("sign.uploadCommercialRecord")}
                </p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange(
                      "commercial_record_image",
                      e.target.files[0]
                    )
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <h6 className="upload-title">{t("sign.storeImage")}</h6>
        <div className="upload-container">
          <div className="card-upload">
            <div className="card-upload-body">
              <div className="image-upload-container">
                <FiCamera className="camera-icon" />
                <p className="upload-text">{t("sign.uploadStoreImage")}</p>
                <FiPlus className="plus-icon" />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) =>
                    handleFileChange("store_image", e.target.files[0])
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-buttons">
        <button
          type="button"
          className="register-button secondary"
          onClick={() => setStep(2)}
        >
          {t("sign.previous")}
        </button>
        <button type="submit" className="register-button" disabled={loading}>
          {loading ? t("sign.registering") : t("sign.register")}
        </button>
      </div>
    </form>
  );

  return (
    <div className="register-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="register-container">
        <img className="register-logo" src={logo} alt="Logo" />

        <div className="register-tabs">
          <button
            className={`tab-button ${tab === "individual" ? "active" : ""}`}
            onClick={() => {
              setTab("individual");
              resetForm();
            }}
          >
            {t("sign.individual")}
          </button>
          <button
            className={`tab-button ${tab === "company" ? "active" : ""}`}
            onClick={() => {
              setTab("company");
              resetForm();
            }}
          >
            {t("sign.company")}
          </button>
          <button
            className={`tab-button ${
              tab === "individual_vendor" ? "active" : ""
            }`}
            onClick={() => {
              setTab("individual_vendor");
              resetForm();
            }}
          >
            {t("sign.individual_vendor")}
          </button>
        </div>

        {/* Account Type Tabs for Company and Individual Vendor */}
        {(tab === "company" || tab === "individual_vendor") && (
          <div className="account-type-tabs">
            <button
              className={`account-tab-button ${
                accountType === "physical" ? "active" : ""
              }`}
              onClick={() => {
                setAccountType("physical");
                setFormData((prev) => ({ ...prev, account_type: "physical" }));
              }}
            >
              {t("physical")}
            </button>
            <button
              className={`account-tab-button ${
                accountType === "service" ? "active" : ""
              }`}
              onClick={() => {
                setAccountType("service");
                setFormData((prev) => ({ ...prev, account_type: "service" }));
              }}
            >
              {t("service")}
            </button>
          </div>
        )}

        {tab === "individual"
          ? renderIndividualForm()
          : tab === "company"
          ? step === 1
            ? renderCompanyFormStep1()
            : renderCompanyFormStep2()
          : step === 1
          ? renderIndividualVendorFormStep1()
          : step === 2
          ? renderIndividualVendorFormStep2()
          : renderIndividualVendorFormStep3()}

        <div className="login-link">
          <span>{t("sign.haveAccount")}</span>
          <Link to="/login" className="link">
            {t("sign.login")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
