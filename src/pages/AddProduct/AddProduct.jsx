import React, { useState, useEffect } from "react";
import PageHead from "../../component/PageHead/PageHead";
import { useTranslation } from "react-i18next";
import {
  FiCamera,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiX,
  FiTruck,
  FiShield,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./AddProduct.css";

export default function AddProduct() {
  const { t, i18n } = useTranslation("global");
  const [activeTab, setActiveTab] = useState("add");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [centerGovernorates, setCenterGovernorates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Dynamic Categories States - يمكن أن تكون عدد لا نهائي من المستويات
  const [categoryLevels, setCategoryLevels] = useState([]); // Array of category levels
  const [selectedCategories, setSelectedCategories] = useState({}); // Object to store selected category at each level
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  // Form Data States
  const [formData, setFormData] = useState({
    name: { ar: "", en: "" },
    description: { ar: "", en: "" },
    category_id: "",
    price: "",
    country_id: "",
    address: { ar: "", en: "" },
    condition: "new",
    has_delivery: "1",
    has_warranty: "1",
    warranty_period: "",
    main_image: null,
    other_images: [],
    governorate_id: "",
    center_gov_id: "",
    use_profile_address: "0",
  });

  // Edit Form Data with Category System
  const [editFormData, setEditFormData] = useState({
    name: { ar: "", en: "" },
    description: { ar: "", en: "" },
    category_id: "",
    price: "",
    country_id: "",
    address: { ar: "", en: "" },
    condition: "new",
    has_delivery: "1",
    has_warranty: "1",
    warranty_period: "",
    governorate_id: "",
    center_gov_id: "",
    use_profile_address: "0",
    main_image: null,
    other_images: [],
    category_path: [],
  });

  // Edit Category System States
  const [editCategoryLevels, setEditCategoryLevels] = useState([]);
  const [editSelectedCategories, setEditSelectedCategories] = useState({});
  const [editCategoriesLoading, setEditCategoriesLoading] = useState(false);
  const [editCategoriesError, setEditCategoriesError] = useState("");

  useEffect(() => {
    // Debug localStorage
    console.log("=== DEBUGGING LOCALSTORAGE ===");
    console.log("All localStorage keys:", Object.keys(localStorage));
    console.log("userData:", localStorage.getItem("userData"));
    console.log("token:", localStorage.getItem("token"));

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      console.log("Parsed userData:", userData);
      console.log("Account type:", userData.account_type);
    } catch (error) {
      console.error("Error parsing userData:", error);
    }
    console.log("=== END DEBUGGING ===");

    fetchMainCategories();
    fetchCountries();
    fetchMyProducts();
  }, []);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        if (showImageModal) {
          setShowImageModal(false);
        } else if (showViewModal) {
          setShowViewModal(false);
        } else if (showEditModal) {
          setShowEditModal(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showImageModal, showViewModal, showEditModal]);

  useEffect(() => {
    if (formData.country_id) {
      fetchGovernorates(formData.country_id);
    }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.governorate_id) {
      fetchCenterGovernorates(formData.governorate_id);
    }
  }, [formData.governorate_id]);

  // Clear location fields when use_profile_address changes to "1"
  useEffect(() => {
    if (formData.use_profile_address === "1") {
      setFormData((prev) => ({
        ...prev,
        country_id: "",
        governorate_id: "",
        center_gov_id: "",
      }));
    }
  }, [formData.use_profile_address]);

  // Update governorates when country changes in edit form
  useEffect(() => {
    if (editFormData.country_id) {
      fetchGovernorates(editFormData.country_id);
    }
  }, [editFormData.country_id]);

  // Update center governorates when governorate changes in edit form
  useEffect(() => {
    if (editFormData.governorate_id) {
      fetchCenterGovernorates(editFormData.governorate_id);
    }
  }, [editFormData.governorate_id]);

  // Clear location fields in edit form when use_profile_address changes to "1"
  useEffect(() => {
    if (editFormData.use_profile_address === "1") {
      setEditFormData((prev) => ({
        ...prev,
        country_id: "",
        governorate_id: "",
        center_gov_id: "",
      }));
    }
  }, [editFormData.use_profile_address]);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      fetchMyProducts();
    }
  }, [selectedCategory, currentPage, i18n.language]);

  // Refetch products when language changes
  useEffect(() => {
    // Reset to first page when language changes
    setCurrentPage(1);
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      fetchMyProducts();
    }
  }, [i18n.language]);

  // Fetch main categories based on account type
  const fetchMainCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const accountType = userData.account_type || "physical";

      console.log("Fetching categories for account type:", accountType);
      console.log("User data:", userData);

      // Check if we have authentication
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Token exists:", !!token);

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/categories/children?market=${accountType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      console.log("Categories API response:", response.data);
      const mainCategories = response.data.data || [];

      if (mainCategories.length > 0) {
        console.log("Main categories loaded:", mainCategories);
        // Initialize first level
        setCategoryLevels([
          {
            level: 0,
            categories: mainCategories,
            loading: false,
            error: "",
          },
        ]);
        setSelectedCategories({});
      } else {
        console.log("No categories found in API response");
        // Try to use fallback categories if API returns empty
        const fallbackCategories = [
          { id: 1, name: "Electronics", has_children: 1 },
          { id: 2, name: "Clothing", has_children: 1 },
          { id: 3, name: "Furniture", has_children: 1 },
        ];
        console.log("Using fallback categories:", fallbackCategories);
        setCategoryLevels([
          {
            level: 0,
            categories: fallbackCategories,
            loading: false,
            error: "",
          },
        ]);
        setSelectedCategories({});
      }
    } catch (error) {
      console.error("Error fetching main categories:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = t("failedToLoadCategories");
      if (error.message === "No authentication token found") {
        errorMessage = "No authentication token found. Please login again.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
        // Clear invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      } else if (error.response?.status === 404) {
        errorMessage = "Categories endpoint not found.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          t("settings.serverError") + ". " + t("settings.pleaseTryAgainLater");
      }

      setCategoriesError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch sub categories when a category is selected
  const fetchSubCategories = async (parentId, level) => {
    try {
      // Set loading for this specific level
      setCategoryLevels((prev) =>
        prev.map((l) =>
          l.level === level ? { ...l, loading: true, error: "" } : l
        )
      );

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const accountType = userData.account_type || "physical";

      console.log(
        "Fetching sub categories for parent ID:",
        parentId,
        "level:",
        level,
        "market:",
        accountType
      );

      // Check if we have authentication
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/categories/children?parent_id=${parentId}&market=${accountType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      console.log("Sub categories API response:", response.data);
      const subCategories = response.data.data || [];

      // Update the levels array with new categories
      setCategoryLevels((prev) => {
        const newLevels = [...prev];

        // Remove all levels after the current one
        const levelsToKeep = newLevels.filter((l) => l.level <= level);

        // Add new level if categories exist and have children
        if (subCategories.length > 0) {
          levelsToKeep.push({
            level: level + 1,
            categories: subCategories,
            loading: false,
            error: "",
          });
        }

        return levelsToKeep;
      });

      // Clear selected categories for levels after the current one
      setSelectedCategories((prev) => {
        const newSelected = { ...prev };
        Object.keys(newSelected).forEach((key) => {
          if (parseInt(key) > level) {
            delete newSelected[key];
          }
        });
        return newSelected;
      });

      // Update form data category_id if this is the final level
      if (
        subCategories.length > 0 &&
        subCategories.every((cat) => cat.has_children === 0)
      ) {
        // All categories at this level have no children, so we can select one
        setFormData((prev) => ({ ...prev, category_id: "" }));
      } else if (subCategories.length === 0) {
        // No subcategories, so parent is the final category
        setFormData((prev) => ({ ...prev, category_id: parentId }));
      }
    } catch (error) {
      console.error("Error fetching sub categories:", error);
      let errorMessage = t("failedToLoadSubCategories");
      if (error.message === "No authentication token found") {
        errorMessage = "No authentication token found. Please login again.";
      }

      // Set error for this specific level
      setCategoryLevels((prev) =>
        prev.map((l) =>
          l.level === level ? { ...l, loading: false, error: errorMessage } : l
        )
      );

      toast.error(errorMessage);
    }
  };

  // Handle category selection at any level
  const handleCategoryChange = (categoryId, level) => {
    console.log(`Category selected at level ${level}:`, categoryId);

    // Update selected categories
    setSelectedCategories((prev) => ({
      ...prev,
      [level]: categoryId,
    }));

    // Clear form category_id initially
    setFormData((prev) => ({ ...prev, category_id: "" }));

    if (categoryId) {
      // Check if this category has children
      const currentLevel = categoryLevels.find((l) => l.level === level);
      const selectedCategory = currentLevel?.categories.find(
        (cat) => cat.id == categoryId
      );

      if (selectedCategory && selectedCategory.has_children === 1) {
        // Category has children, fetch them
        fetchSubCategories(categoryId, level);
      } else if (selectedCategory && selectedCategory.has_children === 0) {
        // Category has no children, this is the final selection
        setFormData((prev) => ({ ...prev, category_id: categoryId }));

        // Remove all levels after this one
        setCategoryLevels((prev) => prev.filter((l) => l.level <= level));
      }
    } else {
      // Category deselected, remove all levels after this one
      setCategoryLevels((prev) => prev.filter((l) => l.level <= level));

      // Clear selected categories for levels after this one
      setSelectedCategories((prev) => {
        const newSelected = { ...prev };
        Object.keys(newSelected).forEach((key) => {
          if (parseInt(key) > level) {
            delete newSelected[key];
          }
        });
        return newSelected;
      });
    }
  };

  // Reset category selection
  const resetCategorySelection = async () => {
    try {
      // Clear all selections first
      setSelectedCategories({});
      setFormData((prev) => ({ ...prev, category_id: "" }));

      // Reset to only first level
      setCategoryLevels((prev) => prev.slice(0, 1));

      // Refresh main categories to ensure they're not in loading state
      await fetchMainCategories();
    } catch (error) {
      console.error("Error resetting categories:", error);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId, level) => {
    const levelData = categoryLevels.find((l) => l.level === level);
    if (levelData) {
      const category = levelData.categories.find((cat) => cat.id == categoryId);
      return category ? category.name : "";
    }
    return "";
  };

  // Check if we have a complete category selection
  const hasCompleteCategorySelection = () => {
    if (categoryLevels.length === 0) return false;

    const lastLevel = categoryLevels[categoryLevels.length - 1];
    const lastLevelSelected = selectedCategories[lastLevel.level];

    if (!lastLevelSelected) return false;

    const selectedCategory = lastLevel.categories.find(
      (cat) => cat.id == lastLevelSelected
    );
    return selectedCategory && selectedCategory.has_children === 0;
  };

  // Get the selected final category ID
  const getSelectedFinalCategoryId = () => {
    if (categoryLevels.length === 0) return "";

    const lastLevel = categoryLevels[categoryLevels.length - 1];
    const lastLevelSelected = selectedCategories[lastLevel.level];

    if (!lastLevelSelected) return "";

    const selectedCategory = lastLevel.categories.find(
      (cat) => cat.id == lastLevelSelected
    );
    if (selectedCategory && selectedCategory.has_children === 0) {
      return selectedCategory.id;
    }

    return "";
  };

  // Update formData.category_id when we have a complete selection
  useEffect(() => {
    const finalCategoryId = getSelectedFinalCategoryId();
    if (finalCategoryId) {
      setFormData((prev) => ({ ...prev, category_id: finalCategoryId }));
    }
  }, [selectedCategories, categoryLevels]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/categories`
      );
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/countries`
      );
      setCountries(response.data.data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchGovernorates = async (countryId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/governorates?country_id=${countryId}`
      );
      setGovernorates(response.data.data || []);
      setFormData((prev) => ({
        ...prev,
        governorate_id: "",
        center_gov_id: "",
      }));
    } catch (error) {
      console.error("Error fetching governorates:", error);
    }
  };

  const fetchCenterGovernorates = async (governorateId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/centergovernorates?governorate_id=${governorateId}`
      );
      setCenterGovernorates(response.data.data || []);
      setFormData((prev) => ({ ...prev, center_gov_id: "" }));
    } catch (error) {
      console.error("Error fetching center governorates:", error);
    }
  };

  // Fetch governorates for edit form
  const fetchEditGovernorates = async (countryId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/governorates?country_id=${countryId}`
      );
      setGovernorates(response.data.data || []);
    } catch (error) {
      console.error("Error fetching edit governorates:", error);
    }
  };

  // Fetch center governorates for edit form
  const fetchEditCenterGovernorates = async (governorateId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/centergovernorates?governorate_id=${governorateId}`
      );
      setCenterGovernorates(response.data.data || []);
    } catch (error) {
      console.error("Error fetching edit center governorates:", error);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/products/my-products?per_page=10&page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );
      setProducts(response.data.data.data || []);
      setTotalPages(response.data.data.meta?.last_page || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/products/my-products-by-category?category_id=${categoryId}&per_page=10&page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );
      setProducts(response.data.data.data || []);
      setTotalPages(response.data.data.meta?.last_page || 1);
    } catch (error) {
      console.error("Error fetching products by category:", error);
    }
  };

  const handleInputChange = (field, value, lang = null) => {
    if (lang) {
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [lang]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileChange = (field, files) => {
    if (field === "main_image") {
      setFormData((prev) => ({ ...prev, main_image: files[0] }));
    } else if (field === "other_images") {
      setFormData((prev) => ({ ...prev, other_images: Array.from(files) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate category selection
    if (!formData.category_id) {
      toast.error(t("pleaseSelectCategory"));
      return;
    }

    // Validate location fields only if not using profile address
    if (formData.use_profile_address === "0") {
      if (!formData.country_id) {
        toast.error(t("pleaseSelectCountry"));
        return;
      }
      if (!formData.governorate_id) {
        toast.error(t("pleaseSelectGovernorate"));
        return;
      }
      if (!formData.center_gov_id) {
        toast.error(t("pleaseSelectCenterGovernorate"));
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Add form data
      Object.keys(formData).forEach((key) => {
        if (key === "name" || key === "description" || key === "address") {
          if (formData[key].ar)
            formDataToSend.append(`${key}[ar]`, formData[key].ar);
          if (formData[key].en)
            formDataToSend.append(`${key}[en]`, formData[key].en);
        } else if (key === "main_image" && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (key === "other_images" && formData[key].length > 0) {
          formData[key].forEach((image) => {
            formDataToSend.append("other_images[]", image);
          });
        } else if (key !== "main_image" && key !== "other_images") {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/products`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      toast.success(response.data.message || t("productAdded"));
      resetForm();
      fetchMyProducts();
      setActiveTab("products");
    } catch (error) {
      toast.error(error.response?.data?.message || t("failedToAdd"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (product) => {
    console.log("Editing product:", product);
    setEditingProduct(product);
    setLoading(true);

    try {
      // Fetch detailed product data
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/products/show/${product.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      const productData = response.data.data;
      console.log("Detailed product data:", productData);

      // Helper function to get condition value
      const getConditionValue = (condition) => {
        if (
          condition === "مستعمل" ||
          condition === "Used" ||
          condition === "used"
        )
          return "used";
        if (condition === "جديد" || condition === "New" || condition === "new")
          return "new";
        return "new";
      };

      // Helper function to get delivery/warranty value
      const getBooleanValue = (value) => {
        if (
          value === "نعم" ||
          value === "Yes" ||
          value === "1" ||
          value === 1 ||
          value === true
        )
          return "1";
        return "0";
      };

      // Helper function to extract warranty period number
      const getWarrantyPeriod = (warrantyText) => {
        if (!warrantyText) return "";
        const match = warrantyText.match(/(\d+)/);
        return match ? match[1] : "";
      };

      // Helper function to get country ID by name
      const getCountryIdByName = (countryName) => {
        const country = countries.find((c) => c.name === countryName);
        return country ? country.id : "";
      };

      // Helper function to get governorate ID by name
      const getGovernorateIdByName = (governorateName) => {
        const governorate = governorates.find(
          (g) => g.name === governorateName
        );
        return governorate ? governorate.id : "";
      };

      // Helper function to get center governorate ID by name
      const getCenterGovernorateIdByName = (centerName) => {
        const center = centerGovernorates.find((c) => c.name === centerName);
        return center ? center.id : "";
      };

      const editData = {
        name: {
          ar: productData.name?.ar || "",
          en: productData.name?.en || "",
        },
        description: {
          ar: productData.description?.ar || "",
          en: productData.description?.en || "",
        },
        category_id: productData.category_id || "",
        price: productData.price || "",
        country_id: productData.country?.id || "",
        address: {
          ar: productData.address?.ar || "",
          en: productData.address?.en || "",
        },
        condition: getConditionValue(productData.condition),
        has_delivery: getBooleanValue(productData.has_delivery),
        has_warranty: getBooleanValue(productData.has_warranty),
        warranty_period: getWarrantyPeriod(productData.warranty_period),
        governorate_id: productData.governorate?.id || "",
        center_gov_id: productData.center_gov?.id || "",
        use_profile_address: productData.use_profile_address || "0",
        main_image: productData.main_image || null,
        other_images: productData.other_images || [],
      };

      console.log("Edit form data:", editData);
      console.log("Country ID:", editData.country_id);
      console.log("Governorate ID:", editData.governorate_id);
      console.log("Center Gov ID:", editData.center_gov_id);

      // Set the edit form data first
      setEditFormData(editData);

      // Initialize category system for edit form
      await fetchEditMainCategories();

      // If product has category_path, build the category tree
      if (productData.category_path && productData.category_path.length > 0) {
        await buildEditCategoryTreeFromPath(productData.category_path);
      }

      // Fetch governorates and center governorates if country and governorate are set
      if (editData.country_id) {
        console.log(
          "Fetching governorates for country ID:",
          editData.country_id
        );
        await fetchEditGovernorates(editData.country_id);

        // Wait for governorates to be set, then fetch center governorates
        if (editData.governorate_id) {
          console.log(
            "Fetching center governorates for governorate ID:",
            editData.governorate_id
          );
          await fetchEditCenterGovernorates(editData.governorate_id);
        }
      }

      // Then show the modal
      setShowEditModal(true);
      console.log("Modal should be open now");
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error(t("failedToLoadProduct"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate location fields only if not using profile address
    if (editFormData.use_profile_address === "0") {
      if (!editFormData.country_id) {
        toast.error(t("pleaseSelectCountry"));
        setLoading(false);
        return;
      }
      if (!editFormData.governorate_id) {
        toast.error(t("pleaseSelectGovernorate"));
        setLoading(false);
        return;
      }
      if (!editFormData.center_gov_id) {
        toast.error(t("pleaseSelectCenterGovernorate"));
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Add form data with proper structure
      Object.keys(editFormData).forEach((key) => {
        if (key === "name" || key === "description" || key === "address") {
          if (editFormData[key].ar)
            formDataToSend.append(`${key}[ar]`, editFormData[key].ar);
          if (editFormData[key].en)
            formDataToSend.append(`${key}[en]`, editFormData[key].en);
        } else if (key === "main_image" && editFormData[key]) {
          // Handle main image if it's a new file
          if (editFormData[key] instanceof File) {
            formDataToSend.append(key, editFormData[key]);
          }
        } else if (key === "other_images" && editFormData[key]) {
          // Handle other images if they're new files
          if (Array.isArray(editFormData[key])) {
            editFormData[key].forEach((image) => {
              if (image instanceof File) {
                formDataToSend.append("other_images[]", image);
              }
            });
          }
        } else {
          formDataToSend.append(key, editFormData[key]);
        }
      });

      // Add country, governorate, and center_gov data
      if (editFormData.country_id) {
        formDataToSend.append("country_id", editFormData.country_id);
      }
      if (editFormData.governorate_id) {
        formDataToSend.append("governorate_id", editFormData.governorate_id);
      }
      if (editFormData.center_gov_id) {
        formDataToSend.append("center_gov_id", editFormData.center_gov_id);
      }

      console.log("Update form data:", editFormData);
      console.log("FormData entries:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/products/update/${editingProduct.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      toast.success(response.data.message || t("productUpdated"));
      setShowEditModal(false);
      setEditingProduct(null);
      fetchMyProducts();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || t("failedToUpdate"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: t("deleteConfirmTitle") || "هل أنت متأكد؟",
      text: t("deleteConfirmText") || "لا يمكن التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("deleteConfirm") || "نعم، احذف!",
      cancelButtonText: t("cancel") || "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${process.env.REACT_APP_BASE_URL}/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );

        toast.success(t("productDeleted"));
        fetchMyProducts();
      } catch (error) {
        toast.error(error.response?.data?.message || t("failedToDelete"));
      }
    }
  };

  const handleViewProduct = async (productId) => {
    setViewLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/products/show/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      setViewingProduct(response.data.data);
      setShowViewModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || t("failedToLoadProduct"));
    } finally {
      setViewLoading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: { ar: "", en: "" },
      description: { ar: "", en: "" },
      category_id: "",
      price: "",
      country_id: "",
      address: { ar: "", en: "" },
      condition: "new",
      has_delivery: "1",
      has_warranty: "1",
      warranty_period: "",
      main_image: null,
      other_images: [],
      governorate_id: "",
      center_gov_id: "",
      use_profile_address: "0",
    });
    resetCategorySelection();
  };

  // Helper function to check if delivery/warranty is available
  const isAvailable = (value) => {
    return (
      value === "نعم" ||
      value === "Yes" ||
      value === "1" ||
      value === 1 ||
      value === true
    );
  };

  // Helper function to get localized text
  const getLocalizedText = (isAvailable, type) => {
    if (isAvailable) {
      return i18n.language === "ar"
        ? type === "delivery"
          ? "توصيل"
          : "ضمان"
        : type === "delivery"
        ? "Delivery"
        : "Warranty";
    } else {
      return i18n.language === "ar"
        ? type === "delivery"
          ? "لا يوجد توصيل"
          : "لا يوجد ضمان"
        : type === "delivery"
        ? "No Delivery"
        : "No Warranty";
    }
  };

  // Helper function to get localized condition text
  const getLocalizedCondition = (condition) => {
    if (condition === "مستعمل" || condition === "used") {
      return i18n.language === "ar" ? "مستعمل" : "Used";
    } else if (condition === "جديد" || condition === "new") {
      return i18n.language === "ar" ? "جديد" : "New";
    }
    return condition;
  };

  // Helper function to get localized name
  const getLocalizedName = (product) => {
    // If the product has separate Arabic and English names
    if (product.name_ar && product.name_en) {
      return i18n.language === "ar" ? product.name_ar : product.name_en;
    }

    // If the product has a single name field
    if (product.name) {
      // Check if the name contains Arabic characters
      const hasArabic = /[\u0600-\u06FF]/.test(product.name);

      if (i18n.language === "ar" && hasArabic) {
        return product.name;
      } else if (i18n.language === "en" && !hasArabic) {
        return product.name;
      } else {
        // If language doesn't match the name content, return as is
        return product.name;
      }
    }

    return product.name || "";
  };

  const renderAddProductForm = () => (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-section">
        <h4>{t("categorySelection")}</h4>

        {/* Category Progress Bar */}
        {categoryLevels.length > 0 && (
          <div className="category-progress-container">
            <div className="category-progress-bar">
              <div
                className="category-progress-fill"
                style={{
                  width: `${Math.min(
                    (Object.keys(selectedCategories).length /
                      Math.max(categoryLevels.length, 1)) *
                      100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="category-progress-text">
              {t("categoryProgress")}: {Object.keys(selectedCategories).length}{" "}
              / {categoryLevels.length}
            </div>
          </div>
        )}

        {/* Dynamic Category Levels */}
        {(() => {
          const rows = [];
          for (let i = 0; i < categoryLevels.length; i += 2) {
            const firstLevel = categoryLevels[i];
            const secondLevel = categoryLevels[i + 1];

            rows.push(
              <div key={`row-${i}`} className="form-row">
                {/* First Level in this row */}
                <div className="form-group">
                  <label>
                    <span className="category-level-indicator">
                      {firstLevel.level + 1}
                    </span>
                    {firstLevel.level === 0
                      ? t("mainCategory")
                      : firstLevel.level === 1
                      ? t("subCategory")
                      : firstLevel.level === 2
                      ? t("finalCategory")
                      : `${t("category")} ${firstLevel.level + 1}`}
                  </label>
                  <select
                    value={selectedCategories[firstLevel.level] || ""}
                    onChange={(e) =>
                      handleCategoryChange(e.target.value, firstLevel.level)
                    }
                    required={
                      firstLevel.level === 0 ||
                      (firstLevel.level > 0 &&
                        selectedCategories[firstLevel.level - 1])
                    }
                    disabled={
                      (firstLevel.level > 0 &&
                        !selectedCategories[firstLevel.level - 1]) ||
                      firstLevel.loading
                    }
                    className={`category-select level-${firstLevel.level}`}
                  >
                    <option value="">
                      {firstLevel.loading
                        ? t("loading")
                        : firstLevel.level === 0
                        ? t("selectMainCategory")
                        : firstLevel.level === 1
                        ? t("selectSubCategory")
                        : firstLevel.level === 2
                        ? t("selectFinalCategory")
                        : t("selectCategory")}
                    </option>
                    {!firstLevel.loading &&
                      firstLevel.categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.has_children === 1 ? "→" : ""}
                        </option>
                      ))}
                  </select>
                  {firstLevel.loading && (
                    <div className="loading-indicator">{t("loading")}</div>
                  )}
                  {firstLevel.error && (
                    <div className="error-message">{firstLevel.error}</div>
                  )}
                </div>

                {/* Second Level in this row (if exists) */}
                {secondLevel && (
                  <div className="form-group">
                    <label>
                      <span className="category-level-indicator">
                        {secondLevel.level + 1}
                      </span>
                      {secondLevel.level === 0
                        ? t("mainCategory")
                        : secondLevel.level === 1
                        ? t("subCategory")
                        : secondLevel.level === 2
                        ? t("finalCategory")
                        : `${t("category")} ${secondLevel.level + 1}`}
                    </label>
                    <select
                      value={selectedCategories[secondLevel.level] || ""}
                      onChange={(e) =>
                        handleCategoryChange(e.target.value, secondLevel.level)
                      }
                      required={
                        secondLevel.level === 0 ||
                        (secondLevel.level > 0 &&
                          selectedCategories[secondLevel.level - 1])
                      }
                      disabled={
                        (secondLevel.level > 0 &&
                          !selectedCategories[secondLevel.level - 1]) ||
                        secondLevel.loading
                      }
                      className={`category-select level-${secondLevel.level}`}
                    >
                      <option value="">
                        {secondLevel.loading
                          ? t("loading")
                          : secondLevel.level === 0
                          ? t("selectMainCategory")
                          : secondLevel.level === 1
                          ? t("selectSubCategory")
                          : secondLevel.level === 2
                          ? t("selectFinalCategory")
                          : t("selectCategory")}
                      </option>
                      {!secondLevel.loading &&
                        secondLevel.categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} {cat.has_children === 1 ? "→" : ""}
                          </option>
                        ))}
                    </select>
                    {secondLevel.loading && (
                      <div className="loading-indicator">{t("loading")}</div>
                    )}
                    {secondLevel.error && (
                      <div className="error-message">{secondLevel.error}</div>
                    )}
                  </div>
                )}

                {/* Empty div to maintain grid if only one level in this row */}
                {!secondLevel && <div className="form-group"></div>}
              </div>
            );
          }
          return rows;
        })()}

        {/* Reset Button */}
        {categoryLevels.length > 0 && (
          <div className="form-row">
            <div className="form-group">
              <button
                type="button"
                onClick={resetCategorySelection}
                className="reset-category-btn"
              >
                {t("resetCategories")}
              </button>
            </div>
          </div>
        )}

        {/* Selected Categories Display */}
        {formData.category_id && (
          <div className="form-row">
            <div className="form-group">
              <label>{t("selectedCategory")}</label>
              <div className="selected-category-display">
                {categoryLevels.map((level, index) => {
                  const selectedCategoryId = selectedCategories[level.level];
                  if (selectedCategoryId) {
                    return (
                      <span
                        key={level.level}
                        className={`category-badge level-${level.level}`}
                      >
                        {getCategoryName(selectedCategoryId, level.level)}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Category Validation Message */}
        {!formData.category_id && categoryLevels.length > 0 && (
          <div className="form-row">
            <div className="form-group">
              <div className="category-validation-message">
                {t("pleaseCompleteCategorySelection")}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-section">
        <h4>{t("basicInformation")}</h4>

        <div className="form-row">
          <div className="form-group">
            <label>{t("productNameArabic")}</label>
            <input
              type="text"
              value={formData.name.ar}
              onChange={(e) => handleInputChange("name", e.target.value, "ar")}
              placeholder={t("productNameAr")}
              required
            />
          </div>
          <div className="form-group">
            <label>{t("productNameEnglish")}</label>
            <input
              type="text"
              value={formData.name.en}
              onChange={(e) => handleInputChange("name", e.target.value, "en")}
              placeholder={t("productNameEn")}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t("price")}</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder={t("pricePlaceholder")}
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>{t("condition")}</label>
            <select
              value={formData.condition}
              onChange={(e) => handleInputChange("condition", e.target.value)}
              required
            >
              <option value="new">{t("new")}</option>
              <option value="used">{t("used")}</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t("hasDelivery")}</label>
            <select
              value={formData.has_delivery}
              onChange={(e) =>
                handleInputChange("has_delivery", e.target.value)
              }
              required
            >
              <option value="1">{t("yes")}</option>
              <option value="0">{t("no")}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t("hasWarranty")}</label>
            <select
              value={formData.has_warranty}
              onChange={(e) =>
                handleInputChange("has_warranty", e.target.value)
              }
              required
            >
              <option value="1">{t("yes")}</option>
              <option value="0">{t("no")}</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t("warrantyPeriod")}</label>
            <input
              type="number"
              value={formData.warranty_period}
              onChange={(e) =>
                handleInputChange("warranty_period", e.target.value)
              }
              placeholder={t("warrantyMonths")}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>{t("locationInformation")}</h4>

        <div className="form-row">
          <div className="form-group">
            <label>{t("useProfileAddress")}</label>
            <select
              value={formData.use_profile_address}
              onChange={(e) =>
                handleInputChange("use_profile_address", e.target.value)
              }
              required
            >
              <option value="0">{t("no")}</option>
              <option value="1">{t("yes")}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t("country")}</label>
            <select
              value={formData.country_id}
              onChange={(e) => handleInputChange("country_id", e.target.value)}
              required={formData.use_profile_address === "0"}
              disabled={formData.use_profile_address === "1"}
            >
              <option value="">{t("selectCountry")}</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t("governorate")}</label>
            <select
              value={formData.governorate_id}
              onChange={(e) =>
                handleInputChange("governorate_id", e.target.value)
              }
              required={formData.use_profile_address === "0"}
              disabled={
                formData.use_profile_address === "1" || !formData.country_id
              }
            >
              <option value="">{t("selectGovernorate")}</option>
              {governorates.map((gov) => (
                <option key={gov.id} value={gov.id}>
                  {gov.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t("centerGovernorate")}</label>
            <select
              value={formData.center_gov_id}
              onChange={(e) =>
                handleInputChange("center_gov_id", e.target.value)
              }
              required={formData.use_profile_address === "0"}
              disabled={
                formData.use_profile_address === "1" || !formData.governorate_id
              }
            >
              <option value="">{t("selectCenterGovernorate")}</option>
              {centerGovernorates.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t("addressArabic")}</label>
            <textarea
              value={formData.address.ar}
              onChange={(e) =>
                handleInputChange("address", e.target.value, "ar")
              }
              placeholder={t("addressAr")}
              required
            />
          </div>
          <div className="form-group">
            <label>{t("addressEnglish")}</label>
            <textarea
              value={formData.address.en}
              onChange={(e) =>
                handleInputChange("address", e.target.value, "en")
              }
              placeholder={t("addressEn")}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>{t("description")}</h4>

        <div className="form-row">
          <div className="form-group">
            <label>{t("descriptionArabic")}</label>
            <textarea
              value={formData.description.ar}
              onChange={(e) =>
                handleInputChange("description", e.target.value, "ar")
              }
              placeholder={t("descriptionAr")}
              required
            />
          </div>
          <div className="form-group">
            <label>{t("descriptionEnglish")}</label>
            <textarea
              value={formData.description.en}
              onChange={(e) =>
                handleInputChange("description", e.target.value, "en")
              }
              placeholder={t("descriptionEn")}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>{t("images")}</h4>

        <div className="form-group">
          <label>{t("mainImage")}</label>
          <div className="image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("main_image", e.target.files)}
              required
            />
            <div className="upload-placeholder">
              <FiCamera />
              <span>{t("uploadMainImage")}</span>
            </div>
          </div>

          {/* Main Image Preview */}
          {formData.main_image && (
            <div className="image-preview">
              <div className="preview-container">
                <img
                  src={URL.createObjectURL(formData.main_image)}
                  alt="Main Image Preview"
                  className="preview-image"
                />
                <div className="image-info">
                  <span className="image-name">{formData.main_image.name}</span>
                  <span className="image-size">
                    {(formData.main_image.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, main_image: null }))
                  }
                  className="remove-image-btn"
                >
                  <FiX />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>{t("otherImages")}</label>
          <div className="image-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange("other_images", e.target.files)}
            />
            <div className="upload-placeholder">
              <FiCamera />
              <span>{t("uploadAdditionalImages")}</span>
            </div>
          </div>

          {/* Other Images Preview */}
          {formData.other_images && formData.other_images.length > 0 && (
            <div className="other-images-preview">
              <h5 className="preview-title">{t("selectedImages")}</h5>
              <div className="images-grid">
                {formData.other_images.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Image ${index + 1}`}
                      className="preview-image small"
                    />
                    <div className="image-info">
                      <span className="image-name">{image.name}</span>
                      <span className="image-size">
                        {(image.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = formData.other_images.filter(
                          (_, i) => i !== index
                        );
                        setFormData((prev) => ({
                          ...prev,
                          other_images: newImages,
                        }));
                      }}
                      className="remove-image-btn small"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );

  const renderProductsList = () => (
    <div className="products-section">
      <div className="filters">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.main_image} alt={product.name} />
              <div className="product-actions">
                <button
                  onClick={() => handleEdit(product)}
                  className="action-btn edit"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="action-btn delete"
                >
                  <FiTrash2 />
                </button>
                <button
                  className="action-btn view"
                  onClick={() => handleViewProduct(product.id)}
                  disabled={viewLoading}
                >
                  <FiEye />
                </button>
              </div>
            </div>
            <div className="product-info">
              <h4>{getLocalizedName(product)}</h4>
              <p className="price">{product.price} EGP</p>
              <p className="condition">
                {getLocalizedCondition(product.condition)}
              </p>
              <p className="address">{product.address}</p>
              <div className="product-meta">
                <span
                  className={`delivery-badge ${
                    isAvailable(product.has_delivery)
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  <FiTruck className="meta-icon" />
                  {getLocalizedText(
                    isAvailable(product.has_delivery),
                    "delivery"
                  )}
                </span>
                <span
                  className={`warranty-badge ${
                    isAvailable(product.has_warranty)
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  <FiShield className="meta-icon" />
                  {getLocalizedText(
                    isAvailable(product.has_warranty),
                    "warranty"
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            {t("previous")}
          </button>
          <span>
            {currentPage} {t("pageOf")} {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            {t("next")}
          </button>
        </div>
      )}
    </div>
  );

  // Fetch main categories for edit form
  const fetchEditMainCategories = async () => {
    try {
      setEditCategoriesLoading(true);
      setEditCategoriesError("");

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const accountType = userData.account_type || "physical";

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/categories/children?market=${accountType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      const mainCategories = response.data.data || [];

      if (mainCategories.length > 0) {
        setEditCategoryLevels([
          {
            level: 0,
            categories: mainCategories,
            loading: false,
            error: "",
          },
        ]);
        setEditSelectedCategories({});
      }
    } catch (error) {
      console.error("Error fetching edit main categories:", error);
      setEditCategoriesError(t("settings.failedToLoadCategories"));
    } finally {
      setEditCategoriesLoading(false);
    }
  };

  // Fetch sub categories for edit form
  const fetchEditSubCategories = async (parentId, level) => {
    try {
      setEditCategoryLevels((prev) =>
        prev.map((l) =>
          l.level === level ? { ...l, loading: true, error: "" } : l
        )
      );

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const accountType = userData.account_type || "physical";

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/categories/children?parent_id=${parentId}&market=${accountType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      const subCategories = response.data.data || [];

      setEditCategoryLevels((prev) => {
        const newLevels = [...prev];
        const levelsToKeep = newLevels.filter((l) => l.level <= level);

        if (subCategories.length > 0) {
          levelsToKeep.push({
            level: level + 1,
            categories: subCategories,
            loading: false,
            error: "",
          });
        }

        return levelsToKeep;
      });

      setEditSelectedCategories((prev) => {
        const newSelected = { ...prev };
        Object.keys(newSelected).forEach((key) => {
          if (parseInt(key) > level) {
            delete newSelected[key];
          }
        });
        return newSelected;
      });
    } catch (error) {
      console.error("Error fetching edit sub categories:", error);
      setEditCategoryLevels((prev) =>
        prev.map((l) =>
          l.level === level
            ? {
                ...l,
                loading: false,
                error: t("settings.failedToLoadCategories"),
              }
            : l
        )
      );
    }
  };

  // Handle category change in edit form
  const handleEditCategoryChange = async (categoryId, level) => {
    console.log(
      `Edit category change: level ${level}, category ID ${categoryId}`
    );

    setEditSelectedCategories((prev) => ({
      ...prev,
      [level]: categoryId,
    }));

    if (categoryId) {
      const currentLevel = editCategoryLevels.find((l) => l.level === level);
      const selectedCategory = currentLevel?.categories.find(
        (cat) => cat.id == categoryId
      );

      if (selectedCategory && selectedCategory.has_children === 1) {
        await fetchEditSubCategories(categoryId, level);
      } else if (selectedCategory && selectedCategory.has_children === 0) {
        setEditFormData((prev) => ({ ...prev, category_id: categoryId }));
        setEditCategoryLevels((prev) => prev.filter((l) => l.level <= level));
      }
    } else {
      setEditCategoryLevels((prev) => prev.filter((l) => l.level <= level));
      setEditSelectedCategories((prev) => {
        const newSelected = { ...prev };
        Object.keys(newSelected).forEach((key) => {
          if (parseInt(key) > level) {
            delete newSelected[key];
          }
        });
        return newSelected;
      });
    }
  };

  // Build category tree for edit form from category_path
  const buildEditCategoryTreeFromPath = async (categoryPath) => {
    try {
      console.log("Building edit category tree from path:", categoryPath);

      if (categoryPath.length === 0) return;

      // Set the final category ID
      const finalCategory = categoryPath[categoryPath.length - 1];
      setEditFormData((prev) => ({
        ...prev,
        category_id: finalCategory.id,
      }));

      // Store the category path for display purposes
      setEditFormData((prev) => ({
        ...prev,
        category_path: categoryPath,
      }));

      // Build the category levels dynamically for new selection
      const newCategoryLevels = [];
      const newSelectedCategories = {};

      // First level is already loaded from fetchEditMainCategories
      if (categoryPath.length > 0) {
        newSelectedCategories[0] = categoryPath[0].id;
      }

      // Build subsequent levels
      for (let i = 1; i < categoryPath.length; i++) {
        const category = categoryPath[i];
        const parentCategory = categoryPath[i - 1];

        try {
          console.log(
            `Fetching categories for level ${i}, parent: ${parentCategory.name} (ID: ${parentCategory.id})`
          );

          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/categories/children?parent_id=${parentCategory.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                Accept: "application/json",
                "Accept-Language": i18n.language,
              },
            }
          );

          const subCategories = response.data.data || [];
          console.log(`Level ${i} categories:`, subCategories);

          newCategoryLevels.push({
            level: i,
            categories: subCategories,
            loading: false,
            error: "",
          });

          newSelectedCategories[i] = category.id;
        } catch (error) {
          console.error(`Error fetching categories for level ${i}:`, error);
        }
      }

      console.log("New edit category levels:", newCategoryLevels);
      console.log("New edit selected categories:", newSelectedCategories);

      setEditCategoryLevels((prev) => [...prev, ...newCategoryLevels]);
      setEditSelectedCategories(newSelectedCategories);
    } catch (error) {
      console.error("Error building edit category tree from path:", error);
    }
  };

  // Reset edit category selection
  const resetEditCategorySelection = async () => {
    try {
      setEditSelectedCategories({});
      setEditFormData((prev) => ({
        ...prev,
        category_id: "",
        category_path: [],
      }));
      setEditCategoryLevels((prev) => prev.slice(0, 1));
      await fetchEditMainCategories();
    } catch (error) {
      console.error("Error resetting edit categories:", error);
    }
  };

  // Reset edit location fields
  const resetEditLocationFields = () => {
    setEditFormData((prev) => ({
      ...prev,
      country_id: "",
      governorate_id: "",
      center_gov_id: "",
      use_profile_address: "0",
    }));
  };

  // Get edit category name by ID
  const getEditCategoryName = (categoryId, level) => {
    const levelData = editCategoryLevels.find((l) => l.level === level);
    if (levelData) {
      const category = levelData.categories.find((cat) => cat.id == categoryId);
      return category ? category.name : "";
    }
    return "";
  };

  // Handle edit file change
  const handleEditFileChange = (field, files) => {
    if (field === "main_image") {
      setEditFormData((prev) => ({ ...prev, main_image: files[0] }));
    } else if (field === "other_images") {
      setEditFormData((prev) => ({ ...prev, other_images: Array.from(files) }));
    }
  };

  return (
    <>
      <PageHead header={t("navbar.addProduct")} />

      <div className="add-product-page">
        <div className="sidebar">
          <div className="sidebar-tabs">
            <button
              className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
              onClick={() => setActiveTab("add")}
            >
              {t("navbar.addProduct")}
            </button>
            <button
              className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              {t("myProducts")}
            </button>
          </div>

          <div className="sidebar-content">
            {activeTab === "add"
              ? renderAddProductForm()
              : renderProductsList()}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h3>{t("editProduct")}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="close-btn"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="edit-form">
              {/* Category Selection Section */}
              <div className="form-section">
                <h4>{t("categorySelection")}</h4>

                {/* Show Selected Categories from category_path */}
                {editFormData.category_path &&
                editFormData.category_path.length > 0 ? (
                  <div className="selected-categories-display">
                    <div className="form-row">
                      <div className="form-group">
                        <label>{t("selectedCategory")}</label>
                        <div className="selected-category-display">
                          {editFormData.category_path.map((category, index) => (
                            <span
                              key={index}
                              className={`category-badge level-${index}`}
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reset Buttons */}
                    <div className="form-row">
                      <div className="form-group">
                        <button
                          type="button"
                          onClick={resetEditCategorySelection}
                          className="reset-category-btn"
                        >
                          {t("resetCategories")}
                        </button>
                      </div>
                      {/* <div className="form-group">
                        <button
                          type="button"
                          onClick={resetEditLocationFields}
                          className="reset-location-btn"
                        >
                          {t("resetLocation")}
                        </button>
                      </div> */}
                    </div>
                  </div>
                ) : (
                  /* Show Main Category Select when no categories are selected */
                  <div className="main-category-select">
                    {/* Show Currently Selected Categories */}
                    {Object.keys(editSelectedCategories).length > 0 && (
                      <div className="current-selected-categories">
                        <label>{t("currentlySelected")}</label>
                        <div className="selected-category-display">
                          {editCategoryLevels.map((level) => {
                            const selectedCategoryId =
                              editSelectedCategories[level.level];
                            if (selectedCategoryId) {
                              const category = level.categories.find(
                                (cat) => cat.id == selectedCategoryId
                              );
                              return category ? (
                                <span
                                  key={level.level}
                                  className={`category-badge level-${level.level}`}
                                >
                                  {category.name}
                                </span>
                              ) : null;
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <span className="category-level-indicator">1</span>
                          {t("mainCategory")}
                        </label>
                        <select
                          value={editSelectedCategories[0] || ""}
                          onChange={(e) =>
                            handleEditCategoryChange(e.target.value, 0)
                          }
                          required
                          disabled={editCategoriesLoading}
                          className="category-select level-0"
                        >
                          <option value="">
                            {editCategoriesLoading
                              ? t("loading")
                              : t("selectMainCategory")}
                          </option>
                          {!editCategoriesLoading &&
                            editCategoryLevels[0]?.categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name} {cat.has_children === 1 ? "→" : ""}
                              </option>
                            ))}
                        </select>
                        {editCategoriesLoading && (
                          <div className="loading-indicator">
                            {t("loading")}
                          </div>
                        )}
                        {editCategoriesError && (
                          <div className="error-message">
                            {editCategoriesError}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Category Levels for new selection */}
                    {(() => {
                      const rows = [];
                      for (let i = 1; i < editCategoryLevels.length; i += 2) {
                        const firstLevel = editCategoryLevels[i];
                        const secondLevel = editCategoryLevels[i + 1];

                        rows.push(
                          <div key={`edit-row-${i}`} className="form-row">
                            {/* First Level in this row */}
                            <div className="form-group">
                              <label>
                                <span className="category-level-indicator">
                                  {firstLevel.level + 1}
                                </span>
                                {firstLevel.level === 1
                                  ? t("subCategory")
                                  : firstLevel.level === 2
                                  ? t("finalCategory")
                                  : `${t("category")} ${firstLevel.level + 1}`}
                              </label>
                              <select
                                value={
                                  editSelectedCategories[firstLevel.level] || ""
                                }
                                onChange={(e) =>
                                  handleEditCategoryChange(
                                    e.target.value,
                                    firstLevel.level
                                  )
                                }
                                required={
                                  firstLevel.level > 0 &&
                                  editSelectedCategories[firstLevel.level - 1]
                                }
                                disabled={
                                  (firstLevel.level > 0 &&
                                    !editSelectedCategories[
                                      firstLevel.level - 1
                                    ]) ||
                                  firstLevel.loading
                                }
                                className={`category-select level-${firstLevel.level}`}
                              >
                                <option value="">
                                  {firstLevel.loading
                                    ? t("loading")
                                    : firstLevel.level === 1
                                    ? t("selectSubCategory")
                                    : firstLevel.level === 2
                                    ? t("selectFinalCategory")
                                    : t("selectCategory")}
                                </option>
                                {!firstLevel.loading &&
                                  firstLevel.categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name}{" "}
                                      {cat.has_children === 1 ? "→" : ""}
                                    </option>
                                  ))}
                              </select>
                              {firstLevel.loading && (
                                <div className="loading-indicator">
                                  {t("loading")}
                                </div>
                              )}
                              {firstLevel.error && (
                                <div className="error-message">
                                  {firstLevel.error}
                                </div>
                              )}
                            </div>

                            {/* Second Level in this row (if exists) */}
                            {secondLevel && (
                              <div className="form-group">
                                <label>
                                  <span className="category-level-indicator">
                                    {secondLevel.level + 1}
                                  </span>
                                  {secondLevel.level === 1
                                    ? t("subCategory")
                                    : secondLevel.level === 2
                                    ? t("finalCategory")
                                    : `${t("category")} ${
                                        secondLevel.level + 1
                                      }`}
                                </label>
                                <select
                                  value={
                                    editSelectedCategories[secondLevel.level] ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleEditCategoryChange(
                                      e.target.value,
                                      secondLevel.level
                                    )
                                  }
                                  required={
                                    secondLevel.level > 0 &&
                                    editSelectedCategories[
                                      secondLevel.level - 1
                                    ]
                                  }
                                  disabled={
                                    (secondLevel.level > 0 &&
                                      !editSelectedCategories[
                                        secondLevel.level - 1
                                      ]) ||
                                    secondLevel.loading
                                  }
                                  className={`category-select level-${secondLevel.level}`}
                                >
                                  <option value="">
                                    {secondLevel.loading
                                      ? t("loading")
                                      : secondLevel.level === 1
                                      ? t("selectSubCategory")
                                      : secondLevel.level === 2
                                      ? t("selectFinalCategory")
                                      : t("selectCategory")}
                                  </option>
                                  {!secondLevel.loading &&
                                    secondLevel.categories.map((cat) => (
                                      <option key={cat.id} value={cat.id}>
                                        {cat.name}{" "}
                                        {cat.has_children === 1 ? "→" : ""}
                                      </option>
                                    ))}
                                </select>
                                {secondLevel.loading && (
                                  <div className="loading-indicator">
                                    {t("loading")}
                                  </div>
                                )}
                                {secondLevel.error && (
                                  <div className="error-message">
                                    {secondLevel.error}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Empty div to maintain grid if only one level in this row */}
                            {!secondLevel && <div className="form-group"></div>}
                          </div>
                        );
                      }
                      return rows;
                    })()}
                  </div>
                )}
              </div>

              {/* Basic Information Section */}
              <div className="form-section">
                <h4>{t("basicInformation")}</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t("productNameArabic")}</label>
                    <input
                      type="text"
                      value={editFormData.name?.ar || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          name: { ...prev.name, ar: e.target.value },
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("productNameEnglish")}</label>
                    <input
                      type="text"
                      value={editFormData.name?.en || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          name: { ...prev.name, en: e.target.value },
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t("price")}</label>
                    <input
                      type="number"
                      value={editFormData.price || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("condition")}</label>
                    <select
                      value={editFormData.condition || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          condition: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="new">{t("new")}</option>
                      <option value="used">{t("used")}</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t("hasDelivery")}</label>
                    <select
                      value={editFormData.has_delivery || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          has_delivery: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="1">{t("yes")}</option>
                      <option value="0">{t("no")}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t("hasWarranty")}</label>
                    <select
                      value={editFormData.has_warranty || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          has_warranty: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="1">{t("yes")}</option>
                      <option value="0">{t("no")}</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t("warrantyPeriod")}</label>
                    <input
                      type="number"
                      value={editFormData.warranty_period || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          warranty_period: e.target.value,
                        }))
                      }
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="form-section">
                <h4>{t("locationInformation")}</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t("useProfileAddress")}</label>
                    <select
                      value={editFormData.use_profile_address || "0"}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          use_profile_address: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="0">{t("no")}</option>
                      <option value="1">{t("yes")}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t("country")}</label>
                    <select
                      value={editFormData.country_id || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          country_id: e.target.value,
                        }))
                      }
                      required={editFormData.use_profile_address === "0"}
                      disabled={editFormData.use_profile_address === "1"}
                    >
                      <option value="">{t("selectCountry")}</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t("governorate")}</label>
                    <select
                      value={editFormData.governorate_id || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          governorate_id: e.target.value,
                        }))
                      }
                      required={editFormData.use_profile_address === "0"}
                      disabled={
                        editFormData.use_profile_address === "1" ||
                        !editFormData.country_id
                      }
                    >
                      <option value="">{t("selectGovernorate")}</option>
                      {governorates.map((gov) => (
                        <option key={gov.id} value={gov.id}>
                          {gov.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t("centerGovernorate")}</label>
                    <select
                      value={editFormData.center_gov_id || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          center_gov_id: e.target.value,
                        }))
                      }
                      required={editFormData.use_profile_address === "0"}
                      disabled={
                        editFormData.use_profile_address === "1" ||
                        !editFormData.governorate_id
                      }
                    >
                      <option value="">{t("selectCenterGovernorate")}</option>
                      {centerGovernorates.map((center) => (
                        <option key={center.id} value={center.id}>
                          {center.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t("addressArabic")}</label>
                    <textarea
                      value={editFormData.address?.ar || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            ar: e.target.value,
                          },
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("addressEnglish")}</label>
                    <textarea
                      value={editFormData.address?.en || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            en: e.target.value,
                          },
                        }))
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="form-section">
                <h4>{t("description")}</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t("descriptionArabic")}</label>
                    <textarea
                      value={editFormData.description?.ar || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            ar: e.target.value,
                          },
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("descriptionEnglish")}</label>
                    <textarea
                      value={editFormData.description?.en || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            en: e.target.value,
                          },
                        }))
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="form-section">
                <h4>{t("images")}</h4>

                <div className="form-group">
                  <label>{t("mainImage")}</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleEditFileChange("main_image", e.target.files)
                      }
                    />
                    <div className="upload-placeholder">
                      <FiCamera />
                      <span>{t("uploadMainImage")}</span>
                    </div>
                  </div>

                  {/* Main Image Preview */}
                  {editFormData.main_image && (
                    <div className="image-preview">
                      <div className="preview-container">
                        <img
                          src={
                            editFormData.main_image instanceof File
                              ? URL.createObjectURL(editFormData.main_image)
                              : editFormData.main_image
                          }
                          alt="Main Image Preview"
                          className="preview-image"
                        />
                        <div className="image-info">
                          <span className="image-name">
                            {editFormData.main_image instanceof File
                              ? editFormData.main_image.name
                              : "Current Image"}
                          </span>
                          {editFormData.main_image instanceof File && (
                            <span className="image-size">
                              {(
                                editFormData.main_image.size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditFormData((prev) => ({
                              ...prev,
                              main_image: null,
                            }))
                          }
                          className="remove-image-btn"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>{t("otherImages")}</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleEditFileChange("other_images", e.target.files)
                      }
                    />
                    <div className="upload-placeholder">
                      <FiCamera />
                      <span>{t("uploadAdditionalImages")}</span>
                    </div>
                  </div>

                  {/* Other Images Preview */}
                  {editFormData.other_images &&
                    editFormData.other_images.length > 0 && (
                      <div className="other-images-preview">
                        <h5 className="preview-title">{t("selectedImages")}</h5>
                        <div className="images-grid">
                          {editFormData.other_images.map((image, index) => (
                            <div key={index} className="image-preview-item">
                              <img
                                src={
                                  image instanceof File
                                    ? URL.createObjectURL(image)
                                    : image
                                }
                                alt={`Image ${index + 1}`}
                                className="preview-image small"
                              />
                              <div className="image-info">
                                <span className="image-name">
                                  {image instanceof File
                                    ? image.name
                                    : `Image ${index + 1}`}
                                </span>
                                {image instanceof File && (
                                  <span className="image-size">
                                    {(image.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages =
                                    editFormData.other_images.filter(
                                      (_, i) => i !== index
                                    );
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    other_images: newImages,
                                  }));
                                }}
                                className="remove-image-btn small"
                              >
                                <FiX />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="cancel-btn"
                >
                  {t("cancel")}
                </button>
                <button type="submit" className="update-btn" disabled={loading}>
                  {loading ? t("updating") : t("updateProduct")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewModal && viewingProduct && (
        <div className="modal-overlay view-modal-overlay">
          <div className="view-modal">
            <div className="view-modal-header">
              <h3>{t("productDetails.productDetails")}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="view-close-btn"
              >
                <FiX />
              </button>
            </div>
            <div className="view-modal-content">
              {viewLoading ? (
                <div className="view-loading-spinner">
                  <div className="view-spinner"></div>
                  <p>{t("loading")}</p>
                </div>
              ) : (
                <div className="view-product-layout">
                  {/* Product Images Section */}
                  <div className="view-product-images">
                    <div className="view-main-image-container">
                      <img
                        src={viewingProduct.main_image}
                        alt="Main Product"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleImageClick(viewingProduct.main_image);
                        }}
                        className="view-main-image"
                      />
                      <div className="view-image-overlay">
                        <span className="view-overlay-text">
                          {t("clickToEnlarge")}
                        </span>
                      </div>
                    </div>

                    {viewingProduct.other_images &&
                      viewingProduct.other_images.length > 0 && (
                        <div className="view-additional-images">
                          <h5 className="view-images-title">
                            {t("additionalImages")}
                          </h5>
                          <div className="view-images-grid">
                            {viewingProduct.other_images.map((image, index) => (
                              <div
                                key={index}
                                className="view-thumbnail-container"
                              >
                                <img
                                  src={image}
                                  alt={`Additional ${index + 1}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleImageClick(image);
                                  }}
                                  className="view-thumbnail"
                                />
                                <div className="view-thumbnail-overlay">
                                  <span className="view-overlay-text">
                                    {t("clickToEnlarge")}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Product Details Section */}
                  <div className="view-product-info">
                    {/* Basic Information Card */}
                    <div className="view-info-card">
                      <div className="view-card-header">
                        <h4 className="view-card-title">
                          {t("basicInformation")}
                        </h4>
                      </div>
                      <div className="view-card-content">
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("productNameArabic")}:
                          </span>
                          <span className="view-info-value">
                            {viewingProduct.name?.ar ||
                              viewingProduct.name ||
                              t("noData")}
                          </span>
                        </div>
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("productNameEnglish")}:
                          </span>
                          <span className="view-info-value">
                            {viewingProduct.name?.en ||
                              viewingProduct.name ||
                              t("noData")}
                          </span>
                        </div>
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("category")}:
                          </span>
                          <span className="view-info-value">
                            {viewingProduct.category?.name ||
                              viewingProduct.category ||
                              t("noCategory")}
                          </span>
                        </div>
                        <div className="view-info-item">
                          <span className="view-info-label">{t("price")}:</span>
                          <span className="view-info-value view-price">
                            {viewingProduct.price} EGP
                          </span>
                        </div>
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("condition")}:
                          </span>
                          <span className="view-info-value">
                            {getLocalizedCondition(viewingProduct.condition)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description Card */}
                    <div className="view-info-card">
                      <div className="view-card-header">
                        <h4 className="view-card-title">{t("description")}</h4>
                      </div>
                      <div className="view-card-content">
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("descriptionArabic")}:
                          </span>
                          <span className="view-info-value view-description">
                            {viewingProduct.description?.ar ||
                              viewingProduct.description ||
                              t("noData")}
                          </span>
                        </div>
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("descriptionEnglish")}:
                          </span>
                          <span className="view-info-value view-description">
                            {viewingProduct.description?.en ||
                              viewingProduct.description ||
                              t("noData")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location Information Card */}
                    <div className="view-info-card">
                      <div className="view-card-header">
                        <h4 className="view-card-title">
                          {t("locationInformation")}
                        </h4>
                      </div>
                      <div className="view-card-content">
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("country")}:
                          </span>
                          <span className="view-info-value">
                            {viewingProduct.country?.name ||
                              viewingProduct.country ||
                              t("noCountry")}
                          </span>
                        </div>
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("governorate")}:
                          </span>
                          <span className="view-info-value">
                            {viewingProduct.governorate?.name ||
                              viewingProduct.governorate ||
                              t("noGovernorate")}
                          </span>
                        </div>
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("centerGovernorate")}:
                          </span>
                          <span className="view-info-value">
                            {viewingProduct.center_gov?.name ||
                              viewingProduct.center_gov ||
                              t("noCenterGovernorate")}
                          </span>
                        </div>
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("address")}:
                          </span>
                          <span className="view-info-value view-address">
                            {viewingProduct.address?.ar ||
                              viewingProduct.address ||
                              t("noData")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information Card */}
                    <div className="view-info-card">
                      <div className="view-card-header">
                        <h4 className="view-card-title">
                          {t("additionalInformation")}
                        </h4>
                      </div>
                      <div className="view-card-content">
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("hasDelivery")}:
                          </span>
                          <span
                            className={`view-info-value view-status ${
                              isAvailable(viewingProduct.has_delivery)
                                ? "available"
                                : "unavailable"
                            }`}
                          >
                            {getLocalizedText(
                              isAvailable(viewingProduct.has_delivery),
                              "delivery"
                            )}
                          </span>
                        </div>
                        <div className="view-info-item">
                          <span className="view-info-label">
                            {t("hasWarranty")}:
                          </span>
                          <span
                            className={`view-info-value view-status ${
                              isAvailable(viewingProduct.has_warranty)
                                ? "available"
                                : "unavailable"
                            }`}
                          >
                            {getLocalizedText(
                              isAvailable(viewingProduct.has_warranty),
                              "warranty"
                            )}
                          </span>
                        </div>
                        {viewingProduct.warranty_period && (
                          <div className="view-info-item">
                            <span className="view-info-label">
                              {t("warrantyPeriod")}:
                            </span>
                            <span className="view-info-value">
                              {viewingProduct.warranty_period}{" "}
                              {t("months") || "شهر"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div
          className="modal-overlay image-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowImageModal(false);
            }
          }}
        >
          <div className="image-modal">
            <div className="image-modal-header">
              <button
                onClick={() => setShowImageModal(false)}
                className="close-btn"
              >
                <FiX />
              </button>
            </div>
            <div className="image-modal-content">
              <img
                src={selectedImage}
                alt="Full size"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
