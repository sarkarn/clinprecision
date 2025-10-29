import React from "react";
import { Route } from "react-router-dom";
import SubjectManagementModule from "../../../../clinprecision/src/components/modules/subjectmanagement/SubjectManagementModule";

const SubjectManagementRoutes = () => (
    <>
        <Route path="/subject-management/*" element={<SubjectManagementModule />} />
        {/* Add more subject management related routes here */}
    </>
);

export default SubjectManagementRoutes;
