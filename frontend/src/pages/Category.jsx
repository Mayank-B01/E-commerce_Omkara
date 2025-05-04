import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from "react-router-dom";
import Layout from "../components/Layout/Layout.jsx";
import {useAuth} from "../context/auth.jsx";
import axios from 'axios';
import {Prices} from "../components/Prices.js";
import { toast } from 'react-toastify';
import { useCart } from "../context/cart.jsx";
import { Pagination } from 'antd';

// Static sizes for now
const Sizes = ["S", "M", "L", "XL", "XXL"];
const PAGE_SIZE = 16;

const Category = ({ handleShowAuthModal }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [auth] = useAuth();
    const [cart, setCart] = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [checked, setChecked] = useState([]);
    const [radio, setRadio] = useState([]);
    const [checkedSizes, setCheckedSizes] = useState([]);
    const [sortBy, setSortBy] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(false);
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
        setCurrentPage(1);

        if (nameSearch) {
            console.log("Handling searchName:", nameSearch);
            setSearchNameFromUrl(nameSearch);
            setChecked([]);
            setRadio([]);
            setCheckedSizes([]);
            setSortBy("");
            fetchProductsByCategoryName(nameSearch, 1);
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
        console.log("Filter/Page Effect: Page:", currentPage, "HasFilters:", hasFilters, "Search:", searchNameFromUrl);

        if (hasFilters) {
            filterProduct(currentPage); 
        } else {
            getAllProducts(currentPage);
        }

    }, [checked, radio, checkedSizes, sortBy, currentPage, initialLoadComplete, searchNameFromUrl]);

    useEffect(() => {
        if (initialLoadComplete) {
             console.log("Filter change detected, resetting to page 1");
             setCurrentPage(1);
        }
    }, [checked, radio, checkedSizes, sortBy]);

    const getAllProducts = async (page = 1) => {
        setLoading(true);
        try {
            const {data} = await axios.get(`${import.meta.env.VITE_API}/api/v1/product/get-product?page=${page}`);
            if(data?.success) {
                 setProducts(data.products);
                 setTotalProducts(data.total);
            } else {
                 setProducts([]);
                 setTotalProducts(0);
                 toast.error(data?.message || "Failed to fetch products");
            }
        } catch (error) {
             console.log(error);
             setProducts([]);
             setTotalProducts(0);
             toast.error("Error fetching all products");
        } finally {
             setLoading(false);
        }
    }

    const fetchProductsByCategoryName = async (nameTerm, page = 1) => {
         setLoading(true);
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API}/api/v1/product/product-category-name-search?page=${page}`, { keyword: nameTerm });
            if (data?.success) {
                setProducts(data?.products);
                 setTotalProducts(data.total);
            } else {
                setProducts([]); 
                setTotalProducts(0);
                toast.error(data?.message || "Error searching products by category name");
            }
        } catch (error) {
            setProducts([]);
            setTotalProducts(0);
            console.log(error);
            toast.error("Something went wrong searching products by category name");
        } finally {
             setLoading(false);
        }
    };

    const filterProduct = async (page = 1) => {
        setSearchNameFromUrl("");
        setLoading(true);
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API}/api/v1/product/product-filters?page=${page}`, { checked, radio, checkedSizes, sortBy });
             if(data?.success) {
                 setProducts(data.products);
                 setTotalProducts(data.total);
             } else {
                 setProducts([]);
                 setTotalProducts(0);
                 toast.error(data?.message || "Failed to fetch filtered products");
             }
        } catch (error) {
            console.log(error);
            setProducts([]);
            setTotalProducts(0);
            toast.error("Error filtering products");
        } finally {
             setLoading(false);
        }
    };

    const handleFilter = (value, id) => {
        let all = [...checked];
        if (value) {
            all.push(id);
        } else {
            all = all.filter((c) => c !== id);
        }
        setChecked(all);
    };

    const handleSizeFilter = (value, size) => {
        let all = [...checkedSizes];
        if (value) {
            all.push(size);
        } else {
            all = all.filter((s) => s !== size);
        }
        setCheckedSizes(all);
    };

    const resetFilters = () => {
        setChecked([]);
        setRadio([]);
        setCheckedSizes([]);
        setSortBy("");
        setSearchNameFromUrl("");
        setCurrentPage(1);
    }

    const handlePageChange = (page) => {
        console.log("Page changed to:", page);
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return(
        <Layout title={'Omkara - Products'} handleShowAuthModal={handleShowAuthModal}>
            <div className="container-fluid row mt-3">

                <div className="col-md-2">
                    {searchNameFromUrl && (
                        <div className="alert alert-info p-2 mb-3" role="alert">
                           Showing results for "{searchNameFromUrl}"
                        </div>
                    )}
                    <h4 className="text-center mb-3">Filters <i className="bi bi-funnel"></i></h4>

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

                    <div className="d-flex flex-column mt-4">
                        <button className="btn btn-danger" onClick={resetFilters}>Reset Filters</button>
                    </div>
                </div>

                <div className="col-md-10">
                    <h1 className="text-center">
                        {searchNameFromUrl ? `Products matching "${searchNameFromUrl}"` : "All Products"}
                    </h1>
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

                    <div className="category-products-grid">
                        {loading ? (
                            <p>Loading products...</p>
                        ) : products?.length > 0 ? (
                            products.map(p => (
                                 <div className="card m-2 product-card" key={p._id}>
                                      <img
                                         src={`${import.meta.env.VITE_API}/api/v1/product/product-photos/${p._id}?first=true`}
                                         className="card-img-top product-card-image"
                                         alt={p.name}
                                         onError={(e) => { e.target.onerror = null; e.target.src="/images/placeholder.png"; }}
                                         onClick={() => navigate(`/product/${p.slug}`)}
                                         style={{ cursor: 'pointer' }}
                                     />
                                     <div className="card-body">
                                         <div className="card-details-row">
                                             <div className="card-info">
                                                 <h5 className="card-title text-truncate" title={p.name}>{p.name}</h5>
                                                 <p className="card-text price-display">Rs {p.price?.toFixed(2)}</p>
                                             </div>
                                             <div className="card-actions">
                                                 <button
                                                     className='btn btn-sm btn-outline-dark'
                                                     onClick={() => navigate(`/product/${p.slug}`)}
                                                     title="View Details"
                                                 >
                                                     Shop 
                                                 </button>
                                                 <button
                                                     className='btn btn-sm btn-dark'
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
                                                              const existingItemIndex = cart.findIndex(item => 
                                                                item.product?._id === cartItem.productId && item.size === cartItem.size
                                                             );
                                                             let updatedCart;
                                                             if (existingItemIndex > -1) {
                                                                 updatedCart = [...cart];
                                                                 updatedCart[existingItemIndex].quantity += cartItem.quantity;
                                                             } else {
                                                                 const newItemForLocalStorage = {
                                                                    product: { 
                                                                        _id: cartItem.productId,
                                                                        name: cartItem.name,
                                                                        price: cartItem.price,
                                                                        slug: p.slug, 
                                                                        sizes: p.sizes
                                                                    },
                                                                    quantity: cartItem.quantity,
                                                                    size: cartItem.size
                                                                 };
                                                                 updatedCart = [...cart, newItemForLocalStorage];
                                                             }
                                                             setCart(updatedCart);
                                                             localStorage.setItem('cart', JSON.stringify(updatedCart));
                                                             toast.success('Item added to cart!');
                                                         }
                                                      }}
                                                     title="Add to Cart"
                                                 >
                                                     Add to Cart 
                                                 </button>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                            ))
                        ) : (
                             !loading && <p>No products found matching your criteria.</p>
                        )}
                    </div>

                    <div className="d-flex justify-content-center mt-4">
                         {totalProducts > PAGE_SIZE && (
                             <Pagination
                                current={currentPage}
                                total={totalProducts}
                                pageSize={PAGE_SIZE}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                         )}
                    </div>
                </div>
                </div>
        </Layout>
    );
};
export default Category;