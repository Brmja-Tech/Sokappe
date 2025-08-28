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
import FilterProductsPhysical from "../pages/FilterProductsPhysical/FilterProductsPhysical";
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
import AddProduct from "../pages/AddProduct/AddProduct";
import ServiceDetalis from "../pages/ServiceDetalis/ServiceDetalis";
import Cart from "../pages/Cart/Cart";
import Wishlist from "../pages/Wishlist/Wishlist";
import Notifications from "../pages/Notifications/Notifications";
import RequestDetails from "../pages/RequestDetails/RequestDetails";
import RequestCategories from "../pages/RequestCategories/RequestCategories";
import ServiceOwnerProfile from "../pages/ServiceOwnerProfile/ServiceOwnerProfile";
import Chats from "../pages/Chats/Chats";
import Chat from "../pages/Chat/Chat";

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
        <Route path="/requestcategories" element={<RequestCategories />} />
        <Route path="/filterproducts" element={<FilterProducts />} />
        <Route
          path="/filterproductsphysical"
          element={<FilterProductsPhysical />}
        />
        <Route path="/productdetalis/:id" element={<ProductsDetalis />} />
        <Route path="/servicedetails/:id" element={<ServiceDetalis />} />
        <Route path="/aboutus" element={<AboutUS />} />
        <Route path="/contactus" element={<ContactUS />} />
        <Route path="/addad" element={<AddAd />} />
        <Route path="/addservice" element={<AddService />} />
        <Route path="/addproduct" element={<AddProduct />} />
        <Route path="/adownerprofile/:id" element={<AdOwnerProfile />} />
        <Route
          path="/serviceownerprofile/:id"
          element={<ServiceOwnerProfile />}
        />
        <Route path="/individualprofile" element={<IndividualProfile />} />
        <Route path="/companyprofile" element={<CompanyProfile />} />
        <Route path="/vendorprofile" element={<VendorProfile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/chats/new" element={<Chat />} />
        <Route path="/chats/:chatId" element={<Chat />} />

        <Route
          path="/request-details/:requestId"
          element={<RequestDetails />}
        />
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
