import React from 'react'
import "../OfferRequestService/OfferRequestService.css"
import PageHead from '../../component/PageHead/PageHead'
import { useTranslation } from 'react-i18next'
import { Link } from "react-router-dom"
import icon1 from "../../assests/imgs/Frame 1410103977.svg";
import icon2 from "../../assests/imgs/Frame 1410103976.svg";

export default function OfferRequestService() {
  const { t, i18n } = useTranslation("global");
  return <>
  <PageHead header={t("ads.services")}/>
  <div className="section-OfferRequestService">
      <div className="container">
        <h5 className="text-center mb-5">{t("OfferRequestService.title")}</h5>
        
        <div className="row justify-content-center align-items-center g-4">
          {/* الكارت الأولى */}
          <div className="col-lg-6">
            <div className="service-card">
              <div className="card-icon">
                <img src={icon1} alt={t("OfferRequestService.offerIconAlt")} />
              </div>
              <h5>{t("OfferRequestService.offerTitle")}</h5>
              <p className="highlight-text">
                {t("OfferRequestService.clientsReady")}
              </p>
             <div className='d-flex justify-content-center'>
             <Link to="/" className="service-btn mx-2">
                {t("OfferRequestService.offerBtn")}
              </Link>

              <Link to="/requestservice" className="service-btn">
                {t("OfferRequestService.requestBtn")}
              </Link>

             </div>
            </div>
          </div>

          {/* الكارت الثانية */}
          <div className="col-lg-6">
            <div className="service-card">
              <div className="card-icon">
                <img src={icon2} alt={t("OfferRequestService.requestIconAlt")} />
              </div>
              <h5>{t("OfferRequestService.requestTitle")}</h5>
              <p className="highlight-text">
                {t("OfferRequestService.clientsReady")}
              </p>
              <div className='d-flex justify-content-center'>
             <Link to="/" className="service-btn mx-2">
                {t("OfferRequestService.offerBtn1")}
              </Link>

              <Link to="/requestservice" className="service-btn">
                {t("OfferRequestService.requestBtn1")}
              </Link>

             </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   
  
  </>
   
  
}
