import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge } from '../../../../ui-kit/src/ui';
import { Hospital, Link2, CheckCircle } from 'lucide-react';

interface QuickAction {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    color: string;
    count: number | null;
    disabled?: boolean;
}

const SiteDashboard: React.FC = () => {
    const navigate = useNavigate();

    const quickActions: QuickAction[] = [
        {
            title: 'Clinical Sites',
            description: 'Manage research sites and facilities',
            icon: Hospital,
            path: '/site-operations/sites',
            color: 'amber',
            count: null
        },
        {
            title: 'Study-Site Associations',
            description: 'Link sites to specific studies',
            icon: Link2,
            path: '/site-operations/study-sites',
            color: 'orange',
            count: null
        },
        {
            title: 'Site Activation Workflow',
            description: 'Track site readiness and approval',
            icon: CheckCircle,
            path: '/site-operations/activation',
            color: 'yellow',
            count: null,
            disabled: true
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white">
                        <Hospital className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Site Operations Management</h2>
                        <p className="text-gray-600">Manage clinical sites and their study associations</p>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickActions.map((action) => {
                        const IconComponent = action.icon;
                        return (
                            <Card
                                key={action.path}
                                onClick={() => !action.disabled && navigate(action.path)}
                                className={action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg transition-shadow'}
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 flex items-center justify-center flex-shrink-0`}>
                                            <IconComponent className={`h-6 w-6 text-${action.color}-600`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                                {action.title}
                                                {action.disabled && (
                                                    <Badge variant="neutral" size="sm" className="ml-2">Coming Soon</Badge>
                                                )}
                                            </h4>
                                            <p className="text-sm text-gray-600">{action.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SiteDashboard;
