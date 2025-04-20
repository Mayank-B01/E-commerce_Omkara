import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Failure = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get details from query params (set by backend redirect)
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get("orderId");
    const message = queryParams.get("message") || "Payment Failed or Cancelled"; // Default message
    const status = queryParams.get("status"); // Optional status code

    // Map common messages to friendlier text
    let displayMessage = message;
    if (message === 'PaymentFailedOrCancelled') displayMessage = "Your payment attempt failed or was cancelled.";
    else if (message === 'SignatureMismatch') displayMessage = "There was a security issue verifying your payment. Please contact support.";
    else if (message === 'PaymentNotCompleted') displayMessage = `The payment process was not completed successfully (Status: ${status || 'N/A'}).`;
    else if (message === 'InvalidCallbackResponse' || message === 'InvalidCallbackDataFormat') displayMessage = "An issue occurred receiving payment confirmation.";
    else if (message === 'ServerError') displayMessage = "A server error occurred while processing your payment confirmation.";

    return (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fff0f0', minHeight: '60vh' }}>
            <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>Payment Failed! ❌</h1>
            <p style={{ fontSize: '1.1em', marginBottom: '10px' }}>
                {displayMessage}
            </p>
            {orderId && orderId !== 'UNKNOWN' && (
                 <p style={{ fontSize: '1em', color: '#555', marginBottom: '30px' }}>
                    Order ID: <strong>{orderId}</strong>
                </p>
            )}
            <p style={{ fontSize: '0.9em', color: '#777', marginBottom: '30px' }}>
                 Please try again or contact support if the problem persists.
            </p>
            {/* Use Link for internal navigation */}
            <Link to="/cart" className="go-home-button" style={buttonStyle}> 
                Return to Cart
            </Link>
            <Link to="/" className="go-home-button" style={{...buttonStyle, marginLeft: '15px', backgroundColor: '#6c757d'}}>
                Go to Homepage
            </Link>
        </div>
    );
};

// Simple button style (adjust as needed)
const buttonStyle = {
    display: 'inline-block',
    padding: '12px 25px',
    backgroundColor: '#dc3545',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease'
};

export default Failure;