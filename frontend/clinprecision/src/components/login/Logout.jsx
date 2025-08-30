import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Logout() {
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.logout();
        navigate("/login");
    };

    return (
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
        </button>
    );
}