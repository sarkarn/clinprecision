import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config.js";
import { Link, Routes, Route } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${API_BASE_URL}/users-ws/users/login`,
                { email, password }
            );
            console.log(response.status)
            // Assume API returns { email, role }
            if (response.status == 200) {
                auth.login(response.data.email, response.data.role);
                navigate("/");
            } else {
                setError("Invalid credentials");
            }
        } catch (err) {
            setError("Login failed. Please check your credentials.");
        }
    };

    return (
        <>
            <header className="bg-white shadow flex justify-between items-center px-8 py-4">
                <div className="flex items-center space-x-6">
                    <h1 className="text-xl font-bold text-blue-600">ClinicalConnect</h1>
                    <Link to="/" className="text-gray-700 hover:text-blue-600">XYZ</Link>
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
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border p-2 rounded"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    {error && <div className="text-red-500">{error}</div>}
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Login
                    </button>
                </form>
            </div>
        </>
    );
}