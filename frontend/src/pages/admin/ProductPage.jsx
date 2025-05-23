import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Layout/AdminMenu.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { Select, Table, Space, Modal, Button, Checkbox, ColorPicker, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/auth';

const { Option } = Select;

// Define size options
const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

const ProductModal = ({ visible, onCancel, onSuccess, initialData }) => {
    const [categories, setCategories] = useState([]);
    // State for multiple photo files
    const [photoFiles, setPhotoFiles] = useState([]);
    // State for preview URLs
    const [previewUrls, setPreviewUrls] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState();
    const [quantity, setQuantity] = useState();
    const [shipping, setShipping] = useState("");
    const [sizes, setSizes] = useState([]);
    // State for the array of selected colors
    const [selectedColors, setSelectedColors] = useState([]);
    // State for the current color in the picker
    const [currentColor, setCurrentColor] = useState('#1677ff'); // Default color

    useEffect(() => {
        const getCategories = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API}/api/v1/category/allCategory`
                );
                if (data?.success) setCategories(data?.category);
            } catch (error) {
                console.log(error);
                toast.error("Error fetching categories");
            }
        };
        getCategories();
    }, []);

    // Effect to update previews when photoFiles change
    useEffect(() => {
        if (photoFiles.length > 0) {
            const newUrls = Array.from(photoFiles).map(file => URL.createObjectURL(file));
            setPreviewUrls(newUrls);

            // Cleanup object URLs on component unmount or when files change again
            return () => newUrls.forEach(url => URL.revokeObjectURL(url));
        } else {
            setPreviewUrls([]); // Clear previews if no files selected
        }
    }, [photoFiles]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
            setPrice(initialData.price);
            setQuantity(initialData.quantity);
            setCategory(initialData.category?._id || initialData.category); // Handle populated vs ID
            setShipping(initialData.shipping ? "1" : "0");
            setSizes(initialData.sizes || []);
            setSelectedColors(initialData.colors || []); // Set initial colors array
            setPhotoFiles([]); // Clear any previously selected files for edit mode
            setPreviewUrls([]); // Clear previews for edit mode
            setCurrentColor('#1677ff'); // Reset picker color
        } else {
            resetForm();
        }
    }, [initialData]);

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setQuantity("");
        setCategory(undefined);
        setShipping(undefined);
        setPhotoFiles([]); // Reset multiple files
        setPreviewUrls([]); // Reset previews
        setSizes([]);
        setSelectedColors([]); // Reset selected colors array
        setCurrentColor('#1677ff'); // Reset picker color
    };

    // Handler for file input changes
    const handleFileChange = (e) => {
        setPhotoFiles(e.target.files); // Store the FileList
    };

    // Handler to remove a selected photo by index
    const handleRemovePhoto = (indexToRemove) => {
        setPhotoFiles(prevFiles => Array.from(prevFiles).filter((_, index) => index !== indexToRemove));
    };

    // Handler to add the current color from picker to the list
    const handleAddColor = () => {
        const colorValue = typeof currentColor === 'object' ? currentColor.toHexString() : currentColor;
        if (colorValue && !selectedColors.includes(colorValue)) {
            setSelectedColors([...selectedColors, colorValue]);
        }
    };

    // Handler to remove a color from the list
    const handleRemoveColor = (colorToRemove) => {
        setSelectedColors(selectedColors.filter(color => color !== colorToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = new FormData();
            productData.append("name", name);
            productData.append("description", description);
            productData.append("price", price);
            productData.append("quantity", quantity);
            // Append multiple photos
            if (photoFiles.length > 0) {
                 Array.from(photoFiles).forEach(file => {
                    productData.append("photos", file);
                 });
            }
            productData.append("category", category);
            productData.append("shipping", shipping === "1");
            productData.append("sizes", JSON.stringify(sizes));
            // Join the array into a comma-separated string for backend
            productData.append("colors", selectedColors.join(','));

            const url = initialData
                ? `${import.meta.env.VITE_API}/api/v1/product/update-product/${initialData._id}`
                : `${import.meta.env.VITE_API}/api/v1/product/add-product`;

            const method = initialData ? "put" : "post";
            const { data } = await axios[method](url, productData);

            if (data?.success) {
                toast.success(`Product ${initialData ? "Updated" : "Added"} Successfully`);
                onSuccess();
                onCancel();
                 resetForm();
            } else {
                 // Handle specific error messages from backend if available
                 toast.error(data?.message || "Failed to save product.");
            }
        } catch (error) {
            console.error("Error submitting product:", error);
             const errorMsg = error.response?.data?.message || "Something went wrong";
             toast.error(errorMsg);
        }
    };

    return (
        <Modal
            title={initialData ? "Edit Product" : "Create Product"}
            open={visible}
            onCancel={() => { resetForm(); onCancel(); }} // Ensure form resets on cancel
            footer={null}
            width={800}
        >
            <form onSubmit={handleSubmit}>
                {/* Category Select */}
                <div className="mb-3">
                    <label> Category</label>
                    <Select
                        bordered={false}
                        placeholder="Select a category"
                        size="large"
                        showSearch
                        className="form-select mb-3"
                        value={category}
                        onChange={(value) => setCategory(value)}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {categories?.map((c) => (
                            <Option key={c._id} value={c._id}>
                                {c.name}
                            </Option>
                        ))}
                    </Select>
                 </div>

                {/* File Upload Input */}
                <div className="mb-3">
                    <label className="btn btn-outline-secondary col-md-12">
                        {photoFiles.length > 0 ? `${photoFiles.length} photos selected` : initialData ? "Upload New Photos (Replaces All)" : "Upload Photos"}
                        <input
                            type="file"
                            name="photos"
                            accept="image/*"
                            onChange={handleFileChange}
                            multiple
                            hidden
                        />
                    </label>
                </div>

                {/* Image Previews */}
                 <div className="mb-3 d-flex flex-wrap gap-2">
                     {previewUrls.map((url, index) => (
                         <div key={index} style={{ position: 'relative', border: '1px solid #ddd', padding: '2px' }}>
                             <img
                                 src={url}
                                 alt={`preview ${index}`}
                                 height="100px"
                                 className="img img-responsive"
                             />
                             <Button
                                 type="primary"
                                 danger
                                 size="small"
                                 onClick={() => handleRemovePhoto(index)}
                                 style={{ position: 'absolute', top: '2px', right: '2px', lineHeight: 1 }}
                             >
                                 X
                             </Button>
                         </div>
                     ))}
                 </div>

                {/* Name Input */}
                <div className="mb-3">
                     <label>Product Name</label>
                    <input
                        type="text"
                        value={name}
                        placeholder="Write a name"
                        className="form-control"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                {/* Description Input */}
                <div className="mb-3">
                    <label>Description</label>
                    <textarea
                        value={description}
                        placeholder="Write a description"
                        className="form-control"
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                {/* Price Input */}
                <div className="row">
                    <div className="col-md-6 mb-3">
                         <label>Price</label>
                        <input
                            type="number"
                            value={price}
                            placeholder="Write a Price"
                            className="form-control"
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    {/* Quantity Input */}
                    <div className="col-md-6 mb-3">
                         <label>Quantity</label>
                        <input
                            type="number"
                            value={quantity}
                            placeholder="Write a quantity"
                            className="form-control"
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </div>
                </div>
                {/* Sizes Selection */}
                <div className="mb-3">
                    <label>Available Sizes</label>
                     <Checkbox.Group
                         options={sizeOptions.map(size => ({ label: size, value: size }))}
                         value={sizes}
                         onChange={(checkedValues) => setSizes(checkedValues)}
                         className="w-100 d-flex flex-wrap gap-3"
                     />
                </div>
                {/* Colors Input - Replaced with Picker */}
                 <div className="mb-3">
                     <label style={{ display: 'block', marginBottom: '8px' }}>Available Colors</label>
                     <div className="d-flex align-items-center gap-2 mb-2">
                         <ColorPicker 
                             value={currentColor} 
                             onChange={setCurrentColor} 
                         />
                         <Button type="dashed" onClick={handleAddColor}>
                             Add Color
                         </Button>
                     </div>
                     <div className="d-flex flex-wrap gap-1">
                         {selectedColors.map((color) => (
                             <Tag
                                 key={color}
                                 closable
                                 onClose={() => handleRemoveColor(color)}
                                 color={color}
                                 style={{ 
                                     color: 'white',
                                     textShadow: '0 0 2px black' 
                                 }}
                             >
                                 {color}
                             </Tag>
                         ))}
                     </div>
                 </div>
                {/* Shipping Select */}
                <div className="mb-3">
                     <label>Shipping</label>
                    <Select
                        bordered={false}
                        placeholder="Select Shipping "
                        size="large"
                        showSearch
                        className="form-select mb-3"
                        value={shipping}
                        onChange={(value) => setShipping(value)}
                    >
                        <Option value="0">No</Option>
                        <Option value="1">Yes</Option>
                    </Select>
                </div>

                <Button type="primary" htmlType="submit" className="w-100" size="large">
                    {initialData ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                </Button>
            </form>
        </Modal>
    );
};

const ProductPage = () => {
    const navigate = useNavigate();
    const [auth, setAuth] = useAuth();
    const [products, setProducts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [categories, setCategories] = useState([]);

    const handleLogout = () => {
        setAuth({
            ...auth,
            user: null,
            token: ''
        });
        localStorage.removeItem("auth");
        toast.success("Logged out successfully.");
        navigate('/');
    };

    const getProducts = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/api/v1/product/get-product`
            );
            if (data?.success) setProducts(data.products);
        } catch (error) {
            console.log(error);
            toast.error("Error fetching products");
        }
    };

    const getCategories = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/api/v1/category/allCategory`
            );
            if (data?.success) setCategories(data?.category);
        } catch (error) {
            console.log(error);
            toast.error("Error fetching categories");
        }
    };

    useEffect(() => {
        document.title = "Admin - Product Management";
        getProducts();
        getCategories();
    }, []);

    const handleDelete = async (productId) => {
        try {
            const { data } = await axios.delete(
                `${import.meta.env.VITE_API}/api/v1/product/delete-product/${productId}`
            );
            if (data?.success) {
                toast.success("Product deleted");

                // Remove the deleted product from the state
                setProducts((prevProducts) => prevProducts.filter((p) => p._id !== productId));

            }
        } catch (error) {
            console.log(error);
            toast.error("Error deleting product");
        }
    };


    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            render: (category) => category?.name || 'N/A',
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `Rs. ${price}`,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button onClick={() => {
                        setSelectedProduct(record);
                        setIsModalVisible(true);
                    }}>Edit</Button>
                    <Button
                        danger
                        onClick={() => {
                            Modal.confirm({
                                title: "Confirm Delete",
                                content: "Are you sure you want to delete this product?",
                                onOk: () => handleDelete(record._id),
                            });
                        }}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div className="admin-custom-header d-flex justify-content-end p-3 bg-light border-bottom">
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                    Logout
                </button>
            </div>

            <div className="container-fluid m-3 p-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminMenu />
                    </div>
                    <div className="col-md-9">
                        <Button
                            type="primary"
                            onClick={() => {
                                setSelectedProduct(null);
                                setIsModalVisible(true);
                            }}
                            className="mb-3"
                        >
                            Create Product
                        </Button>
                        <Table
                            dataSource={products}
                            columns={columns}
                            rowKey="_id"
                            pagination={{ pageSize: 5 }}
                        />
                        <ProductModal
                            visible={isModalVisible}
                            onCancel={() => {
                                setIsModalVisible(false);
                                setSelectedProduct(null);
                            }}
                            onSuccess={getProducts}
                            initialData={selectedProduct}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductPage;