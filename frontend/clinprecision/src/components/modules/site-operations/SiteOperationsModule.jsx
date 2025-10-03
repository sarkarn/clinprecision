import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SiteDashboard from './SiteDashboard';
// Temporarily import from admin folder until migrated
import SiteManagement from '../../admin/SiteManagement/SiteManagement';
import StudySiteAssociationList from '../admin/StudySiteAssociationList';
import StudySiteAssociationForm from '../admin/StudySiteAssociationForm';

/**
 * Site Operations Module Router
 * Handles clinical site management and study-site associations
 */
const SiteOperationsModule = () => {
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
