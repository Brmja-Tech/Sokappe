import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import Home from "../pages/Home/Home";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";

// import Profile from "../components/Profile/Profile";
// import Login from "../pages/Login/Login";
// import Register from "../pages/Register/Register";

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
        {/* <Route path="/otp" element={<OTP />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-reset" element={<OTPReset />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} /> */}


      </Routes>
      {!shouldHideNavbarFooter && <Footer />}
    </>
  );
}
