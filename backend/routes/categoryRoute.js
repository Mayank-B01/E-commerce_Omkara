const express = require('express');
const {requireSignIn, isAdmin} = require("../middlewares/authMiddleware");
const {createCategoryController,
    updateCategoryController,
    allCategoryController,
    singleCategoryController,
    deleteCategoryController} = require("../controllers/categoryController");

const router = express.Router();

//create category
router.post('/create-category', requireSignIn, isAdmin, createCategoryController);

//update category
router.put('/update-category/:id', requireSignIn, isAdmin, updateCategoryController);

//getAll category
router.get('/allCategory', allCategoryController);

//single category
router.get('/singleCategory/:slug', singleCategoryController);

//delte category
router.delete('/delete-category/:id', requireSignIn, isAdmin, deleteCategoryController);

module.exports = router;