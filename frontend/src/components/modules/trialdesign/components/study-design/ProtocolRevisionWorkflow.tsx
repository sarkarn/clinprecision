import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, Clock, FileText, Users, CheckCircle, AlertTriangle, Plus, Edit, Eye, ArrowRight, GitCompare, Settings, Activity } from 'lucide-react';
import { Alert, Button } from '../components/UIComponents';
import EnhancedVersionManager from '../components/EnhancedVersionManager';
import VersionComparisonTool from '../components/VersionComparisonTool';
import ApprovalWorkflowInterface from '../components/ApprovalWorkflowInterface';

// Type definitions
interface ProposedChange {
    section: string;
    type?: string;
    description: string;
    justification: string;
    impactLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface StudyData {
    id: string | number;
    name: string;
    currentVersion: string;
    state: string;
    lastPublished: string;
    nextVersionNumber: string;
    subjectsEnrolled?: number;
}

interface ProtocolVersion {
    id: string;
    version: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
    type: string;
    title: string;
    summary: string;
    createdBy: string;
    createdDate: string;
    approvedDate: string;
    publishedDate: string;
    subjectsEnrolled: number;
    changes: ProposedChange[];
}

interface PendingRevision {
    id: string;
    title: string;
    type: string;
    status: string;
    description: string;
    requestedBy: string;
    requestedDate: string;
    targetVersion: string;
    estimatedImpact: string;
    proposedChanges: ProposedChange[];
}

interface PendingRevisionsProps {
    revisions: PendingRevision[];
    onSubmit: (revisionId: string) => Promise<void>;
    onApprove: (revisionId: string) => Promise<void>;
    onView: (revision: PendingRevision) => void;
}

interface VersionHistoryProps {
    versions: ProtocolVersion[];
    selectedVersion: ProtocolVersion | null;
    onSelectVersion: (version: ProtocolVersion) => void;
    getVersionStatusColor: (status: string) => string;
    getRevisionTypeColor: (type: string) => string;
}

interface VersionDetailsProps {
    version: ProtocolVersion;
    getRevisionTypeColor: (type: string) => string;
    getVersionStatusColor: (status: string) => string;
}

interface RevisionDetailsPanelProps {
    revision: PendingRevision;
    onClose: () => void;
    onSubmit: (revisionId: string) => Promise<void>;
    onApprove: (revisionId: string) => Promise<void>;
    getRevisionTypeColor: (type: string) => string;
}

interface CreateRevisionModalProps {
    onClose: () => void;
    onCreate: (revisionData: RevisionFormData) => Promise<void>;
    nextVersion: string;
    onTypeChange: (type: string) => void;
}

interface RevisionFormData {
    title: string;
    type: string;
    description: string;
    estimatedImpact: string;
    proposedChanges: ProposedChange[];
}

interface RevisionType {
    value: string;
    label: string;
    description: string;
}

interface ImpactLevel {
    value: string;
    label: string;
}

interface CurrentUser {
    name: string;
    role: string;
}

/**
 * Protocol Revision Workflow Component
 * Manages study protocol amendments and versioning
 */
const ProtocolRevisionWorkflow: React.FC = () => {
    const { studyId } = useParams<{ studyId: string }>();
    const navigate = useNavigate();

    // State management
    const [study, setStudy] = useState<StudyData | null>(null);
    const [versions, setVersions] = useState<ProtocolVersion[]>([]);
    const [pendingRevisions, setPendingRevisions] = useState<PendingRevision[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<ProtocolVersion | null>(null);
    const [activeRevision, setActiveRevision] = useState<PendingRevision | null>(null);
    const [revisionType, setRevisionType] = useState<string>('AMENDMENT');
    const [showCreateRevision, setShowCreateRevision] = useState(false);
    const [showVersionComparison, setShowVersionComparison] = useState(false);
    const [showApprovalWorkflow, setShowApprovalWorkflow] = useState(false);
    const [selectedVersionsForComparison, setSelectedVersionsForComparison] = useState<ProtocolVersion[]>([]);
    const [viewMode, setViewMode] = useState<'enhanced' | 'classic'>('enhanced');
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);

    // Load study data
    useEffect(() => {
        loadStudyData();
    }, [studyId]);

    const loadStudyData = async () => {
        try {
            setLoading(true);

            // Mock data - replace with actual API call
            const mockData = {
                study: {
                    id: studyId || '',
                    name: 'Phase III Oncology Trial - Advanced NSCLC',
                    currentVersion: '2.1',
                    state: 'PUBLISHED',
                    lastPublished: '2024-01-15T10:30:00Z',
                    nextVersionNumber: '2.2'
                },
                versions: [
                    {
                        id: 'V1.0',
                        version: '1.0',
                        status: 'ARCHIVED' as const,
                        type: 'ORIGINAL',
                        title: 'Initial Protocol',
                        summary: 'Original study protocol',
                        createdBy: 'Dr. Sarah Johnson',
                        createdDate: '2023-06-01T09:00:00Z',
                        approvedDate: '2023-06-15T14:30:00Z',
                        publishedDate: '2023-07-01T08:00:00Z',
                        subjectsEnrolled: 45,
                        changes: []
                    },
                    {
                        id: 'V1.1',
                        version: '1.1',
                        status: 'ARCHIVED' as const,
                        type: 'ADMINISTRATIVE_CHANGE',
                        title: 'Administrative Update',
                        summary: 'Updated contact information and minor text corrections',
                        createdBy: 'Dr. Michael Chen',
                        createdDate: '2023-08-15T11:20:00Z',
                        approvedDate: '2023-08-20T16:45:00Z',
                        publishedDate: '2023-08-25T09:30:00Z',
                        subjectsEnrolled: 78,
                        changes: [
                            {
                                section: 'Contact Information',
                                type: 'ADMINISTRATIVE',
                                description: 'Updated principal investigator contact details',
                                justification: 'PI office relocation'
                            },
                            {
                                section: 'Study Sites',
                                type: 'ADMINISTRATIVE',
                                description: 'Added two new study sites',
                                justification: 'Enhance recruitment'
                            }
                        ]
                    },
                    {
                        id: 'V2.0',
                        version: '2.0',
                        status: 'ARCHIVED' as const,
                        type: 'SUBSTANTIAL_AMENDMENT',
                        title: 'Major Protocol Amendment',
                        summary: 'Modified primary endpoint and added biomarker substudy',
                        createdBy: 'Dr. Sarah Johnson',
                        createdDate: '2023-10-01T14:15:00Z',
                        approvedDate: '2023-11-15T10:20:00Z',
                        publishedDate: '2023-12-01T12:00:00Z',
                        subjectsEnrolled: 156,
                        changes: [
                            {
                                section: 'Primary Endpoint',
                                type: 'SUBSTANTIAL',
                                description: 'Changed from overall survival to progression-free survival',
                                justification: 'Updated FDA guidance and interim analysis results',
                                impactLevel: 'HIGH' as const
                            },
                            {
                                section: 'Study Procedures',
                                type: 'SUBSTANTIAL',
                                description: 'Added mandatory tumor biopsy at baseline and progression',
                                justification: 'Biomarker analysis for personalized medicine',
                                impactLevel: 'MEDIUM' as const
                            },
                            {
                                section: 'Inclusion Criteria',
                                type: 'SUBSTANTIAL',
                                description: 'Modified ECOG performance status requirement',
                                justification: 'Broaden eligible patient population',
                                impactLevel: 'MEDIUM' as const
                            }
                        ]
                    },
                    {
                        id: 'V2.1',
                        version: '2.1',
                        status: 'ACTIVE' as const,
                        type: 'MINOR_AMENDMENT',
                        title: 'Safety Update',
                        summary: 'Updated safety monitoring procedures based on DSMB recommendations',
                        createdBy: 'Dr. Lisa Rodriguez',
                        createdDate: '2024-01-05T09:45:00Z',
                        approvedDate: '2024-01-12T15:30:00Z',
                        publishedDate: '2024-01-15T10:30:00Z',
                        subjectsEnrolled: 267,
                        changes: [
                            {
                                section: 'Safety Monitoring',
                                type: 'MINOR',
                                description: 'Increased frequency of liver function monitoring',
                                justification: 'DSMB recommendation following safety review',
                                impactLevel: 'LOW' as const
                            },
                            {
                                section: 'Adverse Event Reporting',
                                type: 'MINOR',
                                description: 'Updated expedited reporting criteria',
                                justification: 'Align with updated regulatory guidance',
                                impactLevel: 'LOW' as const
                            }
                        ]
                    }
                ],
                pendingRevisions: [
                    {
                        id: 'REV001',
                        title: 'Efficacy Endpoint Modification',
                        type: 'SUBSTANTIAL_AMENDMENT',
                        status: 'DRAFT',
                        description: 'Propose addition of quality of life as co-primary endpoint',
                        requestedBy: 'Dr. Sarah Johnson',
                        requestedDate: '2024-01-20T11:15:00Z',
                        targetVersion: '3.0',
                        estimatedImpact: 'HIGH',
                        proposedChanges: [
                            {
                                section: 'Primary Endpoints',
                                description: 'Add quality of life (EORTC QLQ-C30) as co-primary endpoint',
                                justification: 'Patient advocacy group feedback and regulatory guidance'
                            },
                            {
                                section: 'Statistical Analysis',
                                description: 'Update sample size calculation for dual primary endpoints',
                                justification: 'Ensure adequate power for both endpoints'
                            }
                        ]
                    }
                ]
            };

            setStudy(mockData.study);
            setVersions(mockData.versions);
            setPendingRevisions(mockData.pendingRevisions);
            setSelectedVersion(mockData.versions.find(v => v.status === 'ACTIVE') || null);
            setLoading(false);
        } catch (error: unknown) {
            console.error('Error loading protocol versions:', error);
            setErrors(['Failed to load protocol revision data']);
            setLoading(false);
        }
    };

    // Create new revision
    const handleCreateRevision = async (revisionData: RevisionFormData) => {
        try {
            const newRevision: PendingRevision = {
                id: `REV${String(pendingRevisions.length + 1).padStart(3, '0')}`,
                ...revisionData,
                status: 'DRAFT',
                requestedBy: 'Current User', // Replace with actual user
                requestedDate: new Date().toISOString(),
                targetVersion: getNextVersionNumber(revisionData.type)
            };

            setPendingRevisions([...pendingRevisions, newRevision]);
            setActiveRevision(newRevision);
            setShowCreateRevision(false);
        } catch (error: unknown) {
            console.error('Error creating revision:', error);
            setErrors(['Failed to create revision']);
        }
    };

    // Get next version number based on revision type
    const getNextVersionNumber = (type: string): string => {
        const currentVersion = study?.currentVersion || '1.0';
        const [major, minor] = currentVersion.split('.').map(Number);

        switch (type) {
            case 'SUBSTANTIAL_AMENDMENT':
                return `${major + 1}.0`;
            case 'MINOR_AMENDMENT':
            case 'ADMINISTRATIVE_CHANGE':
                return `${major}.${minor + 1}`;
            default:
                return `${major}.${minor + 1}`;
        }
    };

    // Submit revision for approval
    const handleSubmitRevision = async (revisionId: string) => {
        try {
            const updatedRevisions = pendingRevisions.map(rev =>
                rev.id === revisionId ? { ...rev, status: 'PROTOCOL_REVIEW' } : rev
            );
            setPendingRevisions(updatedRevisions);
        } catch (error: unknown) {
            console.error('Error submitting revision:', error);
            setErrors(['Failed to submit revision']);
        }
    };

    // Handle version comparison
    const handleCompareVersions = (versionsToCompare: ProtocolVersion[]) => {
        setSelectedVersionsForComparison(versionsToCompare);
        setShowVersionComparison(true);
    };

    // Handle approval workflow actions
    const handleApproveRevision = async (revisionId: string) => {
        try {
            const revision = pendingRevisions.find(r => r.id === revisionId);
            if (!revision) return;

            // Create new version
            const newVersion: ProtocolVersion = {
                id: `V${revision.targetVersion}`,
                version: revision.targetVersion,
                status: 'ACTIVE',
                type: revision.type,
                title: revision.title,
                summary: revision.description,
                createdBy: revision.requestedBy,
                createdDate: revision.requestedDate,
                approvedDate: new Date().toISOString(),
                publishedDate: new Date().toISOString(),
                subjectsEnrolled: (study as any)?.subjectsEnrolled || 0,
                changes: revision.proposedChanges
            };

            // Update current version to archived
            const updatedVersions = versions.map(v =>
                v.status === 'ACTIVE' ? { ...v, status: 'ARCHIVED' as const } : v
            );
            updatedVersions.push(newVersion);

            // Remove from pending revisions
            const updatedRevisions = pendingRevisions.filter(r => r.id !== revisionId);

            setVersions(updatedVersions);
            setPendingRevisions(updatedRevisions);
            setStudy(prev => prev ? { ...prev, currentVersion: revision.targetVersion } : null);
            setSelectedVersion(newVersion);
        } catch (error: unknown) {
            console.error('Error approving revision:', error);
            setErrors(['Failed to approve revision']);
        }
    };

    const handleRejectRevision = async (revisionId: string) => {
        try {
            const updatedRevisions = pendingRevisions.map(rev =>
                rev.id === revisionId ? { ...rev, status: 'REJECTED' } : rev
            );
            setPendingRevisions(updatedRevisions);
        } catch (error: unknown) {
            console.error('Error rejecting revision:', error);
            setErrors(['Failed to reject revision']);
        }
    };

    const handleRequestChanges = async (revisionId: string) => {
        try {
            const updatedRevisions = pendingRevisions.map(rev =>
                rev.id === revisionId ? { ...rev, status: 'CHANGES_REQUESTED' } : rev
            );
            setPendingRevisions(updatedRevisions);
        } catch (error: unknown) {
            console.error('Error requesting changes:', error);
            setErrors(['Failed to request changes']);
        }
    };

    const handleAddComment = async (revisionId: string, comment: string) => {
        try {
            // In real implementation, this would make an API call
            console.log('Adding comment to revision:', revisionId, comment);
        } catch (error: unknown) {
            console.error('Error adding comment:', error);
            setErrors(['Failed to add comment']);
        }
    };

    // Get version status color
    const getVersionStatusColor = (status: string): string => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'ARCHIVED':
                return 'bg-gray-100 text-gray-800';
            case 'DRAFT':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get revision type color
    const getRevisionTypeColor = (type: string): string => {
        switch (type) {
            case 'SUBSTANTIAL_AMENDMENT':
                return 'bg-red-100 text-red-800';
            case 'MINOR_AMENDMENT':
                return 'bg-yellow-100 text-yellow-800';
            case 'ADMINISTRATIVE_CHANGE':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading protocol revisions...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Protocol Revisions</h1>
                        <p className="text-gray-600 mt-1">
                            Manage protocol amendments and versioning for {study?.name}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* View Mode Toggle */}
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">View:</label>
                            <select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value as 'enhanced' | 'classic')}
                                className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="enhanced">Enhanced</option>
                                <option value="classic">Classic</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <Button
                            variant="outline"
                            onClick={() => setShowApprovalWorkflow(true)}
                            disabled={pendingRevisions.length === 0}
                        >
                            <Activity className="h-4 w-4 mr-2" />
                            Workflow
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowVersionComparison(true)}
                            disabled={versions.length < 2}
                        >
                            <GitCompare className="h-4 w-4 mr-2" />
                            Compare
                        </Button>
                        <Button
                            onClick={() => setShowCreateRevision(true)}
                            variant="primary"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Revision
                        </Button>
                    </div>
                </div>

                {/* Current Version Info */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center">
                            <GitBranch className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-900">Current Version</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900 mt-1">v{study?.currentVersion}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-900">Total Versions</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900 mt-1">{versions.length}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center">
                            <FileText className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-900">Pending Revisions</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900 mt-1">{pendingRevisions.length}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-center">
                            <Users className="h-5 w-5 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-900">Subjects Enrolled</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-900 mt-1">
                            {selectedVersion?.subjectsEnrolled || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <Alert
                    type="error"
                    title="Error"
                    message={errors[0]}
                    onClose={() => setErrors([])}
                />
            )}

            {/* Enhanced or Classic View */}
            {viewMode === 'enhanced' ? (
                <EnhancedVersionManager
                    versions={versions as any}
                    selectedVersion={selectedVersion as any}
                    onSelectVersion={setSelectedVersion as any}
                    onCompareVersions={handleCompareVersions as any}
                    currentVersion={study?.currentVersion}
                    pendingRevisions={pendingRevisions as any}
                />
            ) : (
                <div className="space-y-6">
                    {/* Classic view - existing implementation */}
                    {/* Pending Revisions */}
                    {pendingRevisions.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Pending Revisions</h3>
                            </div>
                            <PendingRevisions
                                revisions={pendingRevisions}
                                onSubmit={handleSubmitRevision}
                                onApprove={handleApproveRevision}
                                onView={setActiveRevision}
                            />
                        </div>
                    )}

                    {/* Version History */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Version List */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Version History</h3>
                            </div>
                            <VersionHistory
                                versions={versions}
                                selectedVersion={selectedVersion}
                                onSelectVersion={setSelectedVersion}
                                getVersionStatusColor={getVersionStatusColor}
                                getRevisionTypeColor={getRevisionTypeColor}
                            />
                        </div>

                        {/* Version Details */}
                        <div className="bg-white rounded-lg shadow">
                            {selectedVersion ? (
                                <VersionDetails
                                    version={selectedVersion}
                                    getRevisionTypeColor={getRevisionTypeColor}
                                    getVersionStatusColor={getVersionStatusColor}
                                />
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Version</h3>
                                    <p>Choose a version from the history to view its details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Active Revision Details */}
            {activeRevision && (
                <RevisionDetailsPanel
                    revision={activeRevision}
                    onClose={() => setActiveRevision(null)}
                    onSubmit={handleSubmitRevision}
                    onApprove={handleApproveRevision}
                    getRevisionTypeColor={getRevisionTypeColor}
                />
            )}

            {/* Create Revision Modal */}
            {showCreateRevision && (
                <CreateRevisionModal
                    onClose={() => setShowCreateRevision(false)}
                    onCreate={handleCreateRevision}
                    nextVersion={getNextVersionNumber(revisionType)}
                    onTypeChange={setRevisionType}
                />
            )}

            {/* Version Comparison Tool */}
            <VersionComparisonTool
                versions={versions as any}
                selectedVersions={selectedVersionsForComparison as any}
                onVersionSelect={setSelectedVersionsForComparison as any}
                isVisible={showVersionComparison}
                onClose={() => {
                    setShowVersionComparison(false);
                    setSelectedVersionsForComparison([]);
                }}
            />

            {/* Approval Workflow Interface */}
            <ApprovalWorkflowInterface
                revisions={pendingRevisions as any}
                currentUser={{ name: 'Current User', role: 'Investigator' }}
                onApprove={handleApproveRevision}
                onReject={handleRejectRevision}
                onRequestChanges={handleRequestChanges}
                onAddComment={handleAddComment as any}
                isVisible={showApprovalWorkflow}
                onClose={() => setShowApprovalWorkflow(false)}
            />
        </div>
    );
};

// Pending Revisions Component
const PendingRevisions: React.FC<PendingRevisionsProps> = ({ revisions, onSubmit, onApprove, onView }) => {
    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'DRAFT':
                return 'bg-blue-100 text-blue-800';
            case 'PROTOCOL_REVIEW':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="divide-y divide-gray-200">
            {revisions.map((revision) => (
                <div key={revision.id} className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3">
                                <h4 className="text-lg font-medium text-gray-900">{revision.title}</h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(revision.status)}`}>
                                    {revision.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-gray-600 mt-1">{revision.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>Target: v{revision.targetVersion}</span>
                                <span>•</span>
                                <span>Requested by {revision.requestedBy}</span>
                                <span>•</span>
                                <span>{new Date(revision.requestedDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => onView(revision)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                            {revision.status === 'DRAFT' && (
                                <Button size="sm" onClick={() => onSubmit(revision.id)}>
                                    Submit
                                </Button>
                            )}
                            {revision.status === 'PROTOCOL_REVIEW' && (
                                <Button
                                    size="sm"
                                    onClick={() => onApprove(revision.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Version History Component
const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, selectedVersion, onSelectVersion, getVersionStatusColor, getRevisionTypeColor }) => {
    return (
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {versions.map((version) => (
                <div
                    key={version.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedVersion?.id === version.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                    onClick={() => onSelectVersion(version)}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">Version {version.version}</h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVersionStatusColor(version.status)}`}>
                                    {version.status}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRevisionTypeColor(version.type)}`}>
                                    {version.type.replace('_', ' ')}
                                </span>
                            </div>
                            <h5 className="text-sm font-medium text-gray-700 mt-1">{version.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{version.summary}</p>
                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                <span>Published: {new Date(version.publishedDate).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{version.subjectsEnrolled} subjects</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Version Details Component
const VersionDetails: React.FC<VersionDetailsProps> = ({ version, getRevisionTypeColor, getVersionStatusColor }) => {
    return (
        <div className="p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">Version {version.version}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVersionStatusColor(version.status)}`}>
                        {version.status}
                    </span>
                </div>
                <h4 className="text-md font-medium text-gray-700">{version.title}</h4>
                <p className="text-gray-600 mt-1">{version.summary}</p>
            </div>

            {/* Timeline */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                    <div className="w-20 text-gray-500">Created:</div>
                    <div className="text-gray-900">{new Date(version.createdDate).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center text-sm">
                    <div className="w-20 text-gray-500">Approved:</div>
                    <div className="text-gray-900">{new Date(version.approvedDate).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center text-sm">
                    <div className="w-20 text-gray-500">Published:</div>
                    <div className="text-gray-900">{new Date(version.publishedDate).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center text-sm">
                    <div className="w-20 text-gray-500">Subjects:</div>
                    <div className="text-gray-900">{version.subjectsEnrolled} enrolled</div>
                </div>
            </div>

            {/* Changes */}
            {version.changes && version.changes.length > 0 && (
                <div>
                    <h5 className="font-medium text-gray-900 mb-3">Changes in this Version</h5>
                    <div className="space-y-3">
                        {version.changes.map((change, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-medium text-gray-900">{change.section}</h6>
                                    {change.type && (
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRevisionTypeColor(change.type)}`}>
                                            {change.type}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{change.description}</p>
                                <p className="text-sm text-gray-600 italic">{change.justification}</p>
                                {change.impactLevel && (
                                    <div className="mt-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${change.impactLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                                            change.impactLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {change.impactLevel} Impact
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Revision Details Panel Component
const RevisionDetailsPanel: React.FC<RevisionDetailsPanelProps> = ({ revision, onClose, onSubmit, onApprove, getRevisionTypeColor }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{revision.title}</h3>
                    <p className="text-gray-600 mt-1">{revision.description}</p>
                </div>
                <div className="flex space-x-2">
                    {revision.status === 'DRAFT' && (
                        <Button size="sm" onClick={() => onSubmit(revision.id)}>
                            Submit for Review
                        </Button>
                    )}
                    {revision.status === 'PROTOCOL_REVIEW' && (
                        <Button
                            size="sm"
                            onClick={() => onApprove(revision.id)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Approve & Implement
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>

            {/* Proposed Changes */}
            <div>
                <h4 className="font-medium text-gray-900 mb-3">Proposed Changes</h4>
                <div className="space-y-3">
                    {revision.proposedChanges?.map((change, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">{change.section}</h5>
                            <p className="text-sm text-gray-700 mb-2">{change.description}</p>
                            <p className="text-sm text-gray-600 italic">{change.justification}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Create Revision Modal Component
const CreateRevisionModal: React.FC<CreateRevisionModalProps> = ({ onClose, onCreate, nextVersion, onTypeChange }) => {
    const [formData, setFormData] = useState<RevisionFormData>({
        title: '',
        type: 'MINOR_AMENDMENT',
        description: '',
        estimatedImpact: 'LOW',
        proposedChanges: [{ section: '', description: '', justification: '' }]
    });

    const revisionTypes: RevisionType[] = [
        { value: 'ADMINISTRATIVE_CHANGE', label: 'Administrative Change', description: 'Minor administrative updates' },
        { value: 'MINOR_AMENDMENT', label: 'Minor Amendment', description: 'Minor protocol changes' },
        { value: 'SUBSTANTIAL_AMENDMENT', label: 'Substantial Amendment', description: 'Major protocol changes' }
    ];

    const impactLevels: ImpactLevel[] = [
        { value: 'LOW', label: 'Low Impact' },
        { value: 'MEDIUM', label: 'Medium Impact' },
        { value: 'HIGH', label: 'High Impact' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(formData);
    };

    const addChange = () => {
        setFormData({
            ...formData,
            proposedChanges: [...formData.proposedChanges, { section: '', description: '', justification: '' }]
        });
    };

    const updateChange = (index: number, field: keyof ProposedChange, value: string) => {
        const updatedChanges = formData.proposedChanges.map((change, i) =>
            i === index ? { ...change, [field]: value } : change
        );
        setFormData({ ...formData, proposedChanges: updatedChanges });
    };

    const removeChange = (index: number) => {
        const updatedChanges = formData.proposedChanges.filter((_, i) => i !== index);
        setFormData({ ...formData, proposedChanges: updatedChanges });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Create New Protocol Revision</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Revision Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter revision title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Revision Type *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => {
                                        setFormData({ ...formData, type: e.target.value });
                                        onTypeChange(e.target.value);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    {revisionTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                placeholder="Describe the purpose and scope of this revision"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estimated Impact
                            </label>
                            <select
                                value={formData.estimatedImpact}
                                onChange={(e) => setFormData({ ...formData, estimatedImpact: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {impactLevels.map(level => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Proposed Changes */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-md font-medium text-gray-900">Proposed Changes</h4>
                                <Button type="button" variant="outline" size="sm" onClick={addChange}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Change
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {formData.proposedChanges.map((change, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <h5 className="font-medium text-gray-900">Change {index + 1}</h5>
                                            {formData.proposedChanges.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeChange(index)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Section/Area
                                                </label>
                                                <input
                                                    type="text"
                                                    value={change.section}
                                                    onChange={(e) => updateChange(index, 'section', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="e.g., Primary Endpoint, Inclusion Criteria"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Change Description
                                                </label>
                                                <textarea
                                                    value={change.description}
                                                    onChange={(e) => updateChange(index, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    rows={2}
                                                    placeholder="Describe what will be changed"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Justification
                                                </label>
                                                <textarea
                                                    value={change.justification}
                                                    onChange={(e) => updateChange(index, 'justification', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    rows={2}
                                                    placeholder="Explain why this change is necessary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Create Revision
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProtocolRevisionWorkflow;
