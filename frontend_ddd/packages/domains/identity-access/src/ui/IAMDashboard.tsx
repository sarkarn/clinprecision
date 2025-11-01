import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Badge } from '../shared/ui';
import { Users, Shield, UserCog, ClipboardList } from 'lucide-react';

interface QuickAction {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    color: string;
    count: number | null;
}

/**
 * Identity & Access Management Dashboard
 * Central hub for user, role, and access management
 */
const IAMDashboard: React.FC = () => {
    const navigate = useNavigate();

    const quickActions: QuickAction[] = [
        {
            title: 'Users',
            description: 'Manage system users and their credentials',
            icon: Users,
            path: '/identity-access/users',
            color: 'blue',
            count: null // TODO: Add user count
        },
        {
            title: 'User Types',
            description: 'Configure user roles and permissions',
            icon: Shield,
            path: '/identity-access/user-types',
            color: 'indigo',
            count: null
        },
        {
            title: 'Study Assignments',
            description: 'Assign users to studies with specific roles',
            icon: UserCog,
            path: '/identity-access/study-assignments',
            color: 'purple',
            count: null
        }
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 
                        flex items-center justify-center text-white">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Identity & Access Management</h2>
                        <p className="text-gray-600">Manage users, roles, and study-level access controls</p>
                    </div>
                </div>
                <Badge {...({ variant: "blue", size: "sm" } as any)}>IAM</Badge>
            </div>

            {/* Quick Actions Grid */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickActions.map((action) => {
                        const IconComponent = action.icon;
                        return (
                            <Card
                                key={action.path}
                                {...({ hoverable: true, onClick: () => navigate(action.path), className: "cursor-pointer" } as any)}
                            >
                                <CardBody>
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 
                                  flex items-center justify-center flex-shrink-0`}>
                                            <IconComponent className={`h-6 w-6 text-${action.color}-600`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                                {action.title}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {action.description}
                                            </p>
                                            {action.count !== null && (
                                                <div className="mt-2">
                                                    <Badge {...({ variant: "neutral", size: "sm" } as any)}>
                                                        {action.count} items
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity / Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">--</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Roles</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">--</p>
                            </div>
                            <Shield className="h-8 w-8 text-indigo-600" />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Study Assignments</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">--</p>
                            </div>
                            <ClipboardList className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default IAMDashboard;
