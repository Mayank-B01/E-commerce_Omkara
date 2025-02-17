import {Route, Routes} from 'react-router-dom'
import Homepage from "./pages/Homepage.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Policy from "./pages/Policy.jsx";
import PagenotFound from "./pages/PagenotFound.jsx";
import {useState} from "react";
import {Modal} from 'react-bootstrap';
import Register from "./pages/Auth/Register.jsx";
import Login from "./pages/Auth/Login.jsx";
import Header from "./components/Layout/Header.jsx";
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Dashboard from "./pages/user/Dashboard.jsx";
import PrivateRoute from "./components/routes/Private.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import AdminRoute from "./components/routes/Admin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

function App() {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [modalContent, setModalContent] = useState('register');

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
        <Header handleShowAuthModal={handleShowRegister} />
       <Routes>
           <Route path ='/' element={<Homepage />} />
           <Route path ='/about' element={<About />} />
           <Route path ='/contact' element={<Contact />} />
           <Route path ='/policy' element={<Policy />}/>
           <Route path ='/dashboard' element={<PrivateRoute />}>
               <Route path ='user' element={<Dashboard />} />
           </Route>
           <Route path ='/dashboard' element={<AdminRoute />}>
               <Route path ='admin' element={<AdminDashboard />} />
           </Route>
           <Route path ='*' element={<PagenotFound />}/>
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
