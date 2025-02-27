import {useState, useEffect} from "react";
import {useAuth} from "../../context/auth.jsx";
import {Outlet} from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner.jsx";

export default function PrivateRoute(){
    const [ok, setOk] = useState(false);
    const [auth, setAuth] = useAuth();

    useEffect(() => {
        const authCheck = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API}/api/v1/auth/user-auth`);
                console.log("User Auth Check Response:", res.data);
                if (res.data.ok) {
                    setOk(true);
                } else {
                    setOk(false);
                }
            } catch (error) {
                console.error("Error checking user authentication:", error);
                setOk(false);
            }
        };
        if (auth?.token) authCheck();
    }, [auth?.token]);

    return ok ? <Outlet/>:<Spinner />;
}