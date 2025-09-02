import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import styles from "./FAQ.module.css";

const FAQ = () => {
  const { t, i18n } = useTranslation("global");
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/faqs`, {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        });

        const result = await response.json();

        if (result.data && Array.isArray(result.data)) {
          setFaqs(result.data);
        } else {
          // Fallback data for testing
          setFaqs([
            {
              id: 1,
              question: "How do I book a ride?",
              answer:
                "You can book a ride by selecting your pickup point, destination, and car type in the app.",
            },
            {
              id: 2,
              question: "How can I pay for a ride?",
              answer:
                "You can pay cash upon arrival or use a saved credit card in the app.",
            },
          ]);
        }
      } catch (error) {
        // Fallback data for testing
        setFaqs([
          {
            id: 1,
            question: "How do I book a ride?",
            answer:
              "You can book a ride by selecting your pickup point, destination, and car type in the app.",
          },
          {
            id: 2,
            question: "How can I pay for a ride?",
            answer:
              "You can pay cash upon arrival or use a saved credit card in the app.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [i18n.language]);

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <FaQuestionCircle className={styles.spinnerIcon} />
        </div>
        <p className={styles.loadingText}>{t("faq.loading")}</p>
      </div>
    );
  }

  return (
    <div className={styles.faqContainer}>
      <div className="container">
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.headerIcon}>
            <FaQuestionCircle />
          </div>
          <h1 className={styles.mainTitle}>{t("faq.title")}</h1>
          <p className={styles.subtitle}>{t("faq.subtitle")}</p>
        </div>

        {/* FAQ Items */}
        <div className={styles.faqList}>
          {faqs.length > 0 ? (
            faqs.map((faq, index) => {
              const isExpanded = expandedItems.has(faq.id);
              return (
                <div
                  key={faq.id}
                  className={`${styles.faqItem} ${
                    isExpanded ? styles.expanded : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={styles.questionHeader}
                    onClick={() => toggleExpanded(faq.id)}
                  >
                    <div className={styles.questionContent}>
                      <span className={styles.questionNumber}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className={styles.question}>{faq.question}</h3>
                    </div>
                    <div className={styles.chevronIcon}>
                      {isExpanded ? (
                        <FaChevronUp className={styles.chevron} />
                      ) : (
                        <FaChevronDown className={styles.chevron} />
                      )}
                    </div>
                  </div>
                  <div
                    className={`${styles.answerContainer} ${
                      isExpanded ? styles.answerExpanded : ""
                    }`}
                  >
                    <div className={styles.answer}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.noFaqs}>
              <p>{t("faq.noFaqs")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
