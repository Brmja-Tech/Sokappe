import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AllSearchProducts.module.css";
import { FiSearch, FiMapPin, FiClock, FiTag } from "react-icons/fi";

const AllSearchProducts = () => {
  const { t, i18n } = useTranslation("global");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const type = searchParams.get("type");
  const name = searchParams.get("name");
  const condition = searchParams.get("condition");

  useEffect(() => {
    if (name) {
      setSearchQuery(name);
      fetchSearchResults();
    }
  }, [name, type, condition, currentPage, i18n.language]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      let url = `${
        process.env.REACT_APP_BASE_URL
      }/search?type=${type}&name=${encodeURIComponent(
        name
      )}&page=${currentPage}`;

      // Add condition parameter for product products
      if (type === "product" && condition) {
        url += `&condition=${condition}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Accept-Language": i18n.language,
        },
      });

      if (response.data.status === 200) {
        console.log("Search results:", response.data.data.data);
        setSearchResults(response.data.data.data);
        setTotalPages(response.data.data.meta.last_page);
      }
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ في البحث");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams();
      newParams.set("type", type);
      newParams.set("name", searchQuery.trim());
      if (condition) {
        newParams.set("condition", condition);
      }
      newParams.set("page", "1");

      navigate(`/search?${newParams.toString()}`);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    navigate(`/search?${newParams.toString()}`);
  };

  const getSearchTypeTitle = () => {
    switch (type) {
      case "service":
        return t("hero.services");
      case "product":
        return condition === "used" ? t("hero.used") : t("hero.shop");
      default:
        return t("common.searchResults");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
    }).format(price);
  };

  const renderServiceCard = (item) => {
    // Handle different data structures for services vs products
    const isService = type === "service";

    // Extract location data safely
    const country = isService
      ? typeof item.country === "string"
        ? item.country
        : item.country?.name || ""
      : typeof item.country === "string"
      ? item.country
      : item.country?.name || "";

    const governorate = isService
      ? typeof item.governorate === "string"
        ? item.governorate
        : item.governorate?.name || ""
      : typeof item.governorate === "string"
      ? item.governorate
      : item.governorate?.name || "";

    const centerGov = isService
      ? null
      : typeof item.center_gov === "string"
      ? item.center_gov
      : item.center_gov?.name || "";

    return (
      <div key={item.id} className={styles.serviceCard}>
        <div className={styles.cardImage}>
          <img
            src={item.main_image || "/placeholder-image.jpg"}
            alt={item.name || "Product/Service"}
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
          />
          {item.discount_price && (
            <div className={styles.discountBadge}>
              <FiTag />
              <span>{t("service.discount")}</span>
            </div>
          )}
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.serviceName}>
            {item.name || t("common.noData")}
          </h3>
          <p className={styles.serviceDescription}>
            {item.description || t("common.noData")}
          </p>

          <div className={styles.serviceDetails}>
            <div className={styles.detailItem}>
              <FiMapPin />
              <span>
                {[country, governorate, centerGov].filter(Boolean).join(", ") ||
                  t("common.noData")}
              </span>
            </div>

            {isService ? (
              <div className={styles.detailItem}>
                <FiClock />
                <span>
                  {item.delivery_days} {t("service.days")}
                </span>
              </div>
            ) : (
              <div className={styles.detailItem}>
                <FiTag />
                <span>{item.condition || t("common.noData")}</span>
              </div>
            )}
          </div>

          <div className={styles.priceSection}>
            <div className={styles.priceInfo}>
              {item.discount_price ? (
                <>
                  <span className={styles.originalPrice}>
                    {formatPrice(item.price || 0)}
                  </span>
                  <span className={styles.discountPrice}>
                    {formatPrice(item.discount_price || 0)}
                  </span>
                </>
              ) : (
                <span className={styles.regularPrice}>
                  {formatPrice(item.price || 0)}
                </span>
              )}
            </div>

            {item.discount_expires_at && (
              <div className={styles.discountExpiry}>
                {t("common.discountExpires")}:{" "}
                {new Date(item.discount_expires_at).toLocaleDateString()}
              </div>
            )}
          </div>

          <button className={styles.viewDetailsBtn}>
            {t("common.viewDetails")}
          </button>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.pageBtn} ${
            currentPage === i ? styles.activePage : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className={styles.pagination}>
        {currentPage > 1 && (
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            {t("common.previous")}
          </button>
        )}

        {pages}

        {currentPage < totalPages && (
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            {t("common.next")}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>{t("common.loading")}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>{t("common.error")}</h3>
        <p>{error}</p>
        <button onClick={fetchSearchResults} className={styles.retryBtn}>
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.searchPage}>
      <div className={styles.searchHeader}>
        <h1 className={styles.pageTitle}>
          {getSearchTypeTitle()} - {t("common.searchResults")}
        </h1>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInput}>
            <FiSearch />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("hero.searchPlaceholder")}
            />
          </div>
          <button type="submit" className={styles.searchBtn}>
            {t("hero.searchButton")}
          </button>
        </form>
      </div>

      <div className={styles.resultsSection}>
        {searchResults.length === 0 ? (
          <div className={styles.noResults}>
            <h3>{t("common.noResults")}</h3>
            <p>{t("common.noResultsMessage")}</p>
          </div>
        ) : (
          <>
            <div className={styles.resultsGrid}>
              {searchResults.map((item) => renderServiceCard(item))}
            </div>

            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default AllSearchProducts;
