// SubjectManagementModule.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SubjectManagementDashboard from './SubjectManagementDashboard';
import SubjectList from '../datacapture/SubjectList';
import SubjectDetails from '../datacapture/SubjectDetails';
import SubjectEdit from '../datacapture/SubjectEdit';

const SubjectManagementModule: React.FC = () => {
    return (
        <div className="container mx-auto px-4 pb-4">
            <Routes>
                {/* Default route - Subject Management Dashboard */}
                <Route index element={<SubjectManagementDashboard />} />

                {/* Subject Management Routes */}
                <Route path="subjects" element={<SubjectList />} />
                <Route path="subjects/:subjectId" element={<SubjectDetails />} />
                <Route path="subjects/:subjectId/edit" element={<SubjectEdit />} />
            </Routes>
        </div>
    );
};

export default SubjectManagementModule;
