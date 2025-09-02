import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import axios from "axios";
import "./ContactUS.css";
import PageHead from "../../component/PageHead/PageHead";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaEnvelope,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

export default function ContactUS() {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [infoLoading, setInfoLoading] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setInfoLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/company-info`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );
        if (response.data?.status === 200) {
          setCompanyInfo(response.data.data || null);
        }
      } catch (error) {
        // Silent fail, keep UI minimal
      } finally {
        setInfoLoading(false);
      }
    };
    fetchCompanyInfo();
  }, [i18n.language]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error(t("contactPage.nameRequired"));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t("contactPage.emailRequired"));
      return;
    }
    if (!formData.phone.trim()) {
      toast.error(t("contactPage.phoneRequired"));
      return;
    }
    if (!formData.message.trim()) {
      toast.error(t("contactPage.messageRequired"));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/contact-us`,
        formData,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data.status === 200) {
        toast.success(response.data.message || t("contactPage.successMessage"));
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("contactPage.errorMessage")
      );
    } finally {
      setLoading(false);
    }
  };

  const formatWhatsAppLink = (num) => {
    if (!num) return null;
    const digits = ("" + num).replace(/[^\d]/g, "");
    return `https://wa.me/${digits}`;
  };

  return (
    <>
      <PageHead header={t("navbar.contactUs")} />

      <section className="contact-section" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="contact-form">
                <h4>{t("contactPage.customRequest")}</h4>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-6">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder={t("contactPage.fullName")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                        disabled={loading}
                      />
                    </div>
                    <div className="col-lg-6">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder={t("contactPage.email")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                        disabled={loading}
                      />
                    </div>
                    <div className="col-lg-12">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder={t("contactPage.phone")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                        disabled={loading}
                      />
                    </div>
                    <div className="col-lg-12">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder={t("contactPage.message")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                        rows="5"
                        disabled={loading}
                      ></textarea>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}>
                    {loading
                      ? t("contactPage.sending")
                      : t("contactPage.submit")}
                  </button>
                </form>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="contact-info">
                <h6>{t("contactPage.stayInTouch")}</h6>

                {infoLoading ? (
                  // Loading skeleton
                  <>
                    <div className="skeleton-line mb-3"></div>
                    <div className="skeleton-line mb-3"></div>
                    <div className="skeleton-line mb-3"></div>
                    <div className="skeleton-line mb-3"></div>
                    <div className="skeleton-line mb-3"></div>
                    <div className="skeleton-social mt-3">
                      <div className="skeleton-icon"></div>
                      <div className="skeleton-icon"></div>
                      <div className="skeleton-icon"></div>
                      <div className="skeleton-icon"></div>
                      <div className="skeleton-icon"></div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Company name */}
                    {companyInfo?.company_name && (
                      <p className="d-flex align-items-center gap-2">
                        <strong>{companyInfo.company_name}</strong>
                      </p>
                    )}

                    {/* Address */}
                    <p className="d-flex align-items-center gap-2">
                      <FaMapMarkerAlt className="contact-icon" />
                      {companyInfo?.address || t("contactPage.address")}
                    </p>

                    {/* Email */}
                    {companyInfo?.email && (
                      <p className="d-flex align-items-center gap-2">
                        <FaEnvelope className="contact-icon" />
                        <a href={`mailto:${companyInfo.email}`}>
                          {companyInfo.email}
                        </a>
                      </p>
                    )}

                    {/* Phone */}
                    {companyInfo?.phone && (
                      <p className="d-flex align-items-center gap-2">
                        <FaPhone className="contact-icon" />
                        <a href={`tel:${companyInfo.phone}`}>
                          {companyInfo.phone}
                        </a>
                      </p>
                    )}

                    {/* WhatsApp */}
                    {companyInfo?.whatsapp_number && (
                      <p className="d-flex align-items-center gap-2">
                        <FaWhatsapp className="contact-icon" />
                        <a
                          href={formatWhatsAppLink(companyInfo.whatsapp_number)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {companyInfo.whatsapp_number}
                        </a>
                      </p>
                    )}

                  
                    {/* Social links */}
                    <div className="d-flex align-items-center justify-content-center gap-3 mt-2">
                      {companyInfo?.facebook && (
                        <a
                          href={companyInfo.facebook}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Facebook"
                        >
                          <FaFacebook className="contact-icon" />
                        </a>
                      )}
                      {companyInfo?.instagram && (
                        <a
                          href={companyInfo.instagram}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Instagram"
                        >
                          <FaInstagram className="contact-icon" />
                        </a>
                      )}
                      {companyInfo?.twitter && (
                        <a
                          href={companyInfo.twitter}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Twitter"
                        >
                          <FaTwitter className="contact-icon" />
                        </a>
                      )}
                      {companyInfo?.tiktok && (
                        <a
                          href={companyInfo.tiktok}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Tiktok"
                        >
                          <FaTiktok className="contact-icon" />
                        </a>
                      )}
                      {companyInfo?.youtube && (
                        <a
                          href={companyInfo.youtube}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="YouTube"
                        >
                          <FaYoutube className="contact-icon" />
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
