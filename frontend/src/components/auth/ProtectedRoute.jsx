import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ role, children }) {
    const { isAuthenticated, role: userRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (role && userRole !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
