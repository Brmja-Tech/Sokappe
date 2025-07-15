import React, { useEffect } from "react";
import "./home.css";
import Hero from "../../component/Hero/Hero";
import Ads from "../../component/Ads/Ads";
import Products from "../../component/Products/Products";
import Services from "../../component/Services/Services";
import Features from "../../component/Features/Features";
import Testimonials from "../../component/Testimonials/Testimonials";

const Home = () => {
  return (
    <>
      <Hero />
      <Ads/>
      <Products/>
      <Services/>
      <Features/>
      <Testimonials/>
    </>
  );
};

export default Home;
