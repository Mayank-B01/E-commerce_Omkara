import React,{useState} from 'react';
import {Col, Row} from "react-bootstrap";
import {toast} from "react-toastify";
import {useAuth} from "../../context/auth.jsx";
import axios from "axios";
//import {useNavigation} from "react-router-dom";


// const navigate = useNavigation();

const Login = ({ handleShowRegister ,handleCloseAuthModel}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [auth,setAuth] = useAuth();

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            const res = await axios.post(`${import.meta.env.VITE_API}/api/v1/auth/login`,{
                email,
                password
            });
            if (res.data.success) {
                toast.success(res.data.message);
                setAuth({
                    ...auth,
                    user:res.data.user,
                    token:res.data.token
                })
                localStorage.setItem('auth', JSON.stringify(res.data))
                handleCloseAuthModel();
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
