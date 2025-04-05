const productModel = require('../models/productModel');
const fs = require('fs');
const slugify = require("slugify");

const addProductController = async (req, res) =>{
    try {
        const {name, slug, description,price, category,quantity, shipping } = req.fields;
        const {photo} = req.files;
        console.log("Received fields:", req.fields);

        //validation
        switch (true){
            case !name:
                return res.status(500).send({
                    error:"Name is required"
                })
            case !description:
                return res.status(500).send({
                    error:"Description is required"
                })
            case !price:
                return res.status(500).send({
                    error:"Price  is required"
                })
            case !category:
                return res.status(500).send({
                    error:"Category is required"
                })
            case !quantity:
                return res.status(500).send({
                    error:"Quantity is required"
                })
            case photo && photo.size > 10000000:
                return res.status(500).send({
                    error:'Photo is required and should be less than 100 MB'
                })
        }

        const products = new productModel({
            ...req.fields,
            slug:slugify(name)
        })
        if(photo){
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success:true,
            message:'Product added successfully!',
            products
        })

    }catch (error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error adding new product"
        })
    }
}

const updateProductController = async (req, res) => {
    try {
        const {name, slug, description,price, category,quantity, shipping } = req.fields;
        const {photo} = req.files;
        console.log("Received fields:", req.fields);

        //validation
        switch (true){
            case !name:
                return res.status(500).send({
                    error:"Name is required"
                })
            case !description:
                return res.status(500).send({
                    error:"Description is required"
                })
            case !price:
                return res.status(500).send({
                    error:"Price  is required"
                })
            case !category:
                return res.status(500).send({
                    error:"Category is required"
                })
            case !quantity:
                return res.status(500).send({
                    error:"Quantity is required"
                })
            case photo && photo.size > 1000000:
                return res.status(500).send({
                    error:'Photo is required and should be less than 1 MB'
                })
        }

        const products = await productModel.findByIdAndUpdate(req.params.pid,
            {...req.fields, slug:slugify(name)}, {new:true}
        )
        if(photo){
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success:true,
            message:'Product Updated successfully!',
            products
        })

    }catch (error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error updating product',
            error
        })

    }
}

const getProductController = async (req, res) => {
    try {
        const products =await productModel.find({})
            .populate('category')
            .select('-photo')
            .limit(12)
            .sort({createdAt:-1});
        res.status(200).send({
            count: products.length,
            success:true,
            message:'Products displayed successfully',
            products
        })
    }catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error getting all the products"
        })
    }
}

const singleProductController = async (req, res) => {
    try {
        const product = await productModel.findOne({slug:req.params.slug}, null, null)
            .select('-photo')
            .populate('category')
        ;
        res.status(200).send({
            success:true,
            message:"Product found successfully",
            product
        })
    }catch (error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error fetching product"
        })
    }
}

const photoController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).select('photo');
        if(product.photo.data){
            res.set('Content-type', product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    }catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error fetching photo"
        })
    }
}

const deleteProductController = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.pid, null).select('-photo');
        res.status(200).send({
            success:true,
            message:'Product deleted successfully'
        })
    }catch (error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error deleting product",
            error
        })
    }
}

module.exports = {addProductController,
    getProductController,
    singleProductController,
    photoController,
    deleteProductController,
    updateProductController};