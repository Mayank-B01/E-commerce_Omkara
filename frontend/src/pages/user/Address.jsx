import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout.jsx';
import UserMenu from '../../components/Layout/UserMenu.jsx';
import { useAuth } from '../../context/auth.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/UserDashboard.css';
import { FaPencilAlt } from 'react-icons/fa';

const Address = () => {
    const [auth, setAuth] = useAuth();
    const [address, setAddress] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (auth?.user?.address) {
            setAddress(auth.user.address);
        }
    }, [auth?.user?.address]);

    const handleAddressUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/api/v1/auth/profile`, {
                address,
            });
            if (data?.error) {
                toast.error(data.error);
            } else {
                setAuth({ ...auth, user: data?.updatedUser });
                let ls = localStorage.getItem('auth');
                ls = JSON.parse(ls);
                ls.user = data.updatedUser;
                localStorage.setItem('auth', JSON.stringify(ls));
                toast.success('Address updated successfully!');
                setIsEditing(false);
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong updating address');
        }
    };

    return (
        <Layout title={"Manage Address - Omkara"}>
            <div className="dashboard-container">
                <div className="dashboard-menu">
                    <UserMenu />
                </div>
                <div className="dashboard-content">
                    <h3>Manage Address</h3>

                    <form onSubmit={handleAddressUpdate} className="dashboard-form">
                        <div className="address-section">
                            <h4>
                                Billing Address
                                {!isEditing && (
                                    <FaPencilAlt
                                        className="edit-address-icon ms-2"
                                        onClick={() => setIsEditing(true)}
                                        title="Edit Address"
                                    />
                                )}
                            </h4>
                            {isEditing ? (
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter your full billing address"
                                    required
                                />
                            ) : (
                                <p>{address || 'No billing address set.'}</p>
                            )}
                        </div>

                        {isEditing && (
                            <button type="submit" className="btn-save-changes">
                                Save Changes
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Address;