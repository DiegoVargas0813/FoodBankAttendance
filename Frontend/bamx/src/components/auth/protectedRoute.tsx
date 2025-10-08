import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

    // While checking auth status, you can show a loading indicator
    if (loading) {
        return <div>Loading...</div>;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Otherwise, render the requested route
    return <Outlet />;
};

export default ProtectedRoute;