import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
    const { user, isLoading } = useAuth();

    // Show loading spinner while authentication is initializing
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" />;
    }
    return children;
}