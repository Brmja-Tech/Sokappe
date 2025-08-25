import React, { createContext, useContext, useState, useEffect } from "react";
import { bannerService } from "../services/bannerService";

const BannerContext = createContext();

export const useBanner = () => {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error("useBanner must be used within a BannerProvider");
  }
  return context;
};

export const BannerProvider = ({ children }) => {
  const [allBanners, setAllBanners] = useState(null);
  const [newProductsBanners, setNewProductsBanners] = useState([]);
  const [serviceBanners, setServiceBanners] = useState([]);
  const [allProductsBanners, setAllProductsBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all banners data
  const fetchAllBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getAllBanners();

      if (response.data) {
        setAllBanners(response.data);

        // Set specific banner types
        setNewProductsBanners(response.data.new_products || []);
        setServiceBanners(response.data.service || []);
        setAllProductsBanners(response.data.all_products || []);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching all banners:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch banners by specific type
  const fetchBannersByType = async (type) => {
    try {
      const response = await bannerService.getBannersByType(type);
      return response.data || [];
    } catch (err) {
      console.error(`Error fetching banners for type ${type}:`, err);
      return [];
    }
  };

  // Get all images from all banner types
  const getAllBannerImages = () => {
    if (!allBanners) return [];

    const allImages = [];
    Object.values(allBanners).forEach((bannerArray) => {
      if (Array.isArray(bannerArray)) {
        bannerArray.forEach((banner) => {
          if (banner.images && Array.isArray(banner.images)) {
            allImages.push(...banner.images);
          }
        });
      }
    });

    return allImages;
  };

  // Refresh banners data
  const refreshBanners = () => {
    fetchAllBanners();
  };

  useEffect(() => {
    fetchAllBanners();
  }, []);

  const value = {
    // Data
    allBanners,
    newProductsBanners,
    serviceBanners,
    allProductsBanners,

    // State
    loading,
    error,

    // Functions
    fetchAllBanners,
    fetchBannersByType,
    getAllBannerImages,
    refreshBanners,
  };

  return (
    <BannerContext.Provider value={value}>{children}</BannerContext.Provider>
  );
};
