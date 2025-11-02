/**
 * SubjectList Component
 * 
 * Comprehensive subject management with study filtering, search, and workflows
 * Includes enrollment stepper, status changes, visits, and withdrawal management
 * 
 * Updated: October 2025
 * Aligned with clinical research subject management workflow
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getStudies } from 'services/StudyService';
import { getSubjectsByStudy } from 'services/SubjectService';
import ApiService from 'services/ApiService';
import { useStudy, useDebounce } from '@packages/hooks';
// @ts-ignore - Component to be converted
import StudySelector from '../components/StudySelector';
// @ts-ignore - Component to be converted
import SubjectFilters from '../components/SubjectFilters';
// @ts-ignore - Component to be converted
import SubjectCard from '../components/SubjectCard';
// @ts-ignore - Component to be converted
import EnrollmentStepper from '../components/EnrollmentStepper';
import StatusChangeModal from '../components/StatusChangeModal';
import UnscheduledVisitModal from '../components/UnscheduledVisitModal';
import WithdrawalModal from '../components/WithdrawalModal';

interface Study {
    id: number;
    title?: string;
    name?: string;
    protocolNumber: string;
    status: string;
}

interface Subject {
    id: number;
    subjectId: string;
    patientNumber?: string;
    firstName?: string;
    lastName?: string;
    status: string;
    enrollmentDate?: string;
    siteId?: number;
    studyId?: number;
}

interface Patient {
    id: number;
    screeningNumber?: string;
    patientNumber: string;
    firstName?: string;
    lastName?: string;
    status: string;
    studyId?: number;
    createdAt?: string;
}

interface EnrollmentData {
    subjectId: string;
    studyId: number;
    siteId: number;
    dateOfBirth: string;
    gender: string;
    phoneNumber?: string;
}

interface StatusDef {
    status: string;
    color: string;
    description: string;
    requiresAction?: boolean;
}

/**
 * Normalize status strings for case-insensitive comparisons
 * Backend returns mixed-case values ('Withdrawn' vs 'WITHDRAWN')
 */
const normalizeStatus = (status: string): string => {
    return status ? status.trim().toUpperCase() : '';
};

