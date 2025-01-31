import React,{useState} from 'react';
import {Col, Row} from "react-bootstrap";
import {toast} from "react-toastify";

const Login = ({ handleShowRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="login-container" style={{minHeight: '50vh'}}>
            <Row>
                <Col md={7} className="d-none d-md-block">
                    <img
                        src="/icon.jpg"
                        alt="Brand Logo"
                        className="img-fluid" style={{height: '80vh'}}
                    />
                </Col>
                <Col xs={12} md={4} >
                    <h2 className="mb-4 mt-0 pt-5 ">Log In</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        toast.success('Login Successful')
                    }
                    }>
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
                </Col>
            </Row>
        </div>
    );
};

export default Login;
