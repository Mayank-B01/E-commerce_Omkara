import React,{useState} from 'react';
import {Col, Row} from "react-bootstrap";
import {toast} from "react-toastify";
import {useAuth} from "../../context/auth.jsx";
import { useCart } from "../../context/cart.jsx";
import axios from "axios";
import { useNavigate, useLocation } from 'react-router-dom';

const Login = ({ handleShowRegister ,handleShowForgotPassword, handleCloseAuthModal}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [auth,setAuth] = useAuth();
    const [cart, setCart] = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            const res = await axios.post(`${import.meta.env.VITE_API}/api/v1/auth/login`,{
                email,
                password
            });
            if (res.data.success) {
                toast.success(res.data.message);
                const userData = res.data.user;
                const tokenData = res.data.token;
                const cartData = res.data.cart || [];
                
                setAuth({
                    ...auth,
                    user: userData,
                    token: tokenData
                });
                localStorage.setItem('auth', JSON.stringify({ user: userData, token: tokenData }));
                
                setCart(cartData);
                localStorage.removeItem('cart');

                if (userData.role === 1) {
                    navigate('/dashboard/admin');
                } else {
                    const from = location.state?.from?.pathname || "/";
                    navigate(from);
                }
                
                handleCloseAuthModal();
            }
            else{
                toast.error(res.data.message);
            }
        }
        catch (e){
            console.log(e);
            toast.error(e.message);
        }
    }
    return (
        <div className="login-container" style={{minHeight: '50vh'}}>
            <Row className="g-0">
                <Col md={7} className="d-none d-md-block">
                    <img
                        src="/icon.jpg"
                        alt="Brand Logo"
                        className="img-fluid" style={{height: '80vh'}}
                    />
                </Col>
                <Col xs={12} md={5} className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', background: '#e9f5e9', borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                    <div style={{ width: '100%', padding: '2rem 1rem' }}>
                        <h2 className="mb-4 mt-0 pt-5 ">Log In</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="registerEmail" className="form-label">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-control"
                                    id="registerEmail"
                                    placeholder="Enter Email"
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="registerPassword" className="form-label">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-control"
                                    id="registerPassword"
                                    placeholder="Enter Password"
                                    required
                                />
                            </div>
                            <div onClick={handleShowForgotPassword} className="text-decoration-underline mb-3" style={{ cursor: "pointer" }}>
                                Forgot Password?
                            </div>
                            <button type="submit" className="btn w-100 mb-3" style={{backgroundColor: '#74ab6a'}}>
                                Login
                            </button>
                            <div className="text-center">
                                Don't have an account?{' '}
                                <span
                                    style={{color: 'blue', cursor: 'pointer'}}
                                    onClick={handleShowRegister}
                                >SignUp</span>
                            </div>
                        </form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Login;
