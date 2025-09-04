import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import styles from "./FilterProductsPhysical.module.css";

const FilterProductsPhysical = () => {
  const { t, i18n } = useTranslation("global");
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });
  const [productRatings, setProductRatings] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    condition: "",
    has_warranty: "",
    has_delivery: "",
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

  // Fetch product ratings
  const fetchProductRatings = useCallback(
    async (productIds) => {
      try {
        const ratingPromises = productIds.map((productId) =>
          axios
            .get(
              `${process.env.REACT_APP_BASE_URL}/ratings/products/${productId}`,
              {
                headers: {
                  Accept: "application/json",
                  "Accept-Language": i18n.language,
                },
              }
            )
            .catch(() => ({ data: { data: { average_rating: 0 } } }))
        );

        const ratingResponses = await Promise.all(ratingPromises);
        const ratings = {};

        productIds.forEach((productId, index) => {
          const response = ratingResponses[index];
          if (response?.data?.status === 200) {
            ratings[productId] = response.data.data?.average_rating || 0;
          } else {
            ratings[productId] = 0;
          }
        });

        setProductRatings(ratings);
      } catch (error) {
        console.error("Error fetching product ratings:", error);
      }
    },
    [i18n.language]
  );

  const fetchProducts = useCallback(
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
          `${process.env.REACT_APP_BASE_URL}/filters/products`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
            params: queryParams,
          }
        );

        if (response.data.status === 200) {
          const productsData = response.data.data.data || [];
          setProducts(productsData);

          // Fetch ratings for products
          if (productsData.length > 0) {
            fetchProductRatings(productsData.map((product) => product.id));
          }

          // Handle pagination
          const meta = response.data.data.meta;
          if (meta) {
            setPagination({
              currentPage: meta.current_page || 1,
              lastPage: meta.last_page || 1,
              total: meta.total || productsData.length,
            });
          } else {
            setPagination({
              currentPage: 1,
              lastPage: 1,
              total: productsData.length,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setPagination({
          currentPage: 1,
          lastPage: 1,
          total: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    [categoryId, fetchProductRatings, i18n.language]
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
    fetchProducts(1, filters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = {
      min_price: "",
      max_price: "",
      condition: "",
      has_warranty: "",
      has_delivery: "",
      country_id: "",
      governorate_id: "",
    };
    setFilters(clearedFilters);
    setGovernorates([]);
    fetchProducts(1, clearedFilters);
  };

  useEffect(() => {
    if (categoryId && market === "physical") {
      fetchCountries();
      fetchProducts();
    }
  }, [categoryId, market, fetchProducts, fetchCountries]);

  const handlePageChange = (page) => {
    if (page && page > 0) {
      fetchProducts(page, filters);
    }
  };

  if (!categoryId || market !== "physical") {
    return (
      <div className={styles.invalidRequest}>
        <h3>{t("filterProducts.invalidRequest")}</h3>
        <p>{t("filterProducts.selectValidCategory")}</p>
      </div>
    );
  }

  return (
    <div className={styles.filterPage}>
      <div className="container">
        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-lg-3">
            <div className={styles.filtersBox}>
              <div className={styles.filterBlock}>
                <h6>{t("filterProducts.category")}</h6>
                <p className="text-muted">
                  {t("filterProducts.productsInCategory")}
                </p>
              </div>

              <div className={styles.filterBlock}>
                <h6>{t("filterProducts.priceRange")}</h6>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    placeholder={t("filterProducts.min")}
                    className={styles.priceInput}
                    value={filters.min_price}
                    onChange={(e) =>
                      handleFilterChange("min_price", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder={t("filterProducts.max")}
                    className={styles.priceInput}
                    value={filters.max_price}
                    onChange={(e) =>
                      handleFilterChange("max_price", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.filterBlock}>
                <h6>{t("filterProducts.condition")}</h6>
                <select
                  className={styles.filterSelect}
                  value={filters.condition}
                  onChange={(e) =>
                    handleFilterChange("condition", e.target.value)
                  }
                >
                  <option value="">{t("filterProducts.allConditions")}</option>
                  <option value="new">{t("filterProducts.new")}</option>
                  <option value="used">{t("filterProducts.used")}</option>
                </select>
              </div>

              <div className={styles.filterBlock}>
                <h6>{t("filterProducts.delivery")}</h6>
                <select
                  className={styles.filterSelect}
                  value={filters.has_delivery}
                  onChange={(e) =>
                    handleFilterChange("has_delivery", e.target.value)
                  }
                >
                  <option value="">{t("filterProducts.all")}</option>
                  <option value="1">{t("filterProducts.withDelivery")}</option>
                  <option value="0">
                    {t("filterProducts.withoutDelivery")}
                  </option>
                </select>
              </div>

              <div className={styles.filterBlock}>
                <h6>{t("filterProducts.warranty")}</h6>
                <select
                  className={styles.filterSelect}
                  value={filters.has_warranty}
                  onChange={(e) =>
                    handleFilterChange("has_warranty", e.target.value)
                  }
                >
                  <option value="">{t("filterProducts.all")}</option>
                  <option value="1">{t("filterProducts.withWarranty")}</option>
                  <option value="0">
                    {t("filterProducts.withoutWarranty")}
                  </option>
                </select>
              </div>

              <div className={styles.filterBlock}>
                <h6>{t("filterProducts.country")}</h6>
                <select
                  className={styles.filterSelect}
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
                  className={styles.filterSelect}
                  value={filters.governorate_id}
                  onChange={(e) =>
                    handleFilterChange("governorate_id", e.target.value)
                  }
                  disabled={!filters.country_id || loadingFilters}
                >
                  <option value="">
                    {t("filterProducts.allGovernorates")}
                  </option>
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
                <button
                  className={styles.applyFiltersBtn}
                  onClick={applyFilters}
                >
                  <i className="bi bi-search me-2"></i>
                  {t("filterProducts.applyFilters")}
                </button>
                <button
                  className={styles.clearFiltersBtn}
                  onClick={clearFilters}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  {t("filterProducts.clearFilters")}
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-lg-9">
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">
                  {t("filterProducts.loadingProducts")}
                </p>
              </div>
            ) : products && products.length > 0 ? (
              <>
                <div className={styles.productsGrid}>
                  {products.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                      <Link
                        to={`/productdetalis/${product.id}`}
                        className={styles.productLink}
                      >
                        <div className={styles.card}>
                          <div className={styles.imageContainer}>
                            <img
                              src={
                                product.main_image || "/placeholder-product.jpg"
                              }
                              alt={product.name || "Product"}
                              className={styles.productImage}
                              onError={(e) => {
                                e.target.src = "/placeholder-product.jpg";
                              }}
                            />

                            {/* Product Rating Badge */}
                            {productRatings[product.id] > 0 && (
                              <div className={styles.ratingBadge}>
                                <i className="bi bi-star-fill"></i>
                                <span>
                                  {productRatings[product.id].toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className={styles.cardContent}>
                            <h6 className={styles.productTitle}>
                              {product.name ||
                                t("filterProducts.unnamedProduct")}
                            </h6>
                            <p className={styles.productDescription}>
                              {product.description ||
                                t("filterProducts.noDescriptionAvailable")}
                            </p>

                            <div className={styles.productInfo}>
                              <div className={styles.productCondition}>
                                <span className={styles.conditionBadge}>
                                  {product.condition ||
                                    t("filterProducts.unknown")}
                                </span>
                              </div>

                              <div className={styles.productFeatures}>
                                {product.has_warranty === 1 ? (
                                  <span className={styles.featureBadge}>
                                    {t("filterProducts.warranty")}:{" "}
                                    {product.warranty_period ||
                                      t("filterProducts.available")}
                                  </span>
                                ) : (
                                  <span
                                    className={`${styles.featureBadge} ${styles.unavailable}`}
                                  >
                                    {t("filterProducts.noWarranty")}
                                  </span>
                                )}
                                {product.has_delivery === 1 ? (
                                  <span className={styles.featureBadge}>
                                    {t("filterProducts.deliveryAvailable")}
                                  </span>
                                ) : (
                                  <span
                                    className={`${styles.featureBadge} ${styles.unavailable}`}
                                  >
                                    {t("filterProducts.noDelivery")}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={styles.productFooter}>
                              <div className={styles.productPrice}>
                                {product.price || "0.00"}
                              </div>
                              <div className={styles.productLocation}>
                                {product.governorate?.name ||
                                  t("filterProducts.unknown")}
                                ,{" "}
                                {product.country?.name ||
                                  t("filterProducts.unknown")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.lastPage > 1 && (
                  <div className={styles.paginationContainer}>
                    <nav>
                      <ul className="pagination">
                        <li
                          className={`page-item ${
                            pagination && pagination.currentPage === 1
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              handlePageChange(
                                pagination && pagination.currentPage
                                  ? pagination.currentPage - 1
                                  : 1
                              )
                            }
                            disabled={
                              pagination && pagination.currentPage === 1
                            }
                          >
                            {t("filterProducts.previous")}
                          </button>
                        </li>

                        {pagination &&
                          pagination.lastPage &&
                          Array.from(
                            { length: pagination.lastPage },
                            (_, i) => i + 1
                          ).map((page) => (
                            <li
                              key={page}
                              className={`page-item ${
                                page ===
                                (pagination && pagination.currentPage
                                  ? pagination.currentPage
                                  : 1)
                                  ? "active"
                                  : ""
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
                            pagination.currentPage === pagination.lastPage
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              handlePageChange(pagination.currentPage + 1)
                            }
                            disabled={
                              pagination.currentPage === pagination.lastPage
                            }
                          >
                            {t("filterProducts.next")}
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.emptyState}>
                  <p className="text-muted">
                    {t("filterProducts.noProductsFound")}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterProductsPhysical;
