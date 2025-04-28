import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from "react-router-dom";
import Layout from "../components/Layout/Layout.jsx";
import {useAuth} from "../context/auth.jsx";
import axios from 'axios';
import {Prices} from "../components/Prices.js";
import { toast } from 'react-toastify';
import { useCart } from "../context/cart.jsx";

// Static sizes for now
const Sizes = ["S", "M", "L", "XL", "XXL"];

const Category = ({ handleShowAuthModal }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [auth] = useAuth();
    const [cart, setCart] = useCart(); // Use cart context
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [checked, setChecked] = useState([]);
    const [radio, setRadio] = useState([]);
    const [checkedSizes, setCheckedSizes] = useState([]);
    const [sortBy, setSortBy] = useState("");
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [searchNameFromUrl, setSearchNameFromUrl] = useState("");

    const getAllCategories = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/api/v1/category/allCategory`);
            if (data?.success) {
                setCategories(data?.category);
            }
        } catch (error) {
            console.log(error);
            toast.error("Error fetching categories");
        }
    };

    useEffect(() => {
        getAllCategories();
    }, []);


    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const nameSearch = params.get('searchName');
        const categorySlugFromUrl = params.get('cat');
        let handledByUrl = false;
        
        setInitialLoadComplete(false);
        setSearchNameFromUrl("");

        if (nameSearch) {
            console.log("Handling searchName:", nameSearch);
            setSearchNameFromUrl(nameSearch);
            setChecked([]);
            setRadio([]);
            setCheckedSizes([]);
            setSortBy("");
            fetchProductsByCategoryName(nameSearch); 
            handledByUrl = true;
        } else if (categorySlugFromUrl && categories.length > 0) {
             console.log("Handling cat:", categorySlugFromUrl);
             const targetCategory = categories.find(c => c.slug === categorySlugFromUrl);
             if (targetCategory) {
                 setChecked([targetCategory._id]);
                 setRadio([]); 
                 setCheckedSizes([]);
                 setSortBy("");

             } else {
                 console.warn(`Category slug "${categorySlugFromUrl}" from URL not found.`);
                 setChecked([]);
             }
             handledByUrl = true;
        } else if (categorySlugFromUrl && categories.length === 0) {
             console.log("'cat' param found, but categories not loaded yet. Waiting...");

        } else if (!categorySlugFromUrl && !nameSearch) {
            console.log("No 'cat' or 'searchName' found in URL, clearing category filter.");
            setChecked([]);
            setRadio([]); 
            setCheckedSizes([]);
            setSortBy("");
            handledByUrl = true;
        }

         console.log("Initial load handled by URL:", handledByUrl);
        setInitialLoadComplete(true);

    }, [location.search, categories]);

     useEffect(() => {
        if (!initialLoadComplete) return;
        if (searchNameFromUrl) return; 

        const hasFilters = checked.length > 0 || radio.length > 0 || checkedSizes.length > 0 || sortBy;
        console.log("Filter Effect: hasFilters:", hasFilters, "searchNameFromUrl:", searchNameFromUrl);

        if (hasFilters) {
            filterProduct(); 
        } else {
            getAllProducts();
        }

    }, [checked, radio, checkedSizes, sortBy, initialLoadComplete, searchNameFromUrl]);

    //get all products
     const getAllProducts = async () => {
        try {
            const {data} = await axios.get(`${import.meta.env.VITE_API}/api/v1/product/get-product`);
            setProducts(data.products);
        } catch (error) {
             console.log(error);
            toast.error("Error fetching all products");
        }
    }

    // Fetch products by category name (NEW)
    const fetchProductsByCategoryName = async (nameTerm) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API}/api/v1/product/product-category-name-search`, { searchName: nameTerm });
            if (data?.success) {
                setProducts(data?.products);
            } else {
                setProducts([]); // Clear products if search fails or returns none
                toast.error(data?.message || "Error searching products by category name");
            }
        } catch (error) {
            setProducts([]);
            console.log(error);
            toast.error("Something went wrong searching products by category name");
        }
    };

    // Fetch products by filters (checkboxes, radio, size, sort)
    const filterProduct = async () => {
        setSearchNameFromUrl(""); 
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API}/api/v1/product/product-filters`, { checked, radio, checkedSizes, sortBy });
            setProducts(data?.products);
        } catch (error) {
            console.log(error);
            toast.error("Error filtering products");
        }
    };

    // Handle filter checkbox changes
    const handleFilter = (value, id) => {
        let all = [...checked];
        if (value) {
            all.push(id);
        } else {
            all = all.filter((c) => c !== id);
        }
        setChecked(all);
    };

    // Handle size filter checkbox changes
    const handleSizeFilter = (value, size) => {
        let all = [...checkedSizes];
        if (value) {
            all.push(size);
        } else {
            all = all.filter((s) => s !== size);
        }
        setCheckedSizes(all);
    };

    // Reset filters
    const resetFilters = () => {
        setChecked([]);
        setRadio([]);
        setCheckedSizes([]);
        setSortBy("");
        setSearchNameFromUrl("");

    }

    return(
        <Layout title={'Omkara - Products'} handleShowAuthModal={handleShowAuthModal}>
            <div className="container-fluid row mt-3">

                <div className="col-md-2">
                    {/* Display search term if active */}
                    {searchNameFromUrl && (
                        <div className="alert alert-info p-2 mb-3" role="alert">
                           Showing results for "{searchNameFromUrl}"
                        </div>
                    )}
                    <h4 className="text-center mb-3">Filters <i className="bi bi-funnel"></i></h4>

                    {/* Category Filter */}
                    <h6 className="mt-4">Category</h6>
                    <div className="d-flex flex-column ms-1">
                        {categories?.map((c) => (
                            <div className="form-check" key={c._id}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={checked.includes(c._id)}
                                    onChange={(e) => handleFilter(e.target.checked, c._id)}
                                />
                                <label className="form-check-label">
                                    {c.name}
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Price Filter */}
                    <h6 className="mt-4">Price range</h6>
                    <div className="d-flex flex-column ms-1">
                        {Prices?.map((p) => (
                            <div className="form-check" key={p._id}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="priceRadio"
                                    value={p._id}
                                    checked={JSON.stringify(radio) === JSON.stringify(p.array)}
                                    onChange={() => setRadio(p.array)}
                                />
                                <label className="form-check-label">
                                    {p.name}
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Size Filter */}
                    <h6 className="mt-4">Size</h6>
                    <div className="d-flex flex-column ms-1">
                        {Sizes?.map((s, index) => (
                            <div className="form-check" key={index}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={checkedSizes.includes(s)}
                                    onChange={(e) => handleSizeFilter(e.target.checked, s)}
                                />
                                <label className="form-check-label">
                                    {s}
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Reset Button */}
                    <div className="d-flex flex-column mt-4">
                        <button className="btn btn-danger" onClick={resetFilters}>Reset Filters</button>
                    </div>
                </div>

                {/* Products Section */}
                <div className="col-md-10">
                    <h1 className="text-center">
                        {searchNameFromUrl ? `Products matching "${searchNameFromUrl}"` : "All Products"}
                    </h1>
                    {/* Sort By Dropdown */}
                    <div className="d-flex justify-content-end mb-3">
                        <select 
                            className="form-select w-auto"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="">Sort By</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>

                    {/* Product Grid */}
                    <div className="d-flex flex-wrap justify-content-center">
                        {products?.length > 0 ? products.map((p) => (
                            <div className="card m-2" style={{ width: '18rem' }} key={p._id} >
                                <img src={`${import.meta.env.VITE_API}/api/v1/product/product-photo/${p._id}`} className="card-img-top p-2" alt={p.name} style={{height: "250px", objectFit: "contain"}}/>
                                <div className="card-body text-center">
                                    <h5 className="card-title">{p.name}</h5>
                                    <p className="card-text">Rs {p.price}</p>
                                    <button
                                        className='btn btn-sm btn-outline-dark ms-1'
                                        onClick={() => navigate(`/product/${p.slug}`)}
                                    >
                                        Shop
                                    </button>
                                    <button
                                        className='btn btn-sm btn-dark ms-1'
                                        onClick={async () => {
                                            const cartItem = {
                                                productId: p._id,
                                                quantity: 1,
                                                size: p.sizes?.length > 0 ? p.sizes[0] : null,
                                                _id: p._id,
                                                name: p.name,
                                                price: p.price,
                                                selectedSize: p.sizes?.length > 0 ? p.sizes[0] : null
                                            };

                                            if (auth?.token) {
                                                try {
                                                    const { data } = await axios.post(`${import.meta.env.VITE_API}/api/v1/cart/add`,
                                                        { productId: cartItem.productId, quantity: cartItem.quantity, size: cartItem.size },
                                                        { headers: { Authorization: `Bearer ${auth.token}` } }
                                                    );
                                                    if (data?.success) {
                                                        toast.success('Item added to cart!');
                                                        const existingItemIndex = cart.findIndex(item => item.product?._id === cartItem.productId && item.size === cartItem.size);
                                                         if (existingItemIndex > -1) {
                                                             const updatedCart = [...cart];
                                                             updatedCart[existingItemIndex].quantity += cartItem.quantity;
                                                             setCart(updatedCart);
                                                         } else {
                                                             setCart([...cart, { product: { ...p, _id: cartItem.productId }, quantity: cartItem.quantity, size: cartItem.size }]);
                                                         }
                                                    } else {
                                                        toast.error(data?.message || "Failed to add item.");
                                                    }
                                                } catch (error) {
                                                    toast.error(error.response?.data?.message || "Error adding item.");
                                                    console.error("Error adding item via API:", error);
                                                }
                                            } else {
                                                const existingCartItemIndex = cart.findIndex(item => item._id === cartItem._id && item.selectedSize === cartItem.selectedSize);
                                                let updatedCart;
                                                if (existingCartItemIndex > -1) {
                                                    updatedCart = [...cart];
                                                    updatedCart[existingCartItemIndex].quantity += cartItem.quantity;
                                                } else {
                                                    updatedCart = [...cart, cartItem];
                                                }
                                                setCart(updatedCart);
                                                localStorage.setItem('cart', JSON.stringify(updatedCart));
                                                toast.success('Item added to cart!');
                                            }
                                        }}
                                    >
                                        Add to Cart <i className="bi bi-cart-plus-fill"></i>
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center w-100 mt-4">
                                <h4>No products found matching your criteria.</h4>
                        </div>
                        )}
                    </div>

                    {/* Load More Button */}
                    <div className="m-2 p-3 text-center">
                        <button>
                            Load More <i className="bi bi-caret-down-fill"></i>
                        </button>
                    </div>
                </div>
                </div>
        </Layout>
    );
};
export default Category;