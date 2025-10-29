
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Badge } from '../../shared/ui';
import { Building2, Network, Settings } from 'lucide-react';

interface QuickAction {
	title: string;
	description: string;
	icon: any;
	path: string;
	color: string;
	count: number | null;
	disabled?: boolean;
}

/**
 * Organization Administration Dashboard
 * Central hub for managing sponsor organizations and CROs
 */
const OrgDashboard: React.FC = () => {
	const navigate = useNavigate();

	const quickActions: QuickAction[] = [
		{
			title: 'Organizations',
			description: 'Manage sponsor companies and CROs',
			icon: Building2,
			path: '/organization-admin/organizations',
			color: 'violet',
			count: null // TODO: Add organization count
		},
		{
			title: 'Organization Hierarchy',
			description: 'View and manage parent-child relationships',
			icon: Network,
			path: '/organization-admin/hierarchy',
			color: 'purple',
			count: null,
			disabled: true // Phase 3 feature
		},
		{
			title: 'Organization Settings',
			description: 'Configure global organization preferences',
			icon: Settings,
			path: '/organization-admin/settings',
			color: 'indigo',
			count: null,
			disabled: true // Phase 3 feature
		}
	];

	return (
		<div className="p-6">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 \
						flex items-center justify-center text-white">
						<Building2 className="h-6 w-6" />
					</div>
					<div>
						<h2 className="text-3xl font-bold text-gray-900">Organization Administration</h2>
						<p className="text-gray-600">Manage sponsor organizations, CROs, and corporate structures</p>
					</div>
				</div>
				<Badge {...({ variant: "violet", size: "sm" } as any)}>ORG</Badge>
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
								hoverable={!action.disabled}
								onClick={() => !action.disabled && navigate(action.path)}
								className={action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
							>
								<CardBody>
									<div className="flex items-start gap-4">
										<div className={`w-12 h-12 rounded-lg bg-${action.color}-100 \
								  flex items-center justify-center flex-shrink-0`}>
											<IconComponent className={`h-6 w-6 text-${action.color}-600`} />
										</div>
										<div className="flex-1">
											<h4 className="text-lg font-semibold text-gray-900 mb-1">
												{action.title}
												{action.disabled && (
													<Badge {...({ variant: "neutral", size: "sm", className: "ml-2" } as any)}>Coming Soon</Badge>
												)}
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

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardBody>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Organizations</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">--</p>
							</div>
							<Building2 className="h-8 w-8 text-violet-600" />
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardBody>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Active Organizations</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">--</p>
							</div>
							<Badge {...({ variant: "success", className: "self-start" } as any)}>Active</Badge>
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardBody>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Organization Types</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">--</p>
							</div>
							<Network className="h-8 w-8 text-purple-600" />
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default OrgDashboard;
