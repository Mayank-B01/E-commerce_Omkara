import React, { useState } from 'react';
import Layout from "../components/Layout/Layout.jsx";
import { Link } from 'react-router-dom';
import '../styles/Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    });

    const [selectedStore, setSelectedStore] = useState(null);

    const stores = [
        {
            id: 1,
            name: "Store 1",
            location: "Hadigaun, Kathmandu",
            contact: "+977-1234567890",
            embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.4612419922482!2d85.33405187578647!3d27.718496724999078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb197ccf1e59d5%3A0x99c58b7f2b7d5e71!2sOmkara!5e1!3m2!1sen!2snp!4v1743887163659!5m2!1sen!2snp"
        },
        {
            id: 2,
            name: "Store 2",
            location: "Patan, Lalitpur",
            contact: "+977-1234567890",
            embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d577.3536407997874!2d85.3256158920816!3d27.675640753081808!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19c5d205ea99%3A0x4d10fb70c12907f9!2sOmkara!5e1!3m2!1sen!2snp!4v1743886975488!5m2!1sen!2snp"
        }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted:', formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleStoreSelect = (store) => {
        setSelectedStore(store);
    };

    return (
        <Layout title={'Contact Us - Omkara'}>
            <div className="contact-container">
                {/* Breadcrumb Navigation */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="separator">▶</span>
                    <span className="current">Contact</span>
                </div>

                <h1>Contact Us</h1>

                <div className="contact-content">
                    {/* Contact Information */}
                    <div className="contact-info">
                        <div className="info-section">
                            <h3>Address:</h3>
                            <p><i className="location-icon">📍</i> Patan, Lalitpur</p>
                            <p><i className="location-icon">📍</i> Hadigaun, Kathmandu</p>
                        </div>

                        <div className="info-section">
                            <h3>Contact:</h3>
                            <p><i className="phone-icon">📞</i> +977-1234567890</p>
                            <p><i className="phone-icon">📞</i> +977-0987654321</p>
                        </div>

                        <div className="info-section">
                            <h3>Email:</h3>
                            <p><i className="email-icon">✉️</i> Omkaraexport@gmail.com</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form">
                        <h2>GET IN TOUCH</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name*"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name*"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email*"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <textarea
                                name="message"
                                placeholder="Message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="4"
                            ></textarea>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>

                {/* Store Locator Section */}
                <div className="store-locator">
                    <h2>Store Locator</h2>
                    <div className="store-locator-content">
                        <div className="stores-list">
                            {stores.map(store => (
                                <div 
                                    key={store.id} 
                                    className={`store-card ${selectedStore?.id === store.id ? 'active' : ''}`}
                                    onClick={() => handleStoreSelect(store)}
                                >
                                    <h3>{store.name}</h3>
                                    <p><strong>Location:</strong> {store.location}</p>
                                    <p><strong>Contact:</strong> {store.contact}</p>
                                </div>
                            ))}
                        </div>
                        <div className="map-container">
                            {selectedStore ? (
                                <iframe
                                    src={selectedStore.embedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`${selectedStore.name} location`}
                                ></iframe>
                            ) : (
                                <div className="map-placeholder">
                                    <p>Select a store to view its location</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;