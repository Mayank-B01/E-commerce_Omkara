import React from 'react';
import Layout from '../components/Layout/Layout.jsx';
import { useCart } from '../context/cart.jsx'; // Assuming cart context exists
import { useAuth } from '../context/auth.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/CartPage.css'; // Import custom CSS for styling

const CartPage = () => {
    const [auth, setAuth] = useAuth();
    const [cart, setCart] = useCart();
    const navigate = useNavigate();

    // Calculate Total Price
    const totalPrice = () => {
        try {
            let total = 0;
            cart?.forEach((item) => {
                // Use item.quantity if available, otherwise assume 1
                total += item.price * (item.quantity || 1); 
            });
            // Format as currency (adjust locale and options as needed)
            return total.toLocaleString("en-IN", { 
                style: "currency",
                currency: "INR", // Change currency code if needed
            });
        } catch (error) {
            console.log("Error calculating total price:", error);
            return "Error";
        }
    };

    // Remove item from cart
    const removeCartItem = (productId, size) => { // Include size if items can be differentiated by size
        try {
            // Filter logic might need adjustment based on how items are stored (e.g., need size?)
            let myCart = [...cart];
            // Find the first matching item (or use findIndex if removing only one instance)
            const index = myCart.findIndex(item => item._id === productId && item.selectedSize === size);
            if (index !== -1) {
                myCart.splice(index, 1);
                setCart(myCart);
                localStorage.setItem('cart', JSON.stringify(myCart)); // Update localStorage
                toast.info('Item removed from cart');
            } else {
                toast.error('Could not find item in cart');
            }
        } catch (error) {
            console.log("Error removing item:", error);
            toast.error("Error removing item from cart");
        }
    };
    
    // Handle Quantity Change (Example - if quantity adjustable in cart)
    // const handleQuantityChange = (productId, size, newQuantity) => {
    //     if (newQuantity < 1) return; // Minimum quantity is 1
    //     try {
    //         let myCart = [...cart];
    //         const index = myCart.findIndex(item => item._id === productId && item.selectedSize === size);
    //         if (index !== -1) {
    //             myCart[index].quantity = newQuantity;
    //             setCart(myCart);
    //             localStorage.setItem('cart', JSON.stringify(myCart));
    //         }
    //     } catch (error) {
    //         console.log("Error updating quantity:", error);
    //     }
    // };

    return (
        <Layout title={"Your Cart - Omkara"}>
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
                        {cart?.map((p) => (
                            <div className="row cart-item-card mb-3 p-3 border rounded" key={`${p._id}-${p.selectedSize}`}> {/* Use combined key */}
                                <div className="col-md-3 text-center">
                                    <img
                                        src={`${import.meta.env.VITE_API}/api/v1/product/product-photo/${p._id}`}
                                        className="img-fluid cart-item-image" 
                                        alt={p.name}
                                    />
                                </div>
                                <div className="col-md-9">
                                    <h5>{p.name}</h5>
                                    {/* Display size if available */} 
                                    {p.selectedSize && <p className="mb-1"><small>Size: {p.selectedSize}</small></p>} 
                                    {/* Display quantity - Adjust if editable */}
                                    <p className="mb-1">Quantity: {p.quantity || 1}</p> 
                                    {/* Quantity Changer - Uncomment and adapt if needed */}
                                    {/* <div className="d-flex align-items-center mb-2">
                                        <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => handleQuantityChange(p._id, p.selectedSize, (p.quantity || 1) - 1)}>-</button>
                                        <span>{p.quantity || 1}</span>
                                        <button className="btn btn-outline-secondary btn-sm ms-2" onClick={() => handleQuantityChange(p._id, p.selectedSize, (p.quantity || 1) + 1)}>+</button>
                                    </div> */} 
                                    <p className="fw-bold mb-2">Price: Rs {p.price}</p>
                                    <button 
                                        className="btn btn-danger btn-sm" 
                                        onClick={() => removeCartItem(p._id, p.selectedSize)}
                                    >
                                        <i className="bi bi-trash-fill me-1"></i> Remove from Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Cart Summary / Checkout */}    
                    {cart?.length > 0 && (
                        <div className="col-md-4 cart-summary text-center">
                            <h4>Cart Summary</h4>
                            <p>Total | Checkout | Payment</p>
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
                                    disabled={!auth?.token || !auth?.user?.address /* Add payment setup check later */} 
                                    /* Add onClick for payment processing */
                                >
                                    Proceed to Checkout
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