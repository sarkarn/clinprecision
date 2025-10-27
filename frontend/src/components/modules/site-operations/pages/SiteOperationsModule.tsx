import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SiteDashboard from './SiteDashboard';
// Migrated components - now in proper locations
import SiteManagement from './sites/SiteManagement';
import StudySiteAssociationList from './study-sites/StudySiteAssociationList';
import StudySiteAssociationForm from './study-sites/StudySiteAssociationForm';

/**
 * Site Operations Module Router
 * Handles clinical site management and study-site associations
 */
const SiteOperationsModule: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<SiteDashboard />} />
            <Route path="/sites" element={<SiteManagement />} />
            <Route path="/study-sites" element={<StudySiteAssociationList />} />
            <Route path="/study-sites/create" element={<StudySiteAssociationForm />} />
            <Route path="/study-sites/edit/:id" element={<StudySiteAssociationForm />} />
            <Route path="*" element={<Navigate to="/site-operations" replace />} />
        </Routes>
    );
};

export default SiteOperationsModule;
