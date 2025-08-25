import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import styles from "./FilterProductsPhysical.module.css";

const FilterProductsPhysical = () => {
  const { t } = useTranslation("global");
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  const categoryId = searchParams.get("category_id");
  const market = searchParams.get("market");

  useEffect(() => {
    if (categoryId && market === "physical") {
      fetchProducts();
    }
  }, [categoryId, market]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/products/show-by-category?page=${page}`,
        {
          headers: {
            Accept: "application/json",
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
  };

  const handlePageChange = (page) => {
    if (page && page > 0) {
      fetchProducts(page);
    }
  };

  if (!categoryId || market !== "physical") {
    return (
      <div className={styles.invalidRequest}>
        <h3>Invalid request</h3>
        <p>Please select a valid category.</p>
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
                <h6>Category</h6>
                <p className="text-muted">Products in this category</p>
              </div>

              <div className={styles.filterBlock}>
                <h6>Price Range</h6>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    placeholder="Min"
                    className={styles.priceInput}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className={styles.priceInput}
                  />
                </div>
              </div>

              <div className={styles.filterBlock}>
                <h6>Condition</h6>
                <select className={styles.filterSelect}>
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <div className={styles.filterBlock}>
                <h6>Delivery</h6>
                <select className={styles.filterSelect}>
                  <option value="">All</option>
                  <option value="1">With Delivery</option>
                  <option value="0">Without Delivery</option>
                </select>
              </div>

              <div className={styles.filterBlock}>
                <h6>Warranty</h6>
                <select className={styles.filterSelect}>
                  <option value="">All</option>
                  <option value="1">With Warranty</option>
                  <option value="0">Without Warranty</option>
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
                <p className="mt-2 text-muted">Loading products...</p>
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
                        to={`/productdetails/${product.id}`}
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
                          </div>
                          <div className={styles.cardContent}>
                            <h6 className={styles.productTitle}>
                              {product.name || "Unnamed Product"}
                            </h6>
                            <p className={styles.productDescription}>
                              {product.description ||
                                "No description available"}
                            </p>

                            <div className={styles.productInfo}>
                              <div className={styles.productCondition}>
                                <span className={styles.conditionBadge}>
                                  {product.condition || "Unknown"}
                                </span>
                              </div>

                              <div className={styles.productFeatures}>
                                {product.has_warranty === 1 ? (
                                  <span className={styles.featureBadge}>
                                    Warranty:{" "}
                                    {product.warranty_period || "Available"}
                                  </span>
                                ) : (
                                  <span
                                    className={`${styles.featureBadge} ${styles.unavailable}`}
                                  >
                                    No Warranty
                                  </span>
                                )}
                                {product.has_delivery === 1 ? (
                                  <span className={styles.featureBadge}>
                                    Delivery Available
                                  </span>
                                ) : (
                                  <span
                                    className={`${styles.featureBadge} ${styles.unavailable}`}
                                  >
                                    No Delivery
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={styles.productFooter}>
                              <div className={styles.productPrice}>
                                {product.price || "0.00"}
                              </div>
                              <div className={styles.productLocation}>
                                {product.governorate?.name || "Unknown"},{" "}
                                {product.country?.name || "Unknown"}
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
                            Previous
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
                            Next
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
                    No products found in this category.
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
