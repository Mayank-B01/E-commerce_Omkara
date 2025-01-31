// Register.jsx
import React,{useState} from 'react';
import { FaGoogle } from 'react-icons/fa';
import { Row, Col } from 'react-bootstrap';
import {toast} from 'react-toastify';
import axios from 'axios';

const Register = ({ handleShowLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePassCheck = async(e) => {
        e.preventDefault();
        try{
            if(password === confirmPassword) {
                const res = await axios.post(`${process.env.REACT_API}/api/v1/auth/register`, {name,email,password});
                toast.success('Registration Successful');
            }
            else{
                toast.error('Password does not match');
            }
        }catch (e) {
            console.log(e);
            toast.error(e.response.data.message);
        }
    }
    return (
        <div className="register-container" style={{ minHeight: '80vh' }}>
            <Row>
                <Col md={7} className="d-none d-md-block">
                    <img
                        src="/icon.jpg"
                        alt="Brand Logo"
                        className="img-fluid"
                        style={{height: '80vh'}}
                    />
                </Col>
                <Col xs={12} md={4}>
                    <h2 className="mb-4 mt-0 pt-5">Sign Up</h2>
                    <form onSubmit={ handlePassCheck}>
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
                        <div className="mb-4">
                            <label htmlFor="registerConfirmPassword" className="form-label">
                                Re-type Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-control"
                                id="registerConfirmPassword"
                                placeholder="Confirm Password"
                                required
                            />
                        </div>
                        {/* Sign Up Button */}
                        <button type="submit" className="btn w-100 mb-3" style={{backgroundColor: '#74ab6a'}}>
                            Sign Up
                        </button>

                        {/* OR Divider */}
                        <div className="d-flex align-items-center mb-3">
                            <hr className="flex-grow-1" />
                            <span className="mx-2">OR</span>
                            <hr className="flex-grow-1" />
                        </div>

                        {/* Continue with Google Button */}
                        <button type="button" className="btn btn-danger w-100 mb-3">
                            <FaGoogle className="me-2" />
                            Continue With Google
                        </button>

                        {/* Login Link */}
                        <div className="text-center">
                            Already have an account?{' '}
                            <span
                                style={{ color: 'blue', cursor: 'pointer' }}
                                onClick={handleShowLogin}
                            >
                Login
              </span>
                        </div>
                    </form>
                </Col>
            </Row>
        </div>
    );
};

export default Register;
