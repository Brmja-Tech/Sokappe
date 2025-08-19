import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Create context
const CartContext = createContext();

// Initial state
const initialState = {
  cartItems: [],
  wishlistItems: [],
  loading: false,
  error: null,
  cartTotal: 0,
  cartCount: 0,
};

// Action types
const CART_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_CART_ITEMS: "SET_CART_ITEMS",
  SET_WISHLIST_ITEMS: "SET_WISHLIST_ITEMS",
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  UPDATE_CART_ITEM: "UPDATE_CART_ITEM",
  CLEAR_CART: "CLEAR_CART",
  ADD_TO_WISHLIST: "ADD_TO_WISHLIST",
  REMOVE_FROM_WISHLIST: "REMOVE_FROM_WISHLIST",
  CALCULATE_TOTAL: "CALCULATE_TOTAL",
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case CART_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case CART_ACTIONS.SET_CART_ITEMS:
      return {
        ...state,
        cartItems: action.payload,
        cartCount: action.payload.length,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.SET_WISHLIST_ITEMS:
      return {
        ...state,
        wishlistItems: action.payload,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.ADD_TO_CART:
      return { ...state, loading: false, error: null };

    case CART_ACTIONS.REMOVE_FROM_CART:
      return { ...state, loading: false, error: null };

    case CART_ACTIONS.UPDATE_CART_ITEM:
      return { ...state, loading: false, error: null };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        cartItems: [],
        cartCount: 0,
        cartTotal: 0,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.ADD_TO_WISHLIST:
      return { ...state, loading: false, error: null };

    case CART_ACTIONS.REMOVE_FROM_WISHLIST:
      return { ...state, loading: false, error: null };

    case CART_ACTIONS.CALCULATE_TOTAL:
      const total = state.cartItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      return { ...state, cartTotal: total };

    default:
      return state;
  }
};

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken");
  };

  // Get current language
  const getCurrentLanguage = () => {
    return localStorage.getItem("i18nextLng") || "en";
  };

  // Fetch cart items from backend
  const fetchCartItems = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const token = getAuthToken();
      if (!token) {
        dispatch({ type: CART_ACTIONS.SET_CART_ITEMS, payload: [] });
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/cart/show`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": getCurrentLanguage(),
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status === 200) {
        const cartData = response.data.data;
        dispatch({
          type: CART_ACTIONS.SET_CART_ITEMS,
          payload: cartData.items || [],
        });
        dispatch({ type: CART_ACTIONS.CALCULATE_TOTAL });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: "Failed to fetch cart items",
      });
      toast.error("Failed to fetch cart items");
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const token = getAuthToken();
      if (!token) {
        toast.error("Please login to add items to cart");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/cart/add?product_id=${product.id}&quantity=${quantity}`,
        {},
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": getCurrentLanguage(),
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status === 200) {
        toast.success("Item added to cart successfully!");
        // Refresh cart items
        await fetchCartItems();
        dispatch({ type: CART_ACTIONS.ADD_TO_CART });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add item to cart";
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const token = getAuthToken();
      if (!token) {
        toast.error("Please login to remove items from cart");
        return;
      }

      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/cart/delete/item?item_id=${itemId}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": getCurrentLanguage(),
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status === 200) {
        toast.success("Item removed from cart successfully!");
        // Refresh cart items
        await fetchCartItems();
        dispatch({ type: CART_ACTIONS.REMOVE_FROM_CART });
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to remove item from cart";
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const token = getAuthToken();
      if (!token) {
        toast.error("Please login to update cart items");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/cart/update/item?item_id=${itemId}&quantity=${quantity}`,
        {},
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": getCurrentLanguage(),
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status === 200) {
        toast.success("Cart updated successfully!");
        // Refresh cart items
        await fetchCartItems();
        dispatch({ type: CART_ACTIONS.UPDATE_CART_ITEM });
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update cart item";
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      // For now, we'll clear locally since there's no clear all endpoint
      // You can add a clear all endpoint in the backend if needed
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      toast.success("Cart cleared successfully!");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  // Add to wishlist (keeping local for now)
  const addToWishlist = (product) => {
    try {
      const existingItem = state.wishlistItems.find(
        (item) => item.id === product.id
      );
      if (!existingItem) {
        const newWishlistItems = [...state.wishlistItems, product];
        dispatch({
          type: CART_ACTIONS.SET_WISHLIST_ITEMS,
          payload: newWishlistItems,
        });
        localStorage.setItem("wishlistItems", JSON.stringify(newWishlistItems));
        toast.success("Added to wishlist!");
      } else {
        toast.info("Item is already in wishlist");
      }
      dispatch({ type: CART_ACTIONS.ADD_TO_WISHLIST });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
  };

  // Remove from wishlist
  const removeFromWishlist = (productId) => {
    try {
      const newWishlistItems = state.wishlistItems.filter(
        (item) => item.id !== productId
      );
      dispatch({
        type: CART_ACTIONS.SET_WISHLIST_ITEMS,
        payload: newWishlistItems,
      });
      localStorage.setItem("wishlistItems", JSON.stringify(newWishlistItems));
      toast.success("Removed from wishlist!");
      dispatch({ type: CART_ACTIONS.REMOVE_FROM_WISHLIST });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return state.cartItems.some((item) => item.product.id === productId);
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return state.wishlistItems.some((item) => item.id === productId);
  };

  // Get cart item quantity
  const getCartItemQuantity = (productId) => {
    const item = state.cartItems.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Load wishlist items from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("wishlistItems");
      if (savedWishlist) {
        const wishlistItems = JSON.parse(savedWishlist);
        dispatch({
          type: CART_ACTIONS.SET_WISHLIST_ITEMS,
          payload: wishlistItems,
        });
      }
    } catch (error) {
      console.error("Error loading wishlist from localStorage:", error);
    }
  }, []);

  // Fetch cart items on mount if user is authenticated
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchCartItems();
    }
  }, []);

  // Calculate total whenever cart items change
  useEffect(() => {
    dispatch({ type: CART_ACTIONS.CALCULATE_TOTAL });
  }, [state.cartItems]);

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateCartItem,
    addToWishlist,
    removeFromWishlist,
    clearCart,
    isInCart,
    isInWishlist,
    getCartItemQuantity,
    fetchCartItems, // Expose this for manual refresh
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Default export for CartProvider
export default CartProvider;
