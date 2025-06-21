import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode; // Use React.ReactNode for children
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>; // Wrap children in a React fragment
};

export default ProtectedRoute;