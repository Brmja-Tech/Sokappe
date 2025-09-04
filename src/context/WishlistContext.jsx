import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { t, i18n } = useTranslation("global");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated()) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/wishlist`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.data?.status === 200) {
        setWishlistItems(response.data.data || []);
      } else {
        setError(response.data?.message || "Failed to fetch wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      if (error.response?.status === 401) {
        // User not authenticated, clear wishlist
        setWishlistItems([]);
      } else {
        setError(t("wishlist.fetchError"));
      }
    } finally {
      setLoading(false);
    }
  }, [i18n.language, t]);

  // Add item to wishlist
  const addToWishlist = async (product) => {
    if (!isAuthenticated()) {
      toast.error(t("sign.login") + " " + t("sign.haveAccount"));
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/wishlist/${product.id}`,
        {},
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.data?.status === 201) {
        // Add to local state
        setWishlistItems((prev) => {
          const exists = prev.find((item) => item.id === product.id);
          if (!exists) {
            return [...prev, product];
          }
          return prev;
        });
        toast.success(t("wishlist.addedToWishlist"));
        return true;
      } else {
        toast.error(response.data?.message || t("wishlist.addError"));
        return false;
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      if (error.response?.status === 401) {
        toast.error(t("sign.login") + " " + t("sign.haveAccount"));
      } else if (error.response?.status === 409) {
        toast.info(t("wishlist.alreadyInWishlist"));
      } else {
        toast.error(t("wishlist.addError"));
      }
      return false;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated()) {
      toast.error(t("sign.login") + " " + t("sign.haveAccount"));
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/wishlist/${productId}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.data?.status === 200) {
        // Remove from local state
        setWishlistItems((prev) =>
          prev.filter((item) => item.id !== productId)
        );
        toast.success(t("wishlist.removedFromWishlist"));
        return true;
      } else {
        toast.error(response.data?.message || t("wishlist.removeError"));
        return false;
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      if (error.response?.status === 401) {
        toast.error(t("sign.login") + " " + t("sign.haveAccount"));
      } else {
        toast.error(t("wishlist.removeError"));
      }
      return false;
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  // Toggle wishlist item (add if not exists, remove if exists)
  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      return await removeFromWishlist(product.id);
    } else {
      return await addToWishlist(product);
    }
  };

  // Clear wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  // Fetch wishlist when component mounts or language changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Clear wishlist when user logs out
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        clearWishlist();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
