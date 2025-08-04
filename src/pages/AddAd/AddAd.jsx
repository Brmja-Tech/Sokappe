import React from "react";
import PageHead from "../../component/PageHead/PageHead";
import { useTranslation } from "react-i18next";
import "./AddAd.css";
import { FiCamera, FiPlus } from "react-icons/fi";

export default function AddAd() {
  const { t } = useTranslation("global");
  
  return (
    <>
      <PageHead header={t("navbar.addAd")} />

      <section className="add-ad-section">
        <div className="container">
          <h1 className="add-ad-title">{t("addAd.title")}</h1>
          
          <div className="row">
            {[...Array(4)].map((_, index) => (
              <div className="col-lg-3 col-md-6 mb-4" key={index}>
                <div className="card-add-ad">
                  <div className="card-add-ad-body">
                    <div className="image-upload-container">
                      <FiCamera className="camera-icon" />
                      <p className="upload-text">{t("addAd.uploadImage")}</p>
                      <FiPlus className="plus-icon" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="file-input" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="col-lg-12 text-center">
              <button className="btn btn-primary btn-publish">
                {t("addAd.publishAd")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}