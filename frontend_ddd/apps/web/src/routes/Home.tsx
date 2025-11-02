import React from "react";
import HomeLayout from "../layouts/HomeLayout";
import { Routes, Route, Navigate } from "react-router-dom";
import { studyDesignRoutes } from "./StudyDesignRoutes";
import { dataCaptureRoutes } from "./DataCaptureRoutes";
import { subjectManagementRoutes } from "./SubjectManagementRoutes";
import { adminRoutes } from "./AdminRoutes";

const Home: React.FC = () => (
    <HomeLayout>
        <Routes>
            {/* Feature-based routes */}
            <Route index element={
                <div className="space-y-6">
                    {/* Hero Welcome Section and dashboard content */}
                </div>
            } />
            {studyDesignRoutes}
            {dataCaptureRoutes}
            {subjectManagementRoutes}
            {adminRoutes}
            {/* Add other feature route components here */}
            {/* Placeholder and reporting routes can be modularized similarly */}
        </Routes>
    </HomeLayout>
);

export default Home;