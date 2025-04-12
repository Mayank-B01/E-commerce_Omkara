const productModel = require('../models/productModel');
const fs = require('fs');
const slugify = require("slugify");
const categoryModel = require('../models/categoryModel');

const addProductController = async (req, res) =>{
    try {
        const {name, description,price, category,quantity, shipping, sizes } = req.fields;
        const {photo} = req.files;
        console.log("Received fields:", req.fields);
        console.log("Received sizes string:", sizes);

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

        const parsedSizes = sizes ? JSON.parse(sizes) : [];
        console.log("Parsed sizes:", parsedSizes);

        const products = new productModel({
            ...req.fields,
            sizes: parsedSizes,
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
        const {name, description,price, category,quantity, shipping, sizes } = req.fields;
        const {photo} = req.files;
        console.log("Received fields for update:", req.fields);
        console.log("Received sizes string for update:", sizes);

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

        const parsedSizes = sizes ? JSON.parse(sizes) : [];
        console.log("Parsed sizes for update:", parsedSizes);

        const products = await productModel.findByIdAndUpdate(req.params.pid,
            {...req.fields, slug:slugify(name), sizes: parsedSizes}, {new:true}
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

// Product Filters Controller
const productFiltersController = async (req, res) => {
    try {
        const { checked, radio, checkedSizes, sortBy } = req.body;
        let args = {};
        if (checked && checked.length > 0) args.category = { $in: checked };
        if (radio && radio.length === 2) args.price = { $gte: radio[0], $lte: radio[1] };
        if (checkedSizes && checkedSizes.length > 0) args.sizes = { $in: checkedSizes };

        console.log("Filter args:", args);
        console.log("SortBy:", sortBy);

        // Determine sort object based on sortBy value
        let sortArgs = {};
        if (sortBy === 'price_asc') {
            sortArgs = { price: 1 };
        } else if (sortBy === 'price_desc') {
            sortArgs = { price: -1 };
        } else if (sortBy === 'newest') {
            sortArgs = { createdAt: -1 };
        } // Add more sort options if needed
        
        console.log("Sort args:", sortArgs);

        const products = await productModel.find(args).select("-photo").sort(sortArgs);
        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error filtering products",
            error,
        });
    }
};

// Related Product Controller
const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const products = await productModel
            .find({
                category: cid,
                _id: { $ne: pid }, // $ne means not equal
            })
            .select("-photo")
            .limit(3) // Limit to 3 related products
            .populate("category", "name slug"); // Populate category name/slug if needed in related card

        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log("Error fetching related products:", error);
        res.status(400).send({
            success: false,
            message: "Error fetching related products",
            error,
        });
    }
};

// Product Category Name Search Controller (NEW)
const productCategoryNameSearchController = async (req, res) => {
    try {
        const { searchName } = req.body;
        if (!searchName) {
            return res.status(400).send({ success: false, message: "Search term is required" });
        }

        // 1. Find categories matching the search term (case-insensitive)
        const matchingCategories = await categoryModel.find({
            name: { $regex: searchName, $options: "i" },
        });

        if (!matchingCategories || matchingCategories.length === 0) {
            return res.status(200).send({ success: true, products: [] }); // No matching categories found
        }

        // 2. Extract the IDs of matching categories
        const categoryIds = matchingCategories.map(category => category._id);

        // 3. Find products belonging to those categories
        const products = await productModel
            .find({ category: { $in: categoryIds } })
            .select("-photo")
            .populate("category", "name"); // Optional: populate category name if needed

        res.status(200).send({
            success: true,
            count: products.length,
            products,
        });

    } catch (error) {
        console.log("Error in product category name search:", error);
        res.status(500).send({
            success: false,
            message: "Error searching products by category name",
            error,
        });
    }
};

module.exports = {addProductController,
    getProductController,
    singleProductController,
    photoController,
    deleteProductController,
    updateProductController,
    productFiltersController,
    relatedProductController,
    productCategoryNameSearchController
};