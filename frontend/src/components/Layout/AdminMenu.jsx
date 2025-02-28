import React from 'react';
import { NavLink } from "react-router-dom";
import '../../App.css';

const AdminMenu = () => {
    return (
        <div className="text-center">
            <div className="list-group">
                <h4>Admin Panel</h4>
                <NavLink
                    to="/dashboard/admin"
                    end
                    className={({ isActive }) => `list-group-item ${isActive ? "active-custom" : ""}`}
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/dashboard/admin/users"
                    className={({ isActive }) => `list-group-item ${isActive ? "active-custom" : ""}`}
                >
                    Users
                </NavLink>
                <NavLink
                    to="/dashboard/admin/category"
                    className={({ isActive }) => `list-group-item ${isActive ? "active-custom" : ""}`}
                >
                    Categories
                </NavLink>
                <NavLink
                    to="/dashboard/admin/products"
                    className={({ isActive }) => `list-group-item ${isActive ? "active-custom" : ""}`}
                >
                    Products
                </NavLink>
                <NavLink
                    to="/dashboard/admin/orders"
                    className={({ isActive }) => `list-group-item ${isActive ? "active-custom" : ""}`}
                >
                    Orders
                </NavLink>
            </div>
        </div>
    );
};

export default AdminMenu;
