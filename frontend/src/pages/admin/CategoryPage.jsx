import React, {useEffect,useState} from "react";
import AdminMenu from "../../components/Layout/AdminMenu.jsx";
import {toast} from "react-toastify";
import axios from "axios";
import CategoryForm from "../../components/Forms/CategoryForm.jsx";
import {Modal} from 'antd';

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("")
    const [visible, setVisible]= useState(false);
    const [selected, setSelected] = useState(null);
    const [updatedName, setUpdatedName] = useState("");

    //handle form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const {data} =await axios.post(`${import.meta.env.VITE_API}/api/v1/category/create-category`, {name});
            if(data?.success){
                setName("");
                toast.success(`${name} added successfully.`)
                getAllCategory();
            }else{
                toast.error(data.message);
            }
        }catch (error){
            console.log(error);
            toast.error("Error in input form submission")
        }
    }
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

    //update
    const submitUpdate = async (e) =>{
        e.preventDefault();
        try{
            const {data} = await axios.put(`${import.meta.env.VITE_API}/api/v1/category/update-category/${selected._id}`, {name:updatedName});
            if(data.success){
                toast.success(`Category is updated successfully`);
                setSelected(null);
                setUpdatedName("");
                setVisible(false);
                getAllCategory();
            }else{
                toast.error(data.message);
            }
        }catch (error){
            toast.error("Something went wrong. Try again.")
        }
    }

    //delete
    const submitDelete = async (id) =>{
        try{
            const {data} = await axios.delete(`${import.meta.env.VITE_API}/api/v1/category/delete-category/${id}`);
            if(data.success){
                toast.success(`${name} is deleted successfully`);
                getAllCategory();
            }else{
                toast.error(data.message);
            }
        }catch (error){
            toast.error("Something went wrong. Try again.")
        }
    }

    useEffect(() => {
        document.title = 'Admin Category Management';
        getAllCategory();
    }, []);
    return (
        <div className="container-fluid m-3 p-3">
            <div className="row">
                <div className="col-md-3">
                    <AdminMenu />
                </div>
                <div className='col-md-9'>
                    <div className='card w-75'>
                        <h2>Admin - Category page</h2>
                        <div className='p-3 w-50'>
                            <CategoryForm handleSubmit={handleSubmit} value={name} setValue={setName}/>
                        </div>
                        <div>
                            <table className="table">
                                <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {categories?.map((c) => (
                                        <>
                                            <tr>
                                                <td key ={c._id}>{c.name}</td>
                                                <td>
                                                    <button className='btn btn-primary ms-2' onClick={() => {
                                                            setVisible(true);
                                                            setUpdatedName(c.name);
                                                            setSelected(c)
                                                        }
                                                    }
                                                    >Edit</button>
                                                    <button className='btn btn-danger ms-2' onClick={() =>{submitDelete(c._id)}}>Delete</button>
                                                </td>
                                            </tr>
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <Modal onCancel={() => setVisible(false)} footer={null} visible={visible}>
                    <CategoryForm value={updatedName} setValue={setUpdatedName} handleSubmit={submitUpdate}></CategoryForm>
                </Modal>
            </div>
        </div>
    )
}

export default CategoryPage;