const SubjectList: React.FC = () => {
    const { selectedStudy, setSelectedStudy } = useStudy();
    const [studies, setStudies] = useState<Study[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [allPatients, setAllPatients] = useState<Patient[]>([]);
    const [showAllPatients, setShowAllPatients] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Subject | Patient | null>(null);
    const [preselectedStatus, setPreselectedStatus] = useState<string | null>(null);
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [visitType, setVisitType] = useState<string | null>(null);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

    // Filters and sorting state
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [statusFilter, setStatusFilter] = useState('');
    const [siteFilter, setSiteFilter] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showLegend, setShowLegend] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Detect which module we're in based on the current path
    const isSubjectManagementModule = location.pathname.startsWith('/subject-management');
    const basePath = isSubjectManagementModule ? '/subject-management' : '/datacapture-management';

    // Check if enrollment modal should be auto-opened
    useEffect(() => {
        if (location.state?.openEnrollment) {
            setShowEnrollmentModal(true);
            // Clear the state to prevent re-opening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchStudies = async () => {
            try {
                console.log('[SUBJECT LIST] Fetching studies...');
                const studiesData = await getStudies() as any;
                console.log('[SUBJECT LIST] Studies received:', studiesData);

                // Filter for studies that are ready to have subjects viewed
                const filteredStudies = studiesData.filter((study: Study) => {
                    const status = study.status?.toUpperCase();
                    return status === 'PUBLISHED' || status === 'APPROVED' || status === 'ACTIVE';
                });

                console.log('[SUBJECT LIST] Filtered studies for viewing:', filteredStudies.length);
                setStudies(filteredStudies);

                // Check if study was preselected from navigation state
                if (location.state?.preselectedStudy) {
                    console.log('[SUBJECT LIST] Preselected study from navigation:', location.state.preselectedStudy);
                    setSelectedStudy(location.state.preselectedStudy);
                    window.history.replaceState({}, document.title);
                }
            } catch (error) {
                console.error('[SUBJECT LIST] Error fetching studies:', error);
            }
        };

        fetchStudies();
    }, [location.state]);

    useEffect(() => {
        if (!selectedStudy) return;

        const fetchSubjects = async () => {
            console.log('[SUBJECT LIST] Fetching subjects for study ID:', selectedStudy);
            setLoading(true);
            try {
                const subjectsData = await getSubjectsByStudy(selectedStudy) as any;
                console.log('[SUBJECT LIST] Subjects received:', subjectsData.length);
                setSubjects(subjectsData);
            } catch (error) {
                console.error('[SUBJECT LIST] Error fetching subjects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [selectedStudy]);

    // Persist search term to URL
    useEffect(() => {
        if (debouncedSearchTerm) {
            setSearchParams({ search: debouncedSearchTerm });
        } else {
            setSearchParams({});
        }
    }, [debouncedSearchTerm, setSearchParams]);

    const handleEditSubject = (subjectId: number) => {
        navigate(`${basePath}/subjects/${subjectId}/edit`);
    };

    const handleWithdrawSubject = (subject: any) => {
        if (normalizeStatus(subject.status) === 'WITHDRAWN') {
            toast.error('This subject has already been withdrawn.');
            return;
        }
        setSelectedPatient(subject);
        setShowWithdrawalModal(true);
    };

    const handleEnrollmentSubmit = async (enrollmentData: EnrollmentData) => {
        try {
            const payload = {
                ...enrollmentData,
                status: 'Registered',
                enrollmentDate: new Date().toISOString(),
            };

            console.log('[SUBJECT LIST] Enrolling subject:', payload);
            const response = await ApiService.post('/clinops-ws/api/v1/subjects', payload) as any;
            console.log('[SUBJECT LIST] Enrollment successful:', response);

            setShowEnrollmentModal(false);
            toast.success(`Subject ${enrollmentData.subjectId} enrolled successfully`);

            if (selectedStudy) {
                const subjectsData = await getSubjectsByStudy(selectedStudy) as any;
                setSubjects(subjectsData);
            }
        } catch (error: any) {
            console.error('[SUBJECT LIST] Error enrolling subject:', error);
            toast.error(error.response?.data?.message || 'Failed to enroll subject');
        }
    };

    const handleStatusChanged = async (result: any) => {
        console.log('[SUBJECT LIST] Status changed, result:', result);

        setShowStatusModal(false);
        setSelectedPatient(null);
        setPreselectedStatus(null);

        toast.success('Subject status updated successfully');

        // Re-fetch patients if registry is shown
        if (showAllPatients && selectedStudy) {
            try {
                const response = await ApiService.get(`/clinops-ws/api/v1/patients?studyId=${selectedStudy}`) as any;
                if (response?.data) {
                    setAllPatients(response.data);
                }
            } catch (error) {
                console.error('[SUBJECT LIST] Error refreshing patient registry:', error);
                toast.error('Failed to refresh patient registry');
            }
        }

        // Re-fetch subjects
        if (selectedStudy) {
            setLoading(true);
            try {
                const subjectsData = await getSubjectsByStudy(selectedStudy) as any;
                setSubjects(subjectsData);
            } catch (error) {
                console.error('[SUBJECT LIST] Error refreshing subjects:', error);
                toast.error('Failed to refresh subjects');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVisitCreated = async (visit: any) => {
        console.log('[SUBJECT LIST] Visit created successfully:', visit);
        setShowVisitModal(false);
        setSelectedPatient(null);
        setPreselectedStatus(null);

        toast.success('Visit created successfully');

        // Refresh data
        if (showAllPatients && selectedStudy) {
            try {
                const response = await ApiService.get(`/clinops-ws/api/v1/patients?studyId=${selectedStudy}`) as any;
                if (response?.data) {
                    setAllPatients(response.data);
                }
            } catch (error) {
                console.error('[SUBJECT LIST] Error refreshing patients:', error);
            }
        }

        if (selectedStudy) {
            try {
                const subjectsData = await getSubjectsByStudy(selectedStudy) as any;
                setSubjects(subjectsData);
            } catch (error) {
                console.error('[SUBJECT LIST] Error refreshing subjects:', error);
            }
        }
    };

    // Get unique sites from subjects
    const availableSites = [...new Set(subjects.map(s => s.siteId).filter(Boolean))].map(String);

    // Status definitions for legend
    const statusDefinitions: StatusDef[] = [
        { status: 'Registered', color: 'bg-gray-100 text-gray-800', description: 'Patient registered, not yet screening' },
        { status: 'Screening', color: 'bg-yellow-100 text-yellow-800', description: 'Undergoing eligibility assessment', requiresAction: true },
        { status: 'Enrolled', color: 'bg-blue-100 text-blue-800', description: 'Enrolled in study' },
        { status: 'Active', color: 'bg-green-100 text-green-800', description: 'Actively participating in study' },
        { status: 'Completed', color: 'bg-purple-100 text-purple-800', description: 'Study completion achieved' },
        { status: 'Withdrawn', color: 'bg-red-100 text-red-800', description: 'Withdrawn from study', requiresAction: true },
        { status: 'Screen Failed', color: 'bg-red-100 text-red-800', description: 'Did not meet eligibility criteria', requiresAction: true }
    ];

    // Filter and sort subjects
    const getFilteredAndSortedSubjects = () => {
        let filtered = [...subjects];

        // Apply search filter
        if (debouncedSearchTerm) {
            const searchLower = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.subjectId?.toLowerCase().includes(searchLower) ||
                s.firstName?.toLowerCase().includes(searchLower) ||
                s.lastName?.toLowerCase().includes(searchLower) ||
                s.siteId?.toString().includes(searchLower) ||
                s.status?.toLowerCase().includes(searchLower)
            );
        }

        // Apply status filter
        if (statusFilter) {
            if (statusFilter === 'REQUIRES_ACTION') {
                filtered = filtered.filter(s =>
                    ['SCREENING', 'WITHDRAWN', 'SCREEN FAILED'].includes(normalizeStatus(s.status))
                );
            } else {
                filtered = filtered.filter(s => normalizeStatus(s.status) === normalizeStatus(statusFilter));
            }
        }

        // Apply site filter
        if (siteFilter) {
            filtered = filtered.filter(s => s.siteId?.toString() === siteFilter);
        }

        // Apply sorting
        if (sortField) {
            filtered.sort((a: any, b: any) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                // Handle dates
                if (sortField === 'enrollmentDate') {
                    aVal = aVal ? new Date(aVal).getTime() : 0;
                    bVal = bVal ? new Date(bVal).getTime() : 0;
                }

                // Handle strings
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = (bVal || '').toLowerCase();
                }

                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    };

    const filteredSubjects = getFilteredAndSortedSubjects();

    // Handle column sort
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon: React.FC<{ field: string }> = ({ field }) => {
        if (sortField !== field) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return sortDirection === 'asc' ? (
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    return (
        <div>
            {/* Study Context Banner */}
            {selectedStudy && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-blue-800">
                                Viewing Protocol: {studies.find(s => s.id.toString() === selectedStudy.toString())?.protocolNumber || 'N/A'}
                            </p>
                            <p className="text-xs text-blue-600">
                                {studies.find(s => s.id.toString() === selectedStudy.toString())?.title || 'Study'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold">Subject Management</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage study subjects, enrollment status, and protocol compliance</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowEnrollmentModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Enroll New Subject
                    </button>
                </div>
            </div>

            <StudySelector studies={studies} className="mb-6" {...{} as any} />

            {/* Subject Summary Statistics */}
            {selectedStudy && subjects.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    {/* Filters and Actions Bar */}
                    <SubjectFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        siteFilter={siteFilter}
                        onSiteFilterChange={setSiteFilter}
                        availableSites={availableSites}
                        showLegend={showLegend}
                        onToggleLegend={() => setShowLegend(!showLegend)}
                        filteredCount={filteredSubjects.length}
                        totalCount={subjects.length}
                        hasActiveFilters={!!(statusFilter || siteFilter || sortField || searchTerm)}
                        onClearFilters={() => {
                            setSearchTerm('');
                            setStatusFilter('');
                            setSiteFilter('');
                            setSortField('');
                            setSortDirection('asc');
                        }}
                        {...{} as any}
                    />

                    {/* Status Legend */}
                    {showLegend && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2">Status Definitions</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {statusDefinitions.map(def => (
                                    <div key={def.status} className="flex items-start space-x-2">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${def.color} whitespace-nowrap`}>
                                            {def.status}
                                        </span>
                                        <span className="text-xs text-gray-600 flex-1">
                                            {def.description}
                                            {def.requiresAction && <span className="ml-1 text-orange-600 font-medium">⚠️</span>}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{subjects.length}</div>
                            <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {subjects.filter(s => ['REGISTERED', 'SCREENING'].includes(normalizeStatus(s.status))).length}
                            </div>
                            <div className="text-sm text-gray-600">Pre-Enrollment</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {subjects.filter(s => ['ENROLLED', 'ACTIVE'].includes(normalizeStatus(s.status))).length}
                            </div>
                            <div className="text-sm text-gray-600">Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">
                                {subjects.filter(s => ['COMPLETED', 'WITHDRAWN', 'SCREEN FAILED'].includes(normalizeStatus(s.status))).length}
                            </div>
                            <div className="text-sm text-gray-600">Completed/Discontinued</div>
                        </div>
                    </div>

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
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('subjectId')}
                                            >
                                                <div className="flex items-center">
                                                    Subject ID
                                                    <SortIcon field="subjectId" />
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('patientNumber')}
                                            >
                                                <div className="flex items-center">
                                                    Patient Number
                                                    <SortIcon field="patientNumber" />
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('status')}
                                            >
                                                <div className="flex items-center">
                                                    Status
                                                    <SortIcon field="status" />
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('enrollmentDate')}
                                            >
                                                <div className="flex items-center">
                                                    Enrollment Date
                                                    <SortIcon field="enrollmentDate" />
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('siteId')}
                                            >
                                                <div className="flex items-center">
                                                    Site
                                                    <SortIcon field="siteId" />
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredSubjects.map(subject => (
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
                                                ${normalizeStatus(subject.status) === 'REGISTERED' ? 'bg-gray-100 text-gray-800' :
                                                            normalizeStatus(subject.status) === 'SCREENING' ? 'bg-yellow-100 text-yellow-800' :
                                                                normalizeStatus(subject.status) === 'ENROLLED' ? 'bg-blue-100 text-blue-800' :
                                                                    normalizeStatus(subject.status) === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                                        normalizeStatus(subject.status) === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                                                                            normalizeStatus(subject.status) === 'WITHDRAWN' ? 'bg-red-100 text-red-800' :
                                                                                normalizeStatus(subject.status) === 'SCREEN FAILED' ? 'bg-red-100 text-red-800' :
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
                                                            className={`flex items-center ${normalizeStatus(subject.status) === 'WITHDRAWN'
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-red-600 hover:text-red-900'
                                                                }`}
                                                            disabled={normalizeStatus(subject.status) === 'WITHDRAWN'}
                                                            title={
                                                                normalizeStatus(subject.status) === 'WITHDRAWN'
                                                                    ? 'Subject already withdrawn'
                                                                    : 'Withdraw subject from study'
                                                            }
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Withdraw
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setSelectedPatient(subject);
                                                                setVisitType('UNSCHEDULED');
                                                                setShowVisitModal(true);
                                                            }}
                                                            className="text-purple-600 hover:text-purple-900 flex items-center"
                                                            title="Add unscheduled visit"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Visit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {filteredSubjects.map(subject => (
                                    <SubjectCard
                                        key={subject.id}
                                        subject={subject as any}
                                        onChangeStatus={(s: any) => {
                                            setSelectedPatient(s);
                                            setPreselectedStatus(null);
                                            setShowStatusModal(true);
                                        }}
                                        onStartVisit={(s: any) => {
                                            setSelectedPatient(s);
                                            setVisitType('UNSCHEDULED');
                                            setShowVisitModal(true);
                                        }}
                                        onWithdraw={handleWithdrawSubject}
                                        basePath={basePath}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Patient Registry Section */}
            {selectedStudy && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="text-lg font-medium text-gray-800">Patient Registry</h4>
                            <p className="text-sm text-gray-600">View all registered patients (including those not yet enrolled)</p>
                        </div>
                        <button
                            onClick={async () => {
                                if (!showAllPatients) {
                                    setLoadingPatients(true);
                                    try {
                                        console.log('[SUBJECT LIST] Fetching patient registry for study:', selectedStudy);
                                        const response = await ApiService.get(`/clinops-ws/api/v1/patients?studyId=${selectedStudy}`) as any;
                                        if (response?.data) {
                                            console.log('[SUBJECT LIST] Patient registry loaded:', response.data.length);
                                            setAllPatients(response.data);
                                        }
                                    } catch (error) {
                                        console.error('[SUBJECT LIST] Error fetching patient registry:', error);
                                    } finally {
                                        setLoadingPatients(false);
                                    }
                                }
                                setShowAllPatients(!showAllPatients);
                            }}
                            className={`px-4 py-2 rounded flex items-center ${showAllPatients
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            disabled={loadingPatients}
                        >
                            {loadingPatients ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showAllPatients ? "M6 18L18 6M6 6l12 12" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                                    </svg>
                                    {showAllPatients ? 'Hide Registry' : 'Show Patient Registry'}
                                </>
                            )}
                        </button>
                    </div>

                    {showAllPatients && (
                        <>
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
                                                    ${normalizeStatus(patient.status) === 'REGISTERED' ? 'bg-blue-100 text-blue-800' :
                                                                normalizeStatus(patient.status) === 'SCREENING' ? 'bg-yellow-100 text-yellow-800' :
                                                                    normalizeStatus(patient.status) === 'ENROLLED' ? 'bg-green-100 text-green-800' :
                                                                        normalizeStatus(patient.status) === 'ACTIVE' ? 'bg-violet-100 text-violet-800' :
                                                                            normalizeStatus(patient.status) === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                                                                normalizeStatus(patient.status) === 'WITHDRAWN' ? 'bg-red-100 text-red-800' :
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
                                                                onClick={() => handleWithdrawSubject(patient as any)}
                                                                className={`flex items-center ${normalizeStatus(patient.status) === 'WITHDRAWN'
                                                                    ? 'text-gray-400 cursor-not-allowed'
                                                                    : 'text-red-600 hover:text-red-900'
                                                                    }`}
                                                                disabled={normalizeStatus(patient.status) === 'WITHDRAWN'}
                                                                title={
                                                                    normalizeStatus(patient.status) === 'WITHDRAWN'
                                                                        ? 'Patient already withdrawn'
                                                                        : 'Withdraw patient from study'
                                                                }
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Withdraw
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPatient(patient);
                                                                    setVisitType('UNSCHEDULED');
                                                                    setShowVisitModal(true);
                                                                }}
                                                                className="text-purple-600 hover:text-purple-900 flex items-center"
                                                                title="Add unscheduled visit"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Visit
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Status Change Modal */}
            {showStatusModal && selectedPatient && (
                <StatusChangeModal
                    isOpen={showStatusModal}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedPatient(null);
                        setPreselectedStatus(null);
                    }}
                    patientId={selectedPatient.id}
                    patientName={`${(selectedPatient as any).firstName || ''} ${(selectedPatient as any).lastName || ''}`.trim() || `Patient ${selectedPatient.id}`}
                    currentStatus={(selectedPatient as any).status}
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
                    patientName={`${(selectedPatient as any).firstName || ''} ${(selectedPatient as any).lastName || ''}`.trim() || `Patient ${selectedPatient.id}`}
                    studyId={(selectedPatient as any).studyId || (selectedStudy ? parseInt(selectedStudy as any) : null)}
                    siteId={(selectedPatient as any).siteId || 1}
                    visitType={visitType}
                    onVisitCreated={handleVisitCreated}
                />
            )}

            {/* Withdrawal Modal */}
            {showWithdrawalModal && selectedPatient && (
                <WithdrawalModal
                    isOpen={showWithdrawalModal}
                    onClose={() => {
                        setShowWithdrawalModal(false);
                        setSelectedPatient(null);
                    }}
                    patientId={selectedPatient.id}
                    patientName={`${(selectedPatient as any).firstName || ''} ${(selectedPatient as any).lastName || ''}`.trim() || `Patient ${selectedPatient.id}`}
                    currentStatus={(selectedPatient as any).status}
                    onWithdrawalComplete={handleStatusChanged}
                />
            )}

            {/* Enrollment Stepper Modal */}
            {showEnrollmentModal && (
                <EnrollmentStepper
                    onClose={() => setShowEnrollmentModal(false)}
                    onSubmit={handleEnrollmentSubmit}
                    studies={studies}
                />
            )}
        </div>
    );
};

export default SubjectList;
