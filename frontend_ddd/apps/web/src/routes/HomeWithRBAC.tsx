import React from "react";
import HomeWithRBACLayout from "../layouts/HomeWithRBACLayout";
import { Routes, Route } from "react-router-dom";
import StudyDesignModule from "../../../../clinprecision/src/components/modules/trialdesign/StudyDesignModule";
import DataCaptureModule from "../../../../clinprecision/src/components/modules/datacapture/DataCaptureModule";

const HomeWithRBAC: React.FC = () => (
    <HomeWithRBACLayout>
        <Routes>
            {/* ...copy all Route definitions from original HomeWithRBAC.tsx... */}
        </Routes>
    </HomeWithRBACLayout>
);

export default HomeWithRBAC;