import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout.jsx';
import UserMenu from '../../components/Layout/UserMenu.jsx';
import { useAuth } from '../../context/auth.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/UserDashboard.css'; // Import the new CSS

const Profile = ({ handleShowAuthModal }) => {
    const [auth, setAuth] = useAuth();
    // State for user details
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    // State for password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Populate form with user data on load
    useEffect(() => {
        const { name, email, phone } = auth?.user || {};
        const nameParts = name?.split(' ') || [];
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setEmail(email || '');
        setPhone(phone || '');
    }, [auth?.user]);

    // Handle profile details update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const fullName = `${firstName} ${lastName}`.trim();
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/api/v1/auth/profile`, {
                name: fullName,
                email,
                phone,
            });
            if (data?.error) {
                toast.error(data.error);
            } else {
                setAuth({ ...auth, user: data?.updatedUser });
                let ls = localStorage.getItem('auth');
                ls = JSON.parse(ls);
                ls.user = data.updatedUser;
                localStorage.setItem('auth', JSON.stringify(ls));
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong updating profile');
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match!');
            return;
        }
        if (!currentPassword || !newPassword) {
            toast.error('Please fill in all password fields.');
            return;
        }

        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/api/v1/auth/update-password`, {
                currentPassword,
                newPassword,
            });
            if (data?.success) {
                toast.success('Password updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data?.message || 'Failed to update password');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Error updating password');
        }
    };

    // Combined submit handler (calls both updates)
    const handleSaveChanges = (e) => {
        e.preventDefault();
        handleProfileUpdate(e); // Update profile details
        // Only attempt password change if fields are filled
        if (currentPassword || newPassword || confirmPassword) {
            handlePasswordChange(e);
        }
    };

    return (
        <Layout title={"Account Info - Omkara"} handleShowAuthModal={handleShowAuthModal}>
            <div className="dashboard-container profile-container">
                <div className="dashboard-menu">
                    <UserMenu />
                </div>
                <div className="dashboard-content">
                    <div className="profile-header mb-4">
                        <h3>Account Settings</h3>
                        <p className="text-muted">Manage your account information and security settings</p>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">Personal Information</h5>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleProfileUpdate}>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="firstName" className="form-label">First Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="firstName"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="lastName" className="form-label">Last Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lastName"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="phone" className="form-label">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            Update Profile
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">Change Password</h5>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handlePasswordChange}>
                                        <div className="mb-3">
                                            <label htmlFor="currentPassword" className="form-label">Current Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="currentPassword"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="newPassword" className="form-label">New Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            Change Password
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;