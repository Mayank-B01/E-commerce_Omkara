import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout.jsx';
import UserMenu from '../../components/Layout/UserMenu.jsx';
import axios from 'axios';
import { useAuth } from '../../context/auth.jsx';
import moment from 'moment';
import { Link } from 'react-router-dom';
import '../../styles/UserDashboard.css'; // Import the new CSS

const UserOrder = () => {
    const [orders, setOrders] = useState([]);
    const [auth] = useAuth();

    const getOrders = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/api/v1/auth/orders`);
            setOrders(data);
        } catch (error) {
            console.log('Error fetching orders:', error);
            // Add user feedback (e.g., toast message)
        }
    };

    useEffect(() => {
        if (auth?.token) getOrders();
    }, [auth?.token]);

    return (
        <Layout title={"Your Orders - Omkara"}>
            <div className="dashboard-container">
                <div className="dashboard-menu">
                    <UserMenu />
                </div>
                <div className="dashboard-content">
                    <h3>Order History</h3>
                    {orders?.length > 0 ? (
                        orders.map((order) => (
                            <div key={order._id} className="mb-4 p-3 border rounded">
                                <p><strong>Order ID:</strong> {order._id}</p>
                                <p><strong>Status:</strong> {order.status}</p>
                                <p><strong>Date:</strong> {moment(order.createdAt).format('DD MMM, YYYY')}</p>
                                <p><strong>Payment:</strong> {order.payment.success ? "Success" : "Failed"}</p>
                                <p><strong>Total:</strong> Rs {order.payment.transaction.amount}</p>
                                <h5 className="mt-3">Products:</h5>
                                {order.products.map((p) => (
                                    <div className="order-item" key={p._id}>
                                        <img
                                            src={`${import.meta.env.VITE_API}/api/v1/product/product-photo/${p._id}`}
                                            alt={p.name}
                                        />
                                        <div className="order-item-details">
                                            <h5>{p.name}</h5>
                                            {/* Add size/variant if available in p */}
                                            <p>Price: Rs {p.price}</p>
                                            <p>Purchased Date: {moment(order.createdAt).format('DD MMM, YYYY')} {/* Approximation, use specific if available */}</p>
                                        </div>
                                        <Link to={`/product/${p.slug}`} className="btn-go-to-product">
                                            Go to Product
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <p>You haven't placed any orders yet.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default UserOrder;