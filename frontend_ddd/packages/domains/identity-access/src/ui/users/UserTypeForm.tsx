import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Button } from '../../shared/ui';

const UserTypeForm: React.FC = () => {
	const navigate = useNavigate();
	const { userTypeId } = useParams<{ userTypeId?: string }>();
	const isEdit = Boolean(userTypeId);

	return (
		<div className="p-6">
			<Card>
				<CardBody>
					<h1 className="text-2xl font-semibold text-gray-900 mb-4">
						{isEdit ? 'Edit User Type' : 'Create User Type'}
					</h1>
					<p className="text-gray-600 mb-6">
						A streamlined user-type configuration experience is on the way. This interim view keeps routing
						stable while the underlying API contracts are finalized.
					</p>
					<Button type="button" variant="primary" onClick={() => navigate('/identity-access/user-types')}>
						Back to User Types
					</Button>
				</CardBody>
			</Card>
		</div>
	);
};

export default UserTypeForm;
