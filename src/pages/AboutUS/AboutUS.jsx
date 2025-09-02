import React, { useState, useEffect } from "react";
import "./AboutUS.css";
import PageHead from "../../component/PageHead/PageHead";
import { useTranslation } from "react-i18next";
import axios from "axios";
import aboutus from "../../assests/imgs/image 6.svg";
import {
  FaShoppingCart,
  FaHeadset,
  FaExchangeAlt,
  FaCreditCard,
} from "react-icons/fa";
import Features from "../../component/Features/Features";

export default function AboutUS() {
  const { t, i18n } = useTranslation("global");
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // قائمة الأيقونات فقط، النصوص تأتي من ملفات الترجمة
  const icons = [
    <FaShoppingCart className="feature-icon" />,
    <FaHeadset className="feature-icon" />,
    <FaExchangeAlt className="feature-icon" />,
    <FaCreditCard className="feature-icon" />,
  ];

  const features = t("about.features", { returnObjects: true });

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/static-pages/about`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );
        if (response.data?.status === 200) {
          setPageData(response.data.data || null);
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, [i18n.language]);

  return (
    <>
      <PageHead header={t("aboutus")} />

      <section className="about-us-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 about-content">
              <h6>{t("aboutus")}</h6>
              <h2>{pageData?.title || t("about.title")}</h2>

              {loading ? (
                <div className="about-skeleton">
                  <div className="skeleton-line mb-3"></div>
                  <div className="skeleton-line mb-3"></div>
                  <div className="skeleton-line mb-3"></div>
                </div>
              ) : (
                <div className="about-description">
                  {pageData?.description ? (
                    <p>{pageData.description}</p>
                  ) : (
                    <>
                      <p>{t("about.paragraph1")}</p>
                      <p>{t("about.paragraph2")}</p>
                    </>
                  )}
                </div>
              )}

              <div className="about-features">
                <p>{t("about.featuresTitle")}</p>
                <ul>
                  {features.map((text, index) => (
                    <li key={index}>
                      {icons[index]}
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-6 about-image">
              <img
                src={pageData?.image || aboutus}
                alt={pageData?.title || t("aboutus")}
                onError={(e) => {
                  e.target.src = aboutus;
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <Features />
    </>
  );
}
