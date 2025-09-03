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

  const categoryId = searchParams.get("category_id");
  const market = searchParams.get("market");

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
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/products/show-by-category?page=${page}`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
            params: {
              category_id: categoryId,
            },
          }
        );

        if (response.data.status === 200) {
          console.log("API Response:", response.data);

          // Handle both nested and flat response structures
          const productsData =
            response.data.data.data || response.data.data || [];
          console.log("Products Data:", productsData);
          setProducts(productsData);

          // Fetch ratings for products
          if (productsData.length > 0) {
            fetchProductRatings(productsData.map((product) => product.id));
          }

          // Handle pagination if it exists
          const paginationData =
            response.data.data.pagination || response.data.pagination;
          console.log("Pagination Data:", paginationData);

          if (paginationData) {
            setPagination({
              currentPage: paginationData.current_page || 1,
              lastPage: paginationData.last_page || 1,
              total: paginationData.total || productsData.length,
            });
          } else {
            // If no pagination, set defaults based on data
            setPagination({
              currentPage: 1,
              lastPage: 1,
              total: productsData.length,
            });
          }

          console.log("Final Products State:", productsData);
          console.log(
            "Final Pagination State:",
            paginationData
              ? {
                  currentPage: paginationData.current_page || 1,
                  lastPage: paginationData.last_page || 1,
                  total: paginationData.total || productsData.length,
                }
              : {
                  currentPage: 1,
                  lastPage: 1,
                  total: productsData.length,
                }
          );
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

  useEffect(() => {
    if (categoryId && market === "physical") {
      fetchProducts();
    }
  }, [categoryId, market, fetchProducts]);

  const handlePageChange = (page) => {
    if (page && page > 0) {
      fetchProducts(page);
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
                  />
                  <input
                    type="number"
                    placeholder={t("filterProducts.max")}
                    className={styles.priceInput}
                  />
                </div>
              </div>

              <div className={styles.filterBlock}>
                <h6>{t("filterProducts.condition")}</h6>
                <select className={styles.filterSelect}>
                  <option value="">{t("filterProducts.allConditions")}</option>
                  <option value="new">{t("filterProducts.new")}</option>
                  <option value="used">{t("filterProducts.used")}</option>
                </select>
              </div>

              <div className={styles.filterBlock}>
                <h6>{t("filterProducts.delivery")}</h6>
                <select className={styles.filterSelect}>
                  <option value="">{t("filterProducts.all")}</option>
                  <option value="1">{t("filterProducts.withDelivery")}</option>
                  <option value="0">
                    {t("filterProducts.withoutDelivery")}
                  </option>
                </select>
              </div>

              <div className={styles.filterBlock}>
                <h6>{t("filterProducts.warranty")}</h6>
                <select className={styles.filterSelect}>
                  <option value="">{t("filterProducts.all")}</option>
                  <option value="1">{t("filterProducts.withWarranty")}</option>
                  <option value="0">
                    {t("filterProducts.withoutWarranty")}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-lg-9">
            {console.log("Render - Loading:", loading)}
            {console.log("Render - Products:", products)}
            {console.log("Render - Products Length:", products?.length)}
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
                {console.log(
                  "Rendering products grid with",
                  products.length,
                  "products"
                )}
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
                {console.log(
                  "No products to render. Products:",
                  products,
                  "Length:",
                  products?.length
                )}
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
