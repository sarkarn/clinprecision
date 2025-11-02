import React from "react";
import { Route, Navigate } from "react-router-dom";
import IdentityAccessModule from "@domains/identity-access/src/ui/IdentityAccessModule";
import OrganizationAdminModule from "@domains/organization/src/ui/OrganizationAdminModule";
import SiteOperationsModule from "@domains/site-operation/src/ui/SiteOperationsModule";

export const AdminRoutes = () => (
    <>
        <Route path="/identity-access/*" element={<IdentityAccessModule />} />
        <Route path="/organization-admin/*" element={<OrganizationAdminModule />} />
        <Route path="/site-operations/*" element={<SiteOperationsModule />} />
        {/* Legacy Admin Module Redirects */}
        <Route path="/user-management/users" element={<Navigate to="/identity-access/users" replace />} />
        <Route path="/user-management/users/*" element={<Navigate to="/identity-access/users" replace />} />
        <Route path="/user-management/usertypes" element={<Navigate to="/identity-access/user-types" replace />} />
        <Route path="/user-management/usertypes/*" element={<Navigate to="/identity-access/user-types" replace />} />
        <Route path="/user-management/user-study-roles" element={<Navigate to="/identity-access/study-assignments" replace />} />
        <Route path="/user-management/user-study-roles/*" element={<Navigate to="/identity-access/study-assignments" replace />} />
        <Route path="/user-management/study-teams/*" element={<Navigate to="/identity-access/study-teams" replace />} />
        <Route path="/user-management/organizations" element={<Navigate to="/organization-admin/organizations" replace />} />
        <Route path="/user-management/organizations/*" element={<Navigate to="/organization-admin/organizations" replace />} />
        <Route path="/user-management/sites" element={<Navigate to="/site-operations/sites" replace />} />
        <Route path="/user-management/sites/*" element={<Navigate to="/site-operations/sites" replace />} />
        <Route path="/user-management/study-site-associations" element={<Navigate to="/site-operations/study-sites" replace />} />
        <Route path="/user-management/study-site-associations/*" element={<Navigate to="/site-operations/study-sites" replace />} />
        <Route path="/user-management/form-templates/*" element={<Navigate to="/study-design/forms" replace />} />
        <Route path="/user-management/*" element={<Navigate to="/identity-access" replace />} />
        <Route path="/user-management" element={<Navigate to="/identity-access" replace />} />
    </>
);
