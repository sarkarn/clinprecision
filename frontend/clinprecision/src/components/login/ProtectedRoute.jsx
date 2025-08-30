import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" />;
    }
    return children;
}