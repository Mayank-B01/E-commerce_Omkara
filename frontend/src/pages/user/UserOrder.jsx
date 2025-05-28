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
            toast.error('Failed to load order history');
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
                    <div className="order-history-header mb-4">
                        <h3>Order History</h3>
                        <p className="text-muted">View and track your orders</p>
                    </div>
                    
                    {orders?.length > 0 ? (
                        orders.map((order) => (
                            <div key={order._id} className="card shadow-sm mb-4">
                                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-0">Order #{order._id.slice(-6)}</h5>
                                        <small className="text-muted">
                                            Placed on {moment(order.createdAt).format('MMMM Do YYYY, h:mm a')}
                                        </small>
                                    </div>
                                    <span className={`badge ${order.status === 'Delivered' ? 'bg-success' : 
                                        order.status === 'Cancelled' ? 'bg-danger' : 
                                        order.status === 'Processing' ? 'bg-warning' : 'bg-info'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <p className="mb-1"><strong>Payment Status:</strong> 
                                                <span className={`ms-2 ${order.payment?.status === 'COMPLETE' ? 'text-success' : 'text-warning'}`}>
                                                    {order.payment?.status === 'COMPLETE' ? "Paid" : "Pending"}
                                                </span>
                                            </p>
                                            <p className="mb-1"><strong>Payment Method:</strong> {order.payment?.method}</p>
                                        </div>
                                        <div className="col-md-6 text-md-end">
                                            <p className="mb-1"><strong>Total Amount:</strong></p>
                                            <h4 className="mb-0">Rs {order.payment?.amount}</h4>
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        {order.products?.map((item) => (
                                            <div className="order-item" key={item.product?._id || item._id}>
                                                <div className="order-item-image-container">
                                                    <img
                                                        src={`${import.meta.env.VITE_API}/api/v1/product/product-photos/${item.product?._id}?first=true`}
                                                        alt={item.product?.name}
                                                        className="order-item-image"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <div className="order-item-details">
                                                    <h5>{item.product?.name}</h5>
                                                    {item.size && <p className="mb-1"><small>Size: {item.size}</small></p>}
                                                    <p className="mb-1"><small>Quantity: {item.quantity}</small></p>
                                                    <p className="mb-0" style={{ color: 'black' }}>Price: Rs {item.product?.price}</p>
                                                </div>
                                                {item.product?.slug && 
                                                    <Link 
                                                        to={`/product/${item.product.slug}`} 
                                                        className="btn btn-outline-primary btn-sm"
                                                    >
                                                        View Product
                                                    </Link>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-5">
                            <h4 className="text-muted">No Orders Yet</h4>
                            <p>You haven't placed any orders yet.</p>
                            <Link to="/" className="btn btn-primary mt-3">
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default UserOrder;