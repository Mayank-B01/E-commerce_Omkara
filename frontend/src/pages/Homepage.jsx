import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout/Layout.jsx";
import { useAuth } from "../context/auth.jsx";
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Homepage.css';
import axios from 'axios';
import menCategory from '../assets/men-category.png';
import womenCategory from '../assets/women-category.png';
import accessoriesCategory from '../assets/accessories-category.jpg';
import { useCart } from "../context/cart.jsx";
import { toast } from 'react-toastify';

const Homepage = () => {
    const [auth] = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useCart();
    const [products, setProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroProducts, setHeroProducts] = useState([]);

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
    }, []);

    return (
        <Layout title={'Omkara - Home'}>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-carousel">
                        {heroProducts.map((product, index) => (
                            <div 
                                key={product._id}
                                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                            >
                                <img 
                                    src={`${import.meta.env.VITE_API}/api/v1/product/product-photo/${product._id}`}
                                    alt={product.name} 
                                />
                                <div className="featured-badge">New Arrival</div>
                                <div className="hero-text">
                                    <h2>{product.name}</h2>
                                    <p>Rs. {product.price}</p>
                                    <Link to={`/product/${product.slug}`} className="shop-now-btn">
                                        Shop Now
                                    </Link>
                                </div>
                            </div>
                        ))}
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
                </div>
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
                                src={`${import.meta.env.VITE_API}/api/v1/product/product-photo/${product._id}`}
                                alt={product.name} 
                            />
                            <h3>{product.name}</h3>
                            <p className="price">Rs. {product.price}</p>
                            <button
                                className='btn btn-sm btn-outline-dark ms-1'
                                onClick={() => navigate(`/product/${product.slug}`)}
                            >
                                Shop
                            </button>
                            <button
                                className='btn btn-sm btn-dark ms-1'
                                onClick={() => {
                                    const updatedCart = [...cart, { ...product, quantity: 1 }];
                                    setCart(updatedCart);
                                    localStorage.setItem('cart', JSON.stringify(updatedCart));
                                    toast.success('Item added to cart!');
                                }}
                            >
                                Add to Cart <i className="bi bi-cart-plus-fill"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta-section">
                <h2>Wanna Be a Trend?</h2>
                <Link to="/category" className="cta-button">See Trending Now</Link>
            </section>
        </Layout>
    );
};

export default Homepage;