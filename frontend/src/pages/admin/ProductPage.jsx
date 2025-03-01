import React, {useState, useEffect} from "react";
import AdminMenu from "../../components/Layout/AdminMenu.jsx";
import axios from "axios";
import {toast} from "react-toastify";
import {Select} from 'antd';
import {useNavigate} from "react-router-dom";

const {Option} = Select;

const ProductPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [photo, setPhoto] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("");
    const [shipping, setShipping] = useState("");

    //get all category
    const getAllCategory = async () =>{
        try{
            const {data} = await axios.get(`${import.meta.env.VITE_API}/api/v1/category/allCategory`);
            if(data?.success){
                setCategories(data?.category);
            }
        }catch (error){
            console.log(error);
            toast.error('Error fetching all categories');
        }
    }

    useEffect(() => {
        document.title ='Admin Product Management';
        getAllCategory()
    }, []);

    //create
    const handleAdd = async(e) =>{
        e.preventDefault();
        try{
            const productData = new FormData();
            productData.append("name", name);
            productData.append("description", description);
            productData.append("price", price);
            productData.append("quantity", quantity);
            productData.append("photo", photo);
            productData.append("category", category);
            const {data} = axios.post(`${import.meta.env.VITE_API}/api/v1/product/add-product`, productData)
            if (data?.success){
                toast.success("Product Added Successfully");
                navigate('/dashboard/admin/products')
            }else{
                toast.error(data?.message)
            }
        }catch (error){
            console.log(error);
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="container-fluid m-3 p-3">
            <div className="row">
                <div className="col-md-3">
                    <AdminMenu />
                </div>
                <div className='col-md-9'>
                    <div className='card w-75' >
                        <h2>Admin - Product page</h2>
                        <div className='m-1'>
                            <label>Category:</label>
                            <Select variant={false} placeholder="Select a category" size="large"
                                    showSearch
                                    className="form-select mb-3" onChange={ (value) =>{setCategory(value)}}>
                                {categories?.map(c=>(
                                    <Option key={c._id} value={c._id}>{c.name}</Option>
                                ))}
                            </Select>
                            <div className="mb-3">
                                <label  className="btn btn-outline-dark">
                                    {photo ? photo.name : "Upload Photo"}
                                    <input type="file" name="Photo" accept="image/*"
                                           onChange={(e) => setPhoto(e.target.files[0]) }
                                    hidden/>
                                </label>
                            </div>
                            <div className="mb-3">
                                {photo && (
                                    <div className="text-center">
                                        <img src={URL.createObjectURL(photo)}
                                             alt="product photo"
                                             height={'200px'}
                                             className='img img-responsive'
                                        />
                                    </div>
                                )}
                            </div>
                            <div className='mb-3'>
                                <label>Name:</label>
                                <input type='text'
                                       value={name}
                                       placeholder='Product Name'
                                       className='form control'
                                       onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className='mb-3'>
                                <label>Description:</label>
                               <textarea typeof='text'
                                         value={description}
                                         placeholder="Describe the product"
                                         className='form-control'
                                         onChange={(e) => setDescription(e.target.value)}
                               />
                            </div>
                            <div className='mb-3'>
                                <label>Price: Rs.</label>
                                <input type='number'
                                       value={price}
                                       placeholder='Price of product'
                                       className='form control'
                                       onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div className='mb-3'>
                                <label>Quantity:</label>
                                <input type='number'
                                       value={quantity}
                                       placeholder='Product Quantity'
                                       className='form control'
                                       onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label>Shipping: </label>
                                <Select
                                    placeholder="Select Shipping "
                                    size="medium"
                                    showSearch
                                    className="form-select mb-3"
                                    onChange={(value) => {
                                        setShipping(value);
                                    }}
                                >
                                    <Option value="0">No</Option>
                                    <Option value="1">Yes</Option>
                                </Select>
                            </div>
                            <div className='mb-3'>
                                <button className='btn btn-primary' onClick={handleAdd}>Add Product</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductPage;