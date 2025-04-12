import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import {AuthProvider} from "./context/auth.jsx";
import {CartProvider} from "./context/cart.jsx";
import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <CartProvider>
            <BrowserRouter>
                <React.StrictMode>
                    <App />
                </React.StrictMode>,
            </BrowserRouter>
        </CartProvider>
    </AuthProvider>
)
