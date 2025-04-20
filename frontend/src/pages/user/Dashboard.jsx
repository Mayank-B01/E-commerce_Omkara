import React from "react";
import Layout from "../../components/Layout/Layout.jsx";
import {NavLink} from "react-router-dom";
import UserMenu from "../../components/Layout/UserMenu.jsx";
import {useAuth} from "../../context/auth.jsx";
import '../../styles/UserDashboard.css';

const Dashboard = ({ handleShowAuthModal }) =>{
    const [auth] = useAuth();

    // Helper function to format the date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return(
        <Layout title={'Dashboard - Omkara'} handleShowAuthModal={handleShowAuthModal}>
            <div className="dashboard-container">
                <div className="dashboard-menu">
                    <UserMenu />
                </div>
                <div className="dashboard-content">
                    <h3>Dashboard</h3>
                    <p>
                        Hello {auth?.user?.name}. You have been a part of Omkara since {formatDate(auth?.user?.createdAt)}, please to have you as a part of Omkara family.
                    </p>
                    <div className='d-flex  card mt-3 w-75'>
                        <NavLink className='btn btn-outline-dark w-25' to='/dashboard/user/account'>Edit info</NavLink>
                        <div className='data'>
                            <h4>Email: {auth?.user?.email}</h4>
                            <h4>Phone: {auth?.user?.phone}</h4>
                            <h4>Address: {auth?.user?.address || 'Not Added'}</h4>
                            <h4>Account Created on: {auth?.user?.createdAt}</h4>
                        </div>
                        <NavLink className='btn btn-outline-dark w-25' to='/dashboard/user/address'>Edit Address</NavLink>
                        <div className='data'>
                            <h4>Address: {auth?.user?.address || 'Not Added'}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard;