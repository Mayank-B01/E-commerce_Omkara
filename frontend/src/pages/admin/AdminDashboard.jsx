import React, {useEffect, useState} from 'react';
import AdminMenu from "../../components/Layout/AdminMenu.jsx";
import {useAuth} from "../../context/auth.jsx";
import axios from "axios";
import {NavLink, useNavigate} from "react-router-dom";
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [auth, setAuth] = useAuth();
    const navigate = useNavigate();

    const [userCount, setUserCount] = useState(null);
    const [orderCount, setOrderCount] = useState(null);
    const [productCount, setProductCount] = useState(null);

    const handleLogout = () => {
        setAuth({
            ...auth,
            user: null,
            token: ''
        });
        localStorage.removeItem("auth");
        toast.success("Logged out successfully.");
        navigate('/');
    };

    useEffect(() => {
        document.title = "Admin Dashboard";
        const fetchDashboardData = async () => {
            try {
                document.title = "Admin Dashboard";
                const countcheck = async() => {
                    const res = await axios.get((`${import.meta.env.VITE_API}/api/v1/auth/count`));
                    console.log(res);
                    setUserCount(res.data.count);
                }
                countcheck();

                const productCount = async() => {
                    const res = await axios.get((`${import.meta.env.VITE_API}/api/v1/auth/productcount`));
                    console.log(res);
                    setProductCount(res.data.count);
                }
                productCount();
                setOrderCount(5)

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                if (error.response) {
                    console.error("Error response data:", error.response.data);
                    console.error("Error response status:", error.response.status);
                    console.error("Error response headers:", error.response.headers);
                    toast.error(`Failed to load stats: ${error.response.data?.message || error.response.statusText}`);
                } else if (error.request) {
                    console.error("Error request:", error.request);
                    toast.error("Failed to load stats: No response from server.");
                } else {
                    console.error('Error message:', error.message);
                    toast.error(`Failed to load stats: ${error.message}`);
                }
            }
        };

        if (auth?.token) {
            fetchDashboardData();
        }
    }, [auth?.token]);

    return (
        <>
            <div className="admin-custom-header d-flex justify-content-end p-3 bg-light border-bottom">
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                    Logout
                </button>
            </div>

            <div className="container-fluid m-3 p-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminMenu />
                    </div>
                    <div className='col-md-9'>
                        <div className="card shadow-sm">
                            <div className="card-header">Admin Dashboard Overview</div>
                            <div className="card-body">
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <div className="card text-center h-100">
                                            <div className="card-body d-flex flex-column justify-content-between">
                                                <div>
                                                    <h5 className="card-title">Total Users</h5>
                                                    <p className="card-text fs-4 fw-bold">
                                                        {userCount !== null ? userCount : <span className="spinner-border spinner-border-sm" role="status"></span>}
                                                    </p>
                                                </div>
                                                <NavLink to="/dashboard/admin/users" className="btn btn-outline-dark btn-sm mt-auto">Manage Users</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card text-center h-100">
                                            <div className="card-body d-flex flex-column justify-content-between">
                                                 <div>
                                                    <h5 className="card-title">Total Orders</h5>
                                                    <p className="card-text fs-4 fw-bold">
                                                        {orderCount !== null ? orderCount : <span className="spinner-border spinner-border-sm" role="status"></span>}
                                                    </p>
                                                </div>
                                                <NavLink to="/dashboard/admin/orders" className="btn btn-outline-dark btn-sm mt-auto">View Orders</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                     <div className="col-md-4">
                                        <div className="card text-center h-100">
                                            <div className="card-body d-flex flex-column justify-content-between">
                                                <div>
                                                    <h5 className="card-title">Total Products</h5>
                                                    <p className="card-text fs-4 fw-bold">
                                                        {productCount !== null ? productCount : <span className="spinner-border spinner-border-sm" role="status"></span>}
                                                    </p>
                                                </div>
                                                <NavLink to="/dashboard/admin/products" className="btn btn-outline-dark btn-sm mt-auto">Manage Products</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className='card mt-4'>
                                    <div className="card-header">Admin Information</div>
                                    <div className="card-body">
                                        <p className="mb-1"><strong>Name:</strong> {auth?.user?.displayName || auth?.user?.firstName || auth?.user?.name || 'Admin'}</p>
                                        <p className="mb-1"><strong>Email:</strong> {auth?.user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminDashboard;