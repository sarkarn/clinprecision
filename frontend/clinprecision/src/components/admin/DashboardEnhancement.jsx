// Enhanced Dashboard Example - Professional Metrics Cards
import { Link } from "react-router-dom";
import {
    Users, Building2, MapPin, UserCheck,
    FileText, Activity, TrendingUp, AlertCircle
} from "lucide-react";

export default function EnhancedAdminDashboard() {
    // Mock data - would come from API
    const metrics = {
        users: { count: 247, active: 231, pending: 16 },
        organizations: { count: 45, active: 43, inactive: 2 },
        sites: { count: 89, active: 82, pending: 7 },
        assignments: { count: 324, recent: 12 }
    };

    return (
        <div>
            {/* Header with Overview */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Administration Dashboard</h3>
                        <p className="text-gray-600">Manage users, organizations, and clinical sites</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Key Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-sm font-medium">Total Users</p>
                                <p className="text-2xl font-bold text-blue-900">{metrics.users.count}</p>
                                <p className="text-xs text-blue-700">{metrics.users.active} active</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium">Organizations</p>
                                <p className="text-2xl font-bold text-green-900">{metrics.organizations.count}</p>
                                <p className="text-xs text-green-700">{metrics.organizations.active} active</p>
                            </div>
                            <Building2 className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-600 text-sm font-medium">Clinical Sites</p>
                                <p className="text-2xl font-bold text-purple-900">{metrics.sites.count}</p>
                                <p className="text-xs text-purple-700">{metrics.sites.active} active</p>
                            </div>
                            <MapPin className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-600 text-sm font-medium">Role Assignments</p>
                                <p className="text-2xl font-bold text-orange-900">{metrics.assignments.count}</p>
                                <p className="text-xs text-orange-700">{metrics.assignments.recent} recent</p>
                            </div>
                            <UserCheck className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Management Cards with Icons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5 bg-blue-50 border-b border-blue-100">
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6 text-blue-600" />
                            <h4 className="font-semibold text-lg text-blue-800">User Management</h4>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex gap-4 text-sm">
                                <span className="text-green-600 font-medium">{metrics.users.active} Active</span>
                                <span className="text-orange-600 font-medium">{metrics.users.pending} Pending</span>
                            </div>
                            <Activity className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-4 text-sm">
                            Manage system users, assign roles, and control access permissions with full audit trail.
                        </p>
                        <div className="flex gap-2">
                            <Link
                                to="/user-management/users"
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center text-sm"
                            >
                                Manage Users
                            </Link>
                            <Link
                                to="/user-management/users/create"
                                className="px-3 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                            >
                                Add New
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Similar enhanced cards for other modules... */}
            </div>

            {/* Recent Activity Section */}
            <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                    Recent Activity
                </h4>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">New user</span>
                            <span className="font-medium">Dr. Sarah Johnson</span>
                            <span className="text-gray-500">was assigned to Site 003</span>
                            <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Organization</span>
                            <span className="font-medium">Metro Medical Center</span>
                            <span className="text-gray-500">updated contact information</span>
                            <span className="text-xs text-gray-400 ml-auto">4 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}