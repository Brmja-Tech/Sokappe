import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import AppRoutes from "./routes/AppRoutes";
import CartProvider from "./context/CartContext";
import ScrollToTop from "./component/ScrollToTop/ScrollToTop";
import "./App.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  useEffect(() => {
    AOS.init({ duration: 600 });
  }, []);

  return (
    <CartProvider>
      <BrowserRouter>
        <AppRoutes />
        <ScrollToTop />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
