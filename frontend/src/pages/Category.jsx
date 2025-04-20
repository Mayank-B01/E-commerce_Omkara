import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from "react-router-dom";
import Layout from "../components/Layout/Layout.jsx";
import {useAuth} from "../context/auth.jsx";
import axios from 'axios';
import {Prices} from "../components/Prices.js";
import { toast } from 'react-toastify'; // Import toast
import { useCart } from "../context/cart.jsx"; // Import useCart

// Static sizes for now
const Sizes = ["S", "M", "L", "XL", "XXL"];

const Category = ({ handleShowAuthModal }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [auth, setAuth] = useAuth();
    const [cart, setCart] = useCart(); // Use cart context
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [checked, setChecked] = useState([]);
    const [radio, setRadio] = useState([]);
    const [checkedSizes, setCheckedSizes] = useState([]);
    const [sortBy, setSortBy] = useState("");
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [searchNameFromUrl, setSearchNameFromUrl] = useState("");

    // Fetch categories on mount
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

    // Fetch initial products based on URL parameters (or all if none)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const nameSearch = params.get('searchName');
        const categorySlugFromUrl = params.get('cat'); // Check for 'cat' param as well
        let handledByUrl = false; // Flag to see if URL params dictated the load
        
        setInitialLoadComplete(false); // Reset flag on location change
        setSearchNameFromUrl(""); // Reset name search by default
        // Don't reset checked here, let the specific param handlers do it

        if (nameSearch) {
            console.log("Handling searchName:", nameSearch);
            setSearchNameFromUrl(nameSearch); 
            // Clear specific filters when coming from name search link
            setChecked([]); // Reset category filter on name search
            setRadio([]);
            setCheckedSizes([]);
            setSortBy("");
            fetchProductsByCategoryName(nameSearch); 
            handledByUrl = true;
        } else if (categorySlugFromUrl && categories.length > 0) { // Handle 'cat' ONLY if categories are loaded
             console.log("Handling cat:", categorySlugFromUrl);
             const targetCategory = categories.find(c => c.slug === categorySlugFromUrl);
             if (targetCategory) {
                 // Check the corresponding category filter
                 setChecked([targetCategory._id]); 
                 // Reset other filters when navigating from header category link
                 setRadio([]); 
                 setCheckedSizes([]);
                 setSortBy("");
                 // filterProduct will be called by the other useEffect due to `checked` changing
             } else {
                 console.warn(`Category slug "${categorySlugFromUrl}" from URL not found.`);
                 setChecked([]); // Clear category filter if slug invalid
             }
             handledByUrl = true;
        } else if (categorySlugFromUrl && categories.length === 0) {
            // If cat param exists but categories not loaded yet, DO NOTHING here.
            // Wait for categories to load, which will re-trigger this effect.
             console.log("'cat' param found, but categories not loaded yet. Waiting...");
             // handledByUrl remains false
        } else if (!categorySlugFromUrl && !nameSearch) {
            // If NO category or name search param in URL (e.g., navigating to /category)
            // Clear the category filter explicitly.
            console.log("No 'cat' or 'searchName' found in URL, clearing category filter.");
            setChecked([]); 
            // Resetting other filters might be redundant but safe:
            setRadio([]); 
            setCheckedSizes([]);
            setSortBy("");
            handledByUrl = true; // Indicate URL (absence of params) was handled
        }

        // If URL params didn't dictate the load, let the other effect handle it
        // (either load all or use existing filters)
         console.log("Initial load handled by URL:", handledByUrl);
        setInitialLoadComplete(true); // Mark initial load logic attempt as complete

    }, [location.search, categories]); // Re-run if location or categories change

    // Fetch products based on checkbox/radio/size/sort filters (Revised)
     useEffect(() => {
        // Only run if initial load logic is complete
        if (!initialLoadComplete) return; 

        // If a name search term is active from the URL, don't filter based on checkboxes etc.
        if (searchNameFromUrl) return; 

        const hasFilters = checked.length > 0 || radio.length > 0 || checkedSizes.length > 0 || sortBy;
        console.log("Filter Effect: hasFilters:", hasFilters, "searchNameFromUrl:", searchNameFromUrl);

        if (hasFilters) {
            filterProduct(); 
        } else {
            // If filters are cleared (or none were set initially), fetch all products
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
        // If using filters, clear the name search state
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
        setSearchNameFromUrl(""); // Also clear name search on manual reset
        // Call getAllProducts directly after resetting if needed, or let useEffect handle it
        // getAllProducts(); 
    }

    return(
        <Layout title={'Omkara - Products'} handleShowAuthModal={handleShowAuthModal}>
            <div className="container-fluid row mt-3">
                {/* Breadcrumb or Title Removed */}
                {/* <div className="col-md-12 mb-3">
                    <h1 className="text-center">Trending</h1>
                 </div> */}

                {/* Filters Section */}
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
                                        onClick={() => {
                                            // Add product to cart (simple add, quantity 1, no size selected here)
                                            const updatedCart = [...cart, { ...p, quantity: 1 }]; // Add product p with default quantity 1
                                            setCart(updatedCart);
                                            localStorage.setItem('cart', JSON.stringify(updatedCart));
                                            toast.success('Item added to cart!');
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