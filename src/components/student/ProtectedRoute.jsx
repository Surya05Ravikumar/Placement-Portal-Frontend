import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');
    const location = useLocation();

    if (!userStr) {
        // Not logged in, redirect to login page
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        const user = JSON.parse(userStr);
        const email = user.email || '';

        // Determine user role
        let userRole = 'student';
        if (email === import.meta.env.VITE_ADMIN_EMAIL) {
            userRole = 'admin';
        } else if (email.endsWith('@bitsathy.ac.in')) {
            userRole = 'student';
        } else {
            // Default fallback
            userRole = 'student';
        }

        if (allowedRoles && !allowedRoles.includes(userRole)) {
            // User's role is not authorized for this route
            if (userRole === 'admin') {
                return <Navigate to="/admin/dashboard" replace />;
            } else {
                return <Navigate to="/" replace />;
            }
        }

        return children;
    } catch (error) {
        // Invalid user data, clear and redirect to login
        localStorage.removeItem('user');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
};

export default ProtectedRoute;
