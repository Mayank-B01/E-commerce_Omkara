import {useState, useEffect} from "react";
import {useAuth} from "../../context/auth.jsx";
import {Outlet} from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner.jsx";

export default function AdminRoute(){
    const [ok, setOk] = useState(false);
    const [auth, setAuth] = useAuth();

    useEffect(() => {
        const authCheck = async () => {
            const token = localStorage.getItem('auth');
            console.log("Token :", token);
            try {
                if (!token){
                    console.log("No token found");
                }else{
                    console.log(auth?.token);
                }
                const res = await axios.get(`${import.meta.env.VITE_API}/api/v1/auth/admin-auth`);
                console.log("Auth token:", auth?.token);
                console.log("Admin Auth Check Response:", res.data);
                if (res.data.ok) {
                    setOk(true);
                } else {
                    setOk(false);
                }
            }catch (e) {
                console.error("Admin auth check failed:", e);
            }

        };
        if (auth?.token) authCheck();
    }, [auth?.token]);

    return ok ? <Outlet/>:<Spinner />;
}