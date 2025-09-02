import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaFacebook, FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import logo from "../assests/imgs/logo.svg";

const Footer = () => {
  const { t } = useTranslation("global");
  const [companyInfo, setCompanyInfo] = useState({
    company_name: "BrmajTech",
    address: "Cairo, Egypt",
    email: "info@brmajtech.com",
    phone: "+201012345678",
    whatsapp_number: "+201234567890",
    facebook: "https://facebook.com/brmajtech",
    instagram: "https://instagram.com/brmajtech",
    twitter: "https://twitter.com/brmajtech",
    tiktok: "https://tiktok.com/@brmajtech",
    youtube: "https://youtube.com/brmajtech",
  });

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch("/company-info");
        const result = await response.json();

        if (result.status === 200) {
          setCompanyInfo(result.data);
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
      }
    };

    fetchCompanyInfo();
  }, []);
  return (
    <div className="footer pt-5 pb-2">
      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-lg-3 col-md-6">
            <div className="logo">
              <Link className="text-white">
                <img src={logo} style={{ width: "100px" }} alt="logo" />
              </Link>
            </div>
            <p className="line-height">{t("footer.aboutPlatform")}</p>
            <div className="flex_contact d-flex my-2">
              <div className="d-block">
                <i className="bi bi-chat-text-fill"></i>
              </div>
              <div className="mx-2 d-block">
                <span className="d-block">{t("footer.support")}</span>
                <small className="d-block text-sm">{companyInfo.email}</small>
              </div>
            </div>
            <div className="flex_contact d-flex my-2">
              <div className="d-block">
                <i className="bi bi-telephone-fill"></i>
              </div>
              <div className="mx-2 d-block">
                <span className="d-block">{t("footer.contact")}</span>
                <small className="d-block text-sm">{companyInfo.phone}</small>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6">
            <div className="links">
              <b className="d-block">{t("footer.quickLinks")}</b>
              <ul className="list-unstyled p-0">
                <li className="mb-2">
                  <Link>{t("footer.home")}</Link>
                </li>
                <li className="mb-2">
                  <Link>{t("footer.services")}</Link>
                </li>
                <li className="mb-2">
                  <Link>{t("footer.categories")}</Link>
                </li>
                <li className="mb-2">
                  <Link>{t("footer.aboutUs")}</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6">
            <div className="links">
              <b className="d-block">{t("footer.myAccount")}</b>
              <ul className="list-unstyled p-0">
                <li className="mb-2">
                  <Link to="/terms">{t("footer.terms")}</Link>
                </li>
                <li className="mb-2">
                  <Link to="/privacy">{t("footer.privacy")}</Link>
                </li>
                <li className="mb-2">
                  <Link to="/faq">{t("footer.faq")}</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6">
            <div className="links">
              <b className="d-block">{t("footer.socialMedia")}</b>
              <ul className="list-unstyled p-0">
                {companyInfo.twitter && (
                  <li className="mb-2">
                    <Link
                      to={companyInfo.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaXTwitter className="me-2 mx-2" />
                      {t("footer.social.twitter")}
                    </Link>
                  </li>
                )}
                {companyInfo.facebook && (
                  <li className="mb-2">
                    <Link
                      to={companyInfo.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFacebook className="me-2 mx-2" />
                      {t("footer.social.facebook")}
                    </Link>
                  </li>
                )}
                {companyInfo.instagram && (
                  <li className="mb-2">
                    <Link
                      to={companyInfo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaInstagram className="me-2 mx-2" />
                      {t("footer.social.instagram")}
                    </Link>
                  </li>
                )}
                {companyInfo.youtube && (
                  <li className="mb-2">
                    <Link
                      to={companyInfo.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaYoutube className="me-2 mx-2" />
                      {t("footer.social.youtube")}
                    </Link>
                  </li>
                )}
                {companyInfo.tiktok && (
                  <li className="mb-2">
                    <Link
                      to={companyInfo.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaTiktok className="me-2 mx-2" />
                      {t("footer.social.tiktok")}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright py-2 text-sm text-center">
        <span>
          &copy; {new Date().getFullYear()} {t("footer.copyright")}
        </span>{" "}
        <a
          href="https://brmja.tech/"
          style={{ color: "orange" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("footer.poweredBy")}
        </a>
      </div>
    </div>
  );
};

export default Footer;
