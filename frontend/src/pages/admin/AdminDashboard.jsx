import React, {useEffect, useState} from 'react';
import AdminMenu from "../../components/Layout/AdminMenu.jsx";
import {useAuth} from "../../context/auth.jsx";
import axios from "axios";
import {NavLink} from "react-router-dom";

const AdminDashboard =() => {
    const [auth] = useAuth();
    const [userCount, setUserCount] = useState(null);
    console.log(auth);
    console.log("User name:", auth?.user?.name);
    useEffect( () => {
        document.title = "Admin Dashboard";
        const countcheck = async() => {
            const res = await axios.get((`${import.meta.env.VITE_API}/api/v1/auth/count`));
            console.log(res);
            setUserCount(res.data.count);
        }
        countcheck();
    }, []);
    return(
        <div className="container-fluid m-3 p-3">
            <div className="row">
                <div className="col-md-3">
                    <AdminMenu />
                </div>
                <div className='col-md-9'>
                    <div className='card w-75'>
                        <h2>Hello {auth?.user?.name}</h2>
                    </div>
                    <div className='card mt-5 w-75'>
                        <div className='data'>
                            <div  className="d-flex justify-content-between align-items-center mb-3">
                                <h5>User Count = {userCount !== null ? userCount : "Loading...."} </h5>
                                <NavLink className='btn btn-outline-dark' to='/dashboard/admin/users'> View Users</NavLink>
                            </div>
                            <div  className="d-flex justify-content-between align-items-center mb-3">
                                <h5>Products Count = 5</h5>
                                <NavLink className='btn btn-outline-dark' to='/dashboard/admin/products'> View Products</NavLink>
                            </div>
                            <div  className="d-flex justify-content-between align-items-center mb-3">
                                <h5>Active Orders = 5</h5>
                                <NavLink  className='btn btn-outline-dark' to='/dashboard/admin/orders' > View Orders</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default  AdminDashboard;