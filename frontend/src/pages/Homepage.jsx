import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout/Layout.jsx";
import { useAuth } from "../context/auth.jsx";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Homepage.css';
import axios from 'axios';
import menCategory from '../assets/men-category.png';
import womenCategory from '../assets/women-category.png';
import accessoriesCategory from '../assets/accessories-category.jpg';
import { useCart } from "../context/cart.jsx";
import { toast } from 'react-toastify';

const Homepage = ({ handleShowAuthModal }) => {
    const [auth] = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [cart, setCart] = useCart();
    const [products, setProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroProducts, setHeroProducts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState(null);

    // Fetch all products
    const getAllProducts = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/api/v1/product/get-product`);
            if (data?.success) {
                setProducts(data.products);
                // Get 3 random products for hero section
                const randomHeroProducts = [...data.products]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                setHeroProducts(randomHeroProducts);
                // Get 3 different random products for trending section
                const remainingProducts = data.products.filter(
                    product => !randomHeroProducts.find(p => p._id === product._id)
                );
                const randomTrendingProducts = [...remainingProducts]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                setTrendingProducts(randomTrendingProducts);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Auto scroll hero section
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, [heroProducts.length]);

    useEffect(() => {
        getAllProducts();

        // Check for payment success status on mount
        const queryParams = new URLSearchParams(location.search);
        const paymentStatus = queryParams.get('payment_status');
        const orderId = queryParams.get('orderId'); // Optional: use if needed

        if (paymentStatus === 'success') {
            toast.success(`Payment successful! ${orderId ? `(Order: ${orderId})` : ''}`);
            // Optionally clear cart context explicitly, though CartProvider should refetch the empty cart
            // setCart([]); 
            // Clear query parameters from URL
            navigate('/', { replace: true });
        } else if (paymentStatus === 'success_db_error') {
            // Handle case where payment was ok but order saving failed
            toast.error(`Payment was successful, but there was an issue saving your order. Please contact support. ${orderId ? `(Order: ${orderId})` : ''}`);
            navigate('/', { replace: true });
        }
        // No need to handle failure here, as the backend redirects to /cart?payment_status=failure...
        // and CartPage.jsx handles displaying failure messages

    }, []); // Run only once on mount

    const openModal = (imgUrl) => {
        setModalImage(imgUrl);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setModalImage(null);
    };

    return (
        <Layout title={'Omkara - Home'} handleShowAuthModal={handleShowAuthModal}>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-aspect-ratio">
                    {heroProducts.map((product, index) => {
                        const imgUrl = `${import.meta.env.VITE_API}/api/v1/product/product-photos/${product._id}?first=true`;
                        return (
                            <div 
                                key={product._id}
                                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                            >
                                <img 
                                    src={imgUrl}
                                    alt={product.name} 
                                    onError={(e) => { e.target.onerror = null; e.target.src="/images/placeholder.png"}}
                                />
                                {/* View Full Image Button */}
                                <button
                                    className="view-full-btn"
                                    title="View Full Image"
                                    onClick={() => openModal(imgUrl)}
                                    style={{ position: 'absolute', top: 20, left: 20, zIndex: 3, background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '20px', padding: '6px 16px', cursor: 'pointer', fontWeight: 500, fontSize: '1rem', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                                >
                                    View Full Image
                                </button>
                                <div className="featured-badge">New Arrival</div>
                                <div className="hero-text">
                                    <h2>{product.name}</h2>
                                    <p>Rs. {product.price}</p>
                                    <Link to={`/product/${product.slug}`} className="shop-now-btn">
                                        Shop Now
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                    <div className="carousel-dots">
                        {heroProducts.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                </div>
                {/* Modal for full image */}
                {modalOpen && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeModal} title="Close" style={{position:'absolute',top:10,right:10,background:'rgba(0,0,0,0.5)',color:'#fff',border:'none',borderRadius:'50%',width:32,height:32,fontSize:20,cursor:'pointer',zIndex:10}}>&times;</button>
                            <img src={modalImage} alt="Full" style={{maxWidth:'90vw',maxHeight:'80vh',objectFit:'contain',background:'#eee',display:'block',margin:'0 auto'}} />
                        </div>
                    </div>
                )}
            </section>

            {/* Categories Grid */}
            <section className="categories-grid">
                <Link to="/category?searchName=Men" className="category-item-link">
                    <div className="category-item">
                        <img src={menCategory} alt="Men's Fashion" />
                        <h3>Men's Fashion</h3>
                    </div>
                </Link>
                <Link to="/category?searchName=Women" className="category-item-link">
                    <div className="category-item">
                        <img src={womenCategory} alt="Women's Fashion" />
                        <h3>Women's Fashion</h3>
                    </div>
                </Link>
                <Link to="/category?searchName=Accessories" className="category-item-link">
                    <div className="category-item">
                        <img src={accessoriesCategory} alt="Accessories" />
                        <h3>Accessories</h3>
                    </div>
                </Link>
            </section>

            {/* Trending Section */}
            <section className="trending-section">
                <div className="section-header">
                    <h2>Trending</h2>
                    <Link to="/category" className="load-more">Load More</Link>
                </div>
                <div className="products-grid">
                    {trendingProducts.map(product => (
                        <div key={product._id} className="product-card">
                            <img 
                                src={`${import.meta.env.VITE_API}/api/v1/product/product-photos/${product._id}?first=true`}
                                alt={product.name} 
                                onError={(e) => { e.target.onerror = null; e.target.src="/images/placeholder.png"}}
                            />
                            <div className="card-body">
                                <div className="card-details-row">
                                    <div className="card-info">
                                        <h3>{product.name}</h3>
                                        <p className="price">Rs. {product.price}</p>
                                    </div>
                                    <div className="card-actions">
                                        <button
                                            className='btn btn-sm btn-outline-dark'
                                            onClick={() => navigate(`/product/${product.slug}`)}
                                        >
                                            Shop
                                        </button>
                                        <button
                                            className='btn btn-sm btn-dark'
                                            onClick={async () => {
                                                const cartItem = {
                                                    productId: product._id,
                                                    quantity: 1,
                                                    size: product.sizes?.length > 0 ? product.sizes[0] : null,
                                                    _id: product._id,
                                                    name: product.name,
                                                    price: product.price,
                                                    selectedSize: product.sizes?.length > 0 ? product.sizes[0] : null
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
                                                                setCart([...cart, { product: { ...product, _id: cartItem.productId }, quantity: cartItem.quantity, size: cartItem.size }]);
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
                                            }}
                                        >
                                            Add to Cart <i className="bi bi-cart-plus-fill"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="cta-section">
                <h2>Wanna Be a Trend?</h2>
                <Link to="/category" className="cta-button">See Trending Now</Link>
            </section>
        </Layout>
    );
};

export default Homepage;