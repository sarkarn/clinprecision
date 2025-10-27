import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SubjectList from './SubjectList';
import SubjectDetails from './SubjectDetails';
import SubjectEdit from './SubjectEdit';
import FormEntry from './components/forms/FormEntry';
import FormView from './components/forms/FormView';
import VisitDetails from './visits/VisitDetails';
import PatientList from './PatientList';
import PatientRegistration from './PatientRegistration';
import PatientDetails from './PatientDetails';
import DataCaptureDashboard from './DataCaptureDashboard';
import DeviationDashboard from './components/deviations/DeviationDashboard';

const DataCaptureModule: React.FC = () => {
    console.log('[DATA CAPTURE MODULE] Rendering, current pathname:', window.location.pathname);
    return (
        <div className="container mx-auto px-4 pb-4">
            <Routes>
                {/* Default route - Dashboard */}
                <Route index element={<DataCaptureDashboard />} />

                {/* Protocol Deviation Routes */}
                <Route path="deviations/dashboard" element={<DeviationDashboard />} />

                {/* Subject Management Routes */}
                <Route path="subjects" element={<SubjectList />} />
                <Route path="subjects/:subjectId" element={<SubjectDetails />} />
                <Route path="subjects/:subjectId/edit" element={<SubjectEdit />} />
                <Route path="subjects/:subjectId/visits/:visitId" element={<VisitDetails />} />
                <Route path="subjects/:subjectId/visits/:visitId/forms/:formId/entry" element={<FormEntry />} />
                <Route path="subjects/:subjectId/visits/:visitId/forms/:formId/view" element={<FormView />} />

                {/* Patient Management Routes */}
                <Route path="patients" element={<PatientList />} />
                <Route path="patients/register" element={<PatientRegistration />} />
                <Route path="patients/:patientId" element={<PatientDetails />} />
            </Routes>
        </div>
    );
};

export default DataCaptureModule;
