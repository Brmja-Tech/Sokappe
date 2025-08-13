import React, { useState, useEffect } from "react";
import "../OfferRequestService/OfferRequestService.css";
import PageHead from "../../component/PageHead/PageHead";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import icon1 from "../../assests/imgs/Frame 1410103977.svg";
import icon2 from "../../assests/imgs/Frame 1410103976.svg";

export default function OfferRequestService() {
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

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
        setIsAuthenticated(false);
        setUserData(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserData(null);
    }
  };

  const handleButtonClick = (action, type) => {
    if (!isAuthenticated) {
      // Guest mode - redirect to create account
      navigate("/createaccount");
      return;
    }

    if (userData.type === "individual") {
      // Individual user - redirect to register to convert to individual_vendor
      navigate("/register");
      return;
    }

    // For company and individual_vendor users
    if (action === "sell" && type === "service") {
      navigate("/addservice");
    } else if (action === "sell" && type === "product") {
      navigate("/addproduct"); // Placeholder route
    } else if (action === "buy" && type === "service") {
      navigate("/requestservice");
    } else if (action === "buy" && type === "product") {
      navigate("/requestproduct"); // Placeholder route
    }
  };

  const shouldShowButton = (action, type) => {
    if (!isAuthenticated || userData?.type === "individual") {
      return true; // Show all buttons for guests and individual users
    }

    if (userData.type === "individual_vendor") {
      if (userData.account_type === "physical") {
        // Physical accounts: show only product buttons
        return type === "product";
      } else if (userData.account_type === "service") {
        // Service accounts: show only service buttons
        return type === "service";
      }
    }

    if (userData.type === "company") {
      // Company users: hide all buy buttons, show only sell buttons based on account_type
      if (action === "buy") {
        return false; // Hide all buy buttons for company users
      }

      if (userData.account_type === "physical") {
        // Physical accounts: show only product sell buttons
        return type === "product";
      } else if (userData.account_type === "service") {
        // Service accounts: show only service sell buttons
        return type === "service";
      }
    }

    return true;
  };

  return (
    <>
      <PageHead header={t("ads.services")} />
      <div className="section-OfferRequestService">
        <div className="container">
          <h5 className="text-center mb-5">{t("OfferRequestService.title")}</h5>

          <div className="row justify-content-center align-items-center g-4">
            <div className="col-lg-6">
              <div className="service-card">
                <div className="card-icon">
                  <img
                    src={icon1}
                    alt={t("OfferRequestService.offerIconAlt")}
                  />
                </div>
                <h5>{t("OfferRequestService.offerTitle")}</h5>
                <p className="highlight-text">
                  {t("OfferRequestService.clientsReady")}
                </p>
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  {shouldShowButton("buy", "service") && (
                    <button
                      onClick={() => handleButtonClick("buy", "service")}
                      className="service-btn mx-2"
                    >
                      {t("OfferRequestService.buyService")}
                    </button>
                  )}

                  {shouldShowButton("sell", "service") && (
                    <button
                      onClick={() => handleButtonClick("sell", "service")}
                      className="service-btn mx-2"
                    >
                      {t("OfferRequestService.sellService")}
                    </button>
                  )}

                  {shouldShowButton("buy", "product") && (
                    <button
                      onClick={() => handleButtonClick("buy", "product")}
                      className="service-btn mx-2"
                    >
                      {t("OfferRequestService.buyProduct")}
                    </button>
                  )}

                  {shouldShowButton("sell", "product") && (
                    <button
                      onClick={() => handleButtonClick("sell", "product")}
                      className="service-btn mx-2"
                    >
                      {t("OfferRequestService.sellProduct")}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* الكارت الثانية */}
            <div className="col-lg-6">
              <div className="service-card">
                <div className="card-icon">
                  <img
                    src={icon2}
                    alt={t("OfferRequestService.requestIconAlt")}
                  />
                </div>
                <h5>{t("OfferRequestService.requestTitle")}</h5>
                <p className="highlight-text">
                  {t("OfferRequestService.clientsReady")}
                </p>
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  {shouldShowButton("buy", "service") && (
                    <button
                      onClick={() => handleButtonClick("buy", "service")}
                      className="service-btn mx-2"
                    >
                      {t("OfferRequestService.buyService")}
                    </button>
                  )}

                  {shouldShowButton("sell", "service") && (
                    <button
                      onClick={() => handleButtonClick("sell", "service")}
                      className="service-btn mx-2"
                    >
                      {t("OfferRequestService.sellService")}
                    </button>
                  )}

                  {shouldShowButton("buy", "product") && (
                    <button
                      onClick={() => handleButtonClick("buy", "product")}
                      className="service-btn mx-2"
                    >
                      {t("OfferRequestService.buyProduct")}
                    </button>
                  )}

                  {shouldShowButton("sell", "product") && (
                    <button
                      onClick={() => handleButtonClick("sell", "product")}
                      className="service-btn mx-2"
                    >
                      {t("OfferRequestService.sellProduct")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
