import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import IAMDashboard from './IAMDashboard';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import UserTypeList from '../components/users/UserTypeList';
import UserTypeForm from '../components/users/UserTypeForm';
import UserStudyRoleList from '../components/roles/UserStudyRoleList';
import UserStudyRoleForm from '../components/roles/UserStudyRoleForm';
import UserStudyRoleBulkAssignment from '../components/roles/UserStudyRoleBulkAssignment';
import StudyTeamManagement from '../components/roles/StudyTeamManagement';

/**
 * Identity & Access Management Module Router
 * Handles user authentication, roles, and study team assignments
 */
const IdentityAccessModule: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<IAMDashboard />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/create" element={<UserForm />} />
            <Route path="/users/edit/:userId" element={<UserForm />} />
            <Route path="/user-types" element={<UserTypeList />} />
            <Route path="/user-types/create" element={<UserTypeForm />} />
            <Route path="/user-types/edit/:id" element={<UserTypeForm />} />
            <Route path="/study-assignments" element={<UserStudyRoleList />} />
            <Route path="/study-assignments/create" element={<UserStudyRoleForm />} />
            <Route path="/study-assignments/edit/:id" element={<UserStudyRoleForm />} />
            <Route path="/study-assignments/bulk-assign" element={<UserStudyRoleBulkAssignment />} />
            <Route path="/study-teams/:studyId" element={<StudyTeamManagement />} />
            <Route path="*" element={<Navigate to="/identity-access" replace />} />
        </Routes>
    );
};

export default IdentityAccessModule;
