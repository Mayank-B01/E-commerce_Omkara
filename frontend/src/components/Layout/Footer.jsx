import React from 'react';
import { Link } from "react-router-dom";
import {FaFacebook} from "react-icons/fa";
import {FaInstagram} from "react-icons/fa";


const Footer = () => {
    return (
        <div className="footer container-fluid text-dark pt-3 px-3" style={{marginBottom: 0}}>
            <div className="row mb-0">

                <div className="col-md-3 mb-2">
                    <h5 className="footer-head text-decoration-underline">Shop</h5>
                    <ul className="list-unstyled">
                        <li><Link to="/men" className="text-decoration-none text-dark-emphasis">Men</Link></li>
                        <li><Link to="/women" className="text-decoration-none text-dark-emphasis">Women</Link></li>
                        <li><Link to="/accessories"
                                  className="text-decoration-none text-dark-emphasis">Accessories</Link></li>
                    </ul>
                </div>


                <div className="col-md-2 mb-4">
                    <h5 className="footer-head text-decoration-underline">Information</h5>
                    <ul className="list-unstyled">
                        <li><Link to="/about" className="text-decoration-none text-dark-emphasis">About Us</Link></li>
                        <li><Link to="/contact" className="text-decoration-none text-dark-emphasis">Contact Us</Link>
                        </li>
                    </ul>
                </div>


                <div className="col-md-3 ms-auto mb-4">
                    <h5 className="footer-head text-decoration-underline">Our Policies</h5>
                    <ul className="list-unstyled">
                        <li><Link to="/terms" className="text-decoration-none text-dark-emphasis">Terms and
                            Conditions</Link></li>
                        <li><Link to="/return" className="text-decoration-none text-dark-emphasis">Return and Exchange
                            Policy</Link></li>
                        <li><Link to="/delivery" className="text-decoration-none text-dark-emphasis">Delivery
                            Information</Link></li>
                    </ul>
                </div>


                <div className="col-md-2 ms-4">
                    <h5 className="footer-head text-decoration-underline">Connect With Us</h5>
                    <ul className="list-unstyled">
                        <li><a href="https://www.facebook.com/profile.php?id=100085335057688" target="_blank"
                               className="text-decoration-none text-dark-emphasis"><FaFacebook/> Facebook</a></li>
                        <li><a href="https://www.instagram.com/omkaraexport/" target="_blank"
                               className="text-decoration-none text-dark-emphasis"><FaInstagram/> Instagram</a></li>

                    </ul>
                </div>
            </div>

            <div className="mt-4 position-relative" style={{fontSize: "15px"}}>
                <div className="text-center">
                    <p>Our business supports the notion of "Support Nepali Artisans".The contents of this website is copyright products and the property of OmKara.</p>
                    <p>&copy; 2025 Copyright All rights reserved</p>
                </div>

                {/* Image positioned slightly to the left */}
                <img
                    src="/icon.jpg"
                    alt="omkara logo"
                    className="h-12 w-auto object-contain position-absolute end-0 top-50 translate-middle-y"
                    style={{maxWidth: "100px"}}
                />
            </div>
        </div>
    );
};

export default Footer;