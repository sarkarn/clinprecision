import { Routes, Route } from "react-router-dom";
import UserManagementDashboard from "./UserManagementDashboard";
import UserTypeList from "./UserTypeList";
import UserTypeForm from "./UserTypeForm";

export default function UserManagementModule() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">User Management</h2>

            <Routes>
                <Route index element={<UserManagementDashboard />} />
                <Route path="usertypes" element={<UserTypeList />} />
                <Route path="usertypes/new" element={<UserTypeForm />} />
                <Route path="usertypes/edit/:id" element={<UserTypeForm />} />
            </Routes>
        </div>
    );
}
