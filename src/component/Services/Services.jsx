import React from "react";
import { useTranslation } from "react-i18next";
import "./Services.css";
import { Link } from "react-router-dom";

const Services = () => {
  const { t, i18n } = useTranslation("global");
  const servicesCategories = [
    {
      id: 1,
      label: t("services.categories.cars"),
      link: "/",
      img: "/categories/1.png",
    },
    {
      id: 2,
      label: t("services.categories.realEstate"),
      link: "/",
      img: "/categories/2.png",
    },
    {
      id: 3,
      label: t("services.categories.mobilesTablets"),
      link: "/",
      img: "/categories/3.png",
    },
    {
      id: 4,
      label: t("services.categories.jobs"),
      link: "/",
      img: "/categories/4.png",
    },
    {
      id: 5,
      label: t("services.categories.business"),
      link: "/",
      img: "/categories/5.png",
    },
    {
      id: 6,
      label: t("services.categories.babyStuff"),
      link: "/",
      img: "/categories/6.png",
    },
    {
      id: 7,
      label: t("services.categories.furniture"),
      link: "/",
      img: "/categories/7.png",
    },
    {
      id: 8,
      label: t("services.categories.pets"),
      link: "/",
      img: "/categories/8.png",
    },
    {
      id: 9,
      label: t("services.categories.services"),
      link: "/",
      img: "/categories/9.png",
    },
    {
      id: 10,
      label: t("services.categories.hobbies"),
      link: "/",
      img: "/categories/10.png",
    },
    {
      id: 11,
      label: t("services.categories.fashion"),
      link: "/",
      img: "/categories/11.png",
    },
    {
      id: 12,
      label: t("services.categories.electronics"),
      link: "/",
      img: "/categories/12.png",
    },
  ];
  return (
    <div className="services py-5">
      <div className="container">
        <h4 className="mb-3 main-color text-center title"><img src="/shopping-list.gif" alt="--"/> {t("services.title")}</h4>
        <p className="mb-4 gray-color text-center">
          {t("services.yourFeedback")}
        </p>
        <div className="services_categories py-3">
          <div className="row">
            {servicesCategories.length >= 1 ? (
              servicesCategories.map((cat, index) => (
                <div
                  className="col-xl-3 col-lg-3 col-md-4 col-12"
                  key={cat.id || index}
                >
                  <Link className="category_card">
                    <div>
                      <img src={cat.img} alt={cat.label} />
                    </div>
                    <h5>{cat.label}</h5>
                  </Link>
                </div>
              ))
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
