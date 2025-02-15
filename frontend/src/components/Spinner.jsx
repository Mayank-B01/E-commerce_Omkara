import React,{useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";

const Spinner = () => {
    const [count, setCount] = useState(5);
    const navigate =useNavigate();

    useEffect(() =>{
        const interval = setInterval(() =>{
            setCount((prevValue) => --prevValue)
        }, 1000)
        count === 0 && navigate ('/')
        return () => clearInterval(interval)
    },[count, navigate])

    return(
        <>
            <div className="d-flex flex-column justify-content-center align-items-center" style={{height:"70vh"}}>
                <h1 className="Text Center">Redirecting you in {count} second</h1>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </>
    )
}

export default Spinner;