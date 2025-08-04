import React from "react";
import { useTranslation } from "react-i18next";
import "./ContactUS.css";
import PageHead from "../../component/PageHead/PageHead";
import { FaMapMarkerAlt, FaPhone, FaClock } from "react-icons/fa";

export default function ContactUS() {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";

  const contactNumbers = ["0101010101010", "0101010101010"];

  return (
    <>
      <PageHead header={t("navbar.contactUs")} />

      <section className="contact-section" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="contact-form">
                <h4>{t("contactPage.customRequest")}</h4>
                <form>
                  <div className="row">
                    <div className="col-lg-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t("contactPage.fullName")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                    </div>
                    <div className="col-lg-6">
                      <input
                        type="email"
                        className="form-control"
                        placeholder={t("contactPage.email")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                    </div>
                    <div className="col-lg-6">
                      <input
                        type="tel"
                        className="form-control"
                        placeholder={t("contactPage.phone")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                    </div>
                    <div className="col-lg-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t("contactPage.subject")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                    </div>
                    <div className="col-lg-12">
                      <textarea
                        className="form-control"
                        placeholder={t("contactPage.message")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      ></textarea>
                    </div>
                  </div>
                  <button type="submit">{t("contactPage.submit")}</button>
                </form>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="contact-info">
                <h6>{t("contactPage.stayInTouch")}</h6>
                <p className="d-flex align-items-center gap-2">
                  <FaMapMarkerAlt className="contact-icon" />
                  {t("contactPage.address")}
                </p>
                {contactNumbers.map((number, index) => (
                  <p key={index} className="d-flex align-items-center gap-2">
                    <FaPhone className="contact-icon" />
                    {number}
                  </p>
                ))}
                <p className="d-flex align-items-center gap-2">
                  <FaClock className="contact-icon" />
                  {t("contactPage.workingHours")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
