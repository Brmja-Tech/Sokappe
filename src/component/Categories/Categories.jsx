import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCode,
  FaPen,
  FaChartLine,
  FaPalette,
  FaLaptopCode,
  FaMobileAlt,
  FaHome,
  FaCar,
  FaBriefcase,
  FaBaby,
  FaCouch,
  FaDog,
  FaGem,
  FaTshirt,
  FaGamepad,
  FaCog,
  FaFolder,
  FaChevronDown,
  FaChevronRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import "./Categories.css";

const Categories = () => {
  const { t, i18n } = useTranslation("global");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic Categories States - exactly like AddProduct
  const [categoryLevels, setCategoryLevels] = useState([]); // Array of category levels
  const [expandedCategories, setExpandedCategories] = useState({}); // Object to store expanded categories

  // Icon mapping for different product types
  const getProductIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (
      name.includes("electronics") ||
      name.includes("laptop") ||
      name.includes("computer")
    )
      return <FaLaptopCode />;
    if (
      name.includes("clothing") ||
      name.includes("fashion") ||
      name.includes("shirt")
    )
      return <FaTshirt />;
    if (
      name.includes("furniture") ||
      name.includes("couch") ||
      name.includes("chair")
    )
      return <FaCouch />;
    if (name.includes("car") || name.includes("vehicle")) return <FaCar />;
    if (
      name.includes("home") ||
      name.includes("house") ||
      name.includes("property")
    )
      return <FaHome />;
    if (name.includes("baby") || name.includes("child")) return <FaBaby />;
    if (name.includes("pet") || name.includes("animal") || name.includes("dog"))
      return <FaDog />;
    if (name.includes("business") || name.includes("work"))
      return <FaBriefcase />;
    if (name.includes("game") || name.includes("hobby")) return <FaGamepad />;
    if (name.includes("jewelry") || name.includes("gem")) return <FaGem />;
    return <FaCog />; // Default icon
  };

  // Fetch main categories on component mount
  useEffect(() => {
    fetchMainCategories();
  }, []);

  // Fetch main categories - exactly like AddProduct
  const fetchMainCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching categories for market: physical");

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/categories/children?market=physical`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      console.log("Categories API response:", response.data);
      const mainCategories = response.data.data || [];

      if (mainCategories.length > 0) {
        console.log("Main categories loaded:", mainCategories);
        // Initialize first level exactly like AddProduct
        setCategoryLevels([
          {
            level: 0,
            categories: mainCategories,
            loading: false,
            error: "",
          },
        ]);
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
      }
    } catch (error) {
      console.error("Error fetching main categories:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Use fallback categories on error exactly like AddProduct
      console.log("Using fallback categories due to API error");
      const fallbackCategories = [
        { id: 1, name: "Electronics", has_children: 1 },
        { id: 2, name: "Clothing", has_children: 1 },
        { id: 3, name: "Furniture", has_children: 1 },
      ];
      setCategoryLevels([
        {
          level: 0,
          categories: fallbackCategories,
          loading: false,
          error: "",
        },
      ]);

      setError("Failed to load categories. Using fallback categories.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch sub categories when a category is selected - exactly like AddProduct
  const fetchSubCategories = async (parentId, level) => {
    try {
      // Set loading for this specific level
      setCategoryLevels((prev) =>
        prev.map((l) =>
          l.level === level ? { ...l, loading: true, error: "" } : l
        )
      );

      console.log(
        "Fetching sub categories for parent ID:",
        parentId,
        "level:",
        level,
        "market: physical"
      );

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/categories/children?parent_id=${parentId}&market=physical`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      console.log("Sub categories API response:", response.data);
      const subCategories = response.data.data || [];

      // Update the levels array with new categories exactly like AddProduct
      setCategoryLevels((prev) => {
        const newLevels = [...prev];

        // Remove all levels after the current one
        const levelsToKeep = newLevels.filter((l) => l.level <= level);

        // Add new level if categories exist
        if (subCategories.length > 0) {
          levelsToKeep.push({
            level: level + 1,
            categories: subCategories,
            loading: false,
            error: "",
          });
        }

        console.log("Updated category levels:", levelsToKeep);
        return levelsToKeep;
      });
    } catch (error) {
      console.error("Error fetching sub categories:", error);

      // Set error for this specific level
      setCategoryLevels((prev) =>
        prev.map((l) =>
          l.level === level
            ? { ...l, loading: false, error: "Failed to load subcategories" }
            : l
        )
      );

      setError("Failed to load subcategories. Please try again.");
    }
  };

  // Handle category click - exactly like AddProduct logic
  const handleCategoryClick = async (category, level = 0) => {
    console.log("Category clicked:", category, "Level:", level);
    console.log("has_children value:", category.has_children);

    if (category.has_children === 1) {
      console.log("Category has children, expanding...");

      // If this category is already expanded, just close it
      if (expandedCategories[category.id]) {
        console.log("Closing category:", category.name);
        setExpandedCategories((prev) => {
          const newState = { ...prev, [category.id]: false };
          console.log("New expandedCategories state:", newState);
          return newState;
        });

        // Remove all levels after this one exactly like AddProduct
        setCategoryLevels((prev) => prev.filter((l) => l.level <= level));
      } else {
        // If opening a new category, close all others and open this one
        console.log("Opening category:", category.name);
        setExpandedCategories((prev) => {
          const newState = { [category.id]: true };
          console.log("New expandedCategories state:", newState);
          return newState;
        });

        // Remove all levels after this one exactly like AddProduct
        setCategoryLevels((prev) => prev.filter((l) => l.level <= level));

        // Fetch subcategories for this level exactly like AddProduct
        console.log(
          "Fetching subcategories for:",
          category.name,
          "Level:",
          level + 1
        );
        await fetchSubCategories(category.id, level + 1);
      }
    } else {
      console.log("Category is a leaf, navigating to products page");
      // Navigate to filter products page with category ID for physical products
      window.location.href = `/filterproductsphysical?category_id=${category.id}&market=physical`;
    }
  };

  // Render category recursively - exactly like AddProduct
  const renderCategory = (category, level = 0) => {
    const isExpanded = expandedCategories[category.id];
    const hasChildren = category.has_children === 1;

    console.log(`Rendering category: ${category.name}`, {
      id: category.id,
      has_children: category.has_children,
      hasChildren,
      isExpanded,
      level,
    });

    return (
      <div
        key={category.id}
        className="category-item"
        style={{ marginLeft: `${level * 30}px` }}
      >
        <div
          className={`category_card ${hasChildren ? "has-children" : ""} ${
            isExpanded ? "expanded" : ""
          }`}
          onClick={() => handleCategoryClick(category, level)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCategoryClick(category, level);
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={isExpanded}
          aria-label={`${category.name} category${
            hasChildren ? " with subcategories" : ""
          }`}
        >
          <div className="category-content">
            <div className="category-icon-wrapper">
              {category.image ? (
                <img src={category.image} alt={category.name} />
              ) : (
                <div className="category-icon">
                  {getProductIcon(category.name)}
                </div>
              )}
            </div>
            <h5>{category.name}</h5>
            {hasChildren && (
              <span className="expand-icon" aria-hidden="true">
                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            )}
          </div>
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="subcategories">
            {/* Check if next level exists in categoryLevels exactly like AddProduct */}
            {(() => {
              const nextLevel = categoryLevels.find(
                (l) => l.level === level + 1
              );
              if (
                nextLevel &&
                nextLevel.categories &&
                nextLevel.categories.length > 0
              ) {
                return nextLevel.categories.map((child) =>
                  renderCategory(child, level + 1)
                );
              } else if (nextLevel && nextLevel.loading) {
                return (
                  <div className="text-center text-muted py-2">
                    Loading subcategories...
                  </div>
                );
              } else if (nextLevel && nextLevel.error) {
                return (
                  <div className="text-center text-danger py-2">
                    {nextLevel.error}
                  </div>
                );
              } else {
                return (
                  <div className="text-center text-muted py-2">
                    No subcategories available
                  </div>
                );
              }
            })()}
          </div>
        )}
      </div>
    );
  };

  // Retry loading categories
  const handleRetry = () => {
    setError(null);
    fetchMainCategories();
  };

  return (
    <div className="services py-5">
      <div className="container">
        <h4 className="mb-3 main-color text-center title">
          <img src="/shopping-list.gif" alt="--" /> {t("categoriess")}
        </h4>
        <p className="mb-4 gray-color text-center">{t("yourFeedback")}</p>

        <div className="services_categories py-3">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("settings.loading")}</span>
              </div>
              <p className="mt-2 text-muted">{t("settings.loading")}</p>
            </div>
          ) : error ? (
            <div className="text-center text-danger">
              <div className="error-icon mb-3">
                <FaExclamationTriangle size={48} />
              </div>
              <p className="mb-3">{error}</p>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleRetry}
              >
                {t("cart.retry")}
              </button>
            </div>
          ) : categoryLevels.length > 0 ? (
            <div className="categories-grid">
              {categoryLevels.map((level) => (
                <div key={level.level} className="category-level">
                  <h4 className="level-title">
                    {t(`categories.level${level.level}`)}
                  </h4>
                  {level.loading ? (
                    <div className="text-center py-3">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading categories...</p>
                    </div>
                  ) : level.error ? (
                    <div className="text-center text-danger py-3">
                      <p>{level.error}</p>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() =>
                          fetchSubCategories(
                            level.categories[0]?.id,
                            level.level
                          )
                        }
                      >
                        Retry
                      </button>
                    </div>
                  ) : level.categories.length > 0 ? (
                    level.categories.map((category) =>
                      renderCategory(category, level.level)
                    )
                  ) : (
                    <div className="text-center text-muted py-3">
                      No categories available at this level.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted">
              <div className="empty-icon mb-3">
                <FaFolder size={48} />
              </div>
              <p>No categories available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
