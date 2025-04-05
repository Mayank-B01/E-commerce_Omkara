import React, {useState} from 'react';
import Layout from "../components/Layout/Layout.jsx";
import {useAuth} from "../context/auth.jsx";
import axios from 'axios';

const Category = () => {
    const [auth, setAuth] = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    //get products
     const getAllProducts = async () => {
         try{
            const {data} = await axios.get(`${import.meta.env.VITE_API}/api/v1/product/get-product`);
            setProducts(data.products);
         }catch(error){
             console.log(error);
         }
     }
    return(
        <Layout title={'Omkara'}>
                <div className="row">
                    <div className="col-md-3">
                        <h4 className="text-center">Filter by category</h4>
                    </div>
                    <div className="col-md-9">
                        <h1 className="text-center">All Products</h1>
                        <div className="d-flex flex-wrap">
                            <h1>products</h1>
                        </div>
                    </div>

                </div>
        </Layout>
    );
};
export default Category;