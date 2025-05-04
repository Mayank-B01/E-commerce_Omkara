import React, { useState, useEffect } from 'react';
import AdminMenu from '../../components/Layout/AdminMenu';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/auth';
import moment from 'moment';
import { Select } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Option } = Select;

const OrderPage = () => {
    const [auth, setAuth] = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [statusOptions] = useState([
        "Not Processed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
    ]);
    const [orders, setOrders] = useState([]);
    const [filteredUserId, setFilteredUserId] = useState(null);
    const [filteredUserName, setFilteredUserName] = useState(null);

    const handleLogout = () => {
        setAuth({
            ...auth,
            user: null,
            token: ''
        });
        localStorage.removeItem("auth");
        toast.success("Logged out successfully.");
        navigate('/');
    };

    const getOrders = async (userIdToFilter = null) => {
        try {
            let endpoint = `${import.meta.env.VITE_API}/api/v1/order/all-orders`;
            if (userIdToFilter) {
                endpoint += `?userId=${userIdToFilter}`;
                console.log(`Fetching orders filtered by User ID: ${userIdToFilter}`);
            } else {
                console.log("Fetching all orders");
            }

            const { data } = await axios.get(endpoint);
            
            if (data?.success) {
                setOrders(data.orders);
                if (userIdToFilter && data.orders.length > 0) {
                    setFilteredUserName(data.orders[0]?.buyer?.name || `User ${userIdToFilter}`);
                } else {
                    setFilteredUserName(null);
                }
            } else {
                toast.error(data?.message || "Failed to fetch orders");
                setOrders([]);
                setFilteredUserName(null);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong fetching orders");
            setOrders([]);
            setFilteredUserName(null);
        }
    };

    useEffect(() => {
        document.title = "Admin - Order Management";
        const userIdFromState = location.state?.filterByUserId;
        setFilteredUserId(userIdFromState || null);
        if (auth?.token) {
            getOrders(userIdFromState);
        }
    }, [auth?.token, location.state?.filterByUserId]);

    const handleChange = async (orderId, value) => {
        try {
            await axios.put(`${import.meta.env.VITE_API}/api/v1/order/order-status/${orderId}`, {
                status: value,
            });
            getOrders(filteredUserId);
            toast.success("Order status updated");
        } catch (error) {
            console.log(error);
            toast.error("Error updating order status");
        }
    };

    const showAllOrders = () => {
        setFilteredUserId(null);
        setFilteredUserName(null);
    };

    return (
        <>
            <div className="admin-custom-header d-flex justify-content-end p-3 bg-light border-bottom">
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                    Logout
                </button>
            </div>

            <div className="container-fluid m-3 p-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminMenu />
                    </div>
                    <div className="col-md-9">
                        <div className='card shadow-sm'>
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span>{filteredUserName ? `Orders for ${filteredUserName}` : "Manage All Orders"}</span>
                                {filteredUserId && (
                                    <button onClick={showAllOrders} className="btn btn-sm btn-outline-secondary">
                                        Show All Orders
                                    </button>
                                )}
                            </div>
                            <div className="card-body">
                                {orders?.length > 0 ? (
                                    orders.map((o, i) => (
                                        <div className="border shadow-sm rounded p-3 mb-4" key={o._id}>
                                            <table className="table table-sm table-bordered align-middle">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">#</th>
                                                        <th scope="col">Status</th>
                                                        <th scope="col">Buyer</th>
                                                        <th scope="col">Date</th>
                                                        <th scope="col">Payment</th>
                                                        <th scope="col">Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            <Select
                                                                bordered={false}
                                                                onChange={(value) => handleChange(o._id, value)}
                                                                defaultValue={o?.status}
                                                            >
                                                                {statusOptions.map((s, idx) => (
                                                                    <Option key={idx} value={s}>
                                                                        {s}
                                                                    </Option>
                                                                ))}
                                                            </Select>
                                                        </td>
                                                        <td>{o?.buyer?.name}</td>
                                                        <td>{moment(o?.createdAt).format('DD MMM, YYYY HH:mm')}</td>
                                                        <td>{o?.payment?.status === 'COMPLETE' ? "Success" : (o?.payment?.status || "Failed/Pending")}</td>
                                                        <td>{o?.products?.length}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div className="container">
                                                <h6>Order Items:</h6>
                                                {o?.products?.map((item) => (
                                                    <div className="row mb-2 p-2 card flex-row align-items-center" key={item.product?._id || item._id}>
                                                        <div className="col-md-2 text-center">
                                                            <img
                                                                src={`${import.meta.env.VITE_API}/api/v1/product/product-photos/${item.product?._id}?first=true`}
                                                                className="img-fluid rounded"
                                                                alt={item.product?.name || 'Product Image'}
                                                                style={{maxHeight: '80px', objectFit: 'contain'}}
                                                                onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png'; }}
                                                            />
                                                        </div>
                                                        <div className="col-md-8">
                                                            <p className="mb-1">{item.product?.name}</p>
                                                            {item.size && <p className="mb-1"><small>Size: {item.size}</small></p>}
                                                            <p className="mb-1"><small>Quantity: {item.quantity}</small></p>
                                                            <p className="mb-1">Price: Rs. {item.product?.price}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>{filteredUserId ? `No orders found for ${filteredUserName || 'this user'}.` : "No orders found."}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderPage;