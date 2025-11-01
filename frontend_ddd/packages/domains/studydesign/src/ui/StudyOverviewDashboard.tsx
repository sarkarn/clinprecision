import React, { useState, useEffect } from 'react';
import StudyService from '../services/StudyService';
import StudyDocumentService from '../subdomains/document-management/services/StudyDocumentService';
import DocumentUploadModal from './DocumentUploadModal';
import StudyContextHeader from '../components/StudyContextHeader';
import {
    ArrowLeft,
    Edit,
    GitBranch,
    Users,
    MapPin,
    Calendar,
    Clock,
    Target,
    Activity,
    FileText,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Download,
    Share2,
    MoreHorizontal,
    Plus,
    Eye,
    Archive,
    LucideIcon
} from 'lucide-react';

interface Study {
    id: string | number;
    title: string;
    protocol: string;
    version: string;
    versionStatus: string;
    status: string;
    phase: string;
    indication: string;
    therapeuticArea: string;
    sponsor: string;
    principalInvestigator: string;
    studyCoordinator: string;
    sites: number;
    activeSites: number;
    plannedSubjects: number;
    enrolledSubjects: number;
    screenedSubjects: number;
    randomizedSubjects: number;
    completedSubjects: number;
    withdrawnSubjects: number;
    startDate: string;
    estimatedCompletion: string;
    lastModified: string;
    modifiedBy: string;
    description: string;
    primaryEndpoint: string;
    secondaryEndpoints: string[];
    inclusionCriteria: string[];
    exclusionCriteria: string[];
    timeline: {
        screening: string;
        treatment: string;
        followUp: string;
    };
    amendments: Amendment[];
    documents: Document[];
    metrics: {
        enrollmentRate: number;
        screeningSuccessRate: number;
        retentionRate: number;
        complianceRate: number;
        queryRate: number;
    };
    recentActivities: RecentActivity[];
}

interface Amendment {
    version: string;
    type: string;
    date: string;
    reason: string;
    status: string;
}

interface Document {
    name: string;
    type: string;
    size: string;
    lastModified: string;
    status: string;
}

interface RecentActivity {
    type: string;
    message: string;
    date: string;
    user: string;
}

interface UploadedDocument {
    id: number;
    fileName: string;
    documentType: string;
    fileSize: number;
    description?: string;
    uploadedAt: string;
    status: string;
}

interface DocumentStats {
    total: number;
    types: Array<{
        type: string;
        count: number;
    }>;
}

interface StudyOverviewDashboardProps {
    studyId: string | number;
    onBack?: () => void;
    onEdit?: (study: Study) => void;
    onCreateVersion?: (study: Study) => void;
}

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subValue?: string;
    trend?: string;
    color?: string;
}

interface ProgressBarProps {
    label: string;
    current: number;
    total: number;
    color?: string;
}

type TabId = 'overview' | 'enrollment' | 'timeline' | 'documents' | 'amendments';

/**
 * Comprehensive study overview dashboard
 */
const StudyOverviewDashboard: React.FC<StudyOverviewDashboardProps> = ({
    studyId,
    onBack,
    onEdit,
    onCreateVersion
}) => {
    const [study, setStudy] = useState<Study | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [documentStats, setDocumentStats] = useState<DocumentStats>({ total: 0, types: [] });
    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);

    useEffect(() => {
        if (studyId) {
            loadStudyDetails();

            // Load uploaded documents from localStorage
            try {
                const savedDocuments = localStorage.getItem(`study_${studyId}_uploaded_documents`);
                if (savedDocuments) {
                    setUploadedDocuments(JSON.parse(savedDocuments));
                }
            } catch (error) {
                console.error('Error loading documents from localStorage:', error);
            }
        }
    }, [studyId]);

    const loadStudyDetails = async (): Promise<void> => {
        setLoading(true);
        try {
            console.log('Loading study overview for ID:', studyId);

            // Call the real API to get study overview data
            const studyData = await StudyService.getStudyById(studyId) as any as Study;

            console.log('Study overview loaded successfully:', studyData);
            setStudy(studyData);

            // Initialize document statistics locally (no backend call)
            updateDocumentStats();
        } catch (error) {
            console.error('Error loading study details:', error);

            // Fallback to mock data if API fails for now
            console.log('Falling back to mock data due to API error');
            const mockStudyData = getMockStudyData(studyId);
            setStudy(mockStudyData);
        } finally {
            setLoading(false);
        }
    };

    // Update document statistics based on uploaded documents
    const updateDocumentStats = (): void => {
        const typeCount: Record<string, number> = {};
        uploadedDocuments.forEach(doc => {
            typeCount[doc.documentType] = (typeCount[doc.documentType] || 0) + 1;
        });

        const types = Object.entries(typeCount).map(([type, count]) => ({
            type,
            count
        }));

        setDocumentStats({
            total: uploadedDocuments.length,
            types
        });
    };

    // Handle document upload
    const handleUploadSuccess = (uploadedDocument: any): void => {
        // Add document to local state
        const newDocument: UploadedDocument = {
            id: Date.now(), // Simple ID generation for demo
            ...uploadedDocument,
            uploadedAt: new Date().toISOString(),
            status: 'ACTIVE'
        };

        const updatedDocuments = [...uploadedDocuments, newDocument];
        setUploadedDocuments(updatedDocuments);

        // Save to localStorage for access by other components
        localStorage.setItem(`study_${studyId}_uploaded_documents`, JSON.stringify(updatedDocuments));

        setShowUploadModal(false);
    };

    const handleUploadCancel = (): void => {
        setShowUploadModal(false);
    };

    // Update document stats whenever uploaded documents change
    useEffect(() => {
        updateDocumentStats();
    }, [uploadedDocuments]);

    // Mock data fallback function
    const getMockStudyData = (id: string | number): Study => {
        return {
            id: id,
            title: 'Phase III Oncology Trial - Advanced NSCLC',
            protocol: 'ONC-2024-001',
            version: '2.1',
            versionStatus: 'APPROVED',
            status: 'ACTIVE',
            phase: 'Phase III',
            indication: 'Non-Small Cell Lung Cancer',
            therapeuticArea: 'Oncology',
            sponsor: 'Global Pharma Inc.',
            principalInvestigator: 'Dr. Sarah Johnson',
            studyCoordinator: 'Jennifer Martinez, RN',
            sites: 25,
            activeSites: 23,
            plannedSubjects: 450,
            enrolledSubjects: 287,
            screenedSubjects: 324,
            randomizedSubjects: 278,
            completedSubjects: 156,
            withdrawnSubjects: 31,
            startDate: '2024-01-15',
            estimatedCompletion: '2026-03-30',
            lastModified: '2024-03-15T10:30:00Z',
            modifiedBy: 'Dr. Sarah Johnson',
            description: 'A randomized, double-blind, placebo-controlled Phase III study to evaluate the efficacy and safety of investigational drug XYZ-123 in patients with advanced non-small cell lung cancer who have progressed on prior systemic therapy.',
            primaryEndpoint: 'Overall Survival (OS)',
            secondaryEndpoints: [
                'Progression-Free Survival (PFS)',
                'Objective Response Rate (ORR)',
                'Duration of Response (DoR)',
                'Safety and Tolerability'
            ],
            inclusionCriteria: [
                'Age ≥ 18 years',
                'Histologically confirmed NSCLC',
                'Advanced or metastatic disease',
                'ECOG Performance Status 0-1',
                'Adequate organ function'
            ],
            exclusionCriteria: [
                'Prior treatment with similar agents',
                'Brain metastases (unless treated)',
                'Severe cardiovascular disease',
                'Active infection',
                'Pregnancy or nursing'
            ],
            timeline: {
                screening: '4 weeks',
                treatment: '24 cycles (approximately 2 years)',
                followUp: '2 years post-treatment'
            },
            amendments: [
                {
                    version: '2.1',
                    type: 'MINOR',
                    date: '2024-03-15',
                    reason: 'Updated exclusion criteria for cardiovascular conditions',
                    status: 'APPROVED'
                },
                {
                    version: '2.0',
                    type: 'MAJOR',
                    date: '2024-02-01',
                    reason: 'Added new secondary endpoint and modified dosing schedule',
                    status: 'APPROVED'
                },
                {
                    version: '1.0',
                    type: 'INITIAL',
                    date: '2024-01-15',
                    reason: 'Initial protocol version',
                    status: 'APPROVED'
                }
            ],
            documents: [
                {
                    name: 'Protocol v2.1',
                    type: 'Protocol',
                    size: '2.4 MB',
                    lastModified: '2024-03-15',
                    status: 'Current'
                },
                {
                    name: 'Informed Consent v2.1',
                    type: 'ICF',
                    size: '485 KB',
                    lastModified: '2024-03-15',
                    status: 'Current'
                },
                {
                    name: 'Investigator Brochure v3.0',
                    type: 'IB',
                    size: '1.8 MB',
                    lastModified: '2024-02-28',
                    status: 'Current'
                }
            ],
            metrics: {
                enrollmentRate: 75.2,
                screeningSuccessRate: 88.6,
                retentionRate: 89.2,
                complianceRate: 94.8,
                queryRate: 12.3
            },
            recentActivities: [
                {
                    type: 'amendment',
                    message: 'Protocol amendment v2.1 approved',
                    date: '2024-03-15T10:30:00Z',
                    user: 'Regulatory Affairs'
                },
                {
                    type: 'enrollment',
                    message: '5 new subjects enrolled at Site 003',
                    date: '2024-03-14T16:45:00Z',
                    user: 'Site Coordinator'
                },
                {
                    type: 'milestone',
                    message: '75% enrollment milestone reached',
                    date: '2024-03-12T09:20:00Z',
                    user: 'System'
                }
            ]
        };
    };

    const getStatusIcon = (status: string): React.ReactElement => {
        switch (status) {
            case 'ACTIVE': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'RECRUITING': return <Users className="w-5 h-5 text-blue-500" />;
            case 'PAUSED': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'COMPLETED': return <CheckCircle2 className="w-5 h-5 text-purple-500" />;
            case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, subValue, trend, color = 'blue' }) => (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${color}-50`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                {trend && (
                    <div className="flex items-center text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{trend}</span>
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className="text-sm text-gray-600">{label}</p>
                {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
            </div>
        </div>
    );

    const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, total, color = 'blue' }) => {
        const percentage = total > 0 ? (current / total) * 100 : 0;

        return (
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{current}/{total} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading study details...</span>
            </div>
        );
    }

    if (!study) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Study not found</h3>
                <p className="text-gray-600">The requested study could not be loaded.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Study Context Header */}
            <StudyContextHeader
                study={study}
                currentPage="Study Overview"
                onBack={onBack}
                actions={[
                    {
                        label: 'Manage Forms',
                        variant: 'secondary' as const,
                        icon: FileText,
                        onClick: () => window.open(`/study-design/study/${studyId}/forms`, '_blank')
                    },
                    {
                        label: 'Design Study',
                        variant: 'secondary' as const,
                        icon: Target,
                        onClick: () => window.open(`/study-design/study/${studyId}/design/basic-info`, '_blank')
                    },
                    {
                        label: 'New Version',
                        variant: 'secondary' as const,
                        icon: GitBranch,
                        onClick: () => onCreateVersion?.(study)
                    },
                    {
                        label: 'Edit Study',
                        variant: 'primary' as const,
                        icon: Edit,
                        onClick: () => onEdit?.(study)
                    }
                ]}
            />

            {/* Study Description */}
            {study.description && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Study Description</h3>
                    <p className="text-gray-700 leading-relaxed">{study.description}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview' as TabId, label: 'Overview', icon: Activity },
                            { id: 'enrollment' as TabId, label: 'Enrollment', icon: Users },
                            { id: 'timeline' as TabId, label: 'Timeline', icon: Calendar },
                            { id: 'documents' as TabId, label: 'Documents', icon: FileText },
                            { id: 'amendments' as TabId, label: 'Amendments', icon: GitBranch }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    icon={Users}
                                    label="Enrolled Subjects"
                                    value={study.enrolledSubjects}
                                    subValue={`${study.plannedSubjects} planned`}
                                    trend="+5.2%"
                                />
                                <StatCard
                                    icon={MapPin}
                                    label="Active Sites"
                                    value={study.activeSites}
                                    subValue={`${study.sites} total sites`}
                                    color="green"
                                />
                                <StatCard
                                    icon={Target}
                                    label="Enrollment Rate"
                                    value={`${study.metrics.enrollmentRate}%`}
                                    trend="+2.1%"
                                    color="purple"
                                />
                                <StatCard
                                    icon={CheckCircle2}
                                    label="Retention Rate"
                                    value={`${study.metrics.retentionRate}%`}
                                    color="indigo"
                                />
                            </div>

                            {/* Progress Tracking */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Progress</h3>
                                    <div className="space-y-4">
                                        <ProgressBar
                                            label="Screened"
                                            current={study.screenedSubjects}
                                            total={study.plannedSubjects}
                                            color="blue"
                                        />
                                        <ProgressBar
                                            label="Enrolled"
                                            current={study.enrolledSubjects}
                                            total={study.plannedSubjects}
                                            color="green"
                                        />
                                        <ProgressBar
                                            label="Randomized"
                                            current={study.randomizedSubjects}
                                            total={study.plannedSubjects}
                                            color="purple"
                                        />
                                        <ProgressBar
                                            label="Completed"
                                            current={study.completedSubjects}
                                            total={study.plannedSubjects}
                                            color="indigo"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phase:</span>
                                            <span className="font-medium">{study.phase}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Indication:</span>
                                            <span className="font-medium">{study.indication}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Sponsor:</span>
                                            <span className="font-medium">{study.sponsor}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Principal Investigator:</span>
                                            <span className="font-medium">{study.principalInvestigator}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Study Coordinator:</span>
                                            <span className="font-medium">{study.studyCoordinator}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Est. Completion:</span>
                                            <span className="font-medium">{new Date(study.estimatedCompletion).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activities */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                                <div className="space-y-3">
                                    {study.recentActivities.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">{activity.message}</p>
                                                <p className="text-xs text-gray-500">
                                                    {activity.user} • {new Date(activity.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enrollment Tab */}
                    {activeTab === 'enrollment' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    icon={Eye}
                                    label="Screening Success Rate"
                                    value={`${study.metrics.screeningSuccessRate}%`}
                                    color="blue"
                                />
                                <StatCard
                                    icon={Users}
                                    label="Enrollment Rate"
                                    value={`${study.metrics.enrollmentRate}%`}
                                    color="green"
                                />
                                <StatCard
                                    icon={Target}
                                    label="Retention Rate"
                                    value={`${study.metrics.retentionRate}%`}
                                    color="purple"
                                />
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Subject Disposition</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Screened:</span>
                                                <span className="font-medium">{study.screenedSubjects}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Enrolled:</span>
                                                <span className="font-medium">{study.enrolledSubjects}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Randomized:</span>
                                                <span className="font-medium">{study.randomizedSubjects}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Completed:</span>
                                                <span className="font-medium">{study.completedSubjects}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Withdrawn:</span>
                                                <span className="font-medium">{study.withdrawnSubjects}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Site Performance</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Sites:</span>
                                                <span className="font-medium">{study.sites}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Active Sites:</span>
                                                <span className="font-medium">{study.activeSites}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Avg. per Site:</span>
                                                <span className="font-medium">{Math.round(study.enrolledSubjects / study.activeSites)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Study Documents</h3>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Upload Document
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Display original study documents */}
                                {study.documents.map((doc, index) => (
                                    <div key={`original-${index}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3">
                                                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                        <span>{doc.type}</span>
                                                        <span>{doc.size}</span>
                                                        <span>Modified {doc.lastModified}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    {doc.status}
                                                </span>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Display uploaded documents */}
                                {uploadedDocuments.map((doc, index) => (
                                    <div key={`uploaded-${doc.id}`} className="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 bg-blue-25">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3">
                                                <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{doc.fileName}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                        <span className="font-medium text-blue-600">{StudyDocumentService.getDocumentTypes().find(type => type.value === doc.documentType)?.label || doc.documentType}</span>
                                                        <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                                                        <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {doc.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    Recently Uploaded
                                                </span>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Show message when no documents */}
                                {study.documents.length === 0 && uploadedDocuments.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p>No documents uploaded yet</p>
                                        <p className="text-sm">Click "Upload Document" to add your first document</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Amendments Tab */}
                    {activeTab === 'amendments' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Protocol Amendments</h3>
                                <button
                                    onClick={() => onCreateVersion?.(study)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <GitBranch className="w-4 h-4 mr-2" />
                                    Create Amendment
                                </button>
                            </div>

                            <div className="space-y-4">
                                {study.amendments.map((amendment, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Version {amendment.version}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{amendment.reason}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${amendment.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {amendment.status}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${amendment.type === 'MAJOR' ? 'bg-red-100 text-red-700' :
                                                    amendment.type === 'MINOR' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {amendment.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(amendment.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Upload Modal */}
            {showUploadModal && (
                <DocumentUploadModal
                    isOpen={showUploadModal}
                    onClose={handleUploadCancel}
                    studyId={studyId}
                    onUploadSuccess={handleUploadSuccess}
                />
            )}
        </div>
    );
};

export default StudyOverviewDashboard;
