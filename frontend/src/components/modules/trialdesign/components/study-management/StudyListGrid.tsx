import React, { useState, useEffect, useCallback } from 'react';
import { useDataGrid } from '../hooks/useDataGrid';
import { useStudyVersioning } from '../../../../../../src/hooks/api/studies/useStudyVersioning';
import StudyService from 'services/study-management/StudyService';
import {
    Search,
    Filter,
    Eye,
    Edit,
    Copy,
    Trash2,
    MoreHorizontal,
    Download,
    Upload,
    Plus,
    RefreshCw,
    CheckSquare,
    Square,
    Minus,
    ChevronDown,
    ChevronUp,
    Calendar,
    Users,
    Clock,
    AlertCircle,
    CheckCircle2,
    FileText,
    GitBranch,
    XCircle,
    LucideIcon
} from 'lucide-react';

interface Study {
    id: string | number;
    name?: string;
    title?: string;
    protocolNumber?: string;
    protocol?: string;
    version: string | number;
    versionStatus: string;
    status: string;
    phase: string;
    sites: number;
    currentEnrollment?: number;
    enrolledSubjects?: number;
    targetEnrollment?: number;
    plannedSubjects?: number;
    principalInvestigator: string;
    amendments?: number;
    tags?: string[];
    updatedAt?: string;
    modifiedBy?: string;
}

interface LookupOption {
    value: string;
    label: string;
}

interface StatusBadgeProps {
    status: string;
    versionStatus: string;
}

interface VersionBadgeProps {
    version: string | number;
    versionStatus: string;
    amendments?: number;
}

interface ActionMenuProps {
    study: Study;
}

interface StudyListGridProps {
    onCreateNew?: () => void;
    onViewStudy?: (study: Study) => void;
    onEditStudy?: (study: Study) => void;
    onDeleteStudy?: (study: Study) => void;
    onDesignStudy?: (study: Study) => void;
    onManageProtocols?: (study: Study) => void;
    onBulkActions?: (action: string, studyIds: Set<string | number>) => void;
}

interface StatusConfig {
    color: string;
    icon: LucideIcon;
}

/**
 * Modern study list component with versioning support
 */
