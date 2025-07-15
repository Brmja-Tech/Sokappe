import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaLinkedin, FaBehance, FaFacebook, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
const Footer = () => {
  const { t } = useTranslation("global");
   const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
  const updateTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  };

  window.addEventListener("storage", updateTheme);

  return () => {
    window.removeEventListener("storage", updateTheme);
  };
}, []);
  return (
    <div className="footer pt-5 pb-2">
      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-lg-3 col-md-6">
            <div className="logo">
              <Link className="text-white">
                <h4>Sokappe</h4>
              </Link>
            </div>
            <p className="line-height">{t("footer.aboutPlatform")}</p>
            <div className="flex_contact d-flex my-2">
              <div className="d-block">
                <i className="bi bi-chat-text-fill"></i>
              </div>
              <div className="mx-2 d-block">
                <span className="d-block">{t("footer.support")}</span>
                <small className="d-block text-sm">info@gmail.com</small>
              </div>
            </div>
            <div className="flex_contact d-flex my-2">
              <div className="d-block">
                <i className="bi bi-telephone-fill"></i>
              </div>
              <div className="mx-2 d-block">
                <span className="d-block">{t("footer.contact")}</span>
                <small className="d-block text-sm">755. 002. 3005. 905</small>
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
                  <Link>{t("footer.terms")}</Link>
                </li>
                <li className="mb-2">
                  <Link>{t("footer.privacy")}</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6">
            <div className="links">
              <b className="d-block">{t("footer.socialMedia")}</b>
              <ul className="list-unstyled p-0">
                <li className="mb-2">
                  <Link>
                    <FaXTwitter className="me-2 mx-2" />
                    {t("footer.social.twitter")}
                  </Link>
                </li>
                <li className="mb-2">
                  <Link>
                    <FaLinkedin className="me-2 mx-2" />
                    {t("footer.social.linkedin")}
                  </Link>
                </li>
                <li className="mb-2">
                  <Link>
                    <FaBehance className="me-2 mx-2" />
                    {t("footer.social.behance")}
                  </Link>
                </li>
                <li className="mb-2">
                  <Link>
                    <FaFacebook className="me-2 mx-2" />
                    {t("footer.social.facebook")}
                  </Link>
                </li>
                <li className="mb-2">
                  <Link>
                    <FaYoutube className="me-2 mx-2" />
                    {t("footer.social.youtube")}
                  </Link>
                </li>
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
