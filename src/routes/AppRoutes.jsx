import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import Home from "../pages/Home/Home";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";

// import Profile from "../components/Profile/Profile";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import OfferRequestService from "../pages/OfferRequestService/OfferRequestService";
import RequestService from "../pages/RequestService/RequestService";
import FilterProducts from "../pages/FilterProducts/FilterProducts";
import ProductsDetalis from "../pages/ProductsDetalis/ProductsDetalis";
import AboutUS from "../pages/AboutUS/AboutUS";
import ContactUS from "../pages/ContactUS/ContactUS";

export default function Applayout() {
  const location = useLocation();
  const { i18n } = useTranslation();

  // Handle direction change based on language
  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
  }, [i18n.language]);

  const hideNavbarFooterPaths = ["/login", "/register", "/OTP", "/otp", '/verify-account', '/forgot-password', '/change-password', 'otp-reset'];
  const shouldHideNavbarFooter = hideNavbarFooterPaths.includes(
    location.pathname
  );

  return (
    <>
      {!shouldHideNavbarFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/offer-request-service" element={<OfferRequestService />} />
        <Route path="/requestservice" element={<RequestService />} />
        <Route path="/filterproducts" element={<FilterProducts />} />
        <Route path="/productdetalis" element={<ProductsDetalis />} />
        <Route path="/aboutus" element={<AboutUS />} />
        <Route path="/contactus" element={<ContactUS />} />

         {/* <Route path="/otp" element={<OTP />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/otp-reset" element={<OTPReset />} /> */}
        {/* <Route path="/verify-account" element={<VerifyAccount />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        {/* <Route path="/change-password" element={<ChangePassword />} />  */}


      </Routes>
      {!shouldHideNavbarFooter && <Footer />}
    </>
  );
}
