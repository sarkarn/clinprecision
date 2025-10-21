import React, { useState, useEffect } from 'react';
import {
    X,
    FileText,
    Plus,
    Edit2,
    Eye,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react';

import ProtocolVersionForm from './ProtocolVersionForm';
import ProtocolVersionTimeline from './ProtocolVersionTimeline';
import ProtocolVersionActions from './ProtocolVersionActions';
import useProtocolVersioning from '../../hooks/useProtocolVersioning';

/**
 * Protocol Version Management Modal Component
 * Main interface for managing protocol versions
 */
const ProtocolVersionManagementModal = ({
    isOpen,
    onClose,
    studyId,
    studyName = '',
    studyStatus = null,
    mode = 'manage', // 'manage' | 'create' | 'edit' | 'view'
    initialVersionId = null,
    onVersionCreated,
    onVersionUpdated
}) => {
    // Protocol versioning hook
    const {
        protocolVersions,
        currentProtocolVersion,
        loading,
        error,
        PROTOCOL_VERSION_STATUS,
        AMENDMENT_TYPES,
        createProtocolVersion,
        updateProtocolVersion,
        deleteProtocolVersion,
        submitForReview,
        approveProtocolVersion,
        activateProtocolVersion,
        generateNextVersionNumber,
        canPerformAction,
        getActiveVersion,
        clearError
    } = useProtocolVersioning(studyId);

    // Local state
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'create' | 'edit' | 'timeline'
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [formMode, setFormMode] = useState('create');
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [versionToDelete, setVersionToDelete] = useState(null);

    // Initialize selected version
    useEffect(() => {
        if (initialVersionId && protocolVersions.length > 0) {
            const version = protocolVersions.find(v => v.id === initialVersionId);
            setSelectedVersion(version || currentProtocolVersion);
        } else {
            setSelectedVersion(currentProtocolVersion);
        }
    }, [initialVersionId, protocolVersions, currentProtocolVersion]);

    // Set initial tab based on mode
    useEffect(() => {
        switch (mode) {
            case 'create':
                setActiveTab('create');
                setFormMode('create');
                break;
            case 'edit':
                setActiveTab('edit');
                setFormMode('edit');
                break;
            case 'view':
                setActiveTab('overview');
                break;
            default:
                setActiveTab('overview');
                break;
        }
    }, [mode]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        clearError();
    };

    // Handle version creation
    const handleCreateVersion = async (formData) => {
        try {
            const newVersion = await createProtocolVersion(formData);
            // Call the callback and wait for parent to refresh data
            if (onVersionCreated) {
                await onVersionCreated(newVersion);
            }
            // Close modal after parent has refreshed
            onClose();
        } catch (error) {
            console.error('Error creating version:', error);
            // Error is already handled by the hook and displayed in UI
        }
    };

    // Handle version update
    const handleUpdateVersion = async (formData) => {
        if (!selectedVersion) return;

        try {
            await updateProtocolVersion(selectedVersion.id, formData);
            // Call the callback and wait for parent to refresh data
            if (onVersionUpdated) {
                await onVersionUpdated(selectedVersion.id);
            }
            // Close modal after parent has refreshed
            onClose();
        } catch (error) {
            console.error('Error updating version:', error);
            // Error is already handled by the hook and displayed in UI
        }
    };

    // Handle version actions
    const handleEditVersion = (versionId) => {
        const version = protocolVersions.find(v => v.id === versionId);
        if (version) {
            setSelectedVersion(version);
            setFormMode('edit');
            setActiveTab('edit');
        }
    };

    const handleDeleteVersion = (versionId) => {
        const version = protocolVersions.find(v => v.id === versionId);
        if (version) {
            setVersionToDelete(version);
            setShowConfirmDelete(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (versionToDelete) {
            try {
                await deleteProtocolVersion(versionToDelete.id);
                setShowConfirmDelete(false);
                setVersionToDelete(null);
                if (selectedVersion?.id === versionToDelete.id) {
                    setSelectedVersion(currentProtocolVersion);
                }
            } catch (error) {
                console.error('Error deleting version:', error);
            }
        }
    };

    const handleSubmitForReview = async (versionId) => {
        try {
            await submitForReview(versionId);
            // Close modal after successful submission
            onClose();
        } catch (error) {
            console.error('Error submitting for review:', error);
        }
    };

    const handleApproveVersion = async (versionId) => {
        try {
            await approveProtocolVersion(versionId);
            // Close modal after successful approval
            onClose();
        } catch (error) {
            console.error('Error approving version:', error);
        }
    };

    const handleActivateVersion = async (versionId) => {
        try {
            await activateProtocolVersion(versionId);
            // Close modal after successful activation
            onClose();
        } catch (error) {
            console.error('Error activating version:', error);
        }
    };

    const handleVersionSelect = (version) => {
        setSelectedVersion(version);
    };

    // Get tabs configuration
    const getTabs = () => {
        const tabs = [
            { key: 'overview', label: 'Overview', icon: Eye },
            { key: 'timeline', label: 'Version History', icon: FileText },
            { key: 'create', label: 'Create New', icon: Plus }
        ];

        // Add edit tab if version is selected and editable
        if (selectedVersion && canPerformAction(selectedVersion, 'edit')) {
            tabs.splice(2, 0, { key: 'edit', label: 'Edit Version', icon: Edit2 });
        }

        return tabs;
    };

    if (!isOpen) return null;

    const isInitialVersion = protocolVersions.length === 0;
    const activeVersion = getActiveVersion();

    return (
        <>
            {/* Modal Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Protocol Version Management
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {studyName && `Study: ${studyName}`}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="text-red-800">{error}</span>
                            <button
                                onClick={clearError}
                                className="ml-auto text-red-600 hover:text-red-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-col h-[calc(90vh-120px)]">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            {getTabs().map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-auto">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="p-6">
                                    {protocolVersions.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                No Protocol Versions
                                            </h3>
                                            <p className="text-gray-600 mb-6">
                                                Create the initial protocol version to get started.
                                            </p>
                                            <button
                                                onClick={() => handleTabChange('create')}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Create Initial Version
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Current Version Summary */}
                                            {selectedVersion && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                                Protocol {selectedVersion.versionNumber}
                                                                {selectedVersion.status === 'ACTIVE' && (
                                                                    <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </h3>
                                                            <p className="text-gray-700">
                                                                {selectedVersion.description}
                                                            </p>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${selectedVersion.statusInfo?.color || 'bg-gray-100 text-gray-700'}`}>
                                                            {selectedVersion.statusInfo?.label || selectedVersion.status}
                                                        </div>
                                                    </div>

                                                    <ProtocolVersionActions
                                                        version={selectedVersion}
                                                        studyStatus={studyStatus}
                                                        onEdit={handleEditVersion}
                                                        onSubmitReview={handleSubmitForReview}
                                                        onApprove={handleApproveVersion}
                                                        onActivate={handleActivateVersion}
                                                        onDelete={handleDeleteVersion}
                                                        onView={() => { }}
                                                        canEdit={true}
                                                        canApprove={true}
                                                        canActivate={true}
                                                        loading={loading}
                                                    />

                                                    {/* Workflow guidance message */}
                                                    {selectedVersion.status === 'APPROVED' && (
                                                        <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-sm font-medium text-blue-900 mb-1">
                                                                    Ready to Activate
                                                                </p>
                                                                <p className="text-sm text-blue-700">
                                                                    This protocol version has been approved. Click <strong>Activate</strong> to make it the active protocol.
                                                                    Note: At least one active protocol is required before you can approve the study in the <strong>Publish Study</strong> phase.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Statistics */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                        <span className="text-sm font-medium text-gray-600">Total Versions</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900 mt-2">
                                                        {protocolVersions.length}
                                                    </div>
                                                </div>

                                                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                        <span className="text-sm font-medium text-gray-600">Active Version</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900 mt-2">
                                                        {activeVersion?.versionNumber || 'None'}
                                                    </div>
                                                </div>

                                                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-5 w-5 text-yellow-600" />
                                                        <span className="text-sm font-medium text-gray-600">Draft Versions</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900 mt-2">
                                                        {protocolVersions.filter(v => v.status === 'DRAFT').length}
                                                    </div>
                                                </div>

                                                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Info className="h-5 w-5 text-orange-600" />
                                                        <span className="text-sm font-medium text-gray-600">In Review</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900 mt-2">
                                                        {protocolVersions.filter(v => v.status === 'PROTOCOL_REVIEW').length}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recent Versions */}
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900 mb-4">
                                                    Recent Versions
                                                </h4>
                                                <ProtocolVersionTimeline
                                                    versions={protocolVersions.slice(0, 3)}
                                                    currentVersionId={selectedVersion?.id}
                                                    onVersionSelect={handleVersionSelect}
                                                    compact={true}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Timeline Tab */}
                            {activeTab === 'timeline' && (
                                <div className="p-6">
                                    <ProtocolVersionTimeline
                                        versions={protocolVersions}
                                        currentVersionId={selectedVersion?.id}
                                        onVersionSelect={handleVersionSelect}
                                    />
                                </div>
                            )}

                            {/* Create Tab */}
                            {activeTab === 'create' && (
                                <div className="p-6">
                                    <ProtocolVersionForm
                                        mode="create"
                                        onSubmit={handleCreateVersion}
                                        onCancel={() => handleTabChange('overview')}
                                        suggestedVersionNumber={generateNextVersionNumber()}
                                        amendmentTypes={Object.values(AMENDMENT_TYPES)}
                                        loading={loading}
                                        isInitialVersion={isInitialVersion}
                                    />
                                </div>
                            )}

                            {/* Edit Tab */}
                            {activeTab === 'edit' && selectedVersion && (
                                <div className="p-6">
                                    <ProtocolVersionForm
                                        mode="edit"
                                        initialData={selectedVersion}
                                        onSubmit={handleUpdateVersion}
                                        onCancel={() => handleTabChange('overview')}
                                        amendmentTypes={Object.values(AMENDMENT_TYPES)}
                                        loading={loading}
                                        isInitialVersion={selectedVersion.amendmentType === 'MINOR' && protocolVersions.length <= 1}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showConfirmDelete && versionToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Delete Protocol Version
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete Protocol Version {versionToDelete.versionNumber}?
                                This will permanently remove the version and all associated data.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirmDelete(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {loading ? 'Deleting...' : 'Delete Version'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProtocolVersionManagementModal;