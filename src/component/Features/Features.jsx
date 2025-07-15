import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./Features.css";

const Features = () => {
  const { t, i18n } = useTranslation("global");

  // Counter setup
  const trustRef = useRef();
  const [count, setCount] = useState(0);

 useEffect(() => {
  let observer;

  const handleCount = () => {
    let current = 0;
    const end = 999;
    const duration = 1000;
    const increment = Math.ceil(end / (duration / 30));

    const interval = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(interval);
      }
      setCount(current);
    }, 30);
  };

  if (trustRef.current) {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleCount();
        } else {
          setCount(0); // reset when out of view
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(trustRef.current);
  }

  return () => {
    if (observer && trustRef.current) {
      observer.unobserve(trustRef.current);
    }
  };
}, []);


  return (
    <div className="features py-5">
      <div className="container">
        <div className="row">
          <div className="col-xl-5 col-lg-5 col-md-5 col-12">
            <div className="images">
              <div>
                <div className="div1"></div>
                <div className="dotted"></div>
              </div>
              <div>
                <div className="div2"></div>
                <div className="trust" ref={trustRef}>
                  <div className="icon">
                    <img
                      src="/group.png"
                      alt={t("features.fromCustomerTrust")}
                    />
                  </div>
                  <b className="text-white my-2">{count}+</b>
                  <h5 className="text-white my-2 text-md mb-0">
                    {t("features.fromCustomerTrust")}
                  </h5>
                </div>
                <div className="overlay"></div>
              </div>
            </div>
          </div>

          <div className="col-xl-7 col-lg-7 col-md-7 col-12">
            <h4 className="mb-4 main-color title"><img src="/list.gif" alt="--"/> {t("features.platformFeatures")}</h4>

            <ul className="nav nav-tabs p-0" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="commissionSystem-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#commissionSystem"
                  type="button"
                  role="tab"
                  aria-controls="commissionSystem"
                  aria-selected="true"
                >
                  {t("features.commissionSystem")}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="livePreview-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#livePreview"
                  type="button"
                  role="tab"
                  aria-controls="livePreview"
                  aria-selected="false"
                >
                  {t("features.livePreview")}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="guarantees-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#guarantees"
                  type="button"
                  role="tab"
                  aria-controls="guarantees"
                  aria-selected="false"
                >
                  {t("features.guarantees")}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="easierMarketing-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#easierMarketing"
                  type="button"
                  role="tab"
                  aria-controls="easierMarketing"
                  aria-selected="false"
                >
                  {t("features.easierMarketing")}
                </button>
              </li>
            </ul>

            <div className="tab-content" id="myTabContent">
              <div
                className="tab-pane fade show active p-3"
                id="commissionSystem"
                role="tabpanel"
                aria-labelledby="commissionSystem-tab"
              >
                <p className="line-height text-sm gray-color">
                  {t("features.marketingDescription")}
                </p>
              </div>
              <div
                className="tab-pane fade p-3"
                id="livePreview"
                role="tabpanel"
                aria-labelledby="livePreview-tab"
              >
                <p className="line-height text-sm gray-color">
                  {t("features.marketingDescription")}
                </p>
              </div>
              <div
                className="tab-pane fade p-3"
                id="guarantees"
                role="tabpanel"
                aria-labelledby="guarantees-tab"
              >
                <p className="line-height text-sm gray-color">
                  {t("features.marketingDescription")}
                </p>
              </div>
              <div
                className="tab-pane fade p-3"
                id="easierMarketing"
                role="tabpanel"
                aria-labelledby="easierMarketing-tab"
              >
                <p className="line-height text-sm gray-color">
                  {t("features.marketingDescription")}
                </p>
              </div>
            </div>

            <ul className="list-unstyled ul-list p-0 my-5">
              <li>
                <i className="bi bi-check-circle-fill main-color"></i>{" "}
                <span className="gray-color text-sm">----------</span>
              </li>
              <li>
                <i className="bi bi-check-circle-fill main-color"></i>{" "}
                <span className="gray-color text-sm">----------</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
