import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import PageHead from "../../component/PageHead/PageHead";
import styles from "./Privacy.module.css";

export default function Privacy() {
  const { t, i18n } = useTranslation("global");
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacyData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/static-pages/privacy`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );
        if (response.data?.status === 200) {
          setPageData(response.data.data || null);
        }
      } catch (error) {
        console.error("Error fetching privacy data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrivacyData();
  }, [i18n.language]);

  return (
    <>
      <PageHead header={t("privacyPolicy")} />

      <section className={styles.privacySection}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className={styles.privacyContent}>
                <h1 className={styles.pageTitle}>
                  {pageData?.title || t("privacyPolicy")}
                </h1>

                {loading ? (
                  <div className={styles.contentSkeleton}>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                  </div>
                ) : (
                  <div className={styles.pageDescription}>
                    {pageData?.description ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: pageData.description.replace(/\n/g, "<br />"),
                        }}
                      />
                    ) : (
                      <p>{t("privacyDefaultContent")}</p>
                    )}
                  </div>
                )}

                <div className={styles.lastUpdated}>
                  {pageData?.updated_at && (
                    <p>
                      <strong>{t("lastUpdated")}:</strong>{" "}
                      {new Date(pageData.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
