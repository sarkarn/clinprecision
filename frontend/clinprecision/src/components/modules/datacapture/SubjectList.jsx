// SubjectList.jsx - Enhanced for Clinical Trial Standards
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getStudies } from '../../../services/StudyService';
import { getSubjectsByStudy } from '../../../services/SubjectService';
import ApiService from '../../../services/ApiService';
import StatusChangeModal from '../subjectmanagement/components/StatusChangeModal';
import UnscheduledVisitModal from '../subjectmanagement/components/UnscheduledVisitModal';

export default function SubjectList() {
    const [studies, setStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [showAllPatients, setShowAllPatients] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [preselectedStatus, setPreselectedStatus] = useState(null);
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [visitType, setVisitType] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Detect which module we're in based on the current path
    const isSubjectManagementModule = location.pathname.startsWith('/subject-management');
    const basePath = isSubjectManagementModule ? '/subject-management' : '/datacapture-management';

    useEffect(() => {
        const fetchStudies = async () => {
            try {
                console.log('[SUBJECT LIST] Fetching studies...');
                const studiesData = await getStudies();
                console.log('[SUBJECT LIST] Studies received:', studiesData);
                console.log('[SUBJECT LIST] Number of studies:', studiesData.length);

                if (studiesData.length > 0) {
                    console.log('[SUBJECT LIST] First study:', studiesData[0]);
                    console.log('[SUBJECT LIST] First study title:', studiesData[0].title);
                    console.log('[SUBJECT LIST] First study name:', studiesData[0].name);
                }

                // Filter for studies that are ready to have subjects viewed
                // Only PUBLISHED, APPROVED, or ACTIVE studies should be shown
                const filteredStudies = studiesData.filter(study => {
                    const status = study.status?.toUpperCase();
                    return status === 'PUBLISHED' || status === 'APPROVED' || status === 'ACTIVE';
                });

                console.log('[SUBJECT LIST] Filtered studies for viewing:', filteredStudies.length);
                setStudies(filteredStudies);

                // Check if study was preselected from navigation state (e.g., from dashboard)
                if (location.state?.preselectedStudy) {
                    console.log('[SUBJECT LIST] Preselected study from navigation:', location.state.preselectedStudy);
                    setSelectedStudy(location.state.preselectedStudy);
                    // Clear the navigation state to prevent re-selection on refresh
                    window.history.replaceState({}, document.title);
                }
            } catch (error) {
                console.error('[SUBJECT LIST] Error fetching studies:', error);
            }
        };

        const fetchAllPatients = async () => {
            try {
                console.log('[SUBJECT LIST] Fetching all registered patients on initial load...');
                const response = await ApiService.get('/clinops-ws/api/v1/patients');
                if (response?.data) {
                    console.log('[SUBJECT LIST] All patients loaded:', response.data.length);
                    setAllPatients(response.data);
                    setShowAllPatients(true); // Show all patients by default
                }
            } catch (error) {
                console.error('[SUBJECT LIST] Error fetching all patients:', error);
            }
        };

        fetchStudies();
        fetchAllPatients(); // Load all patients on initial page load
    }, [location.state]);

    useEffect(() => {
        if (!selectedStudy) return;

        const fetchSubjects = async () => {
            console.log('[SUBJECT LIST] Fetching subjects for study ID:', selectedStudy);
            setLoading(true);
            try {
                const subjectsData = await getSubjectsByStudy(selectedStudy);
                console.log('[SUBJECT LIST] Subjects received for study', selectedStudy, ':', subjectsData);
                console.log('[SUBJECT LIST] Number of subjects:', subjectsData.length);
                setSubjects(subjectsData);
            } catch (error) {
                console.error('[SUBJECT LIST] Error fetching subjects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [selectedStudy]);

    const handleEditSubject = (subjectId) => {
        // Navigate to subject edit page
        navigate(`${basePath}/subjects/${subjectId}/edit`);
    };

    const handleWithdrawSubject = (subject) => {
        // Open status change modal with WITHDRAWN preselected
        if (subject.status === 'Withdrawn' || subject.status === 'WITHDRAWN') {
            alert('This subject has already been withdrawn.');
            return;
        }
        setSelectedPatient(subject);
        setPreselectedStatus('WITHDRAWN');
        setShowStatusModal(true);
    };

    const handleStatusChanged = async (result) => {
        console.log('[SUBJECT LIST] Status changed, result:', result);

        // Close status modal
        setShowStatusModal(false);
        setSelectedPatient(null);
        setPreselectedStatus(null);

        // Re-fetch all patients to reflect status changes
        try {
            const response = await ApiService.get('/clinops-ws/api/v1/patients');
            if (response?.data) {
                console.log('[SUBJECT LIST] Refreshed all patients after status change');
                setAllPatients(response.data);
            }
        } catch (error) {
            console.error('[SUBJECT LIST] Error refreshing all patients:', error);
        }

        // Re-fetch subjects for the current study if one is selected
        if (selectedStudy) {
            setLoading(true);
            try {
                const subjectsData = await getSubjectsByStudy(selectedStudy);
                setSubjects(subjectsData);
            } catch (error) {
                console.error('[SUBJECT LIST] Error refreshing subjects:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVisitCreated = async (visit) => {
        console.log('[SUBJECT LIST] Visit created successfully:', visit);
        setShowVisitModal(false);
        setSelectedPatient(null);
        setPreselectedStatus(null);

        // Refresh data after visit creation
        try {
            const response = await ApiService.get('/clinops-ws/api/v1/patients');
            if (response?.data) {
                setAllPatients(response.data);
            }
        } catch (error) {
            console.error('[SUBJECT LIST] Error refreshing patients:', error);
        }

        if (selectedStudy) {
            try {
                const subjectsData = await getSubjectsByStudy(selectedStudy);
                setSubjects(subjectsData);
            } catch (error) {
                console.error('[SUBJECT LIST] Error refreshing subjects:', error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold">Subject Management</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage study subjects, enrollment status, and protocol compliance</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate('/subject-management/enroll')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Enroll New Subject
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Study Protocol
                        {studies.length > 0 && <span className="text-green-600 ml-2">({studies.length} active studies)</span>}
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Showing only studies with status PUBLISHED, APPROVED, or ACTIVE
                    </p>
                    <select
                        value={selectedStudy}
                        onChange={(e) => setSelectedStudy(e.target.value)}
                        className="border border-gray-300 rounded-md w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-- Select a Study Protocol --</option>
                        {studies.length === 0 ? (
                            <option value="" disabled>No active studies available</option>
                        ) : (
                            studies.map(study => (
                                <option key={study.id} value={study.id}>
                                    {study.protocolNumber ? `${study.protocolNumber} - ` : ''}
                                    {study.title || study.name || 'Untitled Study'}
                                    {study.phase ? ` (${study.phase})` : ''}
                                </option>
                            ))
                        )}
                    </select>
                    {studies.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                            No studies available for viewing subjects. Studies must be PUBLISHED, APPROVED, or ACTIVE.
                        </p>
                    )}
                </div>

                {/* Subject Summary Statistics - Reflects Patient Lifecycle */}
                {selectedStudy && subjects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{subjects.length}</div>
                            <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {subjects.filter(s => s.status === 'Registered' || s.status === 'Screening').length}
                            </div>
                            <div className="text-sm text-gray-600">Pre-Enrollment</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {subjects.filter(s => s.status === 'Enrolled' || s.status === 'Active').length}
                            </div>
                            <div className="text-sm text-gray-600">Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">
                                {subjects.filter(s => s.status === 'Completed' || s.status === 'Withdrawn' || s.status === 'Screen Failed').length}
                            </div>
                            <div className="text-sm text-gray-600">Completed/Discontinued</div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-4">Loading subjects...</div>
                ) : !selectedStudy ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500 mb-4">
                            Please select a study protocol from the dropdown above to view enrolled subjects.
                        </div>
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-4">
                        <div className="text-gray-500 mb-4">
                            No subjects enrolled in this study yet.
                        </div>

                        {/* Show option to view all registered patients */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2">Looking for registered patients?</h4>
                            <p className="text-blue-700 text-sm mb-3">
                                There are registered patients who haven't been enrolled in any study yet.
                            </p>
                            <button
                                onClick={async () => {
                                    if (!showAllPatients) {
                                        // Fetch all patients when showing for the first time
                                        try {
                                            const response = await ApiService.get('/clinops-ws/api/v1/patients');
                                            if (response?.data) {
                                                setAllPatients(response.data);
                                            }
                                        } catch (error) {
                                            console.error('Error fetching all patients:', error);
                                        }
                                    }
                                    setShowAllPatients(!showAllPatients);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                            >
                                {showAllPatients ? 'Hide' : 'Show'} All Registered Patients
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subjects.map(subject => (
                                    <tr key={subject.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <Link
                                                    to={`${basePath}/subjects/${subject.id}`}
                                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {subject.subjectId}
                                                </Link>
                                                <span className="text-xs text-gray-500">Screening #{subject.subjectId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex flex-col">
                                                <span>{subject.patientNumber || 'N/A'}</span>
                                                {subject.firstName && subject.lastName && (
                                                    <span className="text-xs text-gray-400">Initials: {subject.firstName.charAt(0)}{subject.lastName.charAt(0)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${subject.status === 'Registered' ? 'bg-gray-100 text-gray-800' :
                                                    subject.status === 'Screening' ? 'bg-yellow-100 text-yellow-800' :
                                                        subject.status === 'Enrolled' ? 'bg-blue-100 text-blue-800' :
                                                            subject.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                                subject.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                                                                    subject.status === 'Withdrawn' ? 'bg-red-100 text-red-800' :
                                                                        subject.status === 'Screen Failed' ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-800'}`}>
                                                {subject.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {subject.enrollmentDate ? new Date(subject.enrollmentDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {subject.siteId ? `Site ${subject.siteId}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3 items-center">
                                                <Link
                                                    to={`${basePath}/subjects/${subject.id}`}
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                    title="View subject details"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </Link>

                                                <button
                                                    onClick={() => {
                                                        setSelectedPatient(subject);
                                                        setPreselectedStatus(null);
                                                        setShowStatusModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center"
                                                    title="Change subject status"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                    </svg>
                                                    Status
                                                </button>

                                                <button
                                                    onClick={() => handleEditSubject(subject.id)}
                                                    className="text-gray-600 hover:text-gray-900 flex items-center"
                                                    title="Edit subject details"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleWithdrawSubject(subject)}
                                                    className={`flex items-center ${subject.status === 'Withdrawn' || subject.status === 'WITHDRAWN'
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-red-600 hover:text-red-900'
                                                        }`}
                                                    disabled={subject.status === 'Withdrawn' || subject.status === 'WITHDRAWN'}
                                                    title={
                                                        subject.status === 'Withdrawn' || subject.status === 'WITHDRAWN'
                                                            ? 'Subject already withdrawn'
                                                            : 'Withdraw subject from study'
                                                    }
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Withdraw
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Show All Registered Patients Section */}
            {showAllPatients && (
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">All Registered Patients</h4>
                    {allPatients.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No registered patients found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screening Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {allPatients.map(patient => (
                                        <tr key={patient.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                <Link
                                                    to={`${basePath}/subjects/${patient.id}`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {patient.screeningNumber || 'N/A'}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    to={`${basePath}/subjects/${patient.id}`}
                                                    className="text-gray-700 hover:text-blue-600 hover:underline"
                                                >
                                                    {patient.patientNumber}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {patient.firstName && patient.lastName ?
                                                    `${patient.firstName} ${patient.lastName}` :
                                                    'N/A'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${patient.status === 'REGISTERED' ? 'bg-blue-100 text-blue-800' :
                                                        patient.status === 'SCREENING' ? 'bg-yellow-100 text-yellow-800' :
                                                            patient.status === 'ENROLLED' ? 'bg-green-100 text-green-800' :
                                                                patient.status === 'ACTIVE' ? 'bg-violet-100 text-violet-800' :
                                                                    patient.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                                                        patient.status === 'WITHDRAWN' ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {patient.status || 'REGISTERED'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {patient.studyId ? `Study ${patient.studyId}` : 'Not Enrolled'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3 items-center">
                                                    <Link
                                                        to={`${basePath}/subjects/${patient.id}`}
                                                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                        title="View patient details"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </Link>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedPatient(patient);
                                                            setPreselectedStatus(null);
                                                            setShowStatusModal(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center"
                                                        title="Change patient status"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                        </svg>
                                                        Status
                                                    </button>

                                                    <button
                                                        onClick={() => handleEditSubject(patient.id)}
                                                        className="text-gray-600 hover:text-gray-900 flex items-center"
                                                        title="Edit patient details"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleWithdrawSubject(patient)}
                                                        className={`flex items-center ${patient.status === 'WITHDRAWN'
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-red-600 hover:text-red-900'
                                                            }`}
                                                        disabled={patient.status === 'WITHDRAWN'}
                                                        title={
                                                            patient.status === 'WITHDRAWN'
                                                                ? 'Patient already withdrawn'
                                                                : 'Withdraw patient from study'
                                                        }
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Withdraw
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Status Change Modal for Withdrawal */}
            {showStatusModal && selectedPatient && (
                <StatusChangeModal
                    isOpen={showStatusModal}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedPatient(null);
                        setPreselectedStatus(null);
                    }}
                    patientId={selectedPatient.id}
                    patientName={`${selectedPatient.firstName || ''} ${selectedPatient.lastName || ''}`.trim() || `Patient ${selectedPatient.id}`}
                    currentStatus={selectedPatient.status}
                    preselectedStatus={preselectedStatus}
                    onStatusChanged={handleStatusChanged}
                />
            )}

            {/* Unscheduled Visit Modal */}
            {showVisitModal && selectedPatient && (
                <UnscheduledVisitModal
                    isOpen={showVisitModal}
                    onClose={() => {
                        setShowVisitModal(false);
                        setSelectedPatient(null);
                        setVisitType(null);
                    }}
                    patientId={selectedPatient.id}
                    patientName={`${selectedPatient.firstName || ''} ${selectedPatient.lastName || ''}`.trim() || `Patient ${selectedPatient.id}`}
                    studyId={selectedPatient.studyId || (selectedStudy ? parseInt(selectedStudy) : null)}
                    siteId={selectedPatient.siteId || 1}
                    visitType={visitType}
                    onVisitCreated={handleVisitCreated}
                />
            )}
        </div>
    );
}