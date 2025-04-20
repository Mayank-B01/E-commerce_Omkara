import React, {useEffect, useState} from "react";
import AdminMenu from "../../components/Layout/AdminMenu.jsx";
import {useAuth} from "../../context/auth.jsx";
import {useNavigate} from "react-router-dom";
import { toast } from 'react-toastify';
import axios from 'axios';
import moment from 'moment';

const UserPage = () => {
    const [auth, setAuth] = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('all');

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

    const fetchUsers = async () => {
        console.log(`Attempting to fetch users with filter: ${roleFilter}`);
        let endpoint = `${import.meta.env.VITE_API}/api/v1/auth/all-users`;
        
        if (roleFilter === 'admin') {
            endpoint += '?role=1';
        } else if (roleFilter === 'user') {
            endpoint += '?role=0';
        }

        console.log("Using endpoint:", endpoint);
        try {
            const { data } = await axios.get(endpoint);
            console.log("API Response:", data);

            if (data?.success && Array.isArray(data.users)) {
                console.log(`Fetched ${data.users.length} users.`);
                setUsers(data.users);
            } else {
                console.error("Failed to fetch users or response format incorrect. Response data:", data);
                toast.error(data?.message || "Failed to fetch users or unexpected format");
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
                toast.error(`Failed to fetch users: ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                console.error("Error request:", error.request);
                toast.error("Failed to fetch users: No response from server.");
            } else {
                console.error('Error message:', error.message);
                toast.error(`Failed to fetch users: ${error.message}`);
            }
            setUsers([]);
        }
    };

    const handleDelete = async (userId, userName) => {
        // Confirmation dialog
        if (!window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`)) {
            return; // Stop if user cancels
        }

        try {
            console.log(`Attempting to delete user with ID: ${userId}`);
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/api/v1/auth/delete-user/${userId}`);
            
            if (data?.success) {
                toast.success(data.message || `User "${userName}" deleted successfully.`);
                fetchUsers();
            } else {
                toast.error(data?.message || "Failed to delete user.");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            if (error.response) {
                toast.error(`Error deleting user: ${error.response.data?.message || error.response.statusText}`);
            } else {
                toast.error("Error deleting user: Could not connect to server or other error.");
            }
        }
    };

    useEffect(() => {
        document.title = 'Admin - User Management';
        fetchUsers();
    }, [roleFilter]);

    const handleFilterChange = (newFilter) => {
        setRoleFilter(newFilter);
    };

    const handleViewOrders = (userId) => {
        navigate('/dashboard/admin/orders', { state: { filterByUserId: userId } });

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
                    <div className='col-md-9'>
                        <div className='card shadow-sm'>
                             <div className="card-header d-flex justify-content-between align-items-center">
                                <span>User Management</span>
                                <div className="btn-group btn-group-sm" role="group">
                                    <button 
                                        type="button" 
                                        className={`btn ${roleFilter === 'all' ? 'btn-dark' : 'btn-outline-dark'}`} 
                                        onClick={() => handleFilterChange('all')}
                                    >
                                        All
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`btn ${roleFilter === 'admin' ? 'btn-dark' : 'btn-outline-dark'}`} 
                                        onClick={() => handleFilterChange('admin')}
                                    >
                                        Admins
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`btn ${roleFilter === 'user' ? 'btn-dark' : 'btn-outline-dark'}`} 
                                        onClick={() => handleFilterChange('user')}
                                    >
                                        Users
                                    </button>
                                </div>
                            </div>
                             <div className="card-body">
                                <h2>{roleFilter === 'admin' ? 'Admin Users' : roleFilter === 'user' ? 'Regular Users' : 'All Users'}</h2>
                                {users.length > 0 ? (
                                    <table className="table table-striped table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Created At</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user._id}>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.role === 1 ? 'Admin' : 'User'}</td>
                                                    <td>{moment(user.createdAt).format('YYYY-MM-DD')}</td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-outline-info me-2"
                                                            onClick={() => handleViewOrders(user._id)}
                                                            title="View this user's orders"
                                                        >
                                                            Orders
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(user._id, user.name)} 
                                                            disabled={user._id === auth?.user?._id}
                                                            title="Delete this user"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>Loading users or no users found matching the filter...</p>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserPage;