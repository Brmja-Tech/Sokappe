import React, { useEffect } from "react";
import "./home.css";
import Hero from "../../component/Hero/Hero";
import Ads from "../../component/Ads/Ads";
import Features from "../../component/Features/Features";
import AdsNewMarket from "../../component/AdsNewMarket/AdsNewMarket";
import AdsServices from "../../component/AdsServices/AdsServices";
import AdsOpenMarket from "../../component/AdsOpenMarket/AdsOpenMarket";
import ProductsNewMarket from "../../component/ProductsNewMarket/ProductsNewMarket";
import ProductsServices from "../../component/ProductsServices/ProductsServices";
import ProductsOpenMarket from "../../component/ProductsOpenMarket/ProductsOpenMarket";
import { useTranslation } from 'react-i18next'
import ProductsUsedMarket from "../../component/ProductsUsedMarket/ProductsUsedMarket";

const Home = () => {
  const { t, i18n } = useTranslation("global");

  return (
    <>
      <Hero />
      <Ads/>
      <AdsNewMarket/>
      <AdsServices/>
      <AdsOpenMarket/>
      <ProductsNewMarket/>
      <ProductsUsedMarket/>
      <ProductsServices tittle={t("products.services")}/>
      <ProductsOpenMarket/>
      <Features/>
    </>
  );
};

export default Home;
