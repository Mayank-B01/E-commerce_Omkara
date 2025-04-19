import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        token: "",
    });
    const [loading, setLoading] = useState(true);

    // Update Axios headers when token changes
    useEffect(() => {
        if (auth.token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [auth.token]);

    // Initialize auth from localStorage on mount
    useEffect(() => {
        let isMounted = true;
        try {
            const data = localStorage.getItem("auth");
            if (data) {
                const parseData = JSON.parse(data);
                if (isMounted) {
                    setAuth({
                        user: parseData.user,
                        token: parseData.token,
                    });
                }
            }
        } catch (error) {
            console.error("Failed to parse auth data from localStorage:", error);
            // Optionally clear corrupted data
            // localStorage.removeItem("auth");
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AuthContext.Provider value={[auth, setAuth, loading]}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };