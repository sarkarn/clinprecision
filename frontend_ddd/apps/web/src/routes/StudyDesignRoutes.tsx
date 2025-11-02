import React from "react";
import { Route } from "react-router-dom";
import StudyDesignModule from "@domains/studydesign/src/ui/StudyDesignModule";

export const StudyDesignRoutes = () => (
    <React.Fragment>
        <Route path="/study-design/*" element={<StudyDesignModule />} />
        {/* Add more study design related routes here */}
    </React.Fragment>
);
