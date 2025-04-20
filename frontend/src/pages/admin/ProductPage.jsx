import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Layout/AdminMenu.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { Select, Table, Space, Modal, Button, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/auth';

const { Option } = Select;

// Define size options
const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

const ProductModal = ({ visible, onCancel, onSuccess, initialData }) => {
    const [categories, setCategories] = useState([]);
    const [photoFile, setPhotoFile] = useState(null);
    const [existingPhoto, setExistingPhoto] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState();
    const [quantity, setQuantity] = useState();
    const [shipping, setShipping] = useState("");
    const [sizes, setSizes] = useState([]);

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

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
            setPrice(initialData.price);
            setQuantity(initialData.quantity);
            setCategory(initialData.category);
            setShipping(initialData.shipping ? "1" : "0");
            setSizes(initialData.sizes || []);
            setExistingPhoto(
                `${import.meta.env.VITE_API}/api/v1/product/product-photo/${initialData._id}`
            );
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
        setPhotoFile(null);
        setExistingPhoto(null);
        setSizes([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = new FormData();
            productData.append("name", name);
            productData.append("description", description);
            productData.append("price", price);
            productData.append("quantity", quantity);
            if (photoFile) productData.append("photo", photoFile);
            productData.append("category", category);
            productData.append("shipping", shipping === "1");
            productData.append("sizes", JSON.stringify(sizes));

            const url = initialData
                ? `${import.meta.env.VITE_API}/api/v1/product/update-product/${initialData._id}`
                : `${import.meta.env.VITE_API}/api/v1/product/add-product`;

            const { data } = await axios[initialData ? "put" : "post"](url, productData);

            if (data?.success) {
                toast.success(`Product ${initialData ? "Updated" : "Added"} Successfully`);
                onSuccess();
                onCancel();
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };

    return (
        <Modal
            title={initialData ? "Edit Product" : "Create Product"}
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <form onSubmit={handleSubmit}>
                <label> Category</label>
                <Select
                    placeholder="Select category"
                    className="w-100 mb-3"
                    value={category}
                    onChange={(value) => setCategory(value)}
                >
                    {categories?.map((c) => (
                        <Option key={c._id} value={c._id}>{c.name}</Option>
                    ))}
                </Select>

                <div className="mb-3">
                    <label className="btn btn-outline-dark">
                        {photoFile ? photoFile.name : existingPhoto ? "Change Photo" : "Upload Photo"}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoFile(e.target.files[0])}
                            hidden
                        />
                    </label>
                </div>

                { (photoFile || existingPhoto) && (
                    <div className="text-center mb-3">
                        <img
                            src={photoFile ? URL.createObjectURL(photoFile) : existingPhoto}
                            alt="product"
                            height="200px"
                            className="img img-responsive"
                        />
                    </div>
                )}

                <div className="mb-3">
                    <label>Product Name</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Product Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label>Description</label>
          <textarea
              className="form-control"
              placeholder="Describe the product"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
          />
                </div>

                <div className="mb-3">
                    <label>Price</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label>Quantity</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </div>

                {/* Sizes Selection */}
                <div className="mb-3">
                    <label>Available Sizes</label>
                    <Checkbox.Group
                        options={sizeOptions}
                        value={sizes}
                        onChange={(checkedValues) => setSizes(checkedValues)}
                        className="w-100"
                    />
                </div>

                <label>Shipping</label>
                <Select
                    className="w-100 mb-3 "
                    placeholder="Select Shipping"
                    value={shipping}
                    onChange={(value) => setShipping(value)}
                >
                    <Option value="0">No</Option>
                    <Option value="1">Yes</Option>
                </Select>

                <Button type="primary" htmlType="submit" className="w-100">
                    {initialData ? "Update" : "Create"}
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