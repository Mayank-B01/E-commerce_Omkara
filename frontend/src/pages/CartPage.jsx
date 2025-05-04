import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout.jsx';
import { useCart } from '../context/cart.jsx';
import { useAuth } from '../context/auth.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/CartPage.css';
import { Checkbox } from 'antd';

const CartPage = ({ handleShowAuthModal }) => {
    const [auth, setAuth] = useAuth();
    const [cart, setCart] = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());

    // Helper to create a unique ID for a cart item
    const getItemId = (item) => {
        return `${item.product?._id}${item.size ? `_${item.size}` : '_'}`;
    };

    // Toggle item selection
    const handleSelectItem = (item, isChecked) => {
        const itemId = getItemId(item);
        setSelectedItems(prev => {
            const newSelection = new Set(prev);
            if (isChecked) {
                newSelection.add(itemId);
            } else {
                newSelection.delete(itemId);
            }
            console.log("Selected Items:", newSelection); // Debug log
            return newSelection;
        });
    };

    // Select/Deselect All
    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            const allItemIds = new Set(cart.map(item => getItemId(item)));
            setSelectedItems(allItemIds);
        } else {
            setSelectedItems(new Set());
        }
    };

    // DEBUG: Log cart state on render
    useEffect(() => {
        console.log("CartPage Render - Cart State:", cart);
    }, [cart]);

    // Calculate Total Price of SELECTED items
    const totalPrice = () => {
        try {
            let total = 0;
            cart?.forEach((item) => {
                const itemId = getItemId(item);
                // Only include item if it's selected
                if (selectedItems.has(itemId)) { 
                    const price = item?.product?.price || 0;
                    const quantity = item.quantity || 1;
                    total += price * quantity; 
                }
            });

            return total.toLocaleString("en-IN", { 
                style: "currency",
                currency: "NRP",
            });
        } catch (error) {
            console.log("Error calculating total price:", error);
            return "Error";
        }
    };

    // Remove item from cart
    const removeCartItem = async (productId, size) => {
        try {
            if (auth?.token) {
                // Logged in: Call API
                // Note: size might be optional, adjust API call based on backend route definition
                const { data } = await axios.delete(
                    `${import.meta.env.VITE_API}/api/v1/cart/remove/${productId}${size ? `?size=${encodeURIComponent(size)}` : ''}`,
                     {
                         headers: {
                            Authorization: `Bearer ${auth.token}` // Send token
                         }
                    }
                );
                if (data?.success) {
                    toast.info('Item removed from cart');
                    // Update context by filtering out the removed item
                     let myCart = cart.filter(item => !(item.product._id === productId && item.size === size));
                    setCart(myCart);
                } else {
                    toast.error(data?.message || 'Could not remove item from cart.');
                }
            } else {
                // Not logged in: Use Local Storage
                let myCart = [...cart];
                const index = myCart.findIndex(item => item._id === productId && item.selectedSize === size);
                if (index !== -1) {
                    myCart.splice(index, 1);
                    setCart(myCart);
                    localStorage.setItem('cart', JSON.stringify(myCart)); // Update localStorage
                    toast.info('Item removed from cart');
                } else {
                    toast.error('Could not find item in cart');
                }
            }
        } catch (error) {
            console.error("Error removing item:", error);
            toast.error(error.response?.data?.message || "Error removing item from cart");
        }
    };
    
    // Handle Quantity Change
    const handleQuantityChange = async (productId, size, newQuantity) => {
        // Ensure newQuantity is a number and >= 0 (0 means remove)
        const quantityNum = Number(newQuantity);
         if (isNaN(quantityNum) || quantityNum < 0) return;

        try {
             if (auth?.token) {
                 // Logged in: Call API
                 const { data } = await axios.put(
                     `${import.meta.env.VITE_API}/api/v1/cart/update-quantity`,
                     { productId, quantity: quantityNum, size },
                      {
                         headers: {
                            Authorization: `Bearer ${auth.token}` // Send token
                         }
                     }
                 );
                 if (data?.success) {
                     // Update context based on the new quantity
                     let myCart = cart.map(item => {
                         if (item.product._id === productId && item.size === size) {
                             return { ...item, quantity: quantityNum };
                         }
                         return item;
                     }).filter(item => item.quantity > 0); // Filter out items with quantity 0

                     setCart(myCart);
                     if (quantityNum > 0) {
                         toast.info('Cart quantity updated');
                     } else {
                         toast.info('Item removed from cart');
                     }
                 } else {
                     toast.error(data?.message || 'Could not update quantity.');
                 }
             } else {
                 // Not logged in: Use Local Storage
                 let myCart = [...cart];
                 const index = myCart.findIndex(item => item._id === productId && item.selectedSize === size);
                 if (index !== -1) {
                    if (quantityNum === 0) {
                        myCart.splice(index, 1); // Remove item if quantity is 0
                        toast.info('Item removed from cart');
                    } else {
                         myCart[index].quantity = quantityNum;
                         toast.info('Cart quantity updated');
                    }
                    setCart(myCart);
                    localStorage.setItem('cart', JSON.stringify(myCart));
                 } else {
                     toast.error('Could not find item in cart to update.');
                 }
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
             toast.error(error.response?.data?.message || "Error updating quantity");
        }
    };

    // Effect to check for payment status on load/redirect
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const paymentStatus = queryParams.get('payment_status');
        const orderId = queryParams.get('orderId');
        const message = queryParams.get('message');
        const status = queryParams.get('status'); // For specific statuses like 'PaymentNotCompleted'

        if (paymentStatus === 'failure') {
            let displayMessage = "Payment Failed or Cancelled."; // Default
            if (message === 'PaymentFailedOrCancelled') displayMessage = "Your payment attempt failed or was cancelled.";
            else if (message === 'SignatureMismatch') displayMessage = "Payment verification failed due to a security issue.";
            else if (message === 'PaymentNotCompleted') displayMessage = `The payment process was not completed (Status: ${status || 'N/A'}).`;
            else if (message === 'InvalidCallbackResponse' || message === 'InvalidCallbackDataFormat') displayMessage = "Error receiving payment confirmation.";
            else if (message === 'ServerError') displayMessage = "A server error occurred during payment confirmation.";
            toast.error(`Payment Failed: ${displayMessage}${orderId && orderId !== 'UNKNOWN' ? ` (Order ID: ${orderId})` : ''}`);

            navigate('/cart', { replace: true });
        }

        if (paymentStatus === 'success' || paymentStatus === 'success_db_error'){
             navigate('/cart', { replace: true });
        }

    }, [location, navigate]);


    const handleEsewaCheckout = async () => {
        if (isProcessing) return;
        if (selectedItems.size === 0) {
            toast.error("Please select items to checkout.");
            return;
        }

        setIsProcessing(true);
        toast.info("Initiating payment process...");

        // Filter cart to get only selected items
        const itemsToCheckout = cart.filter(item => selectedItems.has(getItemId(item)));
        
        // Recalculate amount based on selected items (client-side for display/initiation)
        let orderAmount = 0;
        itemsToCheckout.forEach(item => {
            orderAmount += (item.product?.price || 0) * (item.quantity || 1);
        });

        // **TODO LATER:** Modify API call to send `itemsToCheckout` details, 
        // not just the calculated `orderAmount`.
        // Backend needs to recalculate amount based on received items.

        const uniqueOrderId = `OMK-${Date.now()}-${auth.user?._id?.slice(-4) || 'GUEST'}`;

        // Prepare data for backend (including selected items)
        const payload = {
            // Send only essential details needed by backend to validate/get price
            selectedItems: itemsToCheckout.map(item => ({
                productId: item.product._id,
                quantity: item.quantity,
                size: item.size
            })),
            orderId: uniqueOrderId 
        };

        try {
             if (orderAmount <= 0) {
                 toast.error("Cannot process payment with zero or negative amount.");
                 setIsProcessing(false);
                 return;
             }
 
            console.log(`[Frontend Checkout] Initiating payment for Order ID: ${uniqueOrderId}, Items:`, payload.selectedItems);
            const { data } = await axios.post(
                `${import.meta.env.VITE_API}/api/v1/esewa/initiate`, 
                payload, // Send the payload with selectedItems and orderId
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}` 
                    }
                }
            );

            // 3. Handle backend response
            if (data?.success && data?.url) {
                console.log("[Frontend Checkout] Received redirect URL from backend. Redirecting...");
                toast.success("Redirecting to eSewa for payment...");
                window.location.href = data.url;
            } else {
                console.error("[Frontend Checkout] Failed to initiate eSewa payment:", data?.message);
                toast.error(data?.message || "Failed to start eSewa payment process. Please try again.");
                setIsProcessing(false);
            }

        } catch (error) {
            console.error("[Frontend Checkout] Error initiating eSewa payment:", error);
            const errorMsg = error.response?.data?.message || "An error occurred during checkout. Please check console and try again.";
            toast.error(errorMsg);
            setIsProcessing(false);
        }
    };

    return (
        <Layout title={"Your Cart - Omkara"} handleShowAuthModal={handleShowAuthModal}>
            <div className="container cart-page-container mt-4">
                <div className="row">
                    <div className="col-12">
                        <h1 className="text-center bg-light p-2 mb-4"> 
                            {`Hello ${auth?.token && auth?.user?.name ? auth.user.name : 'Guest'}`}
                        </h1>
                        <h4 className="text-center mb-4">
                            {cart?.length > 0 
                                ? `You have ${cart.length} item(s) in your cart ${auth?.token ? '' : '. Please login to checkout.'}`
                                : "Your cart is empty"}
                        </h4>
                    </div>
                </div>
                <div className="row justify-content-center">
                    {/* Cart Items */}    
                    <div className="col-md-8 mb-4">
                        {/* Select All Checkbox */}    
                        {cart?.length > 0 && (
                            <div className="mb-3 border-bottom pb-2">
                                <Checkbox 
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    checked={selectedItems.size === cart.length && cart.length > 0}
                                    indeterminate={selectedItems.size > 0 && selectedItems.size < cart.length}
                                >
                                    Select All
                                </Checkbox>
                            </div>
                        )}

                        {cart?.map((p) => {
                            const itemId = getItemId(p);
                            const isSelected = selectedItems.has(itemId);
                            return (
                                <div className={`row cart-item-card mb-3 p-3 border rounded ${isSelected ? 'selected-item' : ''}`} key={itemId}>
                                    {/* Checkbox Column */}
                                    <div className="col-1 d-flex align-items-center justify-content-center">
                                        <Checkbox 
                                            checked={isSelected}
                                            onChange={(e) => handleSelectItem(p, e.target.checked)}
                                        />
                                    </div>
                                    {/* Image Column */}
                                    <div className="col-md-2 text-center">
                                        <img
                                            src={`${import.meta.env.VITE_API}/api/v1/product/product-photos/${p.product?._id}?first=true`}
                                            className="img-fluid rounded cart-item-image"
                                            alt={p.product?.name || 'Product Image'}
                                            onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png'; }} // Fallback placeholder
                                            style={{ maxHeight: '100px', objectFit: 'contain', cursor: 'pointer'}} // Added pointer cursor
                                            onClick={() => navigate(`/product/${p.product?.slug}`)} // Link to product
                                        />
                                    </div>
                                     {/* Details Column */}
                                    <div className="col-md-8">
                                        <h5>{p.product?.name}</h5>
                                        {p.size && <p className="mb-1"><small>Size: {p.size}</small></p>} 
                                        <div className="d-flex align-items-center mb-2">
                                            <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => handleQuantityChange(p.product._id, p.size, (p.quantity || 1) - 1)}>-</button>
                                            <span>{p.quantity || 1}</span>
                                            <button className="btn btn-outline-secondary btn-sm ms-2" onClick={() => handleQuantityChange(p.product._id, p.size, (p.quantity || 1) + 1)}>+</button>
                                        </div> 
                                        <p className="fw-bold mb-2">Price: Rs {p.product?.price}</p>
                                        <button 
                                            className="btn btn-danger btn-sm" 
                                            onClick={() => removeCartItem(p.product._id, p.size)}
                                        >
                                            <i className="bi bi-trash-fill me-1"></i> Remove from Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Cart Summary / Checkout */}    
                    {cart?.length > 0 && (
                        <div className="col-md-4 cart-summary text-center">
                            <h4>Cart Summary</h4>
                            <p>Total ({selectedItems.size} item(s) selected)</p>
                            <hr />
                            <h5>Checkout Total:</h5> 
                            <h4 className="fw-bold mb-4">{totalPrice()}</h4>
                            {/* Conditional rendering based on login/address */}    
                            {auth?.user?.address ? (
                                <div className="mb-3">
                                    <h6>Current Address:</h6>
                                    <h5>{auth?.user?.address}</h5>
                                    <button 
                                        className="btn btn-outline-warning btn-sm"
                                        onClick={() => navigate('/dashboard/user/address')}
                                    >
                                        Update Address
                                    </button>
                                </div>
                            ) : (
                                <div className="mb-3">
                                    {auth?.token ? (
                                        <button 
                                            className="btn btn-outline-warning btn-sm"
                                            onClick={() => navigate('/dashboard/user/address')}
                                        >
                                            Add Address to Checkout
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            // Navigate to current page with state to trigger modal in App
                                            onClick={() => navigate('/cart', { state: { showLogin: true } })}
                                        >
                                            Login to Checkout
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-success"
                                    onClick={handleEsewaCheckout}
                                    disabled={isProcessing || !auth?.token || !auth?.user?.address || selectedItems.size === 0}
                                >
                                    {isProcessing ? "Processing..." : "Proceed to Checkout (eSewa)"}
                                </button>
                                <button 
                                    className="btn btn-outline-secondary mt-2" 
                                    onClick={() => navigate('/')}
                                >
                                    Cancel / Continue Shopping
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default CartPage; 