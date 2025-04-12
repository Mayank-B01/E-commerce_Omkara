import React, { useState, useEffect } from 'react';
import { NavLink, Link } from "react-router-dom";
import { MdOutlineShoppingCart, MdAccountCircle } from "react-icons/md";
import { useAuth } from "../../context/auth.jsx";
import { toast } from "react-toastify";
import axios from 'axios';
import { NavDropdown } from 'react-bootstrap';

const Header = ({ handleShowAuthModal }) => {
    const [auth, setAuth] = useAuth();
    const [dropdownOpen, setDropdownOPen] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const getAllCategories = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API}/api/v1/category/allCategory`);
                if (data?.success) {
                    setCategories(data?.category);
                } else {
                    console.error("Failed to fetch categories:", data?.message);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        getAllCategories();
    }, []);

    const handleLogout = () => {
        setAuth({
            ...auth,
            user: null,
            token: ''
        })
        localStorage.removeItem("auth");
        toast.success("Logged out successful.")
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                        <Link to="/" className="navbar-brand" ><img src="/icon.jpg" alt="Brand logo" className="h-12 w-auto object-contain" />Omkara</Link>
                        <ul className="navbar-nav ms-auto mb-2 mb-0">
                            <li className="nav-item">
                                <NavLink to="/" className="nav-link ">Home</NavLink>
                            </li>
                            <NavDropdown title="Categories" id="categories-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/category">All Categories</NavDropdown.Item>
                                <NavDropdown.Divider />
                                {categories?.map((c) => (
                                    <NavDropdown.Item 
                                        key={c._id} 
                                        as={Link} 
                                        to={`/category?cat=${c.slug}`}
                                    >
                                        {c.name}
                                    </NavDropdown.Item>
                                ))}
                            </NavDropdown>
                            <li className="nav-item">
                                <NavLink to="/about" className="nav-link ">About</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/contact" className="nav-link ">Contact </NavLink>
                            </li>
                        </ul>
                        <ul className="navbar-nav ms-auto mb-2 mb-0">
                            <li className="nav-item">
                                <NavLink to="/cart" className="nav-link align-content-center"><MdOutlineShoppingCart size={25} /></NavLink>
                            </li>
                            {
                                !auth.user ? (<>
                                    <li className="nav-item">
                                        <span className="nav-link" style={{ cursor: 'pointer' }} onClick={handleShowAuthModal}>Signup / Login</span>
                                    </li>
                                </>) : (<>
                                    <li className="nav-item">
                                        <span className="nav-link align-content-center "
                                            style={{ cursor: "pointer", position: "relative" }}
                                            onClick={() => setDropdownOPen(!dropdownOpen)}
                                        ><MdAccountCircle size={25} /> {auth?.user?.name}
                                        </span>
                                        {dropdownOpen && (
                                            <div className="dropdown-menu show" style={{ position: "absolute", right: 0 }}>
                                                <NavLink
                                                    to={`/dashboard/${
                                                        auth?.user?.role === 1 ? 'admin' : 'user'
                                                    }`}
                                                    className="dropdown-item" onClick={() => setDropdownOPen(false)}>
                                                    Manage Account
                                                </NavLink>
                                                <NavLink to="/" className="dropdown-item" onClick={handleLogout} >Logout</NavLink>
                                            </div>
                                        )}
                                    </li>
                                </>)
                            }
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Header;