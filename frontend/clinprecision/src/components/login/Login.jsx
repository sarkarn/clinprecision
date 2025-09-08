import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import LoginService from "../../services/LoginService";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Use the LoginService to handle authentication
            const result = await LoginService.login(email, password);

            // Extract user data
            const { authData } = result;

            // Store token and userId in localStorage
            localStorage.setItem('authToken', authData.token);
            localStorage.setItem('userId', authData.userId);
            localStorage.setItem('userEmail', authData.userEmail);
            localStorage.setItem('userRole', authData.userRole);

            // Update authentication context with user information
            auth.login(
                email,
                authData.userRole,
                {
                    userId: authData.userId,
                    token: authData.token
                }
            );

            // Navigate to home page after successful login
            navigate("/");
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("Invalid credentials. Please try again.");
            } else {
                setError("Login failed. Please try again later.");
            }
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className="bg-white shadow flex justify-between items-center px-8 py-4">
                <div className="flex items-center space-x-6">
                    <h1 className="text-xl font-bold text-blue-600">ClinicalConnect</h1>
                    <Link to="/" className="text-gray-700 hover:text-blue-600">Solutions</Link>
                    <Link to="/" className="text-gray-700 hover:text-blue-600">Resources</Link>
                    <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
                    <Link to="/help" className="text-gray-700 hover:text-blue-600">Contact Us</Link>
                </div>
            </header>
            <div className="max-w-md mx-auto mt-12 p-8 bg-white shadow rounded">
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Email"
                        className="w-full border p-2 rounded"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border p-2 rounded"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    {error && <div className="text-red-500">{error}</div>}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}
