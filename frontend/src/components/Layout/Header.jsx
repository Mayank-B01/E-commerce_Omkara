import React from 'react';
import {NavLink, Link} from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
const Header = ({handleShowAuthModal}) => {
    return(
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
                            <li className="nav-item">
                                <NavLink to="/category" className="nav-link ">Categories</NavLink>
                            </li>
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
                            <li className="nav-item">
                              <span className="nav-link" style={{cursor: 'pointer'}} onClick={handleShowAuthModal}>Signup / Login</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Header;