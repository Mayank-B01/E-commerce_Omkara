const userModel = require('../models/userModel');
const productModel = require('../models/productModel');

// Add item to cart
const addToCartController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity, size } = req.body;

        if (!productId || !quantity) {
            return res.status(400).send({ success: false, message: "Product ID and quantity are required." });
        }
        if (quantity < 1) {
             return res.status(400).send({ success: false, message: "Quantity must be at least 1." });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found." });
        }

        const product = await productModel.findById(productId);
        if (!product) {
             return res.status(404).send({ success: false, message: "Product not found." });
        }
        // Optional: Check if provided size exists in product.sizes
        if (size && product.sizes && product.sizes.length > 0 && !product.sizes.includes(size)) {
            return res.status(400).send({ success: false, message: `Size '${size}' not available for this product.` });
        }
         // Check if quantity exceeds available stock (product.quantity)
        // if (quantity > product.quantity) {
        //     return res.status(400).send({ success: false, message: `Only ${product.quantity} items in stock.` });
        // }


        // Check if item (product + size combination) already exists in cart
        const existingCartItemIndex = user.cart.findIndex(item =>
            item.product.toString() === productId && item.size === size
        );

        if (existingCartItemIndex > -1) {
            // Update quantity if item exists
            user.cart[existingCartItemIndex].quantity += quantity;
             // Optional: Check stock again after adding quantity
            // if (user.cart[existingCartItemIndex].quantity > product.quantity) {
            //     return res.status(400).send({ success: false, message: `Cannot add ${quantity} more; only ${product.quantity - (user.cart[existingCartItemIndex].quantity - quantity)} remaining in stock.` });
            // }
        } else {
            // Add new item if it doesn't exist
            user.cart.push({ product: productId, quantity, size });
        }

        await user.save();
        res.status(200).send({
            success: true,
            message: "Item added to cart successfully.",
            cart: user.cart // Optionally return updated cart
        });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send({
            success: false,
            message: "Error adding item to cart.",
            error: error.message
        });
    }
};

// Get user's cart
const getCartController = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId).populate({
            path: 'cart.product',
            select: 'name price photo slug description sizes quantity category', // Select fields you need
             populate: { // Optionally populate category if needed
                 path: 'category',
                 select: 'name'
             }
        });

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found." });
        }

        res.status(200).send({
            success: true,
            message: "Cart fetched successfully.",
            cart: user.cart
        });

    } catch (error) {
        console.error("Error getting cart:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching cart.",
            error: error.message
        });
    }
};

// Remove item from cart
const removeFromCartController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params; // Get productId from URL parameters
        const { size } = req.query; // Get optional size from query parameters

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found." });
        }

        // Find the index of the item to remove
        const itemIndex = user.cart.findIndex(item =>
            item.product.toString() === productId &&
            // If size is provided, match it; otherwise, match items without a size or where size doesn't matter for removal
            (size ? item.size === size : item.size === undefined || item.size === null || item.size === '')
        );

        if (itemIndex === -1) {
             return res.status(404).send({ success: false, message: "Item not found in cart." });
        }

        // Remove the item
        user.cart.splice(itemIndex, 1);

        await user.save();
        res.status(200).send({
            success: true,
            message: "Item removed from cart successfully.",
            cart: user.cart // Optionally return updated cart
        });

    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).send({
            success: false,
            message: "Error removing item from cart.",
            error: error.message
        });
    }
};


// Update quantity of an item in the cart
const updateCartQuantityController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity, size } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).send({ success: false, message: "Product ID and quantity are required." });
        }
        // Allow quantity 0 for removal, otherwise must be >= 1
        if (quantity < 0) {
            return res.status(400).send({ success: false, message: "Quantity cannot be negative." });
        }


        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found." });
        }

         // Find the index of the item to update
        const itemIndex = user.cart.findIndex(item =>
            item.product.toString() === productId && item.size === size
        );

        if (itemIndex === -1) {
            return res.status(404).send({ success: false, message: "Item not found in cart." });
        }

        // Optional: Check stock for the new quantity
        // const product = await productModel.findById(productId);
        // if (!product) return res.status(404).send({ success: false, message: "Product associated with cart item not found." });
        // if (quantity > product.quantity) {
        //     return res.status(400).send({ success: false, message: `Quantity exceeds stock (${product.quantity} available).` });
        // }

        if (quantity === 0) {
            // Remove item if quantity is set to 0
            user.cart.splice(itemIndex, 1);
        } else {
             // Update quantity
            user.cart[itemIndex].quantity = quantity;
        }

        await user.save();
        res.status(200).send({
            success: true,
            message: "Cart quantity updated successfully.",
            cart: user.cart // Optionally return updated cart
        });

    } catch (error) {
        console.error("Error updating cart quantity:", error);
        res.status(500).send({
            success: false,
            message: "Error updating cart quantity.",
            error: error.message
        });
    }
};


module.exports = {
    addToCartController,
    getCartController,
    removeFromCartController,
    updateCartQuantityController
}; 