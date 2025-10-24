// src/components/modules/subjectmanagement/PatientDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Calendar,
    Activity,
    Clock,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import PatientEnrollmentService from '../../../services/data-capture/PatientEnrollmentService';
import PatientStatusService from '../../../services/data-capture/PatientStatusService';
import PatientStatusBadge from './components/PatientStatusBadge';
import PatientStatusHistory from './components/PatientStatusHistory';
import StatusChangeModal from './components/StatusChangeModal';
import Button from '../../shared/ui/Button';

/**
 * Patient Detail Page
 * 
 * Features:
 * - Patient demographic information
 * - Current status badge with days in status
 * - Change status button (opens modal)
 * - Status history timeline
 * - Status analytics (total changes, progression speed)
 * - Status summary card
 * - Loading and error states
 */
const PatientDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);
    const [statusSummary, setStatusSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    /**
     * Load patient data on mount
     */
    useEffect(() => {
        if (id) {
            loadPatientData();
        }
    }, [id, refreshKey]);

    /**
     * Load all patient data
     */
    const loadPatientData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load patient enrollment data
            const patientData = await PatientEnrollmentService.getPatientById(id);
            setPatient(patientData);

            // Load current status
            try {
                const status = await PatientStatusService.getCurrentPatientStatus(id);
                setCurrentStatus(status);
            } catch (statusError) {
                console.log('No status found for patient');
                setCurrentStatus(null);
            }

            // Load status summary
            try {
                const summary = await PatientStatusService.getPatientStatusSummary(id);
                setStatusSummary(summary);
            } catch (summaryError) {
                console.log('Could not load status summary');
                setStatusSummary(null);
            }

        } catch (err) {
            console.error('Error loading patient data:', err);
            setError(err.message || 'Failed to load patient data');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle status change modal
     */
    const handleChangeStatus = () => {
        setShowStatusModal(true);
    };

    /**
     * Handle successful status change
     */
    const handleStatusChanged = () => {
        // Refresh data
        setRefreshKey(prev => prev + 1);
    };

    /**
     * Calculate days in current status
     */
    const getDaysInCurrentStatus = () => {
        if (!currentStatus || !currentStatus.changedAt) return null;

        const statusDate = new Date(currentStatus.changedAt);
        const now = new Date();
        const diffMs = now - statusDate;
        const days = Math.floor(diffMs / 86400000);
        return days;
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading patient data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-md p-6">
                        <div className="flex">
                            <AlertCircle className="h-6 w-6 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-red-800">Error Loading Patient</h3>
                                <p className="mt-2 text-sm text-red-700">{error}</p>
                                <div className="mt-4 flex gap-3">
                                    <Button onClick={loadPatientData} variant="secondary" size="sm">
                                        Try Again
                                    </Button>
                                    <Button onClick={() => navigate('/subject-management')} variant="ghost" size="sm">
                                        Back to Dashboard
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No patient found
    if (!patient) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Not Found</h3>
                        <p className="text-gray-600 mb-6">
                            No patient found with ID: {id}
                        </p>
                        <Button onClick={() => navigate('/subject-management')} variant="primary">
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const daysInStatus = getDaysInCurrentStatus();

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/subject-management')}
                                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {patient.firstName} {patient.lastName}
                                </h1>
                                <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
                            </div>
                        </div>
                        <Button onClick={handleChangeStatus} variant="primary">
                            Change Status
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

                {/* Current Status Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                                {currentStatus ? (
                                    <PatientStatusBadge status={currentStatus.newStatus} size="lg" />
                                ) : (
                                    <span className="text-gray-500 text-sm">No status recorded</span>
                                )}
                            </div>

                            {daysInStatus !== null && (
                                <div className="border-l border-gray-200 pl-6">
                                    <p className="text-sm text-gray-600 mb-1">Days in Status</p>
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                                        <span className="text-2xl font-bold text-gray-900">
                                            {daysInStatus}
                                        </span>
                                        <span className="text-sm text-gray-600 ml-2">
                                            {daysInStatus === 1 ? 'day' : 'days'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {statusSummary && (
                                <div className="border-l border-gray-200 pl-6">
                                    <p className="text-sm text-gray-600 mb-1">Total Status Changes</p>
                                    <div className="flex items-center">
                                        <Activity className="w-5 h-5 text-gray-400 mr-2" />
                                        <span className="text-2xl font-bold text-gray-900">
                                            {statusSummary.totalChanges || 0}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {currentStatus && (
                            <div className="text-right text-sm text-gray-600">
                                <p>Last Changed</p>
                                <p className="font-medium text-gray-900">
                                    {formatDate(currentStatus.changedAt)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    by {currentStatus.changedBy}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Patient Info and Status Summary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Patient Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <User className="w-5 h-5 text-gray-400 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm text-gray-600">Full Name:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {patient.firstName} {patient.lastName}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm text-gray-600">Date of Birth:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatDate(patient.dateOfBirth)}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm text-gray-600">Gender:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {patient.gender || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm text-gray-600">Contact:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {patient.contactNumber || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {patient.email || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Study:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {patient.studyName || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Summary */}
                    {statusSummary && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center mb-4">
                                <Activity className="w-5 h-5 text-gray-400 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900">Status Analytics</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm text-blue-700 mb-1">Current Status</div>
                                    <div className="flex items-center justify-between">
                                        <PatientStatusBadge
                                            status={statusSummary.currentStatus}
                                            size="md"
                                        />
                                        <div className="text-right">
                                            <div className="text-xs text-blue-600">Duration</div>
                                            <div className="text-lg font-bold text-blue-900">
                                                {daysInStatus} {daysInStatus === 1 ? 'day' : 'days'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-700 mb-1">Total Status Changes</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {statusSummary.totalChanges || 0}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {statusSummary.history?.length || 0} records in history
                                    </div>
                                </div>

                                {statusSummary.averageDaysPerStatus && (
                                    <div className="bg-violet-50 p-4 rounded-lg">
                                        <div className="text-sm text-violet-700 mb-1">Average Days Per Status</div>
                                        <div className="text-2xl font-bold text-violet-900">
                                            {statusSummary.averageDaysPerStatus.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-violet-600 mt-1">
                                            Progression speed indicator
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status History Timeline */}
                <PatientStatusHistory
                    patientId={id}
                    autoRefresh={false}
                />

            </div>

            {/* Status Change Modal */}
            {showStatusModal && currentStatus && (
                <StatusChangeModal
                    isOpen={showStatusModal}
                    onClose={() => setShowStatusModal(false)}
                    patientId={patient.id}
                    patientName={`${patient.firstName} ${patient.lastName}`}
                    currentStatus={currentStatus.newStatus}
                    onStatusChanged={handleStatusChanged}
                />
            )}

        </div>
    );
};

export default PatientDetailPage;
