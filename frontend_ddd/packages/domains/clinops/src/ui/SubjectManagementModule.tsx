import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SubjectList from '../sub-domains/patient-management/ui/SubjectList';
import SubjectDetails from '../sub-domains/patient-management/ui/SubjectDetails';
import SubjectEdit from '../sub-domains/patient-management/ui/SubjectEdit';
import SubjectEnrollment from '../sub-domains/patient-management/ui/SubjectEnrollment';

/**
 * Subject Management module routes. Patient and Subject flows share components,
 * so we re-use patient-management UI with subject-specific paths for clarity.
 */
const SubjectManagementModule: React.FC = () => {
    return (
        <div className="container mx-auto px-4 pb-4">
            <Routes>
                <Route index element={<SubjectList />} />
                <Route path="subjects" element={<SubjectList />} />
                <Route path="subjects/enroll" element={<SubjectEnrollment />} />
                <Route path="subjects/:subjectId" element={<SubjectDetails />} />
                <Route path="subjects/:subjectId/edit" element={<SubjectEdit />} />
            </Routes>
        </div>
    );
};

export default SubjectManagementModule;
