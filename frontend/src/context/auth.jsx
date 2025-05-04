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
        const verifyToken = async () => {
            try {
                const data = localStorage.getItem("auth");
                if (data) {
                    const parseData = JSON.parse(data);
                    if (parseData.token) {
                        // Temporarily set header for verification request
                        axios.defaults.headers.common["Authorization"] = `Bearer ${parseData.token}`;
                        // Verify token with backend using the existing user-auth endpoint
                        const response = await axios.get('/api/v1/auth/user-auth');
                        if (isMounted && response.data.ok) {
                            // Token is valid, set auth state
                            setAuth({
                                user: parseData.user,
                                token: parseData.token,
                            });
                        } else {
                             // Token is invalid or verification failed
                            localStorage.removeItem("auth");
                             delete axios.defaults.headers.common["Authorization"];
                        }
                    } else {
                         // No token found in storage
                         localStorage.removeItem("auth"); // Clean up if needed
                         delete axios.defaults.headers.common["Authorization"];
                    }
                }
            } catch (error) {
                console.error("Auth verification failed or failed to parse auth data:", error);
                // Clear auth data on any error during verification or parsing
                localStorage.removeItem("auth");
                 delete axios.defaults.headers.common["Authorization"];
                 if(isMounted){
                     setAuth({ user: null, token: "" }); // Ensure state is cleared
                 }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        verifyToken(); // Call the async function

        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array ensures this runs only on mount

    return (
        <AuthContext.Provider value={[auth, setAuth, loading]}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };