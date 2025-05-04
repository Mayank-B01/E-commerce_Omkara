const express = require('express');
const {requireSignIn, isAdmin} = require("../middlewares/authMiddleware");
const {addProductController,
    getProductController,
    singleProductController,
    photosController,
    deleteProductController,
    updateProductController,
    productFiltersController,
    relatedProductController,
    productCategoryNameSearchController,
    getMultipleProductsBySlugController} = require("../controllers/productController");
const formidable = require('express-formidable');

const router = express.Router();

//routes
router.post('/add-product', requireSignIn, isAdmin, formidable({ multiples: true }), addProductController);

//get product
router.get('/get-product', getProductController);

//single product
router.get('/single-product/:slug', singleProductController);

// Add new route to get all photos for a product
router.get('/product-photos/:pid', photosController);

//delete product
router.delete('/delete-product/:pid', requireSignIn, isAdmin, deleteProductController);

//update-product
router.put('/update-product/:pid', requireSignIn, isAdmin, formidable({ multiples: true }), updateProductController);

// Filter products
router.post('/product-filters', productFiltersController);

// Related products
router.get('/related-product/:pid/:cid', relatedProductController);

// Product Category Name Search
router.post('/product-category-name-search', productCategoryNameSearchController);

// ADDED Route: Get Multiple Products by Slug (using POST to send slugs in body)
router.post('/get-multiple-by-slug', getMultipleProductsBySlugController);

module.exports = router;