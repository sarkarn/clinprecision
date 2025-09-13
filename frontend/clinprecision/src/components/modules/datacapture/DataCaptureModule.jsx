// DataCaptureModule.jsx
import { Routes, Route } from 'react-router-dom';
import SubjectList from './SubjectList';
import SubjectEnrollment from './SubjectEnrollment';
import SubjectDetails from './SubjectDetails';
import FormEntry from './forms/FormEntry';
import FormView from './forms/FormView';
import VisitDetails from './visits/VisitDetails';

export default function DataCaptureModule() {
    return (
        <div className="container mx-auto px-4 pb-4">
            <h2 className="text-2xl font-bold mb-6">Data Capture & Entry</h2>

            <Routes>
                <Route index element={<SubjectList />} />
                <Route path="enroll" element={<SubjectEnrollment />} />
                <Route path="subjects/:subjectId" element={<SubjectDetails />} />
                <Route path="subjects/:subjectId/visits/:visitId" element={<VisitDetails />} />
                <Route path="subjects/:subjectId/visits/:visitId/forms/:formId/entry" element={<FormEntry />} />
                <Route path="subjects/:subjectId/visits/:visitId/forms/:formId/view" element={<FormView />} />
            </Routes>
        </div>
    );
}