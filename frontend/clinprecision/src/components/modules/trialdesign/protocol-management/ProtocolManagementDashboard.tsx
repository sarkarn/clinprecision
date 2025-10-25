import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText,
    Plus,
    Edit,
    Eye,
    Clock,
    CheckCircle,
    GitBranch,
    AlertTriangle,
    ArrowLeft,
    Trash2,
    Download,
    Upload,
    X,
    LucideIcon
} from 'lucide-react';
import useProtocolVersioning from '../hooks/useProtocolVersioning';
import StudyService from '../../../../services/StudyService';
import ProtocolVersionManagementModal from '../study-design/protocol-version/ProtocolVersionManagementModal';
import { ProtocolVersion } from '../../../../services/StudyVersioningService';
import type { Study } from '../../../../types';

/**
 * Status display configuration interface
 */
interface StatusDisplayConfig {
    icon: LucideIcon;
    color: string;
    bgColor: string;
    label: string;
}

/**
 * Status display configuration map
 */
type StatusDisplayConfigMap = Record<string, StatusDisplayConfig>;

/**
 * Version action interface
 */
interface VersionAction {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant: 'primary' | 'outline' | 'danger';
    disabled?: boolean;
    tooltip?: string;
}

/**
 * Protocol Management Dashboard - Study-Level Protocol Version Management
 * Separated from Study Design Phase for better user experience and cleaner architecture
 */