const StudyListGrid: React.FC<StudyListGridProps> = ({
    onCreateNew,
    onViewStudy,
    onEditStudy,
    onDeleteStudy,
    onDesignStudy,
    onManageProtocols,
    onBulkActions
}) => {
    const [studies, setStudies] = useState<Study[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [selectedStudyForVersion, setSelectedStudyForVersion] = useState<Study | null>(null);

    // Lookup data state for filters
    const [studyPhases, setStudyPhases] = useState<LookupOption[]>([]);
    const [studyStatuses, setStudyStatuses] = useState<LookupOption[]>([]);
    const [loadingFilters, setLoadingFilters] = useState<boolean>(true);

    // Study versioning hook
    const {
        createVersion,
        getVersionHistory,
        AMENDMENT_TYPES,
        VERSION_STATUS
    } = useStudyVersioning();

    // Data grid configuration
    const dataGrid = useDataGrid(studies, {
        pageSize: 20,
        sortable: true,
        filterable: true,
        selectable: true
    });

    // Load studies data
    const loadStudies = useCallback(async (): Promise<void> => {
        console.log('Loading studies...');
        setLoading(true);
        try {
            const studiesData = await StudyService.getStudies() as Study[];
            console.log('Studies loaded:', studiesData);
            setStudies(studiesData);
            dataGrid.updateData(studiesData);
        } catch (error) {
            console.error('Error loading studies:', error);
            // If backend fails, fall back to empty array
            setStudies([]);
            dataGrid.updateData([]);
        } finally {
            setLoading(false);
        }
    }, [dataGrid.updateData]);

    useEffect(() => {
        loadStudies();
    }, [loadStudies]);

    // Load lookup data for filters
    useEffect(() => {
        const fetchFilterData = async (): Promise<void> => {
            try {
                setLoadingFilters(true);
                const lookupData = await StudyService.getStudyLookupData() as any;

                // Transform data for filter dropdowns
                const phaseOptions: LookupOption[] = (lookupData.phases || []).map((phase: any) => ({
                    value: phase.label || phase.displayName || phase.value,
                    label: phase.label || phase.displayName || phase.value
                }));

                const statusOptions: LookupOption[] = (lookupData.statuses || []).map((status: any) => ({
                    value: status.label || status.displayName || status.value,
                    label: status.label || status.displayName || status.value
                }));

                setStudyPhases(phaseOptions);
                setStudyStatuses(statusOptions);
            } catch (err) {
                console.error('Error fetching filter data:', err);
                // Fallback to default values if API fails
                setStudyPhases([
                    { value: 'Phase I', label: 'Phase I' },
                    { value: 'Phase II', label: 'Phase II' },
                    { value: 'Phase III', label: 'Phase III' },
                    { value: 'Phase IV', label: 'Phase IV' }
                ]);

                setStudyStatuses([
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'RECRUITING', label: 'Recruiting' },
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'PAUSED', label: 'Paused' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'CANCELLED', label: 'Cancelled' }
                ]);
            } finally {
                setLoadingFilters(false);
            }
        };

        fetchFilterData();
    }, []);

    // Status badge component
    const StatusBadge: React.FC<StatusBadgeProps> = ({ status, versionStatus }) => {
        const getStatusConfig = (status: string): StatusConfig => {
            const configs: Record<string, StatusConfig> = {
                ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
                RECRUITING: { color: 'bg-blue-100 text-blue-800', icon: Users },
                DRAFT: { color: 'bg-gray-100 text-gray-800', icon: FileText },
                PAUSED: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
                COMPLETED: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle2 },
                CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle }
            };
            return configs[status] || configs.DRAFT;
        };

        const config = getStatusConfig(status);
        const Icon = config.icon;

        return (
            <div className="flex flex-col gap-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {status}
                </span>
                <span className="text-xs text-gray-500">v{versionStatus}</span>
            </div>
        );
    };

    // Version badge component
    const VersionBadge: React.FC<VersionBadgeProps> = ({ version, versionStatus, amendments }) => {
        const getVersionColor = (status: string): string => {
            const colors: Record<string, string> = {
                DRAFT: 'bg-gray-100 text-gray-700',
                PROTOCOL_REVIEW: 'bg-yellow-100 text-yellow-700',
                APPROVED: 'bg-green-100 text-green-700',
                ACTIVE: 'bg-blue-100 text-blue-700',
                SUPERSEDED: 'bg-orange-100 text-orange-700',
                WITHDRAWN: 'bg-red-100 text-red-700'
            };
            return colors[status] || colors.DRAFT;
        };

        return (
            <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getVersionColor(versionStatus)}`}>
                    <GitBranch className="w-3 h-3 mr-1" />
                    v{version}
                </span>
                {amendments && amendments > 0 && (
                    <span className="text-xs text-gray-500">
                        {amendments} amendment{amendments > 1 ? 's' : ''}
                    </span>
                )}
            </div>
        );
    };

    // Action menu component
    const ActionMenu: React.FC<ActionMenuProps> = ({ study }) => {
        const [isOpen, setIsOpen] = useState<boolean>(false);

        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1 rounded hover:bg-gray-100"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                        <div className="py-1">
                            <button
                                onClick={() => { onViewStudy?.(study); setIsOpen(false); }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                            </button>
                            <button
                                onClick={() => { onEditStudy?.(study); setIsOpen(false); }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Study
                            </button>
                            <button
                                onClick={() => { onDesignStudy?.(study); setIsOpen(false); }}
                                className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 w-full text-left"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Design Study
                            </button>
                            <div className="border-t border-gray-100"></div>
                            <button
                                onClick={() => { onManageProtocols?.(study); setIsOpen(false); }}
                                className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 w-full text-left"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Manage Protocols
                            </button>
                            <button
                                onClick={() => { setSelectedStudyForVersion(study); setIsOpen(false); }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                <GitBranch className="w-4 h-4 mr-2" />
                                Create Version
                            </button>
                            <button
                                onClick={() => { /* Handle clone */ setIsOpen(false); }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Clone Study
                            </button>
                            <div className="border-t border-gray-100"></div>
                            <button
                                onClick={() => { onDeleteStudy?.(study); setIsOpen(false); }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Study
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Grid view component
    const GridView: React.FC = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataGrid?.items && dataGrid.items.length > 0 ? dataGrid.items.map((study) => (
                <div key={study.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{study.name || study.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{study.protocolNumber || study.protocol}</p>
                            <VersionBadge
                                version={study.version}
                                versionStatus={study.versionStatus}
                                amendments={study.amendments}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={study.status} versionStatus={study.versionStatus} />
                            <ActionMenu study={study} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Phase:</span>
                            <span className="font-medium">{study.phase}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Sites:</span>
                            <span className="font-medium">{study.sites}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subjects:</span>
                            <span className="font-medium">{study.currentEnrollment || study.enrolledSubjects || 0}/{study.targetEnrollment || study.plannedSubjects || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">PI:</span>
                            <span className="font-medium">{study.principalInvestigator}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                            {study.tags && study.tags.length > 0 && study.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )) : (
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">
                        {loading ? 'Loading studies...' : 'No studies found.'}
                    </p>
                </div>
            )}
        </div>
    );

    // Table view component
    const TableView: React.FC = () => (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={dataGrid.isAllSelected()}
                                        onChange={dataGrid.isAllSelected() ? dataGrid.clearSelection : dataGrid.selectAll}
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                    />
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => dataGrid.handleSort('title')}
                            >
                                <div className="flex items-center">
                                    Study Title
                                    {dataGrid.sortConfig.key === 'title' && (
                                        dataGrid.sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => dataGrid.handleSort('status')}
                            >
                                <div className="flex items-center">
                                    Status
                                    {dataGrid.sortConfig.key === 'status' && (
                                        dataGrid.sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => dataGrid.handleSort('version')}
                            >
                                <div className="flex items-center">
                                    Version
                                    {dataGrid.sortConfig.key === 'version' && (
                                        dataGrid.sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phase
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subjects
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Principal Investigator
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => dataGrid.handleSort('updatedAt')}
                            >
                                <div className="flex items-center">
                                    Last Modified
                                    {dataGrid.sortConfig.key === 'updatedAt' && (
                                        dataGrid.sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {dataGrid?.items && dataGrid.items.length > 0 ? dataGrid.items.map((study) => (
                            <tr key={study.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={dataGrid.isSelected(study.id)}
                                        onChange={() => dataGrid.toggleSelectItem(study.id)}
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <div className="text-sm font-medium text-gray-900">{study.name || study.title}</div>
                                        <div className="text-sm text-gray-500">{study.protocolNumber || study.protocol}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={study.status} versionStatus={study.versionStatus} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <VersionBadge
                                        version={study.version}
                                        versionStatus={study.versionStatus}
                                        amendments={study.amendments}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {study.phase}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex flex-col">
                                        <span>{study.currentEnrollment || study.enrolledSubjects || 0}/{study.targetEnrollment || study.plannedSubjects || 0}</span>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full"
                                                style={{ width: `${((study.currentEnrollment || study.enrolledSubjects || 0) / (study.targetEnrollment || study.plannedSubjects || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {study.principalInvestigator}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col">
                                        <span>{study.updatedAt ? new Date(study.updatedAt).toLocaleDateString() : 'Not available'}</span>
                                        <span className="text-xs">{study.modifiedBy || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <ActionMenu study={study} />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                    {loading ? 'Loading studies...' : 'No studies found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Study Management</h1>
                    <p className="text-gray-600">Manage clinical trials and protocol versions</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => loadStudies()}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={onCreateNew}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Study
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search studies, protocols, investigators..."
                                value={dataGrid.globalFilter}
                                onChange={(e) => dataGrid.handleGlobalFilterChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </button>

                        <div className="flex border border-gray-300 rounded-md">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-2 text-sm font-medium ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={(dataGrid.filters.status as string) || ''}
                                    onChange={(e) => dataGrid.handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    disabled={loadingFilters}
                                >
                                    <option value="">{loadingFilters ? 'Loading...' : 'All Statuses'}</option>
                                    {studyStatuses.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                                <select
                                    value={(dataGrid.filters.phase as string) || ''}
                                    onChange={(e) => dataGrid.handleFilterChange('phase', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    disabled={loadingFilters}
                                >
                                    <option value="">{loadingFilters ? 'Loading...' : 'All Phases'}</option>
                                    {studyPhases.map(phase => (
                                        <option key={phase.value} value={phase.value}>
                                            {phase.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
                                <input
                                    type="text"
                                    placeholder="Filter by sponsor"
                                    value={(dataGrid.filters.sponsor as string) || ''}
                                    onChange={(e) => dataGrid.handleFilterChange('sponsor', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PI</label>
                                <input
                                    type="text"
                                    placeholder="Filter by PI"
                                    value={(dataGrid.filters.principalInvestigator as string) || ''}
                                    onChange={(e) => dataGrid.handleFilterChange('principalInvestigator', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                                <button
                                    onClick={dataGrid.clearFilters}
                                    className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Actions Bar */}
            {dataGrid.selectedItems.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">
                            {dataGrid.selectedItems.size} study{dataGrid.selectedItems.size > 1 ? 'ies' : ''} selected
                        </span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 rounded">
                                Export Selected
                            </button>
                            <button className="px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 rounded">
                                Bulk Edit
                            </button>
                            <button
                                onClick={dataGrid.clearSelection}
                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading studies...</span>
                </div>
            ) : dataGrid.items.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
                    <p className="text-gray-600 mb-4">
                        {dataGrid.globalFilter || Object.keys(dataGrid.filters).length > 0
                            ? "Try adjusting your search or filter criteria"
                            : "Get started by creating your first clinical trial study"
                        }
                    </p>
                    {(!dataGrid.globalFilter && Object.keys(dataGrid.filters).length === 0) && (
                        <button
                            onClick={onCreateNew}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Study
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? <GridView /> : <TableView />}

                    {/* Pagination */}
                    {dataGrid.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{dataGrid.startIndex}</span> to{' '}
                                    <span className="font-medium">{dataGrid.endIndex}</span> of{' '}
                                    <span className="font-medium">{dataGrid.totalItems}</span> results
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={dataGrid.previousPage}
                                    disabled={!dataGrid.hasPreviousPage}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(dataGrid.totalPages, 5) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => dataGrid.goToPage(page)}
                                                className={`px-3 py-1 text-sm border rounded ${dataGrid.currentPage === page
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={dataGrid.nextPage}
                                    disabled={!dataGrid.hasNextPage}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudyListGrid;
