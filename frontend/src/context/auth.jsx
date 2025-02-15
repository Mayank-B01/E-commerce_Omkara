import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";

const AuthContext = createContext(undefined);


const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        // Retrieve auth data from localStorage during initial render
        const data = localStorage.getItem("auth");
        return data ? JSON.parse(data) : { user: null, token: "" };
    });

    //default axios
    axios.defaults.headers.common['Authorization'] = auth?.token;

    useEffect(() => {
        if (auth.user && auth.token) {
            localStorage.setItem("auth", JSON.stringify(auth));
        } else {
            localStorage.removeItem("auth");
        }
    }, [auth]);

    return (
        <AuthContext.Provider value={[auth, setAuth]}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy use of auth context
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
