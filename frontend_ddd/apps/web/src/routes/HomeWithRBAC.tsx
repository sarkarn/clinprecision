import React from "react";
import HomeWithRBACLayout from "../layouts/HomeWithRBACLayout";
import { Routes, Route } from "react-router-dom";
import StudyDesignModule from "@domains/studydesign/src/ui/StudyDesignModule";
import DataCaptureModule from "@domains/clinops/src/ui/DataCaptureModule";

const HomeWithRBAC: React.FC = () => (
    <HomeWithRBACLayout>
        <Routes>
            {/* ...copy all Route definitions from original HomeWithRBAC.tsx... */}
        </Routes>
    </HomeWithRBACLayout>
);

export default HomeWithRBAC;