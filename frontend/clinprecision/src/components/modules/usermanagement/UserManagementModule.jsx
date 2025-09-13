import { Routes, Route } from "react-router-dom";
import UserManagementDashboard from "./UserManagementDashboard";
import UserTypeList from "./UserTypeList";
import UserTypeForm from "./UserTypeForm";
import UserList from "./UserList";
import UserForm from "./UserForm";
import OrganizationList from "./OrganizationList";
import OrganizationForm from "./OrganizationForm";
import OrganizationDetail from "./OrganizationDetail";
import FormTemplateList from "./FormTemplateList";
import FormTemplateForm from "./FormTemplateForm";
import { useAuth } from "../../login/AuthContext";
import { Navigate } from "react-router-dom";

export default function UserManagementModule() {
    const { user } = useAuth();

    // Check if user is authenticated
    const isAuthenticated = !!user;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Administration</h2>

            <Routes>
                <Route index element={<UserManagementDashboard />} />
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
                <Route path="form-templates" element={<FormTemplateList />} />
                <Route path="form-templates/create" element={<FormTemplateForm />} />
                <Route path="form-templates/edit/:id" element={<FormTemplateForm />} />
            </Routes>
        </div>
    );
}
