import React from "react";
import Layout from "../../components/Layout/Layout.jsx";
import {NavLink} from "react-router-dom";
import UserMenu from "../../components/Layout/UserMenu.jsx";
import {useAuth} from "../../context/auth.jsx";

const Dashboard = () =>{
    const [auth] = useAuth();
    return(
        <Layout title={'Omkara - User Dashboard'}>
            <div className="container-fluid m-3 p-3">
                <div className="row">
                    <div className="col-md-3">
                        <UserMenu />
                    </div>
                    <div className='col-md-9'>
                        <div className='card w-75'>
                            <h2>Hello {auth?.user?.name}</h2>
                        </div>
                        <div className='d-flex  card mt-3 w-75'>
                            <NavLink className='btn btn-outline-dark w-25' to='/dashboard/user/account'>Edit info</NavLink>
                            <div className='data'>
                                <h4>Email: {auth?.user?.email}</h4>
                                <h4>Phone: {auth?.user?.phone}</h4>
                                <h4>Address: {auth?.user?.address || 'Not Added'}</h4>
                                <h4>Account Created on: {auth?.user?.createdAt}</h4>
                            </div>
                            <NavLink className='btn btn-outline-dark w-25' to='/dashboard/user/address'>Edit Address</NavLink>
                            <div className='data'>
                                <h4>Address: {auth?.user?.address || 'Not Added'}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard;