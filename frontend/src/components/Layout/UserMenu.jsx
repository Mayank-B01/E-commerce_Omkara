import React from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/auth';
import { toast } from 'react-toastify';
import '../../App.css'; // Re-import original App.css if it was used for menu styling
// Remove UserDashboard.css import if it's no longer needed for the menu
// import '../../styles/UserDashboard.css';

const UserMenu = () => {
    const [auth, setAuth] = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        setAuth({
            ...auth,
            user: null,
            token: ''
        });
        localStorage.removeItem('auth');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        // Revert to original structure
        <div className="text-center">
            <div className="list-group">
                <h4>Profile Details</h4>
                <NavLink
                    to="/dashboard/user"
                    end
                    // Revert to original classes
                    className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? "active-custom" : ""}`}
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/dashboard/user/order"
                    className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? "active-custom" : ""}`}
                >
                    Order History
                </NavLink>
                <NavLink
                    to="/dashboard/user/address"
                    className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? "active-custom" : ""}`}
                >
                    Address
                </NavLink>
                <NavLink
                    to="/dashboard/user/account"
                    className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? "active-custom" : ""}`}
                >
                    Account Info
                </NavLink>
                {/* Logout Button styled similarly */}
                <button
                    onClick={handleLogout}
                    className="list-group-item list-group-item-action text-danger"
                    style={{ cursor: 'pointer' }} // Add pointer cursor
                >
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default UserMenu;
