import React, {useEffect} from "react";
import AdminMenu from "../../components/Layout/AdminMenu.jsx";

const OrderPage = () => {
    useEffect(() => {
        document.title = 'Admin Order Management';
    }, []);
    return (
        <div className="container-fluid m-3 p-3">
            <div className="row">
                <div className="col-md-3">
                    <AdminMenu />
                </div>
                <div className='col-md-9'>
                    <div className='card w-75'>
                        <h2>Admin - Order page</h2>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderPage;