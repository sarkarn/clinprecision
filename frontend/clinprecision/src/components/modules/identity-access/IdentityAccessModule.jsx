import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import IAMDashboard from './IAMDashboard';
import UserList from './users/UserList';
// Temporarily import from old admin folder until migration is complete
import UserForm from '../admin/UserForm';
import UserTypeList from '../admin/UserTypeList';
import UserTypeForm from '../admin/UserTypeForm';
import UserStudyRoleList from '../admin/UserStudyRoleList';
import UserStudyRoleForm from '../admin/UserStudyRoleForm';
// Import other IAM components as they are migrated

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
            {/* Add more routes as components are migrated:
      <Route path="/study-teams/:studyId" element={<StudyTeamManagement />} />
      */}
            <Route path="*" element={<Navigate to="/identity-access" replace />} />
        </Routes>
    );
};

export default IdentityAccessModule;
