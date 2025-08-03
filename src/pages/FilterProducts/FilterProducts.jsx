import React from 'react';
import FliterPageHead from '../../component/FliterPageHead/FliterPageHead';
import { useTranslation } from 'react-i18next';
import '../FilterProducts/FilterProducts.css';
import latop from "../../assests/imgs/22.svg";
import icon from "../../assests/imgs/Vector.svg";
import chat from "../../assests/imgs/fluent_chat-24-filled.svg";
import heart from "../../assests/imgs/heart.svg";
import { Link } from 'react-router-dom';

export default function FilterProducts() {
    const { t, i18n } = useTranslation("global");
    const isRTL = i18n.language === 'ar';

    return (
        <div dir={isRTL ? "rtl" : "ltr"}>
            <FliterPageHead services={t("products.newmarket")} flitercategory={t("products.latop")} />

            <div className="tabs-container d-flex justify-content-start flex-wrap px-4 py-3">
                {["latop", "computer", "printers", "parts", "modem", "accessories", "monitors"].map((tabKey, i) => (
                    <button className="tab" key={i}>
                        {t(`tabs.${tabKey}`)}
                    </button>
                ))}
            </div>

            <div className="container">
                <div className="row">
                    {/* Sidebar Filters */}
                    <div className="col-lg-3 p-3 filters-box">
                        <div className="filter-block">
                            <h6>{t("filter.sortby")}</h6>
                            <select className="form-select">
                                <option>{t("sort.latest")}</option>
                                <option>{t("sort.lowest")}</option>
                                <option>{t("sort.highest")}</option>
                                <option>{t("sort.topRated")}</option>
                            </select>
                        </div>

                        <div className="filter-block">
                            <h6>{t("filter.categories")}</h6>
                            {["latop", "accessories", "phones"].map((cat, i) => (
                                <div className="form-check" key={i}>
                                    <input className="form-check-input" type="checkbox" id={`cat${i}`} />
                                    <label className="form-check-label" htmlFor={`cat${i}`}>
                                        {t(`categories.${cat}`)}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="filter-block">
                            <h6>{t("filter.governorate")}</h6>
                            <select className="form-select">
                                <option>{t("cities.cairo")}</option>
                                <option>{t("cities.giza")}</option>
                                <option>{t("cities.alex")}</option>
                                <option>{t("cities.mansoura")}</option>
                            </select>
                        </div>

                        <div className="filter-block">
                            <h6>{t("filter.price")}</h6>
                            <div className="d-flex gap-2">
                                <input type="number" className="form-control" placeholder={t("filter.from")} />
                                <input type="number" className="form-control" placeholder={t("filter.to")} />
                            </div>
                        </div>

                        <div className="filter-block">
                            <h6>{t("filter.brand")}</h6>
                            {["Apple", "Samsung", "Dell"].map((brand, i) => (
                                <div className="form-check" key={i}>
                                    <input className="form-check-input" type="checkbox" id={`brand${i}`} />
                                    <label className="form-check-label" htmlFor={`brand${i}`}>{brand}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Cards */}
                    <div className="col-lg-9 p-3">
                        <div className="row gy-4">
                            {Array(6).fill().map((_, i) => (
                                 <Link to="/productdetalis">
                                 <div className="col-12 product-card" key={i}>
                                    <div className="card flex-md-row flex-column align-items-center p-3 gap-3">
                                        <img src={latop} alt="product" className="product-img" />
                                        <div className="flex-grow-1 w-100">
                                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                                <h6 className="mb-1">{t("product.title")}</h6>
                                                <p className="text-muted small mb-1">{t("product.posted")}</p>
                                            </div>
                                            <div>
                                                <p>{t("product.details")}</p>
                                                <p className="bg-light p-2 rounded d-inline-flex align-items-center gap-2">
                                                    <img src={icon} alt="" /> {t("product.delivery")}
                                                </p>
                                                <p className="mb-2">{t("product.location")}</p>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="chat">
                                                        <p className="m-0 p-0 d-flex align-items-center gap-1">
                                                            <img src={chat} alt="" /> {t("product.chat")}
                                                        </p>
                                                    </div>
                                                    <div className="heart">
                                                        <img src={heart} alt="favorite" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h6 className="text-success">{t("product.price")}</h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </Link>
                               
                            ))}

                            {/* Pagination */}
                            <div className="d-flex justify-content-center mt-4">
                                <nav>
                                    <ul className="pagination">
                                        <li className="page-item active"><a className="page-link" href="#">1</a></li>
                                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
