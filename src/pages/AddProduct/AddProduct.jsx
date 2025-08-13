import React, { useState, useEffect } from "react";
import PageHead from "../../component/PageHead/PageHead";
import { useTranslation } from "react-i18next";
import { FiCamera, FiPlus, FiEdit, FiTrash2, FiEye, FiX } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
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

  // Edit Form Data
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
  });

  useEffect(() => {
    fetchCategories();
    fetchCountries();
    fetchMyProducts();
  }, []);

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

  const handleEdit = (product) => {
    console.log("Editing product:", product); // Debug log
    setEditingProduct(product);

    // Helper function to get condition value
    const getConditionValue = (condition) => {
      if (condition === "مستعمل" || condition === "used") return "used";
      if (condition === "جديد" || condition === "new") return "new";
      return "new";
    };

    // Helper function to get delivery/warranty value
    const getBooleanValue = (value) => {
      if (value === "نعم" || value === "Yes" || value === "1" || value === true)
        return "1";
      return "0";
    };

    const editData = {
      name: { ar: product.name || "", en: product.name || "" },
      description: {
        ar: product.description || "",
        en: product.description || "",
      },
      category_id: product.category_id || "",
      price: product.price || "",
      country_id: product.owner?.country_id || "",
      address: { ar: product.address || "", en: product.address || "" },
      condition: getConditionValue(product.condition),
      has_delivery: getBooleanValue(product.has_delivery),
      has_warranty: getBooleanValue(product.has_warranty),
      warranty_period: product.warranty_period?.replace(" شهر", "") || "",
      governorate_id: product.owner?.governorate_id || "",
      center_gov_id: product.owner?.centerGov_id || "",
      use_profile_address: "0",
    };

    console.log("Edit form data:", editData); // Debug log

    // Set the edit form data first
    setEditFormData(editData);

    // Then show the modal
    setTimeout(() => {
      setShowEditModal(true);
      console.log("Modal should be open now"); // Debug log
    }, 100);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      Object.keys(editFormData).forEach((key) => {
        if (key === "name" || key === "description" || key === "address") {
          if (editFormData[key].ar)
            formDataToSend.append(`${key}[ar]`, editFormData[key].ar);
          if (editFormData[key].en)
            formDataToSend.append(`${key}[en]`, editFormData[key].en);
        } else {
          formDataToSend.append(key, editFormData[key]);
        }
      });

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/products/${editingProduct.id}`,
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
      toast.error(error.response?.data?.message || t("failedToUpdate"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm(t("deleteConfirm"))) {
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
  };

  // Helper function to check if delivery/warranty is available
  const isAvailable = (value) => {
    return (
      value === "نعم" || value === "Yes" || value === "1" || value === true
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
            <label>{t("category")}</label>
            <select
              value={formData.category_id}
              onChange={(e) => handleInputChange("category_id", e.target.value)}
              required
            >
              <option value="">{t("selectCategory")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
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
        </div>

        <div className="form-row">
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
      </div>

      <div className="form-section">
        <h4>{t("locationInformation")}</h4>

        <div className="form-row">
          <div className="form-group">
            <label>{t("country")}</label>
            <select
              value={formData.country_id}
              onChange={(e) => handleInputChange("country_id", e.target.value)}
              required
            >
              <option value="">{t("selectCountry")}</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t("governorate")}</label>
            <select
              value={formData.governorate_id}
              onChange={(e) =>
                handleInputChange("governorate_id", e.target.value)
              }
              required
              disabled={!formData.country_id}
            >
              <option value="">{t("selectGovernorate")}</option>
              {governorates.map((gov) => (
                <option key={gov.id} value={gov.id}>
                  {gov.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t("centerGovernorate")}</label>
            <select
              value={formData.center_gov_id}
              onChange={(e) =>
                handleInputChange("center_gov_id", e.target.value)
              }
              required
              disabled={!formData.governorate_id}
            >
              <option value="">{t("selectCenterGovernorate")}</option>
              {centerGovernorates.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

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
                  className={`delivery ${
                    isAvailable(product.has_delivery) ? "yes" : "no"
                  }`}
                >
                  {getLocalizedText(
                    isAvailable(product.has_delivery),
                    "delivery"
                  )}
                </span>
                <span
                  className={`warranty ${
                    isAvailable(product.has_warranty) ? "yes" : "no"
                  }`}
                >
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
              {t("addProduct")}
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
          <div className="modal">
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
                <div className="form-row">
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
                    <option value="new">{t("yes")}</option>
                    <option value="used">{t("no")}</option>
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
        <div className="modal-overlay">
          <div className="modal view-modal">
            <div className="modal-header">
              <h3>{t("productDetails")}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="close-btn"
              >
                <FiX />
              </button>
            </div>
            <div className="view-product-content">
              {viewLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>{t("loading")}</p>
                </div>
              ) : (
                <>
                  <div className="product-images">
                    <div className="main-image">
                      <img
                        src={viewingProduct.main_image}
                        alt="Main"
                        onClick={() =>
                          handleImageClick(viewingProduct.main_image)
                        }
                        className="clickable-image"
                      />
                      <div className="image-overlay">
                        <span>{t("clickToEnlarge")}</span>
                      </div>
                    </div>
                    {viewingProduct.other_images &&
                      viewingProduct.other_images.length > 0 && (
                        <div className="other-images">
                          <h5>{t("additionalImages")}</h5>
                          <div className="images-grid">
                            {viewingProduct.other_images.map((image, index) => (
                              <div key={index} className="other-image">
                                <img
                                  src={image}
                                  alt={`Additional ${index + 1}`}
                                  onClick={() => handleImageClick(image)}
                                  className="clickable-image"
                                />
                                <div className="image-overlay">
                                  <span>{t("clickToEnlarge")}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="product-details">
                    <div className="detail-section">
                      <h4>{t("basicInformation")}</h4>
                      <div className="detail-row">
                        <span className="detail-label">
                          {t("productNameArabic")}:
                        </span>
                        <span className="detail-value">
                          {viewingProduct.name?.ar || viewingProduct.name}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">
                          {t("productNameEnglish")}:
                        </span>
                        <span className="detail-value">
                          {viewingProduct.name?.en || viewingProduct.name}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">{t("category")}:</span>
                        <span className="detail-value">
                          {viewingProduct.category}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">{t("price")}:</span>
                        <span className="detail-value price">
                          {viewingProduct.price} EGP
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">{t("condition")}:</span>
                        <span className="detail-value">
                          {getLocalizedCondition(viewingProduct.condition)}
                        </span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>{t("description")}</h4>
                      <div className="detail-row">
                        <span className="detail-label">
                          {t("descriptionArabic")}:
                        </span>
                        <span className="detail-value">
                          {viewingProduct.description?.ar ||
                            viewingProduct.description}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">
                          {t("descriptionEnglish")}:
                        </span>
                        <span className="detail-value">
                          {viewingProduct.description?.en ||
                            viewingProduct.description}
                        </span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>{t("locationInformation")}</h4>
                      <div className="detail-row">
                        <span className="detail-label">{t("country")}:</span>
                        <span className="detail-value">
                          {viewingProduct.country}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">
                          {t("governorate")}:
                        </span>
                        <span className="detail-value">
                          {viewingProduct.governorate}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">
                          {t("centerGovernorate")}:
                        </span>
                        <span className="detail-value">
                          {viewingProduct.center_gov}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">{t("address")}:</span>
                        <span className="detail-value">
                          {viewingProduct.address?.ar || viewingProduct.address}
                        </span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>{t("additionalInformation")}</h4>
                      <div className="detail-row">
                        <span className="detail-label">
                          {t("hasDelivery")}:
                        </span>
                        <span
                          className={`detail-value ${
                            isAvailable(viewingProduct.has_delivery)
                              ? "yes"
                              : "no"
                          }`}
                        >
                          {getLocalizedText(
                            isAvailable(viewingProduct.has_delivery),
                            "delivery"
                          )}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">
                          {t("hasWarranty")}:
                        </span>
                        <span
                          className={`detail-value ${
                            isAvailable(viewingProduct.has_warranty)
                              ? "yes"
                              : "no"
                          }`}
                        >
                          {getLocalizedText(
                            isAvailable(viewingProduct.has_warranty),
                            "warranty"
                          )}
                        </span>
                      </div>
                      {viewingProduct.warranty_period && (
                        <div className="detail-row">
                          <span className="detail-label">
                            {t("warrantyPeriod")}:
                          </span>
                          <span className="detail-value">
                            {viewingProduct.warranty_period}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="modal-overlay image-modal-overlay">
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
              <img src={selectedImage} alt="Full size" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
