import React from 'react';
import Layout from "../components/Layout/Layout.jsx";
import '../styles/About.css';
import founderImage from '../assets/women-category.png';
import omkaraLogo from '../assets/omkara-logo.jpg';

const About = ({ handleShowAuthModal }) => {
    return (
        <Layout title={'About Us - Omkara'} handleShowAuthModal={handleShowAuthModal}>
            <div className="about-container">
                <div className="about-content">
                    <div className="about-text">
                        <h1>About Omkara</h1>
                        <p>Omkara is about promoting the notion of supporting Nepali artisans.</p>
                        <p>Omkara as a company is a manufacturer, exporter and a wholesaler.</p>
                    </div>
                    <div className="about-logo">
                        <img src={omkaraLogo} alt="Omkara Logo" />
                        <div className="tagline">SUPPORT NEPALI ARTISANS</div>
                    </div>
                </div>
                <div className="founder-section">
                    <h2>Hear from our Founder</h2>
                    <div className="founder-content">
                        <div className="founder-image">
                            <img src={founderImage} alt="Founder" />
                        </div>
                        <div className="founder-message">
                            <p>The brand is the result of vision to do something of my own after doing the same thing for foreign brands for more than a decade.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default About;