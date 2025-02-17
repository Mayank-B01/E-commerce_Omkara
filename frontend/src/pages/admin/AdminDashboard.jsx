import React from 'react';
import AdminMenu from "../../components/Layout/AdminMenu.jsx";

const AdminDashboard =() => {
    return(
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-3">
                    <AdminMenu />
                </div>
            </div>
        </div>
    )
}

export default  AdminDashboard;