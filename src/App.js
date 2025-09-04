import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import AppRoutes from "./routes/AppRoutes";
import CartProvider from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import { BannerProvider } from "./context/BannerContext";
import { ChatProvider } from "./context/ChatContext";
import { WishlistProvider } from "./context/WishlistContext";
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
      <NotificationProvider>
        <BannerProvider>
          <ChatProvider>
            <WishlistProvider>
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
            </WishlistProvider>
          </ChatProvider>
        </BannerProvider>
      </NotificationProvider>
    </CartProvider>
  );
}

export default App;
