import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardActions, Button, Badge } from '../../shared/ui';
import { useUsers, type User } from '../../services/UserService';

type ColumnKey = 'id' | 'email' | 'username' | 'status' | 'isActive' | 'fullName';

const columns: Array<{ key: ColumnKey; label: string }> = [
	{ key: 'id', label: 'User ID' },
	{ key: 'email', label: 'Email' },
	{ key: 'fullName', label: 'Name' },
	{ key: 'username', label: 'Username' },
	{ key: 'status', label: 'Status' },
	{ key: 'isActive', label: 'Active' },
];

const getFullName = (user: User): string => {
	const parts = [user.firstName, user.lastName].filter(Boolean);
	if (parts.length > 0) {
		return parts.join(' ');
	}
	return user.username ?? 'Unnamed';
};

const renderCell = (user: User, key: ColumnKey): React.ReactNode => {
	switch (key) {
		case 'fullName':
			return getFullName(user);
		case 'isActive':
			return (
				<Badge variant={user.isActive ? 'blue' : 'neutral'} size="sm">
					{user.isActive ? 'Active' : 'Inactive'}
				</Badge>
			);
		case 'status':
			return user.status ?? 'Unknown';
		default:
			return user[key] ?? '—';
	}
};

const UserList: React.FC = () => {
	const navigate = useNavigate();
	const { data: users = [], isLoading, error } = useUsers();

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">Users</h1>
					<p className="text-gray-600">Overview of all application users with their primary role.</p>
				</div>
				<Button type="button" variant="primary" onClick={() => navigate('/identity-access/users/create')}>
					Add User
				</Button>
			</div>

			<Card>
				<CardHeader className="flex items-center justify-between">
					<span className="font-medium text-gray-700">Directory</span>
					{isLoading && <span className="text-sm text-gray-500">Loading users…</span>}
					{error && <span className="text-sm text-red-600">Failed to load users</span>}
				</CardHeader>
				<CardBody className="p-0">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									{columns.map((column) => (
										<th
											key={column.key}
											scope="col"
											className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											{column.label}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{users.map((user) => (
									<tr key={user.id} className="hover:bg-gray-50">
										{columns.map((column) => (
											<td key={column.key} className="px-4 py-3 text-sm text-gray-700">
												{renderCell(user, column.key)}
											</td>
										))}
									</tr>
								))}
								{!isLoading && users.length === 0 && (
									<tr>
										<td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={columns.length}>
											No users found.
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

export default UserList;
