import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Spinner = ({ path = '' }) => {
    const [count, setCount] = useState(5);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prevValue) => --prevValue);
        }, 1000);

        if (count === 0) {
            const redirectPath = location.state?.from || `/${path}`;
            navigate(redirectPath, {
                // Optionally pass state if needed for further navigation
                state: location.state,
            });
        }

        return () => clearInterval(interval);
    }, [count, navigate, location, path]);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "70vh" }}>
            <h1 className="text-center">Access Denied !</h1>
            <h2 className="text-center">Redirecting you in {count} seconds</h2>
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default Spinner;