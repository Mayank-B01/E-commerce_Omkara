import React from 'react';
import { NavLink } from "react-router-dom";
import '../../App.css';

const UserMenu = () => {
    return (
        <div className="text-center">
            <div className="list-group">
                <h4>Profile Details</h4>
                <NavLink
                    to="/dashboard/user"
                    end
                    className={({ isActive }) => `list-group-item ${isActive ? "active-custom" : ""}`}
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/dashboard/user/order"
                    className={({ isActive }) => `list-group-item ${isActive ? "active-custom" : ""}`}
                >
                    Order History
                </NavLink>
                <NavLink
                    to="/dashboard/user/address"
                    className={({ isActive }) => `list-group-item ${isActive ? "active-custom" : ""}`}
                >
                    Address
                </NavLink>
                <NavLink
                    to="/dashboard/user/account"
                    className={({ isActive }) => `list-group-item ${isActive ? "active-custom" : ""}`}
                >
                    Account Info
                </NavLink>
            </div>
        </div>
    );
};

export default UserMenu;
