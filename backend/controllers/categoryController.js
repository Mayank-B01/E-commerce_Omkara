const categoryModel = require('../models/categoryModel');
const slugify = require("slugify");

const createCategoryController = async (req, res) => {
    try {
        const {name} = req.body;
        if(!name){
            return res.status(401).send({
                message:"Name is required"
            })
        }

        //existing category
        const existingCategory = await categoryModel.findOne({name}, null, null);
        if(existingCategory){
            return res.status(200).send({
                success:true,
                message:'Category already exists'
            })
        }

        const category = await new categoryModel({name, slug:slugify(name)}).save();
        res.status(201).send({
            success:true,
            message:'New Category Added',
            category
        })

    }catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in category'
        })
    }

}

const updateCategoryController = async (req, res) => {
    try {
        const {name} = req.body;
        const {id} = req.params;
        const category = await categoryModel.findByIdAndUpdate(id, {name, slug:slugify(name)}, {new:true});
        res.status(200).send({
            success:true,
            message:"Category updated successfully!",
            category
        })
    }catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Update category failed'
        })
    }
}

const allCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.find({}, null, null);
        res.status(200).send({
            success:true,
            message:"All Categories list",
            category
        })
    }catch (error){
        console.log(error);
        res.stat(500).send({
            success:false,
            error,
            message:"Error getting all categories"
        })
    }
}

const singleCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({slug: req.params.slug}, null, null);
        res.status(200).send({
            success:true,
            message:'Success getting category',
            category
        })
    }catch (error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Failed getting category'
        })
    }
}

const deleteCategoryController = async (req, res) => {
    try {
        const {id} = req.params;
        await categoryModel.findByIdAndDelete(id, null);
        res.status(200).send({
            success:true,
            message:"Category deleted successfully",
        })
    }catch (error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error deleting the category",
            error
        })
    }
}

module.exports = {createCategoryController, updateCategoryController,
    allCategoryController, singleCategoryController, deleteCategoryController};