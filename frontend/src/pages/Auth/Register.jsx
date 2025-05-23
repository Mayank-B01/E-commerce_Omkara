// Register.jsx
import React,{useState} from 'react';
import { FaGoogle } from 'react-icons/fa';
import { Row, Col } from 'react-bootstrap';
import {toast} from 'react-toastify';
import axios from 'axios';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Input } from 'antd';


const Register = ({ handleShowLogin, handleCloseAuthModal }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [answer, setAnswer] = useState('');

    const validatePhoneNumber = (number) => /^\d{10}$/.test(number); // Exactly 10 digits
    const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#%*&$!]).{8,}$/.test(password);

    const handlePassCheck = async(e) => {
        e.preventDefault();

        if (!validatePhoneNumber(phone)) {
            return toast.error("Phone number must be exactly 10 digits.");
        }

        if (!validatePassword(password)) {
            return toast.error("Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@,#,%,*,&,$,!).");
        }
        try{
            if(password === confirmPassword) {
                const res = await axios.post(`${import.meta.env.VITE_API}/api/v1/auth/register`, {name,email,password,phone,answer});
                if (res.data.success) {
                    toast.success(res.data.message);
                    handleShowLogin();
                }
                else{
                    toast.error(res.data.message);
                }
            }
            else{
                toast.error('Password does not match');
            }
        }catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message || "Error occurred during registration");
        }
    }
    return (
        <div className="register-container" style={{ minHeight: '80vh'}}>
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
                        <h2 className="mb-4 mt-0 pt-5 ">Sign Up</h2>
                        <form onSubmit={handlePassCheck}>
                            <div className="mb-3">
                                <label htmlFor="registerName" className="form-label">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form-control"
                                    id="registerName"
                                    placeholder="Enter Your Name"
                                    required
                                />
                            </div>

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
                            <div className="mb-3">
                                <label htmlFor="registerEmail" className="form-label">
                                    Phone
                                </label>
                                <input
                                    type="String"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="form-control"
                                    id="registerPhone"
                                    placeholder="Enter Phone number"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="registerPassword" className="form-label">
                                    Password
                                </label>
                                <Input.Password
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Password"
                                    required
                                    className="form-control"
                                    id="registerPassword"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="registerConfirmPassword" className="form-label">
                                    Re-type Password
                                </label>
                                <Input.Password
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                    required
                                    className="form-control"
                                    id="registerConfirmPassword"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="answer" className="form-label">
                                    Security Question
                                </label>
                                <input
                                    type="Answer"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="form-control"
                                    id="registerAnswer"
                                    placeholder="What is your favorite color?"
                                    required
                                />
                            </div>
                            {/* Sign Up Button */}
                            <button type="submit" className="btn w-100 mb-3" style={{backgroundColor: '#74ab6a'}}>
                                Sign Up
                            </button>

                            {/*/!* OR Divider *!/*/}
                            {/*<div className="d-flex align-items-center mb-3">*/}
                            {/*    <hr className="flex-grow-1"/>*/}
                            {/*    <span className="mx-2">OR</span>*/}
                            {/*    <hr className="flex-grow-1"/>*/}
                            {/*</div>*/}

                            {/*/!* Continue with Google Button *!/*/}
                            {/*<button type="button" className="btn btn-danger w-100 mb-2">*/}
                            {/*    <FaGoogle className="me-2"/>*/}
                            {/*    Continue With Google*/}
                            {/*</button>*/}

                            {/* Login Link */}
                            <div className="text-center mb-2">
                                Already have an account?{' '}
                                <span
                                    style={{color: 'blue', cursor: 'pointer'}}
                                    onClick={handleShowLogin}
                                >Login
                                </span>
                            </div>
                        </form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Register;
