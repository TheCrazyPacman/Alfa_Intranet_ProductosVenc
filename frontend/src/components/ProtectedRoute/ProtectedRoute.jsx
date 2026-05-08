import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    //const token = localStorage.getItem('token'); 
    const token = sessionStorage.getItem('token');

    if (!token) {
        return <Navigate to="/Login" replace />;
    }
    return children;
};

export default ProtectedRoute;