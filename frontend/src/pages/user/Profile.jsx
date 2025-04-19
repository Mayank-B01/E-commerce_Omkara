import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout.jsx';
import UserMenu from '../../components/Layout/UserMenu.jsx';
import { useAuth } from '../../context/auth.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/UserDashboard.css'; // Import the new CSS

const Profile = () => {
    const [auth, setAuth] = useAuth();
    // State for user details
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [displayName, setDisplayName] = useState(''); // Assuming name is display name for now
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    // State for password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Populate form with user data on load
    useEffect(() => {
        const { name, email, phone } = auth?.user || {};
        // Basic name splitting, adjust if your data structure is different
        const nameParts = name?.split(' ') || [];
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setDisplayName(name || '');
        setEmail(email || '');
        setPhone(phone || '');
    }, [auth?.user]);

    // Handle profile details update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const fullName = `${firstName} ${lastName}`.trim();
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/api/v1/auth/profile`, {
                name: fullName, // Combine first and last name
                email,        // Email update might be restricted depending on setup
                phone,
                // Exclude password fields here
            });
            if (data?.error) {
                toast.error(data.error);
            } else {
                setAuth({ ...auth, user: data?.updatedUser });
                // Update local storage
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
            // Assuming a separate endpoint or logic for password change
            // You might need to adjust the payload based on your API
            const { data } = await axios.put(`${import.meta.env.VITE_API}/api/v1/auth/update-password`, {
                currentPassword, // Or however your backend expects it
                newPassword,
            });

            if (data?.error) {
                toast.error(data.error);
            } else {
                toast.success('Password updated successfully!');
                // Clear password fields
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Something went wrong changing password');
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
        <Layout title={"Account Info - Omkara"}>
            <div className="dashboard-container">
                <div className="dashboard-menu">
                    <UserMenu />
                </div>
                <div className="dashboard-content">
                    <h3>Account Details</h3>
                    <form onSubmit={handleSaveChanges} className="dashboard-form">
                        {/* Account Details Form */}
                        <div className="form-row-split mb-3">
                            <div>
                                <label htmlFor="firstName" className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div>
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
                            <label htmlFor="displayName" className="form-label">Display Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                // This might be derived from First/Last or be separate
                            />
                        </div>
                        <div className="form-row-split mb-3">
                            <div>
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    // Consider disabling if email is used for login and not changeable
                                    // disabled
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Change Section */}
                        <div className="password-change-section">
                            <h4>Password Change:</h4>
                            <div className="mb-3">
                                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Leave blank to keep unchanged"
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
                                    placeholder="Leave blank to keep unchanged"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Re-type New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Leave blank to keep unchanged"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-save-changes">
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;