import { Link } from "react-router-dom";
import { Bell, ListTodo, Mail } from 'lucide-react';
import Logout from "../login/Logout";
import { useAuth } from "../login/AuthContext";

/**
 * Reusable Top Navigation Header Component
 * Used across all modules for consistency
 */
export default function TopNavigationHeader({
    showFullNavigation = false,
    additionalLinks = [],
    className = ""
}) {
    const { user } = useAuth();

    // Get user initial safely
    const getUserInitial = () => {
        if (!user) return "?";
        return user.email ? user.email.charAt(0).toUpperCase() : "?";
    };

    // Get display name safely
    const getDisplayName = () => {
        if (!user) return "";
        return user.email || "User";
    };

    return (
        <header className={`bg-white shadow-sm flex justify-between items-center px-8 py-3 sticky top-0 z-10 ${className}`}>
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600 mr-8">ClinicalConnect</h1>

                {/* Navigation links - show different sets based on context */}
                {showFullNavigation ? (
                    <div className="hidden lg:flex items-center space-x-6">
                        <Link to="/help" className="text-gray-700 hover:text-blue-600">Documentation</Link>
                        <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
                        <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
                    </div>
                ) : (
                    <div className="hidden lg:flex items-center space-x-6">
                        <Link to="/reports" className="text-gray-700 hover:text-blue-600">Reports</Link>
                        <Link to="/help" className="text-gray-700 hover:text-blue-600">Documentation</Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="text-gray-700 hover:text-blue-600">Administration</Link>
                        )}
                        {/* Additional links from props */}
                        {additionalLinks.map((link, index) => (
                            <Link
                                key={index}
                                to={link.to}
                                className="text-gray-700 hover:text-blue-600"
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-4">
                {/* Always show notification and task icons */}
                <>
                    {/* Notifications Icon */}
                    <div className="relative">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Bell size={20} />
                            {/* Notification badge */}
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                3
                            </span>
                        </button>
                    </div>

                    {/* Email Icon */}
                    <div className="relative">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Mail size={20} />
                            {/* Email badge */}
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                7
                            </span>
                        </button>
                    </div>

                    {/* Assigned Tasks Icon */}
                    <div className="relative">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <ListTodo size={20} />
                            {/* Tasks badge */}
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                                5
                            </span>
                        </button>
                    </div>

                    {/* User profile section - conditional on authentication */}
                    {user && (
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                                {getUserInitial()}
                            </div>
                            <span className="text-gray-700 hidden md:inline-block">{getDisplayName()}</span>
                        </div>
                    )}
                    {user && <Logout />}
                </>
            </div>
        </header>
    );
}