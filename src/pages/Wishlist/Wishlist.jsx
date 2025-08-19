import React from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import styles from "./Wishlist.module.css";

const Wishlist = () => {
  const { t, i18n } = useTranslation("global");
  const {
    wishlistItems,
    loading,
    error,
    removeFromWishlist,
    addToCart,
    isInCart,
  } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  if (loading) {
    return (
      <div className={styles.wishlistContainer}>
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className={styles.wishlistContainer}>
        <div className="container">
          <div className={styles.emptyWishlist}>
            <div className={styles.emptyWishlistIcon}>
              <i className="bi bi-heart"></i>
            </div>
            <h3>{t("wishlist.emptyWishlistTitle")}</h3>
            <p>{t("wishlist.emptyWishlistMessage")}</p>
            <Link to="/" className={styles.startShopping}>
              {t("wishlist.startShopping")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wishlistContainer}>
      <div className="container">
        {/* Wishlist Header */}
        <div className={styles.wishlistHeader}>
          <h1 className={styles.wishlistTitle}>
            <i className="bi bi-heart-fill me-3"></i>
            {t("wishlist.myWishlist")}
          </h1>
          <p className={styles.wishlistSubtitle}>
            {t("wishlist.itemsCount", { count: wishlistItems.length })}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Wishlist Items */}
        <div className={styles.wishlistGrid}>
          {wishlistItems.map((product) => (
            <div key={product.id} className={styles.wishlistCard}>
              {/* Product Image */}
              <div className={styles.productImage}>
                <img
                  src={product.main_image || "/car.png"}
                  alt={product.name}
                  className="img-fluid"
                />

                {/* Action Buttons Overlay */}
                <div className={styles.actionOverlay}>
                  <button
                    className={`${styles.actionBtn} ${styles.addToCartBtn} ${
                      isInCart(product.id) ? styles.inCart : ""
                    }`}
                    onClick={() => handleAddToCart(product)}
                    disabled={isInCart(product.id)}
                    title={
                      isInCart(product.id)
                        ? t("wishlist.alreadyInCart")
                        : t("wishlist.addToCart")
                    }
                  >
                    <i
                      className={`bi ${
                        isInCart(product.id)
                          ? "bi-check-circle-fill"
                          : "bi-cart-plus"
                      }`}
                    ></i>
                    {isInCart(product.id)
                      ? t("wishlist.inCart")
                      : t("wishlist.addToCart")}
                  </button>

                  <button
                    className={`${styles.actionBtn} ${styles.removeBtn}`}
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    title={t("wishlist.removeFromWishlist")}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className={styles.productDetails}>
                <h5 className={styles.productName}>{product.name}</h5>

                <p className={styles.productOwner}>
                  <i className="bi bi-person me-2"></i>
                  {product.owner?.username || "Unknown"}
                </p>

                <p className={styles.productLocation}>
                  <i className="bi bi-geo-alt me-2"></i>
                  {product.governorate?.name}, {product.center_gov?.name}
                </p>

                {/* Warranty and Delivery Badges */}
                <div className={styles.productBadges}>
                  {product.has_warranty && (
                    <span
                      className={`${styles.badge} ${styles.wishlistWarranty}`}
                    >
                      <i className="bi bi-shield-check me-1"></i>
                      {t("products.warranty")}
                    </span>
                  )}
                  {product.has_delivery && (
                    <span
                      className={`${styles.badge} ${styles.wishlistDelivery}`}
                    >
                      <i className="bi bi-truck me-1"></i>
                      {t("products.delivery")}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className={styles.productPrice}>
                  <span className={styles.price}>
                    {product.price} {t("products.currency")}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={styles.quickActions}>
                <Link
                  to={`/productdetalis/${product.id}`}
                  className={styles.viewDetailsBtn}
                >
                  <i className="bi bi-eye me-2"></i>
                  {t("wishlist.viewDetails")}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Wishlist Actions */}
        <div className={styles.wishlistActions}>
          <Link to="/" className={styles.continueShoppingBtn}>
            <i className="bi bi-arrow-left me-2"></i>
            {t("wishlist.continueShopping")}
          </Link>

          <Link to="/cart" className={styles.viewCartBtn}>
            <i className="bi bi-cart3 me-2"></i>
            {t("wishlist.viewCart")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
