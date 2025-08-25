import React, { useState, useEffect } from "react";
import FliterPageHead from "../../component/FliterPageHead/FliterPageHead";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import styles from "./FilterProducts.module.css";
import { Link } from "react-router-dom";

export default function FilterProducts() {
  const { t, i18n } = useTranslation("global");
  const [searchParams] = useSearchParams();
  const isRTL = i18n.language === "ar";

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const categoryId = searchParams.get("category_id");
  const market = searchParams.get("market");

  // Fetch services based on category and market
  useEffect(() => {
    if (categoryId && market === "service") {
      fetchServices();
    }
  }, [categoryId, market]);

  const fetchServices = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/services/allServicesByCategory?category_id=${categoryId}&page=${page}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data.status === 200) {
        setServices(response.data.data.data || []);
        setPagination(response.data.data.pagination || {});
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchServices(page);
  };

  // Helper function to get display value for location fields
  const getDisplayValue = (field) => {
    return field?.name || field || "";
  };

  if (!categoryId || market !== "service") {
    return (
      <div className="container py-5 text-center">
        <h4>Invalid request</h4>
        <p>Please select a valid service category.</p>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={styles.filterPage}>
      <div className="container">
        <div className="row">
          {/* Sidebar Filters */}
          <div className={`col-lg-3 p-3 ${styles.filtersBox}`}>
            <div className={styles.filterBlock}>
              <h6>{t("filter.sortby")}</h6>
              <select className={`form-select ${styles.filterSelect}`}>
                <option>{t("sort.latest")}</option>
                <option>{t("sort.lowest")}</option>
                <option>{t("sort.highest")}</option>
                <option>{t("sort.topRated")}</option>
              </select>
            </div>

            <div className={styles.filterBlock}>
              <h6>{t("filter.price")}</h6>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  className={`form-control ${styles.priceInput}`}
                  placeholder={t("filter.from")}
                />
                <input
                  type="number"
                  className={`form-control ${styles.priceInput}`}
                  placeholder={t("filter.to")}
                />
              </div>
            </div>

            <div className={styles.filterBlock}>
              <h6>{t("filter.governorate")}</h6>
              <select className={`form-select ${styles.filterSelect}`}>
                <option>{t("cities.cairo")}</option>
                <option>{t("cities.giza")}</option>
                <option>{t("cities.alex")}</option>
                <option>{t("cities.mansoura")}</option>
              </select>
            </div>
          </div>

          {/* Services Cards */}
          <div className="col-lg-9 p-3">
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">{t("settings.loading")}</p>
              </div>
            ) : services.length > 0 ? (
              <>
                <div className={styles.servicesGrid}>
                  {services.map((service) => (
                    <div key={service.id} className={styles.serviceCard}>
                      <Link
                        to={`/servicedetails/${service.id}`}
                        className={styles.serviceLink}
                      >
                        <div className={styles.card}>
                          <div className={styles.imageContainer}>
                            <img
                              src={service.main_image}
                              alt={service.name}
                              className={styles.serviceImage}
                              onError={(e) => {
                                e.target.src = "/categories/1.png"; // Fallback image
                              }}
                            />
                          </div>
                          <div className={styles.cardContent}>
                            <h6 className={styles.serviceTitle}>
                              {service.name}
                            </h6>
                            <p className={styles.serviceDescription}>
                              {service.description}
                            </p>
                            <div className={styles.serviceFooter}>
                              <span className={styles.servicePrice}>
                                {service.price} {t("products.currency")}
                              </span>
                              <small className={styles.serviceLocation}>
                                {getDisplayValue(service.country)} -{" "}
                                {getDisplayValue(service.governorate)}
                              </small>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <div className={styles.paginationContainer}>
                    <nav>
                      <ul className="pagination">
                        <li
                          className={`page-item ${
                            pagination.current_page === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              handlePageChange(pagination.current_page - 1)
                            }
                            disabled={pagination.current_page === 1}
                          >
                            {t("settings.previous")}
                          </button>
                        </li>
                        {Array.from(
                          { length: pagination.last_page },
                          (_, i) => i + 1
                        ).map((page) => (
                          <li
                            key={page}
                            className={`page-item ${
                              page === pagination.current_page ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            pagination.current_page === pagination.last_page
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              handlePageChange(pagination.current_page + 1)
                            }
                            disabled={
                              pagination.current_page === pagination.last_page
                            }
                          >
                            {t("settings.next")}
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <p className="text-muted">
                  No services found in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
