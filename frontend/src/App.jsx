import React, {useState, useEffect} from "react";
import {Route, Routes, useLocation} from 'react-router-dom'
import Homepage from "./pages/Homepage.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Policy from "./pages/Policy.jsx";
import PagenotFound from "./pages/PagenotFound.jsx";
import {Modal} from 'react-bootstrap';
import Register from "./pages/Auth/Register.jsx";
import Login from "./pages/Auth/Login.jsx";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import './App.css'; // Uncomment App.css
import Dashboard from "./pages/user/Dashboard.jsx";
import PrivateRoute from "./components/routes/Private.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import AdminRoute from "./components/routes/Admin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import UserPage from "./pages/admin/UserPage.jsx";
import ProductPage from "./pages/Admin/ProductPage.jsx";
import OrderPage from "./pages/admin/OrderPage.jsx";
import UserOrder from "./pages/user/UserOrder.jsx";
import Address from "./pages/user/Address.jsx";
import Profile from "./pages/user/Profile.jsx";
import CategoryPage from "./pages/Admin/CategoryPage.jsx";
import Category from "./pages/Category.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import CartPage from "./pages/CartPage.jsx";

function App() {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [modalContent, setModalContent] = useState('register');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.showLogin) {
            handleShowLogin();
        }
    }, [location.state]);

    const handleShowRegister = () => {
        setModalContent('register');
        setShowAuthModal(true);
    };

    const handleShowLogin = () => {
        setModalContent('login');
        setShowAuthModal(true);
    };

    const handleForgotPass = () => {
        setModalContent('forgot-password');
        setShowAuthModal(true);
    }

    const handleCloseAuthModal = () => setShowAuthModal(false);
  return (
    <>
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
        />
       <Routes>
           <Route path ='/' element={<Homepage handleShowAuthModal={handleShowRegister} />} />
           <Route path ='/about' element={<About handleShowAuthModal={handleShowRegister} />} />
           <Route path ='/contact' element={<Contact handleShowAuthModal={handleShowRegister} />} />
           <Route path ='/policy' element={<Policy handleShowAuthModal={handleShowRegister} />}/>
           <Route path ='/category' element={<Category handleShowAuthModal={handleShowRegister} />}/>
           <Route path ='/product/:slug' element={<ProductDetails handleShowAuthModal={handleShowRegister} />} />
           <Route path ='/cart' element={<CartPage handleShowAuthModal={handleShowRegister} />} />
           <Route path ='/dashboard' element={<PrivateRoute />}>
               <Route path ='user' element={<Dashboard handleShowAuthModal={handleShowRegister} />} />
               <Route path ='user/order' element={<UserOrder handleShowAuthModal={handleShowRegister} />} />
               <Route path ='user/address' element={<Address handleShowAuthModal={handleShowRegister} />} />
               <Route path ='user/account' element={<Profile handleShowAuthModal={handleShowRegister} />} />

           </Route>
           <Route path ='/dashboard' element={<AdminRoute />}>
               <Route path ='admin' element={<AdminDashboard handleShowAuthModal={handleShowRegister} />} />
               <Route path ='admin/users' element={<UserPage handleShowAuthModal={handleShowRegister} />} />
               <Route path ='admin/products' element={<ProductPage handleShowAuthModal={handleShowRegister} />} />
               <Route path ='admin/category' element={<CategoryPage handleShowAuthModal={handleShowRegister} />} />
               <Route path ='admin/orders' element={<OrderPage handleShowAuthModal={handleShowRegister} />} />
           </Route>
           <Route path ='*' element={<PagenotFound handleShowAuthModal={handleShowRegister} />}/>
       </Routes>

        <Modal show={showAuthModal} onHide={handleCloseAuthModal} centered
        size="lg"
        dialogClassName="auth-modal">
            <Modal.Header closeButton>
                <Modal.Title>
                    {modalContent === "register" ? "Sign Up" : modalContent === "login" ? "Login" : "Forgot Password"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {modalContent === "register" ? (
                    <Register handleShowLogin={handleShowLogin} />
                ) : modalContent === "login" ? (
                    <Login handleShowRegister={handleShowRegister} handleShowForgotPassword={handleForgotPass} handleCloseAuthModal={handleCloseAuthModal} />
                ) : (
                    <ForgotPassword handleShowLogin={handleShowLogin} />
                )}
            </Modal.Body>
        </Modal>

    </>
  )
}

export default App
