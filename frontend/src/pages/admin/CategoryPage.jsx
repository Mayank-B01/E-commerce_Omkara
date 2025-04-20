import React, {useEffect,useState} from "react";
import AdminMenu from "../../components/Layout/AdminMenu.jsx";
import {toast} from "react-toastify";
import axios from "axios";
import CategoryForm from "../../components/Forms/CategoryForm.jsx";
import {Modal} from 'antd';
import { useAuth } from '../../context/auth';
import { useNavigate } from 'react-router-dom';

const CategoryPage = () => {
    const [auth, setAuth] = useAuth();
    const navigate = useNavigate();

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
                toast.success(`${data.category.name} is created`);
                getAllCategories();
            }else{
                toast.error(data.message);
            }
        }catch (error){
            console.log(error);
            toast.error("Something went wrong in input form");
        }
    }
    //get all category
    const getAllCategories = async () =>{
        try{
            const {data} = await axios.get(`${import.meta.env.VITE_API}/api/v1/category/allCategory`);
            if(data?.success){
                setCategories(data?.category);
            } else {
                toast.error(data?.message || "Failed to fetch categories");
            }
        }catch (error){
            console.log(error);
            toast.error("Something went wrong in getting categories");
        }
    }

    //update
    const handleUpdate = async (e) =>{
        e.preventDefault();
        try{
            const {data} = await axios.put(`${import.meta.env.VITE_API}/api/v1/category/update-category/${selected._id}`, {name:updatedName});
            if(data.success){
                toast.success(`${updatedName} is updated`);
                setSelected(null);
                setUpdatedName("");
                setVisible(false);
                getAllCategories();
            }else{
                toast.error(data.message);
            }
        }catch (error){
            console.log(error);
            toast.error("Something went wrong updating category");
        }
    }

    //delete
    const handleDelete = async (categoryId) =>{
        try{
            const {data} = await axios.delete(`${import.meta.env.VITE_API}/api/v1/category/delete-category/${categoryId}`);
            if(data.success){
                toast.success(`Category deleted successfully`);
                getAllCategories();
            }else{
                toast.error(data.message);
            }
        }catch (error){
            toast.error("Something went wrong deleting category");
        }
    }

    // --- Logout Logic ---
    const handleLogout = () => {
        setAuth({
            ...auth,
            user: null,
            token: ''
        });
        localStorage.removeItem("auth");
        toast.success("Logged out successfully.");
        navigate('/');
    };
    // -------------------

    useEffect(() => {
        document.title = 'Admin - Category Management';
        getAllCategories();
    }, []);
    return (
        <>
            {/* Custom Minimal Header */}
            <div className="admin-custom-header d-flex justify-content-end p-3 bg-light border-bottom">
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                    Logout
                </button>
            </div>

            {/* Admin Page Content Structure */}
            <div className="container-fluid m-3 p-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminMenu />
                    </div>
                    <div className='col-md-9'>
                        <div className='card shadow-sm'>
                            <div className="card-header">Manage Categories</div>
                            <div className="card-body">
                                <CategoryForm handleSubmit={handleSubmit} value={name} setValue={setName} buttonText="Create Category"/>
                                <hr />
                                <table className="table table-striped table-hover">
                                    <thead>
                                    <tr>
                                        <th scope="col">Name</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {categories?.map((c) => (
                                            <tr key={c._id}>
                                                <td>{c.name}</td>
                                                <td>
                                                    <button className='btn btn-primary ms-2 btn-sm' onClick={() => {
                                                            setVisible(true);
                                                            setUpdatedName(c.name);
                                                            setSelected(c)
                                                        }
                                                    }
                                                    >Edit</button>
                                                    <button className='btn btn-danger ms-2 btn-sm' onClick={() => handleDelete(c._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Modal onCancel={() => setVisible(false)} footer={null} visible={visible}>
                                <CategoryForm value={updatedName} setValue={setUpdatedName} handleSubmit={handleUpdate} buttonText="Update Category"></CategoryForm>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CategoryPage;