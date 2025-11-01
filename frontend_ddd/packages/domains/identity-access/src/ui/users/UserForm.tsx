import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Button } from '../../shared/ui';

/**
 * Lightweight placeholder while the new user management form is implemented.
 * Keeps routing intact and provides a clear navigation path back to the list view.
 */
const UserForm: React.FC = () => {
	const navigate = useNavigate();
	const { userId } = useParams<{ userId?: string }>();
	const isEdit = Boolean(userId);

	return (
		<div className="p-6">
			<Card>
				<CardBody>
					<h1 className="text-2xl font-semibold text-gray-900 mb-4">
						{isEdit ? 'Edit User' : 'Create User'}
					</h1>
					<p className="text-gray-600 mb-6">
						The detailed user management workflow is still under construction. This placeholder keeps the
						navigation flow working while services and validation schemas are finalized.
					</p>
					<Button
						type="button"
						variant="primary"
						onClick={() => navigate('/identity-access/users')}
					>
						Back to Users
					</Button>
				</CardBody>
			</Card>
		</div>
	);
};

export default UserForm;
