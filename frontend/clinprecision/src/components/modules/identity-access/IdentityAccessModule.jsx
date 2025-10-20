import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import IAMDashboard from './IAMDashboard';
import UserList from './users/UserList';
// Migrated components - now in proper locations
import UserForm from './users/UserForm';
import UserTypeList from './users/UserTypeList';
import UserTypeForm from './users/UserTypeForm';
import UserStudyRoleList from './roles/UserStudyRoleList';
import UserStudyRoleForm from './roles/UserStudyRoleForm';
import UserStudyRoleBulkAssignment from './roles/UserStudyRoleBulkAssignment';
import StudyTeamManagement from './roles/StudyTeamManagement';

/**
 * Identity & Access Management Module Router
 * Handles user authentication, roles, and study team assignments
 */
const IdentityAccessModule = () => {
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
