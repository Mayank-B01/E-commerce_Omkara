import React, { useState, useContext, createContext, useEffect } from "react";

const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Load cart from localStorage on initial mount
    useEffect(() => {
        let existingCartItem = localStorage.getItem("cart");
        if (existingCartItem) {
            try {
                setCart(JSON.parse(existingCartItem));
            } catch (error) {
                console.error("Error parsing cart JSON from localStorage:", error);
                // Optionally clear invalid data
                // localStorage.removeItem("cart"); 
            }
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    // Note: We don't automatically save to localStorage here on every `cart` change.
    // Instead, the components using setCart (like CartPage's removeCartItem,
    // or the Add to Cart buttons) should handle updating localStorage 
    // after they modify the state via setCart.

    return (
        <CartContext.Provider value={[cart, setCart]}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook
const useCart = () => useContext(CartContext);

export { useCart, CartProvider }; 