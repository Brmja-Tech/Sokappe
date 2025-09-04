import React, { useState, useEffect, useCallback } from "react";
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
  const [serviceRatings, setServiceRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    min_price: "",
    delivery_days: "",
    country_id: "",
    governorate_id: "",
  });

  // Filter data states
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const categoryId = searchParams.get("category_id");
  const market = searchParams.get("market");

  // Fetch countries
  const fetchCountries = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/countries`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data?.status === 200) {
        setCountries(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  }, [i18n.language]);

  // Fetch governorates
  const fetchGovernorates = useCallback(
    async (countryId) => {
      if (!countryId) {
        setGovernorates([]);
        return;
      }

      try {
        setLoadingFilters(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/governorates`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
            params: {
              country_id: countryId,
            },
          }
        );

        if (response.data?.status === 200) {
          setGovernorates(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching governorates:", error);
        setGovernorates([]);
      } finally {
        setLoadingFilters(false);
      }
    },
    [i18n.language]
  );

  // Fetch service ratings
  const fetchServiceRatings = useCallback(
    async (serviceIds) => {
      if (!serviceIds || serviceIds.length === 0) return;

      try {
        const token = localStorage.getItem("token");
        const ratingPromises = serviceIds.map(async (serviceId) => {
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_BASE_URL}/ratings/services/${serviceId}`,
              {
                headers: {
                  Accept: "application/json",
                  "Accept-Language": i18n.language,
                  ...(token && { Authorization: `Bearer ${token}` }),
                },
              }
            );
            return {
              serviceId,
              rating: response.data.data?.average_rating || 0,
            };
          } catch (error) {
            console.error(
              `Error fetching rating for service ${serviceId}:`,
              error
            );
            return { serviceId, rating: 0 };
          }
        });

        const ratings = await Promise.all(ratingPromises);
        const ratingsMap = {};
        ratings.forEach(({ serviceId, rating }) => {
          ratingsMap[serviceId] = rating;
        });
        setServiceRatings(ratingsMap);
      } catch (error) {
        console.error("Error fetching service ratings:", error);
      }
    },
    [i18n.language]
  );

  const fetchServices = useCallback(
    async (page = 1, filterParams = {}) => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = {
          page,
          category_id: categoryId,
          ...filterParams,
        };

        // Remove empty values
        Object.keys(queryParams).forEach((key) => {
          if (
            queryParams[key] === "" ||
            queryParams[key] === null ||
            queryParams[key] === undefined
          ) {
            delete queryParams[key];
          }
        });

        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/filters/services`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
            params: queryParams,
          }
        );

        if (response.data.status === 200) {
          const servicesData = response.data.data.data || [];
          setServices(servicesData);

          // Handle pagination
          const meta = response.data.data.meta;
          if (meta) {
            setPagination({
              current_page: meta.current_page || 1,
              last_page: meta.last_page || 1,
              total: meta.total || servicesData.length,
            });
          } else {
            setPagination({
              current_page: 1,
              last_page: 1,
              total: servicesData.length,
            });
          }

          // Fetch ratings for all services
          const serviceIds = servicesData.map((service) => service.id);
          if (serviceIds.length > 0) {
            fetchServiceRatings(serviceIds);
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]);
        setPagination({
          current_page: 1,
          last_page: 1,
          total: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    [categoryId, i18n.language, fetchServiceRatings]
  );

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));

    // If country changes, reset governorate
    if (filterName === "country_id") {
      setFilters((prev) => ({
        ...prev,
        country_id: value,
        governorate_id: "",
      }));
      fetchGovernorates(value);
    }
  };

  // Apply filters
  const applyFilters = () => {
    fetchServices(1, filters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = {
      min_price: "",
      delivery_days: "",
      country_id: "",
      governorate_id: "",
    };
    setFilters(clearedFilters);
    setGovernorates([]);
    fetchServices(1, clearedFilters);
  };

  // Fetch services based on category and market
  useEffect(() => {
    if (categoryId && market === "service") {
      fetchCountries();
      fetchServices();
    }
  }, [categoryId, market, fetchServices, fetchCountries]);

  const handlePageChange = (page) => {
    fetchServices(page, filters);
  };

  // Helper function to get display value for location fields
  const getDisplayValue = (field) => {
    return field?.name || field || "";
  };

  if (!categoryId || market !== "service") {
    return (
      <div className="container py-5 text-center">
        <h4>{t("filter.invalidRequest")}</h4>
        <p>{t("filter.selectValidCategory")}</p>
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
              <h6>{t("filterProducts.minPrice")}</h6>
              <input
                type="number"
                className={`form-control ${styles.priceInput}`}
                placeholder={t("filterProducts.minPrice")}
                value={filters.min_price}
                onChange={(e) =>
                  handleFilterChange("min_price", e.target.value)
                }
              />
            </div>

            <div className={styles.filterBlock}>
              <h6>{t("filterProducts.deliveryDays")}</h6>
              <input
                type="number"
                className={`form-control ${styles.priceInput}`}
                placeholder={t("filterProducts.deliveryDays")}
                value={filters.delivery_days}
                onChange={(e) =>
                  handleFilterChange("delivery_days", e.target.value)
                }
              />
            </div>

            <div className={styles.filterBlock}>
              <h6>{t("filterProducts.country")}</h6>
              <select
                className={`form-select ${styles.filterSelect}`}
                value={filters.country_id}
                onChange={(e) =>
                  handleFilterChange("country_id", e.target.value)
                }
              >
                <option value="">{t("filterProducts.allCountries")}</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterBlock}>
              <h6>{t("filterProducts.governorate")}</h6>
              <select
                className={`form-select ${styles.filterSelect}`}
                value={filters.governorate_id}
                onChange={(e) =>
                  handleFilterChange("governorate_id", e.target.value)
                }
                disabled={!filters.country_id || loadingFilters}
              >
                <option value="">{t("filterProducts.allGovernorates")}</option>
                {governorates.map((governorate) => (
                  <option key={governorate.id} value={governorate.id}>
                    {governorate.name}
                  </option>
                ))}
              </select>
              {loadingFilters && (
                <div className={styles.loadingSpinner}>
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Actions */}
            <div className={styles.filterActions}>
              <button className={styles.applyFiltersBtn} onClick={applyFilters}>
                <i className="bi bi-search me-2"></i>
                {t("filterProducts.applyFilters")}
              </button>
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                <i className="bi bi-x-circle me-2"></i>
                {t("filterProducts.clearFilters")}
              </button>
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
                            {/* Service Rating Badge */}
                            {serviceRatings[service.id] > 0 && (
                              <div className={styles.ratingBadge}>
                                <i className="bi bi-star-fill"></i>
                                <span>
                                  {serviceRatings[service.id].toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className={styles.cardContent}>
                            <h6 className={styles.serviceTitle}>
                              {service.name}
                            </h6>
                            <p className={styles.serviceDescription}>
                              {service.description}
                            </p>
                            <div className={styles.serviceFooter}>
                              <div className={styles.priceSection}>
                                {service.discount_price &&
                                service.discount_price !== "0.00" ? (
                                  <div className={styles.priceWithDiscount}>
                                    <span className={styles.originalPrice}>
                                      {parseFloat(
                                        service.price
                                      ).toLocaleString()}{" "}
                                      {t("products.currency")}
                                    </span>
                                    <span className={styles.discountPrice}>
                                      {parseFloat(
                                        service.discount_price
                                      ).toLocaleString()}{" "}
                                      {t("products.currency")}
                                    </span>
                                  </div>
                                ) : (
                                  <span className={styles.servicePrice}>
                                    {parseFloat(service.price).toLocaleString()}{" "}
                                    {t("products.currency")}
                                  </span>
                                )}
                              </div>
                              <div className={styles.serviceInfo}>
                                <small className={styles.serviceLocation}>
                                  {getDisplayValue(service.country)} -{" "}
                                  {getDisplayValue(service.governorate)}
                                </small>
                                {service.delivery_days && (
                                  <small className={styles.deliveryDays}>
                                    <i className="bi bi-clock me-1"></i>
                                    {service.delivery_days}{" "}
                                    {t("filterProducts.days")}
                                  </small>
                                )}
                              </div>
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
                <p className="text-muted">{t("filter.noServicesFound")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
