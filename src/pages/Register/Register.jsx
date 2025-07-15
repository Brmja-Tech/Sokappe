import React, { useState } from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation("global");
  const [tab, setTab] = useState("individual");

  const ageOptions = [
    { value: "1", label: "50" },
    { value: "2", label: "40" },
  ];
  const jobTitleOptions = [
    { value: "1", label: "-" },
    { value: "2", label: "-" },
  ];
  const companyTypeOptions = [
    { value: "1", label: "-" },
    { value: "2", label: "-" },
  ];

  return (
    <div
      className="registration_forms h-auto py-4"
      style={{ backgroundImage: "url('/register-bg.jpg')" }}
    >
      <div className="register_div">
        <div className="container">
          <img className="logo mb-4" src="/logo-white.png" alt="logo" />

          {/* Segmented Tabs */}
          <div className="flight-types">
            <input
              type="radio"
              id="individual"
              name="register-tab"
              checked={tab === "individual"}
              onChange={() => setTab("individual")}
            />
            <label htmlFor="individual">{t("sign.individual")}</label>

            <input
              type="radio"
              id="company"
              name="register-tab"
              checked={tab === "company"}
              onChange={() => setTab("company")}
            />
            <label htmlFor="company">{t("sign.company")}</label>

            {/* Highlight background effect */}
            <div className="slider"></div>
          </div>

          {/* Form Logic */}
          {tab === "individual" ? (
            <form>
              <div className="row">
                <div className="col-md-6">
                  <label>{t("profile.name")}</label>
                  <input type="text" placeholder={t("profile.name")} />
                </div>
                <div className="col-md-6">
                  <label>{t("profile.age")}</label>
                  <Select
                    classNamePrefix="react-select"
                    options={ageOptions}
                    placeholder={t("profile.age")}
                  />
                </div>
                <div className="col-md-6">
                  <label>{t("profile.email")}</label>
                  <input type="email" placeholder={t("profile.email")} />
                </div>
                <div className="col-md-6">
                  <label>{t("profile.phone")}</label>
                  <input type="text" placeholder={t("profile.phone")} />
                </div>
                <div className="col-md-6">
                  <label>{t("sign.company_type")}</label>
                  <Select
                    classNamePrefix="react-select"
                    options={companyTypeOptions}
                    placeholder={t("sign.company_type")}
                  />
                </div>
                <div className="col-md-6">
                  <label>{t("profile.nationalId")}</label>
                  <input type="text" placeholder={t("profile.nationalId")} />
                </div>
                <div className="col-md-6">
                  <label>{t("sign.password")}</label>
                  <input
                    type="password"
                    autoComplete="off"
                    placeholder={t("sign.password")}
                  />
                </div>
                <div className="col-md-6">
                  <label>{t("sign.confirmPassword")}</label>
                  <input
                    type="password"
                    autoComplete="off"
                    placeholder={t("sign.confirmPassword")}
                  />
                </div>
                <div className="col-12">
                  <label>{t("profile.bio")}</label>
                  <textarea placeholder={t("profile.bio")}></textarea>
                </div>
              </div>
              <div className="text-center">
                <button type="submit">{t("sign.register")}</button>
              </div>
            </form>
          ) : (
            <form>
              <div className="row">
                <div className="col-md-6">
                  <label>{t("sign.company_name")}</label>
                  <input type="text" placeholder={t("sign.company_name")} />
                </div>
                <div className="col-md-6">
                  <label>{t("sign.account_username")}</label>
                  <input type="text" placeholder={t("sign.account_username")} />
                </div>
                <div className="col-md-6">
                  <label>{t("profile.email")}</label>
                  <input type="email" placeholder={t("profile.email")} />
                </div>
                <div className="col-md-6">
                  <label>{t("profile.phone")}</label>
                  <input type="text" placeholder={t("profile.phone")} />
                </div>
                <div className="col-md-6">
                  <label>{t("profile.jobTitle")}</label>
                  <Select
                    classNamePrefix="react-select"
                    options={jobTitleOptions}
                    placeholder={t("profile.jobTitle")}
                  />
                </div>
                <div className="col-md-6">
                  <label>{t("profile.nationalId")}</label>
                  <input type="text" placeholder={t("profile.nationalId")} />
                </div>
                <div className="col-md-6">
                  <label>{t("sign.password")}</label>
                  <input
                    type="password"
                    autoComplete="off"
                    placeholder={t("sign.password")}
                  />
                </div>
                <div className="col-md-6">
                  <label>{t("sign.confirmPassword")}</label>
                  <input
                    type="password"
                    autoComplete="off"
                    placeholder={t("sign.confirmPassword")}
                  />
                </div>
                <div className="col-12">
                  <label>{t("profile.bio")}</label>
                  <textarea placeholder={t("profile.bio")}></textarea>
                </div>
              </div>
              <div className="text-center">
                <button type="submit">{t("sign.register")}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;