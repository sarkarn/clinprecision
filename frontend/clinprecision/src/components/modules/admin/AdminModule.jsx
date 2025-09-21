import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import UserTypeList from "./UserTypeList";
import UserTypeForm from "./UserTypeForm";
import UserList from "./UserList";
import UserForm from "./UserForm";
import OrganizationList from "./OrganizationList";
import OrganizationForm from "./OrganizationForm";
import OrganizationDetail from "./OrganizationDetail";
import FormTemplateManagement from "./FormTemplateManagement";
import CRFBuilderIntegration from "../../common/forms/CRFBuilderIntegration";
import FormVersionHistory from "../../common/forms/FormVersionHistory";
import FormVersionViewer from "../../common/forms/FormVersionViewer";
import { useAuth } from "../../login/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminModule() {
    const { user } = useAuth();

    // Check if user is authenticated
    const isAuthenticated = !!user;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Administration</h2>

            <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserList />} />
                <Route path="users/create" element={
                    isAuthenticated ? <UserForm /> : <Navigate to="/login" state={{ from: "/user-management/users/create" }} />
                } />
                <Route path="users/edit/:userId" element={
                    isAuthenticated ? <UserForm /> : <Navigate to="/login" state={{ from: "/user-management/users/edit/:userId" }} />
                } />
                <Route path="usertypes" element={<UserTypeList />} />
                <Route path="usertypes/create" element={<UserTypeForm />} />
                <Route path="usertypes/edit/:id" element={<UserTypeForm />} />
                <Route path="organizations" element={<OrganizationList />} />
                <Route path="organizations/create" element={<OrganizationForm />} />
                <Route path="organizations/edit/:id" element={<OrganizationForm />} />
                <Route path="organizations/view/:id" element={<OrganizationDetail />} />

                {/* Form Template Management Routes */}
                <Route path="form-templates" element={<FormTemplateManagement />} />
                <Route path="form-templates/builder" element={
                    isAuthenticated ? <CRFBuilderIntegration /> : <Navigate to="/login" state={{ from: "/user-management/form-templates/builder" }} />
                } />
                <Route path="form-templates/builder/:formId" element={
                    isAuthenticated ? <CRFBuilderIntegration /> : <Navigate to="/login" state={{ from: "/user-management/form-templates/builder/:formId" }} />
                } />
                <Route path="form-templates/preview/:formId" element={
                    isAuthenticated ? <CRFBuilderIntegration /> : <Navigate to="/login" state={{ from: "/user-management/form-templates/preview/:formId" }} />
                } />
                <Route path="form-templates/:formId/versions" element={
                    isAuthenticated ? <FormVersionHistory /> : <Navigate to="/login" state={{ from: "/user-management/form-templates/:formId/versions" }} />
                } />
                <Route path="form-templates/:formId/versions/:versionId/view" element={
                    isAuthenticated ? <FormVersionViewer /> : <Navigate to="/login" state={{ from: "/user-management/form-templates/:formId/versions/:versionId/view" }} />
                } />
            </Routes>
        </div>
    );
}
