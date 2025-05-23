import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout.jsx";
import { NavLink } from "react-router-dom";
import UserMenu from "../../components/Layout/UserMenu.jsx";
import { useAuth } from "../../context/auth.jsx";
import '../../styles/UserDashboard.css';
import { FaUserCircle, FaEdit, FaBoxOpen, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';

const Dashboard = ({ handleShowAuthModal }) => {
    const [auth] = useAuth();
    const [orderCount, setOrderCount] = useState(null);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Avatar initials
    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.split(' ');
        return parts.map(p => p[0]).join('').toUpperCase();
    };

    // Fetch user orders for order count
    useEffect(() => {
        const fetchOrders = async () => {
            if (!auth?.token) return;
            setLoadingOrders(true);
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API}/api/v1/order/user-orders`, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                });
                if (data?.success) {
                    setOrderCount(data.orders.length);
                } else {
                    setOrderCount(0);
                }
            } catch (error) {
                setOrderCount(0);
            } finally {
                setLoadingOrders(false);
            }
        };
        fetchOrders();
    }, [auth?.token]);

    return (
        <Layout title={'Dashboard - Omkara'} handleShowAuthModal={handleShowAuthModal}>
            <div className="dashboard-container">
                <div className="dashboard-menu">
                    <UserMenu />
                </div>
                <div className="dashboard-content">
                    <div className="dashboard-welcome mb-4">
                        <h3>Welcome, {auth?.user?.name?.split(' ')[0] || 'User'}!</h3>
                        <p className="text-muted">Glad to have you as part of Omkara since {formatDate(auth?.user?.createdAt)}.</p>
                    </div>

                    <div className="row g-4 align-items-stretch">
                        {/* Profile Card */}
                        <div className="col-md-5 mb-4">
                            <div className="card profile-card shadow-sm h-100">
                                <div className="card-body d-flex flex-column align-items-center">
                                    <div className="profile-avatar mb-3">
                                        {auth?.user?.avatarUrl ? (
                                            <img src={auth.user.avatarUrl} alt="Avatar" className="avatar-img" />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                <FaUserCircle size={64} color="#a3b18a" />
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="mb-1">{auth?.user?.name}</h4>
                                    <p className="mb-1 text-muted">{auth?.user?.email}</p>
                                    <p className="mb-1 text-muted">{auth?.user?.phone}</p>
                                    <div className="d-flex align-items-center mt-2">
                                        <FaBoxOpen className="me-2 text-success" />
                                        <span className="me-3">Orders: <strong>{loadingOrders ? '...' : orderCount}</strong></span>
                                        <FaCalendarAlt className="me-2 text-success" />
                                        <span>Member since: <strong>{formatDate(auth?.user?.createdAt)}</strong></span>
                                    </div>
                                    <NavLink to="/dashboard/user/account" className="btn btn-outline-primary mt-3 w-100">
                                        <FaEdit className="me-2" />Edit Info
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                        {/* Address Card */}
                        <div className="col-md-7 mb-4">
                            <div className="card address-card shadow-sm h-100">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 className="mb-2">Address</h5>
                                        <p className="mb-0 text-muted">{auth?.user?.address || 'No address added yet.'}</p>
                                    </div>
                                    <NavLink to="/dashboard/user/address" className="btn btn-outline-primary mt-3 align-self-end">
                                        <FaEdit className="me-2" />Edit Address
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;