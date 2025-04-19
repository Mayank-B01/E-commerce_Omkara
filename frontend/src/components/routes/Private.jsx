import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth.jsx";
import { Outlet } from "react-router-dom";
// import axios from "axios"; // No longer needed for initial check
import Spinner from "../Spinner.jsx";

export default function PrivateRoute() {
    // Remove the ok state and the useEffect that made the API call
    // const [ok, setOk] = useState(false);
    const [auth, setAuth, loading] = useAuth(); // Destructure loading state

    // useEffect(() => {
    //     const authCheck = async () => {
    //         try {
    //             const res = await axios.get(`${import.meta.env.VITE_API}/api/v1/auth/user-auth`);
    //             console.log("User Auth Check Response:", res.data);
    //             if (res.data.ok) {
    //                 setOk(true);
    //             } else {
    //                 setOk(false);
    //             }
    //         } catch (error) {
    //             console.error("Error checking user authentication:", error);
    //             setOk(false);
    //         }
    //     };
    //     if (auth?.token) authCheck();
    // }, [auth?.token]);

    if (loading) {
        return <Spinner />; // Show spinner while auth is loading
    }

    // After loading, check if token exists
    return auth?.token ? <Outlet /> : <Spinner path="" />; // Redirect via Spinner if not authenticated
}