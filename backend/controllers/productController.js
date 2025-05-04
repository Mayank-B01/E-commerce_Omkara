const productModel = require('../models/productModel');
const fs = require('fs');
const slugify = require("slugify");
const categoryModel = require('../models/categoryModel');

const addProductController = async (req, res) =>{
    try {
        const {name, description,price, category,quantity, shipping, sizes, colors } = req.fields;
        // Assume multiple photos are uploaded under the field name 'photos'
        const photos = req.files.photos;
        console.log("Received fields:", req.fields);
        console.log("Received sizes string:", sizes);
        console.log("Received colors string:", colors);
        console.log("Received files:", req.files); // Log received files

        // Ensure photos is an array
        const photoFiles = photos ? (Array.isArray(photos) ? photos : [photos]) : [];

        //validation
        switch (true){
            case !name:
                return res.status(500).send({ error: "Name is required" });
            case !description:
                return res.status(500).send({ error: "Description is required" });
            case !price:
                return res.status(500).send({ error: "Price is required" });
            case !category:
                return res.status(500).send({ error: "Category is required" });
            case !quantity:
                return res.status(500).send({ error: "Quantity is required" });
            // Add validation for each photo if needed
            // case photoFiles.some(photo => photo.size > 10000000):
            //     return res.status(500).send({ error: 'Each photo should be less than 10MB' });
        }

        const parsedSizes = sizes ? JSON.parse(sizes) : [];
        // Parse colors string (comma-separated) into an array
        const parsedColors = colors ? colors.split(',').map(c => c.trim()).filter(c => c) : [];
        console.log("Parsed sizes:", parsedSizes);
        console.log("Parsed colors:", parsedColors);

        const productData = new productModel({
            ...req.fields,
            sizes: parsedSizes,
            colors: parsedColors,
            slug: slugify(name),
            photos: [] // Initialize photos array
        });

        if (photoFiles.length > 0) {
            console.log(`ADD: Processing ${photoFiles.length} potential photo files.`); // ADDED Log
            productData.photos = photoFiles.map((photo, index) => {
                console.log(`ADD: Processing file index ${index}: Name=${photo.name}, Size=${photo.size}, Path=${photo.path}, Type=${photo.type}`); // ADDED Log
                if (photo.size > 0) { // Check if file is not empty
                   try {
                        const fileData = fs.readFileSync(photo.path);
                        console.log(`ADD: Successfully read file index ${index}, Size: ${fileData.length} bytes`); // ADDED Log
                        return {
                           data: fileData,
                           contentType: photo.type
                       };
                   } catch (readError) {
                       console.error(`ADD: Error reading file index ${index}:`, photo.path, readError); // ADDED Log prefix
                       return null; // Mark as null to filter out later
                   }
                } else {
                    console.warn(`ADD: Skipping empty file index ${index}:`, photo.path); // ADDED Log prefix
                    return null; // Skip empty files
                }
            }).filter(photoData => photoData !== null);
            console.log(`ADD: Finished processing photos. Resulting array length: ${productData.photos.length}`); // ADDED Log
        }

        await productData.save();
        // Select -photos when sending back the response to avoid large payload
        const savedProduct = await productModel.findById(productData._id).select('-photos');

        res.status(201).send({
            success: true,
            message: 'Product added successfully!',
            products: savedProduct
        });

    } catch (error) {
        console.log(error);
        // Check for specific errors, like JSON parsing errors for sizes
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
             return res.status(400).send({
                 success: false,
                 message: "Invalid format for sizes. Please provide a valid JSON array string.",
                 error: error.message
             });
        }
        res.status(500).send({
            success: false,
            error: error.message, // Send error message instead of full object
            message: "Error adding new product"
        });
    }
}

const updateProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity, shipping, sizes, colors } = req.fields;
        // Assume multiple photos are uploaded under the field name 'photos'
        const photos = req.files.photos;
        console.log("Received fields for update:", req.fields);
        console.log("Received sizes string for update:", sizes);
        console.log("Received colors string for update:", colors);
        console.log("Received files for update:", req.files);

        // Ensure photos is an array
        const photoFiles = photos ? (Array.isArray(photos) ? photos : [photos]) : [];

        //validation (similar to addProductController)
        switch (true) {
            case !name:
                return res.status(500).send({ error: "Name is required" });
            case !description:
                return res.status(500).send({ error: "Description is required" });
            case !price:
                return res.status(500).send({ error: "Price is required" });
            case !category:
                return res.status(500).send({ error: "Category is required" });
            case !quantity:
                return res.status(500).send({ error: "Quantity is required" });
            // Add validation for each photo if needed
            // case photoFiles.some(photo => photo.size > 10000000):
            //     return res.status(500).send({ error: 'Each photo should be less than 10MB' });
        }

        const parsedSizes = sizes ? JSON.parse(sizes) : [];
        // Parse colors string (comma-separated) into an array
        const parsedColors = colors ? colors.split(',').map(c => c.trim()).filter(c => c) : [];
        console.log("Parsed sizes for update:", parsedSizes);
        console.log("Parsed colors for update:", parsedColors);

        const updateData = {
            ...req.fields,
            slug: slugify(name),
            sizes: parsedSizes,
            colors: parsedColors
        };

        const product = await productModel.findById(req.params.pid);
        if (!product) {
            return res.status(404).send({ success: false, message: 'Product not found' });
        }

        if (photoFiles.length > 0) {
            console.log(`UPDATE: Processing ${photoFiles.length} potential photo files.`); // ADDED Log
            updateData.photos = photoFiles.map((photo, index) => {
                 console.log(`UPDATE: Processing file index ${index}: Name=${photo.name}, Size=${photo.size}, Path=${photo.path}, Type=${photo.type}`); // ADDED Log
                 if (photo.size > 0) {
                    try {
                         const fileData = fs.readFileSync(photo.path);
                         console.log(`UPDATE: Successfully read file index ${index}, Size: ${fileData.length} bytes`); // ADDED Log
                         return {
                             data: fileData,
                             contentType: photo.type
                         };
                    } catch (readError) {
                         console.error(`UPDATE: Error reading file index ${index}:`, photo.path, readError); // ADDED Log prefix
                         return null;
                    }
                } else {
                    console.warn(`UPDATE: Skipping empty file index ${index}:`, photo.path); // ADDED Log prefix
                    return null;
                }
            }).filter(photoData => photoData !== null);
            console.log(`UPDATE: Finished processing photos. Resulting array length: ${updateData.photos.length}`); // ADDED Log
        } else {
             console.log("UPDATE: No new photos uploaded, keeping existing ones."); // ADDED Log for clarity
        }

        const updatedProduct = await productModel.findByIdAndUpdate(req.params.pid,
            updateData,
            { new: true } // Return the updated document
        ).select('-photos'); // Exclude photos from the response

        res.status(200).send({
            success: true,
            message: 'Product Updated successfully!',
            products: updatedProduct
        });

    } catch (error) {
        console.log(error);
         // Check for specific errors, like JSON parsing errors for sizes
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
             return res.status(400).send({
                 success: false,
                 message: "Invalid format for sizes. Please provide a valid JSON array string.",
                 error: error.message
             });
        }
        res.status(500).send({
            success: false,
            message: 'Error updating product',
            error: error.message // Send error message
        });
    }
}

const getProductController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 16; // Change page size from 18 to 16
        const skip = (page - 1) * pageSize;

        // Get total count first for pagination
        const totalProducts = await productModel.countDocuments({});

        const products = await productModel.find({})
            .populate('category')
            .select('-photos') 
            // .limit(12) // Remove old limit
            .skip(skip)    // Add skip for pagination
            .limit(pageSize) // Add limit for pagination
            .sort({ createdAt: -1 });

        res.status(200).send({
            // count: products.length, // This count is just for the current page
            total: totalProducts, // Send total count for pagination
            page: page,
            pageSize: pageSize,
            success: true,
            message: 'Products displayed successfully',
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Error getting all the products"
        });
    }
}

const singleProductController = async (req, res) => {
    try {
        const product = await productModel.findOne({ slug: req.params.slug })
            .select('-photos') // Changed from -photo to -photos
            .populate('category');

        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).send({
            success: true,
            message: "Product found successfully",
            product
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Error fetching product"
        });
    }
}

