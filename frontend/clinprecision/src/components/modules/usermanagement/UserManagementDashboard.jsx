import { Link } from "react-router-dom";

export default function UserManagementDashboard() {
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
                    <div className="p-5 bg-orange-50 border-b border-orange-100">
                        <h4 className="font-medium text-lg text-orange-800">Form Templates</h4>
                    </div>
                    <div className="p-5">
                        <p className="text-gray-600 mb-4">
                            Manage reusable form templates for study design and data collection.
                        </p>
                        <Link
                            to="/user-management/form-templates"
                            className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                        >
                            Manage Form Templates
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
