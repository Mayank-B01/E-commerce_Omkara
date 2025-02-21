import React from "react";
import Layout from "../../components/Layout/Layout.jsx";
import UserMenu from "../../components/Layout/UserMenu.jsx";

const Address = () => {
    return(
        <Layout title={'Omkara - User Address'}>
            <div className="container-fluid m-3 p-3">
                <div className="row">
                    <div className="col-md-3">
                        <UserMenu />
                    </div>
                    <div className='col-md-9'>
                        <div className='card w-75'>
                            <h2>User Address</h2>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Address;