import { Link } from "react-router-dom";

export default function AdminDashboard() {
    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Administration Dashboard</h3>
                    <p className="text-gray-600 mt-1">Manage system and study-level configurations</p>
                </div>
            </div>

            {/* System-Level Administration */}
            <div className="mb-12">
                <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900">System-Level Administration</h4>
                        <p className="text-gray-600 text-sm">Core system entities and global configurations</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* User Types Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 bg-blue-50 border-b border-blue-100">
                            <h5 className="font-medium text-lg text-blue-800">User Types</h5>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-600 mb-4 text-sm">
                                Manage the different types of users in the system and their permissions.
                            </p>
                            <Link
                                to="/user-management/usertypes"
                                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                                Manage User Types
                            </Link>
                        </div>
                    </div>

                    {/* Users Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 bg-green-50 border-b border-green-100">
                            <h5 className="font-medium text-lg text-green-800">System Users</h5>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-600 mb-4 text-sm">
                                Manage system users and their basic access permissions.
                            </p>
                            <Link
                                to="/user-management/users"
                                className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                                Manage Users
                            </Link>
                        </div>
                    </div>

                    {/* Organizations Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 bg-indigo-50 border-b border-indigo-100">
                            <h5 className="font-medium text-lg text-indigo-800">Organizations</h5>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-600 mb-4 text-sm">
                                Manage organizations and their relationships with users and sites.
                            </p>
                            <Link
                                to="/user-management/organizations"
                                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
                            >
                                Manage Organizations
                            </Link>
                        </div>
                    </div>

                    {/* Site Management Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 bg-teal-50 border-b border-teal-100">
                            <h5 className="font-medium text-lg text-teal-800">Clinical Sites</h5>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-600 mb-4 text-sm">
                                Manage clinical trial sites and their global configurations.
                            </p>
                            <Link
                                to="/user-management/sites"
                                className="inline-block bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors text-sm"
                            >
                                Manage Sites
                            </Link>
                        </div>
                    </div>

                    {/* Form Templates Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 bg-purple-50 border-b border-purple-100">
                            <h5 className="font-medium text-lg text-purple-800">Form Templates</h5>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-600 mb-4 text-sm">
                                Manage reusable form templates for standardization across studies.
                            </p>
                            <Link
                                to="/user-management/form-templates"
                                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                            >
                                Manage Templates
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Study-Level Administration */}
            <div className="mb-12">
                <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900">Study-Level Administration</h4>
                        <p className="text-gray-600 text-sm">Study-specific configurations and relationships</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* User Study Role Assignments Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 bg-orange-50 border-b border-orange-100">
                            <h5 className="font-medium text-lg text-orange-800">Study Role Assignments</h5>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-600 mb-4 text-sm">
                                Assign users to specific roles within studies and manage study teams.
                            </p>
                            <Link
                                to="/user-management/user-study-roles"
                                className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm"
                            >
                                Manage Role Assignments
                            </Link>
                        </div>
                    </div>

                    {/* Study Site Associations Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 bg-emerald-50 border-b border-emerald-100">
                            <h5 className="font-medium text-lg text-emerald-800">Study Site Associations</h5>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-600 mb-4 text-sm">
                                Manage relationships between studies and clinical sites, including activation and enrollment caps.
                            </p>
                            <Link
                                to="/user-management/study-site-associations"
                                className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm"
                            >
                                Manage Associations
                            </Link>
                        </div>
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

                    <Link
                        to="/user-management/sites"
                        className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-teal-300 hover:bg-teal-50 transition-colors"
                    >
                        <div className="text-center">
                            <div className="text-teal-600 mb-2">
                                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-900">Manage Sites</span>
                            <p className="text-xs text-gray-500 mt-1">Create and manage clinical sites</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
