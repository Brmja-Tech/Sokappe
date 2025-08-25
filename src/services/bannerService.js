const API_BASE_URL =
  process.env.REACT_APP_BASE_URL || "https://backend.sokappe.com";

export const bannerService = {
  // Get all banners (no type filter)
  async getAllBanners() {
    try {
      const response = await fetch(`${API_BASE_URL}/banners`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching all banners:", error);
      throw error;
    }
  },

  // Get banners by specific type
  async getBannersByType(type) {
    try {
      const response = await fetch(`${API_BASE_URL}/banners?type=${type}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching banners for type ${type}:`, error);
      throw error;
    }
  },

  // Get all images from all banner types for the first component
  async getAllBannerImages() {
    try {
      const response = await fetch(`${API_BASE_URL}/banners`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract all images from all banner types
      const allImages = [];

      if (data.data) {
        Object.values(data.data).forEach((bannerArray) => {
          if (Array.isArray(bannerArray)) {
            bannerArray.forEach((banner) => {
              if (banner.images && Array.isArray(banner.images)) {
                allImages.push(...banner.images);
              }
            });
          }
        });
      }

      return allImages;
    } catch (error) {
      console.error("Error fetching all banner images:", error);
      throw error;
    }
  },
};
