import React from 'react';
import { Link } from "react-router-dom";
import { Bell, ListTodo, Mail } from 'lucide-react';
import Logout from '../../domains/identity-access/src/ui/login/Logout';
import { useAuth } from '../../domains/identity-access/src/ui/login/AuthContext';

interface AdditionalLink {
    to: string;
    text: string;
}

interface TopNavigationHeaderProps {
    showFullNavigation?: boolean;
    additionalLinks?: AdditionalLink[];
    className?: string;
}

/**
 * Reusable Top Navigation Header Component
 * Used across all modules for consistency
 */
const TopNavigationHeader: React.FC<TopNavigationHeaderProps> = ({
    showFullNavigation = false,
    additionalLinks = [],
    className = ""
}) => {
    const { user } = useAuth();

    // Get user initial safely
    const getUserInitial = (): string => {
        if (!user) return "?";
        return user.email ? user.email.charAt(0).toUpperCase() : "?";
    };

    // Get display name safely
    const getDisplayName = (): string => {
        if (!user) return "";
        return user.email || "User";
    };

    return (
        <header className={`bg-white border-b border-gray-200 flex justify-between items-center px-6 py-3 sticky top-0 z-20 shadow-sm ${className}`}>
            {/* Left Section - Logo and Primary Navigation */}
            <div className="flex items-center">
                {/* Enhanced Logo */}
                <div className="flex items-center mr-8">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">ClinPrecision</h1>
                        <p className="text-xs text-gray-500 -mt-1">Clinical Data Management</p>
                    </div>
                </div>

                {/* Navigation links - show different sets based on context */}
                {showFullNavigation ? (
                    <div className="hidden lg:flex items-center space-x-1">
                        <Link to="/help" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200">
                            Documentation
                        </Link>
                        <Link to="/about" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200">
                            About
                        </Link>
                        <Link to="/contact" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200">
                            Contact
                        </Link>
                    </div>
                ) : (
                    <div className="hidden lg:flex items-center space-x-1">
                        <Link to="/reports" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200">
                            Reports
                        </Link>
                        <Link to="/help" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200">
                            Documentation
                        </Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200">
                                Administration
                            </Link>
                        )}
                        {/* Additional links from props */}
                        {additionalLinks.map((link, index) => (
                            <Link
                                key={index}
                                to={link.to}
                                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Section - Actions and User */}
            <div className="flex items-center space-x-2">
                {/* Search Bar (optional enhancement) */}
                <div className="hidden md:flex items-center mr-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Notification Icons */}
                <>
                    {/* Notifications Icon */}
                    <div className="relative">
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Bell size={18} />
                            {/* Notification badge */}
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                3
                            </span>
                        </button>
                    </div>

                    {/* Email Icon */}
                    <div className="relative">
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Mail size={18} />
                            {/* Email badge */}
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                7
                            </span>
                        </button>
                    </div>

                    {/* Assigned Tasks Icon */}
                    <div className="relative">
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <ListTodo size={18} />
                            {/* Tasks badge */}
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                5
                            </span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>

                    {/* User profile section - enhanced design */}
                    {user && (
                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-3 text-sm font-medium shadow-sm">
                                {getUserInitial()}
                            </div>
                            <div className="hidden md:block">
                                <div className="text-sm font-medium text-gray-900">{getDisplayName()}</div>
                                <div className="text-xs text-gray-500">{user.role || 'User'}</div>
                            </div>
                        </div>
                    )}
                    {user && <Logout />}
                </>
            </div>
        </header>
    );
};

export default TopNavigationHeader;
