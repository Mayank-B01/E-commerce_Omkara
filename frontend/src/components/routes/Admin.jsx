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
            try {
                const res = await axios.get(`${import.meta.env.VITE_API}/api/v1/auth/admin-auth`, {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`
                    }
                });
                console.log("Auth token:", auth?.token);
                console.log("Admin Auth Check Response:", res.data);
                if (res.data.ok) {
                    setOk(true);
                } else {
                    setOk(false);
                }
            } catch (error) {
                console.error("Error checking admin authentication:", error);
                setOk(false);
            }
        };
        if (auth?.token) authCheck();
    }, [auth?.token]);

    return ok ? <Outlet/>:<Spinner />;
}