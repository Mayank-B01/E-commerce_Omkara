import {useState, useEffect} from "react";
import {useAuth} from "../../context/auth.jsx";
import {Outlet} from "react-router-dom";
import Spinner from "../Spinner.jsx";

export default function AdminRoute(){
    const [auth, setAuth, loading] = useAuth();

    if (loading) {
        return <Spinner />;
    }

    return auth?.token && auth?.user?.role === 1 ? <Outlet/> : <Spinner path="" />;
}