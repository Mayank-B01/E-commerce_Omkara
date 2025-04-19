import React from 'react';
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import {Helmet} from "react-helmet";

const Layout = ({children, title, description, keywords, author, handleShowAuthModal}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <Helmet>
                <meta charSet="utf-8" />
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="author" content={author} />
                <title>{title}</title>
            </Helmet>
            <Header handleShowAuthModal={handleShowAuthModal} />
            <main style={{
                flexGrow: 1
            }}>
                {children}
            </main>
            <Footer/>
        </div>
    );
};

Layout.defaultProps = {
    title: "Omkara - shop now",
    description: "mern stack project",
    keywords: "mern,react,node,mongodb",
    author: "Omkara",
};

export default Layout;