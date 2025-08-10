import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap-icons/font/bootstrap-icons.css';
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "./component/ScrollToTop/ScrollToTop";
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';


function App() {
  useEffect(() => {
    AOS.init({ duration: 600 });
  }, []);
  return (
    <>
      <BrowserRouter>
      <AppRoutes />
      </BrowserRouter>
      <ToastContainer autoClose={2000}/>
      <ScrollToTop />
    </>
  );
}

export default App;