// Add new controller to fetch all photos for a product OR just the first one
const photosController = async (req, res) => {
    try {
        const { pid } = req.params;
        const { first } = req.query; // Check for query parameter ?first=true

        const product = await productModel.findById(pid).select('photos'); // Only select the photos field
        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.photos || product.photos.length === 0) {
            // Send appropriate response if no photos exist
            // If requesting first photo, maybe send 404 or a specific no-photo indicator?
            // For now, send empty success for general case, or 404 if specifically requesting first
            if (first === 'true') {
                 return res.status(404).send({
                     success: false,
                     message: "No photo found for this product"
                 });
            } else {
                 return res.status(200).send({
                     success: true,
                     photos: []
                 });
            }
        }

        // If ?first=true is requested, send only the first photo object
        if (first === 'true') {
            const firstPhoto = product.photos[0];
            res.set('Content-type', firstPhoto.contentType);
            return res.status(200).send(firstPhoto.data); // Send raw buffer data for direct image display

            // --- Alternative: Send JSON object with base64 (if frontend prefers) ---
            // return res.status(200).send({
            //     success: true,
            //     photo: {
            //         data: firstPhoto.data.toString('base64'),
            //         contentType: firstPhoto.contentType,
            //         _id: firstPhoto._id
            //     }
            // });
             // --- End Alternative ---

        } else {
            // Original logic: Send all photos as base64 encoded JSON array
            return res.status(200).send({
                success: true,
                photos: product.photos.map(photo => ({
                    data: photo.data.toString('base64'),
                    contentType: photo.contentType,
                    _id: photo._id
                }))
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Error fetching photos"
        });
    }
};

const deleteProductController = async (req, res) => {
    try {
        // findByIdAndDelete is fine, no need to select photos as they are deleted with the document
        const deletedProduct = await productModel.findByIdAndDelete(req.params.pid);
        if (!deletedProduct) {
             return res.status(404).send({
                 success: false,
                 message: "Product not found for deletion"
             });
        }
        res.status(200).send({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error deleting product",
            error: error.message
        });
    }
}

// Product Filters Controller
const productFiltersController = async (req, res) => {
    try {
        const { checked, radio, checkedSizes, sortBy } = req.body;
        const page = parseInt(req.query.page) || 1; // Get page from query param
        const pageSize = 16; // Change page size from 18 to 16
        const skip = (page - 1) * pageSize;

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

        // Get total count matching filters
        const totalProducts = await productModel.countDocuments(args);

        const products = await productModel.find(args)
             .select("-photos")
             .populate('category')
             .sort(sortArgs)
             .skip(skip)    // Add skip for pagination
             .limit(pageSize); // Add limit for pagination
        
        res.status(200).send({
            success: true,
            total: totalProducts, // Send total count for pagination
            page: page,
            pageSize: pageSize,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error Filtering Products",
            error: error.message,
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
                _id: { $ne: pid }, // Exclude the current product
            })
            .select("-photos") // Keep excluding photos for performance
            .limit(3) // Change limit from 4 to 3
            .populate("category");

        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "error while getting related products",
            error: error.message,
        });
    }
};

// Product Category Name Search Controller (NEW)
const productCategoryNameSearchController = async (req, res) => {
    try {
        const { keyword } = req.body;

        if (!keyword) {
            return res.status(400).send({
                success: false,
                message: "Keyword is required for search.",
            });
        }

        // Find categories matching the keyword first
        const categories = await categoryModel.find({
            name: { $regex: keyword, $options: "i" },
        }).select('_id'); // Get only the IDs

        const categoryIds = categories.map(cat => cat._id);

        // Now find products matching the keyword in name/description OR belonging to matched categories
        const products = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { category: { $in: categoryIds } }
            ]
        })
        .select("-photos") // Exclude photos
        .populate("category");

        res.status(200).send({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error searching products by category name",
            error: error.message,
        });
    }
};

// Controller to get multiple products based on an array of slugs
const getMultipleProductsBySlugController = async (req, res) => {
    try {
        const { slugs } = req.body;

        if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
            return res.status(400).send({
                success: false,
                message: "An array of product slugs is required.",
            });
        }

        const products = await productModel.find({
            slug: { $in: slugs }
        })
        .select("-photos") // Exclude photos for efficiency
        .populate("category"); // Populate category if needed for cards

        // Note: This returns products found, doesn't guarantee order or all slugs found
        res.status(200).send({
            success: true,
            products,
        });

    } catch (error) {
        console.log("Error fetching multiple products by slug:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching multiple products",
            error: error.message,
        });
    }
};

module.exports = {
    addProductController,
    getProductController,
    singleProductController,
    photosController,
    deleteProductController,
    updateProductController,
    productFiltersController,
    relatedProductController,
    productCategoryNameSearchController,
    getMultipleProductsBySlugController
};