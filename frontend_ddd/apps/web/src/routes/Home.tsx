import React from "react";
import HomeLayout from "../layouts/HomeLayout";
import { Routes, Route, Navigate } from "react-router-dom";
import StudyDesignRoutes from "./StudyDesignRoutes";
import DataCaptureRoutes from "./DataCaptureRoutes";
import SubjectManagementRoutes from "./SubjectManagementRoutes";
import AdminRoutes from "./AdminRoutes";

const Home: React.FC = () => (
    <HomeLayout>
        <Routes>
            {/* Feature-based routes */}
            <Route index element={
                <div className="space-y-6">
                    {/* Hero Welcome Section and dashboard content */}
                </div>
            } />
            <StudyDesignRoutes />
            <DataCaptureRoutes />
            <SubjectManagementRoutes />
            <AdminRoutes />
            {/* Add other feature route components here */}
            {/* Placeholder and reporting routes can be modularized similarly */}
        </Routes>
    </HomeLayout>
);

export default Home;