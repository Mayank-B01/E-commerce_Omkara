import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

// No longer need axios or esewajs here
// import {base64Decode} from "esewajs"
// import axios from "axios";

const Success = () => {
    // Remove loading/success state and useEffect
    // const [isSuccess, setIsSuccess] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Get orderId from query params (set by backend redirect)
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get("orderId");

    // Remove the API call logic
    /*
    const verifyPaymentAndUpdateStatus = async () => { ... };
    useEffect(() => {
        verifyPaymentAndUpdateStatus();
    }, []);
    */

    // Directly display success message
    return (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f0fff0', minHeight: '60vh' }}>
            <h1 style={{ color: '#2e8b57', marginBottom: '20px' }}>Payment Successful! ✅</h1>
            <p style={{ fontSize: '1.1em', marginBottom: '10px' }}>
                Thank you for your payment. Your transaction was successful.
            </p>
            {orderId && orderId !== 'UNKNOWN' && (
                <p style={{ fontSize: '1em', color: '#555', marginBottom: '30px' }}>
                    Your Order ID is: <strong>{orderId}</strong>
                </p>
            )}
            <p style={{ fontSize: '0.9em', color: '#777', marginBottom: '30px' }}>
                You should receive an order confirmation email shortly.
            </p>
            {/* Use Link for internal navigation */}
            <Link to="/" className="go-home-button" style={buttonStyle}>
                Continue Shopping
            </Link>
            <Link to="/dashboard/user/order" className="go-home-button" style={{...buttonStyle, marginLeft: '15px', backgroundColor: '#556b2f'}}>
                View Orders
            </Link>
        </div>
    );
};

// Simple button style (adjust as needed)
const buttonStyle = {
    display: 'inline-block',
    padding: '12px 25px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease'
};

export default Success;
