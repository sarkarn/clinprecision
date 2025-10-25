import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OrgDashboard from './OrgDashboard';
import OrganizationList from './organizations/OrganizationList';
// Migrated components - now in proper locations
import OrganizationForm from './organizations/OrganizationForm';
import OrganizationDetail from './organizations/OrganizationDetail';

/**
 * Organization Administration Module Router
 * Handles sponsor organizations and hierarchy management
 */
const OrganizationAdminModule: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<OrgDashboard />} />
            <Route path="/organizations" element={<OrganizationList />} />
            <Route path="/organizations/create" element={<OrganizationForm />} />
            <Route path="/organizations/edit/:id" element={<OrganizationForm />} />
            <Route path="/organizations/view/:id" element={<OrganizationDetail />} />
            <Route path="*" element={<Navigate to="/organization-admin" replace />} />
        </Routes>
    );
};

export default OrganizationAdminModule;
