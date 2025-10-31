// Barrel file for identity-access UI components
export { default as IAMDashboard } from './IAMDashboard';
export { default as IdentityAccessModule } from './IdentityAccessModule';

// Login/Logout
export { default as Login } from './login/Login';
export { default as Logout } from './login/Logout';
export * from './login/AuthContext';

// Roles
export { default as StudyTeamManagement } from './roles/StudyTeamManagement';
export { default as UserStudyRoleBulkAssignment } from './roles/UserStudyRoleBulkAssignment';
export { default as UserStudyRoleForm } from './roles/UserStudyRoleForm';
export { default as UserStudyRoleList } from './roles/UserStudyRoleList';

// Users
export { default as UserForm } from './users/UserForm';
export { default as UserList } from './users/UserList';
export { default as UserTypeForm } from './users/UserTypeForm';
export { default as UserTypeList } from './users/UserTypeList';

// Add more UI exports as needed
