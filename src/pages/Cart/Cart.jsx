import React from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import styles from "./Cart.module.css";

const Cart = () => {
  const { t } = useTranslation("global");
  const {
    cartItems,
    cartTotal,
    cartCount,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  if (loading) {
    return (
      <div className={styles.cartContainer}>
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cartContainer}>
        <div className="container">
          <div className="text-center py-5">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
            <button
              className="btn btn-primary mt-3"
              onClick={() => window.location.reload()}
            >
              {t("cart.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <div className="container">
          <div className={styles.emptyCart}>
            <div className={styles.emptyCartIcon}>
              <i className="bi bi-cart-x"></i>
            </div>
            <h2>{t("cart.emptyCartTitle")}</h2>
            <p>{t("cart.emptyCartMessage")}</p>
            <Link to="/" className={styles.continueShopping}>
              {t("cart.continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <div className="container">
        <div className={styles.cartHeader}>
          <h1 className={styles.cartTitle}>{t("cart.shoppingCart")}</h1>
          <p className={styles.cartSubtitle}>
            {t("cart.itemsCount", { count: cartCount })}
          </p>
        </div>

        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <Link to={`/productdetalis/${item.product.id}`}>
                    <img
                      src={item.product.main_image || "/placeholder.png"}
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  </Link>
                </div>

                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>
                    <Link to={`/productdetalis/${item.product.id}`}>
                      {item.product.name}
                    </Link>
                  </h3>

                  <div className={styles.itemBadges}>
                    {item.product.has_warranty && (
                      <span className={`${styles.badge} ${styles.warranty}`}>
                        <i className="bi bi-shield-check me-1"></i>
                        {t("products.warranty")}
                      </span>
                    )}
                    {item.product.has_delivery && (
                      <span className={`${styles.badge} ${styles.delivery}`}>
                        <i className="bi bi-truck me-1"></i>
                        {t("products.delivery")}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.itemPrice}>
                  <span className={styles.price}>
                    {item.product.discount_price || item.product.price}{" "}
                    {t("products.currency")}
                  </span>
                  {item.product.discount_price && (
                    <span className={styles.originalPrice}>
                      {item.product.price} {t("products.currency")}
                    </span>
                  )}
                </div>

                <div className={styles.itemQuantity}>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityBtn}
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      className={styles.quantityBtn}
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                </div>

                <div className={styles.itemTotal}>
                  <span className={styles.totalPrice}>
                    {item.subtotal} {t("products.currency")}
                  </span>
                </div>

                <div className={styles.itemActions}>
                  <Link
                    to={`/productdetalis/${item.product.id}`}
                    className={styles.viewDetailsBtn}
                    title={t("cart.viewDetails")}
                  >
                    <i className="bi bi-eye"></i>
                  </Link>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveItem(item.id)}
                    title={t("cart.removeItem")}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cartSummary}>
            <h3 className={styles.summaryTitle}>{t("cart.orderSummary")}</h3>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>{t("cart.subtotal")}</span>
                <span>
                  {cartTotal} {t("products.currency")}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t("cart.shipping")}</span>
                <span className={styles.freeShipping}>{t("cart.free")}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t("cart.tax")}</span>
                <span>0 {t("products.currency")}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>{t("cart.total")}</span>
                <span>
                  {cartTotal} {t("products.currency")}
                </span>
              </div>
            </div>

            <button className={styles.checkoutBtn}>
              {t("cart.proceedToCheckout")}
            </button>

            <div className={styles.paymentMethods}>
              <p className={styles.paymentTitle}>{t("cart.securePayment")}</p>
              <div className={styles.paymentIcons}>
                <i className="bi bi-credit-card"></i>
                <i className="bi bi-paypal"></i>
                <i className="bi bi-cash-coin"></i>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cartActions}>
          <button className={styles.clearCartBtn} onClick={handleClearCart}>
            {t("cart.clearCart")}
          </button>
          <Link to="/" className={styles.continueShoppingBtn}>
            {t("cart.continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
