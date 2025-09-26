import React, { useState } from 'react';
import { useRoleBasedNavigation } from '../hooks/useRoleBasedNavigation';
import { useAuth } from '../components/login/AuthContext';

const RoleTester = () => {
    const {
        userRole,
        userRoleDisplay,
        hasModuleAccess,
        hasCategoryAccess,
        getAccessibleModules,
        getModulePermissions,
        moduleCategories
    } = useRoleBasedNavigation();

    const [testRole, setTestRole] = useState(userRole);

    const availableRoles = [
        'SYSTEM_ADMIN',
        'PRINCIPAL_INVESTIGATOR',
        'STUDY_COORDINATOR',
        'DATA_MANAGER',
        'CRA',
        'SITE_USER',
        'MEDICAL_CODER',
        'AUDITOR'
    ];

    const testModules = [
        'study-design',
        'user-management',
        'datacapture-management',
        'subject-management',
        'dq-management',
        'audit-trail',
        'reports',
        'medical-coding',
        'data-integration',
        'system-monitoring'
    ];

    const rolePermissionMap = {
        'SYSTEM_ADMIN': [
            'study-design', 'datacapture-management', 'dq-management', 'user-management',
            'subject-management', 'audit-trail', 'medical-coding', 'reports',
            'data-integration', 'system-monitoring'
        ],
        'PRINCIPAL_INVESTIGATOR': [
            'study-design', 'datacapture-management', 'dq-management', 'subject-management',
            'medical-coding', 'reports', 'audit-trail'
        ],
        'STUDY_COORDINATOR': [
            'datacapture-management', 'subject-management', 'dq-management', 'reports'
        ],
        'DATA_MANAGER': [
            'datacapture-management', 'dq-management', 'medical-coding', 'reports',
            'data-integration', 'audit-trail'
        ],
        'CRA': [
            'datacapture-management', 'subject-management', 'dq-management', 'reports', 'audit-trail'
        ],
        'SITE_USER': [
            'datacapture-management', 'subject-management'
        ],
        'MEDICAL_CODER': [
            'medical-coding', 'reports'
        ],
        'AUDITOR': [
            'audit-trail', 'reports', 'dq-management'
        ]
    };

    // Mock function to simulate role change for testing
    const simulateRoleChange = (newRole) => {
        setTestRole(newRole);
        // In a real implementation, you would update the AuthContext
        console.log(`Simulating role change to: ${newRole}`);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Role-Based Access Control Tester</h1>

                {/* Current Role Display */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Current Role Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Role:</label>
                            <p className="text-lg font-semibold text-blue-600">{userRoleDisplay}</p>
                            <p className="text-sm text-gray-500">({userRole})</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Test Role:</label>
                            <select
                                value={testRole}
                                onChange={(e) => simulateRoleChange(e.target.value)}
                                className="mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {availableRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Module Access Matrix */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Module Access Matrix</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Module</th>
                                    {availableRoles.map(role => (
                                        <th key={role} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase border-b border-l">
                                            {role.replace('_', ' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {testModules.map((module, idx) => (
                                    <tr key={module} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                                            {module.replace('-', ' ').toUpperCase()}
                                        </td>
                                        {availableRoles.map(role => (
                                            <td key={`${module}-${role}`} className="px-2 py-2 text-center border-b border-l">
                                                {rolePermissionMap[role]?.includes(module) ? (
                                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-800 rounded-full">
                                                        ✓
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-red-100 text-red-800 rounded-full">
                                                        ✗
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Category Access Testing */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Category Access (Current Role: {userRoleDisplay})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(moduleCategories).map(([categoryKey, category]) => (
                            <div
                                key={categoryKey}
                                className={`p-4 rounded-lg border-2 ${hasCategoryAccess(categoryKey)
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-red-200 bg-red-50'
                                    }`}
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`w-3 h-3 rounded-full ${hasCategoryAccess(categoryKey) ? 'bg-green-500' : 'bg-red-500'
                                        }`}></span>
                                    <h4 className="font-medium text-gray-900">
                                        {categoryKey.replace('-', ' ').toUpperCase()}
                                    </h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Access: {hasCategoryAccess(categoryKey) ? 'Granted' : 'Denied'}
                                </p>
                                <div className="text-xs text-gray-500">
                                    Modules: {category.modules.join(', ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Individual Module Testing */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Individual Module Access (Current Role: {userRoleDisplay})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {testModules.map(module => (
                            <div
                                key={module}
                                className={`p-3 rounded-lg text-center border ${hasModuleAccess(module)
                                        ? 'border-green-200 bg-green-50 text-green-800'
                                        : 'border-red-200 bg-red-50 text-red-800'
                                    }`}
                            >
                                <div className="text-xs font-medium">
                                    {module.replace('-', ' ').toUpperCase()}
                                </div>
                                <div className="text-lg">
                                    {hasModuleAccess(module) ? '✅' : '❌'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Permission Details */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Permission Details</h3>
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Accessible Modules:</h4>
                            <div className="text-sm text-gray-600">
                                {getAccessibleModules().join(', ') || 'None'}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">User Management Permissions:</h4>
                            <div className="text-sm text-gray-600">
                                {JSON.stringify(getModulePermissions('user-management'), null, 2)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleTester;