// DataCaptureModule.jsx
import { Routes, Route } from 'react-router-dom';
import SubjectList from './SubjectList';
import SubjectEnrollment from './SubjectEnrollment';
import SubjectDetails from './SubjectDetails';
import FormEntry from './forms/FormEntry';
import FormView from './forms/FormView';
import VisitDetails from './visits/VisitDetails';
import PatientList from './PatientList';
import PatientRegistration from './PatientRegistration';
import PatientDetails from './PatientDetails';
import DataCaptureDashboard from './DataCaptureDashboard';

export default function DataCaptureModule() {
    console.log('[DATA CAPTURE MODULE] Rendering, current pathname:', window.location.pathname);
    return (
        <div className="container mx-auto px-4 pb-4">
            <Routes>
                {/* Default route - Dashboard */}
                <Route index element={<DataCaptureDashboard />} />

                {/* Subject Management Routes */}
                <Route path="subjects" element={<SubjectList />} />
                <Route path="enroll" element={<SubjectEnrollment />} />
                <Route path="subjects/:subjectId" element={<SubjectDetails />} />
                <Route path="subjects/:subjectId/visits/:visitId" element={<VisitDetails />} />
                <Route path="subjects/:subjectId/visits/:visitId/forms/:formId/entry" element={<FormEntry />} />
                <Route path="subjects/:subjectId/visits/:visitId/forms/:formId/view" element={<FormView />} />

                {/* Patient Management Routes */}
                <Route path="patients" element={<PatientList />} />
                <Route path="patients/register" element={<PatientRegistration />} />
                <Route path="patients/:patientId" element={<PatientDetails />} />
                <Route path="patients/:patientId/enroll" element={<SubjectEnrollment />} />
            </Routes>
        </div>
    );
}