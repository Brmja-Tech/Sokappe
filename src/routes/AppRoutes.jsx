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
import AddAd from "../pages/AddAd/AddAd";
import AddService from "../pages/AddService/AddService";
import Createaccount from "../pages/Createaccount/Createaccount";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import OtpVerifyEmail from "../pages/OtpVerifyEmail/OtpVerifyEmail";
import ChangePassword from "../pages/ChangePassword/ChangePassword";
import AdOwnerProfile from "../pages/AdOwnerProfile/AdOwnerProfile";
import IndividualProfile from "../pages/IndividualProfile/IndividualProfile";
import CompanyProfile from "../pages/CompanyProfile/CompanyProfile";
import OtpForgetPassword from "../pages/OtpForgetPassword/OtpForgetPassword";
import VendorProfile from "../pages/VendorProfile/VendorProfile";

export default function Applayout() {
  const location = useLocation();
  const { i18n } = useTranslation();

  // Handle direction change based on language
  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
  }, [i18n.language]);

  const hideNavbarFooterPaths = [
    "/login",
    "/register",
    "/OTP",
    "/otp",
    "/verify-account",
    "/forgot-password",
    "/changepassword",
    "/createaccount",
    "/resetpassword",
    "/otpforgetpassword",
  ];
  const shouldHideNavbarFooter = hideNavbarFooterPaths.includes(
    location.pathname
  );

  return (
    <>
      {!shouldHideNavbarFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/offer-request-service"
          element={<OfferRequestService />}
        />
        <Route path="/requestservice" element={<RequestService />} />
        <Route path="/filterproducts" element={<FilterProducts />} />
        <Route path="/productdetalis" element={<ProductsDetalis />} />
        <Route path="/aboutus" element={<AboutUS />} />
        <Route path="/contactus" element={<ContactUS />} />
        <Route path="/addad" element={<AddAd />} />
        <Route path="/addservice" element={<AddService />} />
        <Route path="/adownerprofile" element={<AdOwnerProfile />} />
        <Route path="/individualprofile" element={<IndividualProfile />} />
        <Route path="/companyprofile" element={<CompanyProfile />} />
        <Route path="/vendorprofile" element={<VendorProfile />} />
        {/* <Route path="/otp" element={<OTP />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/createaccount" element={<Createaccount />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/otp" element={<OtpVerifyEmail />} />
        <Route path="/otpforgetpassword" element={<OtpForgetPassword />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        {/* <Route path="/otp-reset" element={<OTPReset />} /> */}
        {/* <Route path="/verify-account" element={<VerifyAccount />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        {/* <Route path="/change-password" element={<ChangePassword />} />  */}
      </Routes>
      {!shouldHideNavbarFooter && <Footer />}
    </>
  );
}