const ProtocolManagementDashboard: React.FC = () => {
    const { studyId } = useParams<{ studyId: string }>();
    const navigate = useNavigate();

    // State
    const [study, setStudy] = useState<Study | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
    const [selectedVersionId, setSelectedVersionId] = useState<string | number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Protocol versioning hook
    const {
        protocolVersions,
        currentProtocolVersion,
        loading: versionsLoading,
        error: versionsError,
        loadProtocolVersions,
        createProtocolVersion,
        updateProtocolVersion,
        deleteProtocolVersion,
        submitForReview,
        approveProtocolVersion,
        activateProtocolVersion
    } = useProtocolVersioning(studyId);

    // Load study data
    useEffect(() => {
        const loadStudy = async (): Promise<void> => {
            try {
                setLoading(true);
                const studyData = await StudyService.getStudyById(studyId!);
                setStudy(studyData);
            } catch (err) {
                setError('Failed to load study');
                console.error('Error loading study:', err);
            } finally {
                setLoading(false);
            }
        };

        if (studyId) {
            loadStudy();
        }
    }, [studyId]);

    // Get status display configuration
    const getStatusDisplay = (status: string): StatusDisplayConfig => {
        const statusConfig: StatusDisplayConfigMap = {
            'DRAFT': {
                icon: FileText,
                color: 'text-gray-600',
                bgColor: 'bg-gray-100',
                label: 'Initial Draft'
            },
            'UNDER_REVIEW': {
                icon: Clock,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100',
                label: 'Submitted for Review'
            },
            'AMENDMENT_REVIEW': {
                icon: Clock,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100',
                label: 'Pending Approval'
            },
            'APPROVED': {
                icon: CheckCircle,
                color: 'text-green-600',
                bgColor: 'bg-green-100',
                label: 'Approved'
            },
            'ACTIVE': {
                icon: CheckCircle,
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-100',
                label: 'Active'
            },
            'SUPERSEDED': {
                icon: GitBranch,
                color: 'text-orange-600',
                bgColor: 'bg-orange-100',
                label: 'Superseded'
            },
            'WITHDRAWN': {
                icon: AlertTriangle,
                color: 'text-red-600',
                bgColor: 'bg-red-100',
                label: 'Withdrawn'
            }
        };
        return statusConfig[status] || statusConfig['DRAFT'];
    };

    // Get available actions for a version
    const getVersionActions = (version: ProtocolVersion): VersionAction[] => {
        const actions: VersionAction[] = [];

        // Always available
        actions.push({
            label: 'View',
            icon: Eye,
            onClick: () => handleViewVersion(version.id!),
            variant: 'outline'
        });

        // Status-specific actions
        switch (version.status) {
            case 'DRAFT':
                actions.push(
                    {
                        label: 'Edit',
                        icon: Edit,
                        onClick: () => handleEditVersion(version.id!),
                        variant: 'outline'
                    },
                    {
                        label: 'Submit for Review',
                        icon: Upload,
                        onClick: () => handleSubmitForReview(version.id!),
                        variant: 'primary'
                    }
                );
                break;

            case 'UNDER_REVIEW':
                // Protocol submitted for review - can be approved
                actions.push({
                    label: 'Approve',
                    icon: CheckCircle,
                    onClick: () => handleApproveVersion(version.id!),
                    variant: 'primary'
                });
                break;

            case 'AMENDMENT_REVIEW':
                // Amendment under review - can be approved
                actions.push({
                    label: 'Approve',
                    icon: CheckCircle,
                    onClick: () => handleApproveVersion(version.id!),
                    variant: 'primary'
                });
                break;

            case 'APPROVED':
                // Protocol version lifecycle is independent of study lifecycle
                // When protocol is APPROVED, it can be activated at any time
                actions.push({
                    label: 'Activate',
                    icon: CheckCircle,
                    onClick: () => handleActivateVersion(version.id!),
                    variant: 'primary'
                });
                break;

            case 'ACTIVE':
                actions.push({
                    label: 'Create Amendment',
                    icon: GitBranch,
                    onClick: () => handleCreateAmendment(version.id!),
                    variant: 'primary'
                });
                break;
        }

        // Deletable if draft
        if (version.status === 'DRAFT') {
            actions.push({
                label: 'Delete',
                icon: Trash2,
                onClick: () => handleDeleteVersion(version.id!),
                variant: 'danger'
            });
        }

        return actions;
    };

    // Action handlers
    const handleCreateVersion = (): void => {
        setSelectedVersionId(null);
        setShowVersionModal(true);
    };

    const handleViewVersion = (versionId: string | number): void => {
        setSelectedVersionId(versionId);
        setShowVersionModal(true);
    };

    const handleEditVersion = (versionId: string | number): void => {
        setSelectedVersionId(versionId);
        setShowVersionModal(true);
    };

    const handleSubmitForReview = async (versionId: string | number): Promise<void> => {
        try {
            await submitForReview(versionId);
        } catch (error) {
            console.error('Error submitting for review:', error);
        }
    };

    const handleApproveVersion = async (versionId: string | number): Promise<void> => {
        try {
            await approveProtocolVersion(versionId);
        } catch (error) {
            console.error('Error approving version:', error);
        }
    };

    const handleActivateVersion = async (versionId: string | number): Promise<void> => {
        try {
            await activateProtocolVersion(versionId);
        } catch (error) {
            console.error('Error activating version:', error);
        }
    };

    const handleCreateAmendment = (parentVersionId: string | number): void => {
        setSelectedVersionId(parentVersionId);
        setShowVersionModal(true);
    };

    const handleDeleteVersion = async (versionId: string | number): Promise<void> => {
        if (window.confirm('Are you sure you want to delete this protocol version?')) {
            try {
                await deleteProtocolVersion(versionId);
            } catch (error) {
                console.error('Error deleting version:', error);
            }
        }
    };

    const handleBackToStudy = (): void => {
        navigate(`/study-design/study/${studyId}`);
    };

    if (loading || versionsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading protocol management...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Study</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/study-design/studies')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Studies
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={handleBackToStudy}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Protocol Management</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {study?.name || 'Loading...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleCreateVersion}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Protocol Version
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            <p className="text-green-800 font-medium">{successMessage}</p>
                            <button
                                onClick={() => setSuccessMessage(null)}
                                className="ml-auto text-green-600 hover:text-green-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Versions</p>
                                <p className="text-2xl font-bold text-gray-900">{protocolVersions.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Active Versions</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {protocolVersions.filter(v => v.status === 'ACTIVE').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">In Review</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {protocolVersions.filter(v => v.status === 'UNDER_REVIEW' || v.status === 'AMENDMENT_REVIEW').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-8 w-8 text-gray-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Drafts</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {protocolVersions.filter(v => v.status === 'DRAFT').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Protocol Versions List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Protocol Versions</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage all protocol versions and amendments for this study
                        </p>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {protocolVersions.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Protocol Versions</h3>
                                <p className="text-gray-600 mb-4">
                                    Create your first protocol version to begin managing protocol documentation and amendments.
                                </p>
                                <button
                                    onClick={handleCreateVersion}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Initial Protocol Version
                                </button>
                            </div>
                        ) : (
                            protocolVersions.map((version) => {
                                const statusDisplay = getStatusDisplay(version.status || 'DRAFT');
                                const StatusIcon = statusDisplay.icon;
                                const actions = getVersionActions(version);

                                return (
                                    <div key={version.id} className="px-6 py-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${statusDisplay.bgColor}`}>
                                                    <StatusIcon className={`h-5 w-5 ${statusDisplay.color}`} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        Protocol {version.versionNumber}
                                                        {version.status === 'ACTIVE' && (
                                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                Active
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">{version.description}</p>
                                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                        <span>Status: {statusDisplay.label}</span>
                                                        <span>•</span>
                                                        <span>Created: {version.createdDate ? new Date(version.createdDate).toLocaleDateString() : 'N/A'}</span>
                                                        {version.amendmentType && (
                                                            <>
                                                                <span>•</span>
                                                                <span>Type: {version.amendmentType}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {actions.map((action, index) => {
                                                    const ActionIcon = action.icon;
                                                    const baseClasses = "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed";
                                                    const variantClasses: Record<'primary' | 'outline' | 'danger', string> = {
                                                        primary: "text-white bg-blue-600 hover:bg-blue-700",
                                                        outline: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
                                                        danger: "text-red-700 bg-white border border-red-300 hover:bg-red-50"
                                                    };

                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={action.onClick}
                                                            disabled={action.disabled}
                                                            className={`${baseClasses} ${variantClasses[action.variant] || variantClasses.outline}`}
                                                            title={action.tooltip || action.label}
                                                        >
                                                            <ActionIcon className="h-4 w-4 mr-1.5" />
                                                            {action.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {versionsError && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                            <p className="text-red-700">Error loading protocol versions: {versionsError}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Protocol Version Management Modal */}
            <ProtocolVersionManagementModal
                isOpen={showVersionModal}
                studyId={studyId}
                studyName={study?.name}
                studyStatus={study?.status}
                initialVersionId={selectedVersionId}
                onClose={() => {
                    setShowVersionModal(false);
                    setSelectedVersionId(null);
                }}
                onVersionCreated={async (newVersion: ProtocolVersion) => {
                    // Reload protocol versions
                    await loadProtocolVersions();
                    // Show success message
                    setSuccessMessage(`Protocol version ${newVersion?.versionNumber || ''} created successfully`);
                    setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds
                }}
                onVersionUpdated={async () => {
                    // Reload protocol versions
                    await loadProtocolVersions();
                    // Show success message
                    setSuccessMessage('Protocol version updated successfully');
                    setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds
                }}
            />
        </div>
    );
};

export default ProtocolManagementDashboard;
