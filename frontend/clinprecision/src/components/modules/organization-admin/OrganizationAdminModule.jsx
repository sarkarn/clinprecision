import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OrgDashboard from './OrgDashboard';
import OrganizationList from './organizations/OrganizationList';
// Temporarily import from admin folder until migrated
import OrganizationForm from '../admin/OrganizationForm';

/**
 * Organization Administration Module Router
 * Handles sponsor organizations and hierarchy management
 */
const OrganizationAdminModule = () => {
    return (
        <Routes>
            <Route path="/" element={<OrgDashboard />} />
            <Route path="/organizations" element={<OrganizationList />} />
            <Route path="/organizations/create" element={<OrganizationForm />} />
            <Route path="/organizations/edit/:id" element={<OrganizationForm />} />
            {/* Add more routes as components are migrated:
      <Route path="/organizations/view/:id" element={<OrganizationDetail />} />
      */}
            <Route path="*" element={<Navigate to="/organization-admin" replace />} />
        </Routes>
    );
};

export default OrganizationAdminModule;
