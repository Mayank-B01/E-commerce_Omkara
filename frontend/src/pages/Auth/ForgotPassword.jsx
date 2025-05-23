import React,{useState} from 'react';
import {Col, Row} from "react-bootstrap";
import {toast} from "react-toastify";
import axios from "axios";

const ForgotPassword = ({ handleShowLogin, handleCloseAuthModal }) =>{
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [answer, setAnswer] = useState('');

    const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#%*&$!]).{8,}$/.test(password);

    const handleSubmit = async (e) =>{
        e.preventDefault();
        if (!validatePassword(newPassword)) {
            return toast.error("Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@,#,%,*,&,$,!).");
        }
        try{
            const res = await axios.post(`${import.meta.env.VITE_API}/api/v1/auth/forgot-password`,{
                email,
                newPassword,
                answer
            });
            if (res.data.success) {
                toast.success(res.data.message);
                handleShowLogin();
            }
            else{
                toast.error(res.data.message);
            }
        }
        catch (e){
            console.log(e);
            toast.error(e.response.data.message);
        }
    }
    return(
        <div className="forgot-pass-container" style={{minHeight: '50vh'}}>
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
                        <h2 className="mb-4 mt-0 pt-5 ">Reset Password</h2>
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
                                    Security Question:
                                    What is your favorite color?
                                </label>
                                <input
                                    type="String"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="form-control"
                                    id="Answer"
                                    placeholder="Enter Answer"
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="registerNewPassword" className="form-label">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="form-control"
                                    id="NewPassword"
                                    placeholder="Enter New Password"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn w-100 mb-3" style={{backgroundColor: '#74ab6a'}}>
                                Reset Password
                            </button>
                            <div className="text-center mb-2">
                                Remember Password?{' '}
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
    )
}

export default ForgotPassword;