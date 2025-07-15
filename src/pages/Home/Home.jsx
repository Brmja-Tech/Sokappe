import React, { useEffect } from "react";
import "./home.css";
import Hero from "../../component/Hero/Hero";
import Ads from "../../component/Ads/Ads";
import Products from "../../component/Products/Products";

const Home = () => {
  return (
    <>
      <Hero />
      <Ads/>
      <Products/>
    </>
  );
};

export default Home;
