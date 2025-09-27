import { Link } from "react-router-dom";

export default function AdminDashboard() {
    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Administration Dashboard</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* User Types Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-blue-50 border-b border-blue-100">
                        <h4 className="font-medium text-lg text-blue-800">User Types</h4>
                    </div>
                    <div className="p-5">
                        <p className="text-gray-600 mb-4">
                            Manage the different types of users in the system and their permissions.
                        </p>
                        <Link
                            to="/user-management/usertypes"
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Manage User Types
                        </Link>
                    </div>
                </div>

                {/* Users Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-green-50 border-b border-green-100">
                        <h4 className="font-medium text-lg text-green-800">Users</h4>
                    </div>
                    <div className="p-5">
                        <p className="text-gray-600 mb-4">
                            Manage system users, assign roles, and control access permissions.
                        </p>
                        <Link
                            to="/user-management/users"
                            className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Manage Users
                        </Link>
                    </div>
                </div>

                {/* User Study Role Assignments Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-orange-50 border-b border-orange-100">
                        <h4 className="font-medium text-lg text-orange-800">Study Role Assignments</h4>
                    </div>
                    <div className="p-5">
                        <p className="text-gray-600 mb-4">
                            Assign users to specific roles within studies and manage study teams.
                        </p>
                        <Link
                            to="/user-management/user-study-roles"
                            className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                        >
                            Manage Role Assignments
                        </Link>
                    </div>
                </div>

                {/* Organizations Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-purple-50 border-b border-purple-100">
                        <h4 className="font-medium text-lg text-purple-800">Organizations</h4>
                    </div>
                    <div className="p-5">
                        <p className="text-gray-600 mb-4">
                            Manage organizations and their relationships with users.
                        </p>
                        <Link
                            to="/user-management/organizations"
                            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                        >
                            Manage Organizations
                        </Link>
                    </div>
                </div>

                {/* Form Templates Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-indigo-50 border-b border-indigo-100">
                        <h4 className="font-medium text-lg text-indigo-800">Form Templates</h4>
                    </div>
                    <div className="p-5">
                        <p className="text-gray-600 mb-4">
                            Manage reusable form templates for standardization across studies.
                        </p>
                        <Link
                            to="/user-management/form-templates"
                            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Manage Form Templates
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        to="/user-management/user-study-roles/create"
                        className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                        <div className="text-center">
                            <div className="text-blue-600 mb-2">
                                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-900">New Role Assignment</span>
                            <p className="text-xs text-gray-500 mt-1">Assign a user to a study role</p>
                        </div>
                    </Link>

                    <Link
                        to="/user-management/user-study-roles/bulk-assign"
                        className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                        <div className="text-center">
                            <div className="text-green-600 mb-2">
                                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-900">Bulk Assignment</span>
                            <p className="text-xs text-gray-500 mt-1">Assign multiple users to roles</p>
                        </div>
                    </Link>

                    <Link
                        to="/user-management/users/create"
                        className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                        <div className="text-center">
                            <div className="text-purple-600 mb-2">
                                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-900">New User</span>
                            <p className="text-xs text-gray-500 mt-1">Create a new user account</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
