import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout.jsx';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from "../context/cart.jsx";
import '../styles/ProductDetails.css';

const ProductDetails = ({ handleShowAuthModal }) => {
    const params = useParams();
    const navigate = useNavigate();
    const [cart, setCart] = useCart();
    const [product, setProduct] = useState({});
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedSize, setSelectedSize] = useState(null); // State for selected size
    const [quantity, setQuantity] = useState(1); // State for quantity

    // Initial product details fetch
    useEffect(() => {
        if (params?.slug) getProduct();
    }, [params?.slug]);

    // Get Product
    const getProduct = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/api/v1/product/single-product/${params.slug}`
            );
            if (data?.success) {
                setProduct(data?.product);
                getSimilarProduct(data?.product._id, data?.product.category._id);
                // Set default selected size if available
                if (data?.product?.sizes?.length > 0) {
                    setSelectedSize(data.product.sizes[0]);
                }
            } else {
                toast.error(data?.message || 'Could not fetch product details');
                navigate('/'); // Redirect if product not found
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong while fetching product details');
            navigate('/');
        }
    };

    // Get similar/related products
    const getSimilarProduct = async (pid, cid) => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/api/v1/product/related-product/${pid}/${cid}`
            );
            if (data?.success) {
                setRelatedProducts(data?.products);
            } else {
                console.log('Could not fetch related products:', data?.message);
            }
        } catch (error) {
            console.log('Error fetching related products:', error);
            // Don't toast error here, less critical
        }
    };

    // Quantity handlers
    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    // Add to Cart Handler
    const handleAddToCart = () => {
        if (!selectedSize && product?.sizes?.length > 0) {
            toast.error("Please select a size");
            return;
        }
        // Simple add - duplicates allowed for now
        // For more complex logic (checking existing, updating quantity), replace below
        const updatedCart = [...cart, { ...product, selectedSize, quantity }];
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast.success('Item added to cart!');
    };

    return (
        <Layout title={product?.name || 'Product Details'} handleShowAuthModal={handleShowAuthModal}>
            <div className="container mt-4 product-details-container">
                 {/* Breadcrumbs Removed */}
                 {/* <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                        {product?.category && (
                            <li className="breadcrumb-item"><Link to={`/category/${product.category.slug}`}>{product.category.name}</Link></li>
                        )}
                        <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
                    </ol>
                 </nav> */}

                <div className="row">
                    {/* Product Image & Thumbnails */}
                    <div className="col-md-6 text-center mb-3 mb-md-0">
                        <img
                            src={product._id ? `${import.meta.env.VITE_API}/api/v1/product/product-photo/${product._id}` : ''} // Check product._id exists
                            className="img-fluid main-product-image"
                            alt={product.name}
                        />
                         {/* Thumbnail Images Placeholder */}
                         <div className="product-thumbnails mt-3">
                             {/* Placeholder for 3 thumbnails like the image */}
                             {product._id && [
                                `${import.meta.env.VITE_API}/api/v1/product/product-photo/${product._id}`,
                                /* Add more placeholder image URLs or logic if you have multiple images */
                             ].slice(0, 3).map((thumbUrl, index) => (
                                 <img 
                                    key={index} 
                                    src={thumbUrl} 
                                    alt={`${product.name} thumbnail ${index + 1}`} 
                                    className="img-thumbnail product-thumbnail me-2" 
                                    // Add onClick handler to change main image if needed
                                />
                             ))}
                         </div>
                    </div>

                    {/* Product Details */}
                    <div className="col-md-6 product-info">
                        <h1 className="fw-bold mb-3">{product.name}</h1>
                         
                         {/* Type - Placeholder */}
                         <p className="text-muted mb-3">Type: Unisex {/* Assuming 'Unisex' - Add logic if type is in model */}</p>

                         {/* Sizes */}
                         {product?.sizes?.length > 0 && (
                             <div className="mb-3">
                                 <h6 className="detail-label">Size:</h6>
                                 {product.sizes.map((s) => (
                                     <button
                                         key={s}
                                         className={`btn size-btn me-2 ${selectedSize === s ? 'btn-dark' : 'btn-outline-dark'}`}
                                         onClick={() => setSelectedSize(s)}
                                     >
                                         {s}
                                     </button>
                                 ))}
                             </div>
                         )}

                        {/* Colors - Placeholder */}
                         <div className="mb-3">
                             <h6 className="detail-label">Color:</h6>
                             {/* Add actual color logic if available in product model */}
                             <button className="btn color-swatch me-2" style={{ backgroundColor: '#A3B899' /* Olive Green */ }} title="Olive Green"></button>
                             <button className="btn color-swatch me-2" style={{ backgroundColor: '#000000' /* Black */ }} title="Black"></button>
                             <button className="btn color-swatch me-2" style={{ backgroundColor: '#3B5998' /* Blue */ }} title="Blue"></button>
                         </div>

                        {/* Quantity */}
                        <div className="mb-3 d-flex align-items-center quantity-selector">
                            <h6 className="detail-label me-3 mb-0">Quantity:</h6>
                            <button className="btn btn-outline-dark btn-sm me-2 quantity-btn" onClick={handleDecrement} disabled={quantity <= 1}>-</button>
                            <span className="quantity-display mx-2">{quantity}</span>
                            <button className="btn btn-outline-dark btn-sm quantity-btn" onClick={handleIncrement}>+</button>
                        </div>

                        {/* Price */}
                        <h4 className="mb-4 price-display">Price: Rs {product.price}</h4>

                        {/* Action Buttons */}
                        <div className="d-flex action-buttons mb-4">
                            <button className="btn btn-dark flex-grow-1 me-2" onClick={handleAddToCart}>
                                <i className="bi bi-cart-plus-fill me-1"></i> Add to Cart
                            </button>
                            <button className="btn btn-outline-success flex-grow-1" /* Changed to outline-success */ >
                                <i className="bi bi-bag-check-fill me-1"></i> Buy Now
                            </button>
                        </div>
                        
                        {/* Product Description */}
                        {product.description && (
                            <div>
                                <h6 className="detail-label">Description:</h6>
                                <p>{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="my-5" />

                {/* Recommended For You Section */}
                <div className="row recommended-section">
                    <div className="section-header d-flex justify-content-between align-items-center mb-4">
                         <h2 className="mb-0">Recommended For You</h2>
                         {relatedProducts.length > 0 && (
                            <button className="btn btn-outline-dark btn-sm">Browse More</button>
                         )}
                    </div>
                    {relatedProducts.length < 1 ? (
                        <p className='text-center'>No similar products found.</p>
                    ) : (
                        <div className="d-flex flex-wrap justify-content-center">
                            {relatedProducts?.map((p) => (
                                <div className="card m-2" style={{ width: '15rem' }} key={p._id}> {/* Slightly smaller cards */}
                                    <img src={`${import.meta.env.VITE_API}/api/v1/product/product-photo/${p._id}`} className="card-img-top p-2" alt={p.name} style={{height: "200px", objectFit: "contain"}}/>
                                    <div className="card-body text-center">
                                        <h6 className="card-title">{p.name}</h6>
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
                                                // Add related product to cart (simple add)
                                                // Note: This doesn't account for size/quantity selection for related items
                                                const updatedCart = [...cart, p]; // Add the related product object 'p'
                                                setCart(updatedCart);
                                                localStorage.setItem('cart', JSON.stringify(updatedCart));
                                                toast.success('Item added to cart!');
                                            }}
                                        >
                                            Add to Cart <i className="bi bi-cart-plus-fill"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ProductDetails; 