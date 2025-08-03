import React from 'react';
import "./AboutUS.css";
import PageHead from '../../component/PageHead/PageHead';
import { useTranslation } from 'react-i18next';
import aboutus from "../../assests/imgs/image 6.svg";
import { FaShoppingCart, FaHeadset, FaExchangeAlt, FaCreditCard } from 'react-icons/fa';
import Features from '../../component/Features/Features';

export default function AboutUS() {
  const { t, i18n } = useTranslation("global");

  // قائمة الأيقونات فقط، النصوص تأتي من ملفات الترجمة
  const icons = [
    <FaShoppingCart className="feature-icon" />,
    <FaHeadset className="feature-icon" />,
    <FaExchangeAlt className="feature-icon" />,
    <FaCreditCard className="feature-icon" />
  ];

  const features = t("about.features", { returnObjects: true });

  return (
    <>
      <PageHead header={t("aboutus")} />

      <section className='about-us-section'>
        <div className="container">
          <div className="row">
            <div className="col-lg-6 about-content">
              <h6>{t("aboutus")}</h6>
              <h2>{t("about.title")}</h2>
              <p>{t("about.paragraph1")}</p>
              <p>{t("about.paragraph2")}</p>

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
              <img src={aboutus} alt={t("aboutus")} />
            </div>
          </div>
        </div>
      </section>

      <Features/>

    </>
  );
}
