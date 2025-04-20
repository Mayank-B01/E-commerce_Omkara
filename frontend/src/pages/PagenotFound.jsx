import React from 'react';
import Layout from "../components/Layout/Layout.jsx";
import {Link} from "react-router-dom";

const PagenotFound = ({ handleShowAuthModal }) => {
    return(
        <Layout title={'Page Not Found - Omkara'} handleShowAuthModal={handleShowAuthModal}>
            <div className="pagenotfound" style={{paddingTop: "20vh", fontSize: "20px"}}>
                <h1 className="pagenotfound-title">404</h1>
                <h2 className="pagenotfound-heading">Oops ! Page Not Found</h2>
                <Link to="/" className="pagenotfound-link text-decoration-none text-dark p-2">Go Back</Link>
            </div>
        </Layout>
    );
};
export default PagenotFound;