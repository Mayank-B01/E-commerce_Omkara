import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout.jsx';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from "../context/cart.jsx";
import { useAuth } from "../context/auth.jsx";
import '../styles/ProductDetails.css';
import { Spin } from 'antd';

const MAX_RECENTLY_VIEWED = 6; // Store current + 5 previous
const DISPLAY_RECENTLY_VIEWED = 4; // Show up to 4 recommendations
const MIN_RECENT_TO_SHOW = 4; // Minimum number of recent items to show before falling back

const ProductDetails = ({ handleShowAuthModal }) => {
    const params = useParams();
    const navigate = useNavigate();
    const [auth] = useAuth();
    const [cart, setCart] = useCart();
    const [product, setProduct] = useState({});
    const [productPhotos, setProductPhotos] = useState([]);
    const [photosLoading, setPhotosLoading] = useState(true);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [recentProducts, setRecentProducts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [recommendationType, setRecommendationType] = useState('recent');
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(null);

    const updateRecentlyViewed = (slug) => {
        if (!slug) return;
        try {
            let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            viewed = viewed.filter(item => item !== slug);
            viewed.unshift(slug);
            viewed = viewed.slice(0, MAX_RECENTLY_VIEWED);
            localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
        } catch (error) {
            console.error("Error updating recently viewed list:", error);
        }
    };

    const fetchRecommendations = async (currentSlug, productId, categoryId) => {
        let fetchedRecent = [];
        let useRecent = false;
        
        try {
            let viewedSlugs = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const slugsToFetch = viewedSlugs
                .filter(slug => slug !== currentSlug)
                .slice(0, DISPLAY_RECENTLY_VIEWED);

            if (slugsToFetch.length >= MIN_RECENT_TO_SHOW) {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API}/api/v1/product/get-multiple-by-slug`,
                    { slugs: slugsToFetch }
                );
                if (data?.success && data.products?.length > 0) {
                    const productMap = data.products.reduce((map, product) => {
                         map[product.slug] = product;
                         return map;
                     }, {});
                     fetchedRecent = slugsToFetch.map(slug => productMap[slug]).filter(p => p);
                     if (fetchedRecent.length >= MIN_RECENT_TO_SHOW) {
                         useRecent = true;
                     }
                }
            }
        } catch (error) {
            console.error("Error fetching recently viewed products:", error.response?.data || error.message);
        }

        if (useRecent) {
            setRecentProducts(fetchedRecent);
            setRelatedProducts([]);
            setRecommendationType('recent');
        } else {
            setRecentProducts([]);
            setRecommendationType('related');
            if (productId && categoryId) {
                getSimilarProduct(productId, categoryId);
            } else {
                setRelatedProducts([]);
            }
        }
    };

    const getSimilarProduct = async (pid, cid) => {
        if (!pid || !cid) return;
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/api/v1/product/related-product/${pid}/${cid}`
            );
            if (data?.success) {
                setRelatedProducts(data?.products || []);
            } else {
                console.log('Could not fetch related products:', data?.message);
                setRelatedProducts([]);
            }
        } catch (error) {
            console.log('Error fetching related products:', error);
            setRelatedProducts([]);
        }
    };

    useEffect(() => {
        const currentSlug = params.slug;
        if (currentSlug) {
            setProduct({});
            setProductPhotos([]);
            setPhotosLoading(true);
            setSelectedPhotoIndex(0);
            setSelectedColor(null);
            setSelectedSize(null);
            setQuantity(1);
            setRecentProducts([]);
            setRelatedProducts([]);

            getProduct(currentSlug);
            updateRecentlyViewed(currentSlug);
        }
    }, [params.slug]);

    useEffect(() => {
        if (product?._id && product.category?._id) {
            fetchRecommendations(product.slug, product._id, product.category._id);
        }
    }, [product]);

    const selectedPhotoData = productPhotos[selectedPhotoIndex];

    const getProductPhotos = async (productId) => {
        if (!productId) return;
        setPhotosLoading(true);
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/api/v1/product/product-photos/${productId}`
            );
            if (data?.success) {
                setProductPhotos(data?.photos || []);
            } else {
                console.error("Failed to fetch product photos:", data?.message);
                setProductPhotos([]);
            }
        } catch (error) {
            console.error("Error fetching product photos:", error);
            setProductPhotos([]);
        } finally {
            setPhotosLoading(false);
        }
    };

    const getProduct = async (slug) => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/api/v1/product/single-product/${slug}`
            );
            if (data?.success && data?.product) {
                setProduct(data.product);
                getProductPhotos(data.product._id);
                if (data.product.sizes?.length > 0) {
                    setSelectedSize(data.product.sizes[0]);
                } else {
                    setSelectedSize(null);
                }
                if (data.product.colors?.length > 0) {
                    setSelectedColor(data.product.colors[0]);
                } else {
                    setSelectedColor(null);
                }
            } else {
                toast.error(data?.message || 'Could not fetch product details');
                navigate('/');
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
            toast.error('Something went wrong while fetching product details');
            navigate('/');
        }
    };

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = async () => {
        if (!product?._id) return;

        if (!selectedSize && product?.sizes?.length > 0) {
            toast.error("Please select a size");
            return;
        }

        const cartItem = {
            productId: product._id,
            quantity: quantity,
            size: selectedSize,
            _id: product._id,
            name: product.name,
            price: product.price,
            selectedSize: selectedSize
        };

        if (auth?.token) {
            try {
                const { data } = await axios.post(`${import.meta.env.VITE_API}/api/v1/cart/add`,
                    {
                        productId: cartItem.productId,
                        quantity: cartItem.quantity,
                        size: cartItem.size
                    },
                    {
                         headers: {
                            Authorization: `Bearer ${auth.token}`
                         }
                    }
                );

                if (data?.success) {
                    toast.success('Item added to cart!');
                    const existingItemIndex = cart.findIndex(item => item.product?._id === cartItem.productId && item.size === cartItem.size);
                    let updatedContextCart;
                    if (existingItemIndex > -1) {
                        updatedContextCart = [...cart];
                        updatedContextCart[existingItemIndex].quantity += cartItem.quantity;
                    } else {
                        const newItemForContext = {
                            product: { ...product, _id: cartItem.productId },
                            quantity: cartItem.quantity,
                            size: cartItem.size,
                            _id: data?.cartItem?._id
                        };
                        updatedContextCart = [...cart, newItemForContext];
                    }
                    setCart(updatedContextCart);
                } else {
                    toast.error(data?.message || "Failed to add item to cart.");
                }
            } catch (error) {
                console.error("Error adding item via API:", error);
                toast.error(error.response?.data?.message || "Error adding item to cart.");
            }
        } else {
            const existingCartItemIndex = cart.findIndex(item => 
                item.product?._id === cartItem.productId && item.size === cartItem.size
            );
            let updatedCart;

            if (existingCartItemIndex > -1) {
                updatedCart = [...cart];
                updatedCart[existingCartItemIndex].quantity += cartItem.quantity;
            } else {
                 const newItemForLocalStorage = {
                    product: {
                        _id: cartItem.productId, 
                        name: cartItem.name,
                        price: cartItem.price,
                        slug: product.slug,
                        sizes: product.sizes
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
    };

    return (
        <Layout title={product?.name || 'Product Details'} handleShowAuthModal={handleShowAuthModal}>
            <div className="container mt-4 product-details-container">
                <div className="row">
                    <div className="col-md-6 mb-3 mb-md-0 product-gallery d-flex gap-3">
                        {productPhotos.length > 1 && (
                            <div className="vertical-thumbnails d-flex flex-column gap-2" style={{ width: '80px', maxHeight: '450px', overflowY: 'auto', flexShrink: 0 }}>
                                {productPhotos.map((photo, index) => (
                                    <img
                                        key={photo._id || index}
                                        src={`data:${photo.contentType};base64,${photo.data}`}
                                        alt={`${product.name} thumbnail ${index + 1}`}
                                        className={`img-thumbnail product-thumbnail ${index === selectedPhotoIndex ? 'active' : ''}`}
                                        style={{ width: '100%', height: 'auto', objectFit: 'cover', cursor: 'pointer' }}
                                        onClick={() => setSelectedPhotoIndex(index)}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="main-image-container flex-grow-1" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', position: 'relative' }}>
                            {photosLoading ? (
                                <Spin size="large" />
                            ) : selectedPhotoData ? (
                                <img
                                    src={`data:${selectedPhotoData.contentType};base64,${selectedPhotoData.data}`}
                                    className="img-fluid main-product-image"
                                    alt={`${product.name} - image ${selectedPhotoIndex + 1}`}
                                    style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            ) : productPhotos.length === 1 ? (
                                 <img
                                    src={`data:${productPhotos[0].contentType};base64,${productPhotos[0].data}`}
                                    className="img-fluid main-product-image"
                                    alt={`${product.name} - image 1`}
                                    style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <img
                                    src="/images/placeholder.png"
                                    className="img-fluid main-product-image placeholder-image"
                                    alt="No product image available"
                                    style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="col-md-6 product-info">
                        <h1 className="fw-bold mb-3">{product.name || 'Product Name'}</h1>

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

                        {product?.colors?.length > 0 && (
                            <div className="mb-3">
                                <h6 className="detail-label">Color:</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {product.colors.map((c) => (
                                        <button
                                            key={c}
                                            className={`btn color-swatch-btn ${selectedColor === c ? 'active' : ''}`}
                                            style={{
                                                backgroundColor: c.toLowerCase(),
                                                minWidth: '35px',
                                                height: '35px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                padding: 0,
                                                outline: selectedColor === c ? '2px solid #74ab6a' : 'none',
                                                outlineOffset: selectedColor === c ? '2px' : '0'
                                            }}
                                            onClick={() => setSelectedColor(c)}
                                            aria-label={`Select color ${c}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-3 d-flex align-items-center quantity-selector">
                            <h6 className="detail-label me-3 mb-0">Quantity:</h6>
                            <button className="btn btn-outline-dark btn-sm me-2 quantity-btn" onClick={handleDecrement} disabled={quantity <= 1}>-</button>
                            <span className="quantity-display mx-2">{quantity}</span>
                            <button className="btn btn-outline-dark btn-sm quantity-btn" onClick={handleIncrement}>+</button>
                        </div>

                        <h4 className="mb-4 price-display">Price: Rs {product.price?.toFixed(2) || '0.00'}</h4>

                        {product.quantity < 10 && (
                            <p className="low-stock-indicator" style={{ color: 'red', fontWeight: 'bold' }}>Low Stock!</p>
                        )}

                        <div className="d-flex action-buttons mb-4">
                            <button
                                className={`btn btn-dark flex-grow-1 me-2 ${!product._id ? 'disabled' : ''}`}
                                onClick={handleAddToCart}
                                disabled={!product._id}
                            >
                                <i className="bi bi-cart-plus-fill me-1"></i> Add to Cart
                            </button>
                            <button
                                className={`btn btn-outline-success flex-grow-1 ${!product._id ? 'disabled' : ''}`}
                                onClick={async () => {
                                    if (!product._id) return;
                                    await handleAddToCart();
                                    navigate('/cart');
                                }}
                                disabled={!product._id}
                            >
                                <i className="bi bi-bag-check-fill me-1"></i> Buy Now
                            </button>
                        </div>

                        {product.description && (
                            <div>
                                <h6 className="detail-label">Description:</h6>
                                <p>{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="my-5" />

                <div className="row recommended-section">
                    <div className="section-header d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">Recommended For You</h2>
                        <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => navigate(`/shop`)}
                        >
                            Browse More
                        </button>
                    </div>

                    {(recommendationType === 'recent' && recentProducts.length > 0) ? (
                        <div className="row">
                            {recentProducts.map((p) => (
                                <div key={p._id} className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <div className="product-card h-100">
                                        <img
                                            src={`${import.meta.env.VITE_API}/api/v1/product/product-photos/${p._id}?first=true`}
                                            className="product-card-image"
                                            alt={p.name}
                                            onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png'; }}
                                            onClick={() => navigate(`/product/${p.slug}`)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div className="card-body">
                                            <div className="card-details-row">
                                                <div className="card-info">
                                                    <h3 className="card-title">{p.name}</h3>
                                                    <p className="price-display">Rs. {p.price?.toFixed(2)}</p>
                                                </div>
                                                <div className="card-actions">
                                                    <button
                                                        className='btn btn-sm btn-outline-dark'
                                                        onClick={() => navigate(`/product/${p.slug}`)}
                                                    >
                                                        Shop
                                                    </button>
                                                    <button
                                                        className='btn btn-sm btn-dark'
                                                        onClick={async () => {
                                                            const cartItem = { productId: p._id, quantity: 1, size: p.sizes?.length > 0 ? p.sizes[0] : null, _id: p._id, name: p.name, price: p.price, selectedSize: p.sizes?.length > 0 ? p.sizes[0] : null };
                                                            const existingCartItemIndex = cart.findIndex(item => item.product?._id === cartItem.productId && item.size === cartItem.size);
                                                            let updatedCart;
                                                            if (existingCartItemIndex > -1) { updatedCart = [...cart]; updatedCart[existingCartItemIndex].quantity += cartItem.quantity; } else { const newItemForLocalStorage = { product: { _id: cartItem.productId, name: cartItem.name, price: cartItem.price, slug: p.slug, sizes: p.sizes }, quantity: cartItem.quantity, size: cartItem.size }; updatedCart = [...cart, newItemForLocalStorage]; }
                                                            setCart(updatedCart); localStorage.setItem('cart', JSON.stringify(updatedCart)); toast.success('Item added to cart!');
                                                        }}
                                                    >
                                                        Add to Cart <i className="bi bi-cart-plus-fill"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (relatedProducts.length > 0 && recommendationType === 'related') ? (
                        <div className="row">
                            {relatedProducts.map((p) => (
                                <div key={p._id} className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <div className="product-card h-100">
                                        <img
                                            src={`${import.meta.env.VITE_API}/api/v1/product/product-photos/${p._id}?first=true`}
                                            className="product-card-image"
                                            alt={p.name}
                                            onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png'; }}
                                            onClick={() => navigate(`/product/${p.slug}`)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div className="card-body">
                                            <div className="card-details-row">
                                                <div className="card-info">
                                                    <h3 className="card-title">{p.name}</h3>
                                                    <p className="price-display">Rs. {p.price?.toFixed(2)}</p>
                                                </div>
                                                <div className="card-actions">
                                                    <button
                                                        className='btn btn-sm btn-outline-dark'
                                                        onClick={() => navigate(`/product/${p.slug}`)}
                                                    >
                                                        Shop
                                                    </button>
                                                    <button
                                                        className='btn btn-sm btn-dark'
                                                        onClick={async () => {
                                                            const cartItem = { productId: p._id, quantity: 1, size: p.sizes?.length > 0 ? p.sizes[0] : null, _id: p._id, name: p.name, price: p.price, selectedSize: p.sizes?.length > 0 ? p.sizes[0] : null };
                                                            const existingCartItemIndex = cart.findIndex(item => item.product?._id === cartItem.productId && item.size === cartItem.size);
                                                            let updatedCart;
                                                            if (existingCartItemIndex > -1) { updatedCart = [...cart]; updatedCart[existingCartItemIndex].quantity += cartItem.quantity; } else { const newItemForLocalStorage = { product: { _id: cartItem.productId, name: cartItem.name, price: cartItem.price, slug: p.slug, sizes: p.sizes }, quantity: cartItem.quantity, size: cartItem.size }; updatedCart = [...cart, newItemForLocalStorage]; }
                                                            setCart(updatedCart); localStorage.setItem('cart', JSON.stringify(updatedCart)); toast.success('Item added to cart!');
                                                        }}
                                                    >
                                                        Add to Cart <i className="bi bi-cart-plus-fill"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-center'>No recommendations found.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ProductDetails; 