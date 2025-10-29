import React from "react";
import { Route } from "react-router-dom";
import StudyDesignModule from "../../../../clinprecision/src/components/modules/trialdesign/StudyDesignModule";

const StudyDesignRoutes = () => (
    <>
        <Route path="/study-design/*" element={<StudyDesignModule />} />
        {/* Add more study design related routes here */}
    </>
);

export default StudyDesignRoutes;
