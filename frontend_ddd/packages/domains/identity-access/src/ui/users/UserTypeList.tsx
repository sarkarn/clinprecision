import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardActions, Button, Badge } from '../../shared/ui';
import { useAllUserTypes } from '../../services/UserTypeService';
import type { UserType } from '../../types/domain/User.types';

const UserTypeList: React.FC = () => {
	const navigate = useNavigate();
	const { data: userTypes = [], isLoading, error } = useAllUserTypes();

	const renderStatus = (userType: UserType) => (
		<Badge variant={userType.isActive ? 'blue' : 'neutral'} size="sm">
			{userType.isActive ? 'Active' : 'Inactive'}
		</Badge>
	);

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">User Types</h1>
					<p className="text-gray-600">Define reusable permission bundles for user management.</p>
				</div>
				<Button variant="primary" type="button" onClick={() => navigate('/identity-access/user-types/create')}>
					Add User Type
				</Button>
			</div>

			<Card>
				<CardHeader className="flex items-center justify-between">
					<span className="font-medium text-gray-700">Configured Roles</span>
					{isLoading && <span className="text-sm text-gray-500">Loading user types…</span>}
					{error && <span className="text-sm text-red-600">Unable to load user types</span>}
				</CardHeader>
				<CardBody className="p-0">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{userTypes.map((userType) => (
									<tr key={userType.id} className="hover:bg-gray-50">
										<td className="px-4 py-3 text-sm text-gray-900">{userType.name}</td>
										<td className="px-4 py-3 text-sm text-gray-600">{userType.code ?? '—'}</td>
										<td className="px-4 py-3 text-sm text-gray-600">{renderStatus(userType)}</td>
										<td className="px-4 py-3 text-sm text-gray-600">{userType.description ?? '—'}</td>
									</tr>
								))}
								{!isLoading && userTypes.length === 0 && (
									<tr>
										<td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={4}>
											No user types found.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</CardBody>
				<CardActions>
					<Button type="button" variant="secondary" onClick={() => navigate(-1)}>
						Go Back
					</Button>
				</CardActions>
			</Card>
		</div>
	);
};

export default UserTypeList;
