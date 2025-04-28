import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout.jsx';
import UserMenu from '../../components/Layout/UserMenu.jsx';
import axios from 'axios';
import { useAuth } from '../../context/auth.jsx';
import moment from 'moment';
import { Link } from 'react-router-dom';
import '../../styles/UserDashboard.css';
import { toast } from 'react-toastify';
// import '../../styles/OrderHistory.css'; // Specific styling for order history

const UserOrder = ({ handleShowAuthModal }) => {
    const [orders, setOrders] = useState([]);
    const [auth] = useAuth();

    const getOrders = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/api/v1/order/user-orders`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            });
            if (data?.success) {
                setOrders(data.orders);
            } else {
                console.error('Failed to fetch orders:', data?.message);
                toast.error(data?.message || 'Could not load order history.');
                setOrders([]);
            }
        } catch (error) {
            console.log('Error fetching orders:', error);
            // Add user feedback (e.g., toast message)
        }
    };

    useEffect(() => {
        if (auth?.token) getOrders();
    }, [auth?.token]);

    return (
        <Layout title={"Order History - Omkara"} handleShowAuthModal={handleShowAuthModal}>
            <div className="dashboard-container order-history-container">
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
                                <p><strong>Payment:</strong> {order.payment?.status === 'COMPLETE' ? "Success" : order.payment?.status || "Pending"} ({order.payment?.method})</p>
                                <p><strong>Total:</strong> Rs {order.payment?.amount}</p>
                                <h5 className="mt-3">Products:</h5>
                                {order.products?.map((item) => (
                                    <div className="order-item" key={item.product?._id || item._id}>
                                        <img
                                            src={`${import.meta.env.VITE_API}/api/v1/product/product-photo/${item.product?._id}`}
                                            alt={item.product?.name}
                                            className="order-item-image"
                                        />
                                        <div className="order-item-details">
                                            <h5>{item.product?.name}</h5>
                                            {item.size && <p><small>Size: {item.size}</small></p>}
                                            <p><small>Quantity: {item.quantity}</small></p>
                                            <p>Price: Rs {item.product?.price} (at time of purchase may differ)</p>
                                        </div>
                                        {item.product?.slug && 
                                            <Link to={`/product/${item.product.slug}`} className="btn-go-to-product">
                                                View Product
                                            </Link>
                                        }
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