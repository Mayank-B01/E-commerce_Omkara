const express = require('express');
const {requireSignIn, isAdmin} = require("../middlewares/authMiddleware");
const {addProductController,
    getProductController,
    singleProductController,
    photoController,
    deleteProductController,
    updateProductController,
    productFiltersController,
    relatedProductController,
    productCategoryNameSearchController} = require("../controllers/productController");
const formidable = require('express-formidable');

const router = express.Router();

//routes
router.post('/add-product', requireSignIn, isAdmin, formidable(), addProductController);

//get product
router.get('/get-product', getProductController);

//single product
router.get('/single-product/:slug', singleProductController);

//photo route
router.get('/product-photo/:pid', photoController);

//delete product
router.delete('/delete-product/:pid', requireSignIn, isAdmin, deleteProductController);

//update-product
router.put('/update-product/:pid', requireSignIn, isAdmin, formidable(), updateProductController);

// Filter products
router.post('/product-filters', productFiltersController);

// Related products
router.get('/related-product/:pid/:cid', relatedProductController);

// Product Category Name Search
router.post('/product-category-name-search', productCategoryNameSearchController);

module.exports = router;