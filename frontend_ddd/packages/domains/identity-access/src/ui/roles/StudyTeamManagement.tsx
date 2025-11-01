import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Card, CardActions, CardBody, CardHeader, Badge, Button } from '../../shared/ui';
import { useStudyTeamMembers } from '../../services/UserStudyRoleService';
import type { StudyTeamMember } from '../../types/domain/Security.types';

const getPrimaryRole = (member: StudyTeamMember): string => {
  const primary = member.roles.find((role) => role.isPrimary);
  const fallback = member.roles[0];
  return (primary ?? fallback)?.roleName ?? 'Role Pending';
};

const renderRoleBadges = (member: StudyTeamMember) => {
  if (member.roles.length === 0) {
    return (
      <Badge variant="neutral" size="sm">
        No roles assigned
      </Badge>
    );
  }

  return member.roles.map((role) => (
    <Badge key={role.assignmentId} variant={role.isPrimary ? 'blue' : 'neutral'} size="sm">
      {role.roleName}
    </Badge>
  ));
};

const StudyTeamManagement: React.FC = () => {
  const { studyId } = useParams<{ studyId?: string }>();
  const navigate = useNavigate();
  const queryStudyId = studyId ?? '';
  const {
    data: teamMembers = [],
    isLoading,
    error,
  } = useStudyTeamMembers(queryStudyId);

  if (!queryStudyId) {
    return (
      <div className="p-6">
        <Card>
          <CardBody>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Study Team Management</h1>
            <p className="text-gray-600">
              Select a study from the study design workspace to review or manage its team assignments.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Study Team</h1>
          <p className="text-gray-600">Assignments for study #{queryStudyId}</p>
        </div>
        <Button type="button" variant="primary" onClick={() => navigate('/identity-access/study-assignments/create')}>
          Add Assignment
        </Button>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active team members</p>
              <p className="text-lg font-semibold text-gray-900">{teamMembers.length}</p>
            </div>
          </div>
          {isLoading && <span className="text-sm text-gray-500">Loading team...</span>}
          {error && <span className="text-sm text-red-600">Unable to load team data</span>}
        </CardHeader>
        <CardBody className="space-y-4">
          {teamMembers.map((member) => (
            <div
              key={member.userId}
              className="border border-gray-200 rounded-lg px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-base font-medium text-gray-900">{member.userName}</p>
                <p className="text-sm text-gray-500">{member.userEmail}</p>
                <p className="text-sm text-gray-500">Primary Role: {getPrimaryRole(member)}</p>
              </div>
              <div className="flex flex-wrap gap-2">{renderRoleBadges(member)}</div>
            </div>
          ))}
          {!isLoading && teamMembers.length === 0 && (
            <div className="text-sm text-gray-500">No team members found for this study yet.</div>
          )}
        </CardBody>
        <CardActions>
          <Button type="button" variant="secondary" onClick={() => navigate('/identity-access')}>
            Back to IAM Dashboard
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};

export default StudyTeamManagement;
