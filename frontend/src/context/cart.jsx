import React, { useState, useContext, createContext, useEffect } from "react";
import { useAuth } from "./auth.jsx"; // Import useAuth
import axios from "axios"; // Import axios

const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [auth] = useAuth(); // Get auth state

    // Function to fetch cart from API
    const fetchCartFromAPI = async () => {
        if (!auth.token) return; // Don't fetch if not logged in
        try {
            console.log("CartProvider: Fetching cart from API...");
            const { data } = await axios.get(`${import.meta.env.VITE_API}/api/v1/cart`,
             {
                 headers: {
                    Authorization: `Bearer ${auth.token}` // Send token
                 }
             });
            if (data?.success) {
                console.log("CartProvider: Cart fetched successfully from API:", data.cart);
                setCart(data.cart || []);
            } else {
                 console.error("CartProvider: Failed to fetch cart from API:", data?.message);
                 setCart([]); // Clear cart on fetch failure
            }
        } catch (error) {
            console.error("CartProvider: Error fetching cart from API:", error);
             // Handle specific errors like 401 Unauthorized if needed
            if (error.response?.status === 401) {
                // Maybe trigger logout or show specific message
            }
            setCart([]); // Clear cart on error
        }
    };

    // Load cart on initial mount AND when auth token changes
    useEffect(() => {
        if (auth.token) {
            // User is logged in, fetch from API
            fetchCartFromAPI();
            // Clear local storage cart just in case
             localStorage.removeItem("cart");
        } else {
            // User is not logged in, load from localStorage
            console.log("CartProvider: Loading cart from localStorage...");
            let existingCartItem = localStorage.getItem("cart");
            if (existingCartItem) {
                try {
                    const parsedCart = JSON.parse(existingCartItem);
                    setCart(parsedCart);
                    console.log("CartProvider: Cart loaded from localStorage:", parsedCart);
                } catch (error) {
                    console.error("CartProvider: Error parsing cart JSON from localStorage:", error);
                    localStorage.removeItem("cart"); // Clear invalid data
                    setCart([]);
                }
            } else {
                 setCart([]); // Ensure cart is empty if nothing in localStorage
            }
        }
    }, [auth.token]); // Dependency on auth.token ensures this runs on login/logout

    // When cart state changes AND user is NOT logged in, save to localStorage
    // We avoid saving to localStorage when logged in, as backend is the source of truth
     useEffect(() => {
         if (!auth.token && cart.length > 0) {
              console.log("CartProvider: Saving cart to localStorage (user not logged in).", cart);
             localStorage.setItem("cart", JSON.stringify(cart));
         } else if (!auth.token && cart.length === 0) {
             // If cart becomes empty while logged out, remove from local storage
             console.log("CartProvider: Cart empty, removing from localStorage (user not logged in).");
             localStorage.removeItem("cart");
         }
     }, [cart, auth.token]);

    return (
        <CartContext.Provider value={[cart, setCart]}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook
const useCart = () => useContext(CartContext);

export { useCart, CartProvider }; 