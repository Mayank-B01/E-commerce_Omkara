import React from 'react';
import Footer from "./Footer.jsx";
import {Helmet} from "react-helmet";
import {ToastContainer} from "react-toastify";

const Layout = ({children, title= "Omkara",
                    description= "Clothing brand e-commerce website",
                    keywords= "clothing, e-commerce, online shopping, clothing store,"}) => {
    return(
            <div>
                <Helmet>
                    <meta charSet="utf-8"/>
                    <meta name="title" content={title}/>
                    <meta name="description" content={description}/>
                    <meta name="keywords" content={keywords}/>
                    <title>{title}</title>
                </Helmet>
                <main style={{minHeight: "70vh"}}>
                    <ToastContainer/>
                    {children}
                </main>
                <Footer/>
            </div>
    );
};


export default Layout;