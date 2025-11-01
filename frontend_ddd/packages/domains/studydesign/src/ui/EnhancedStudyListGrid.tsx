// src/components/modules/trialdesign/study-management/EnhancedStudyListGrid.tsx

// Temporary mock for empty useStatusSynchronization hook
const useStatusSynchronization = (options?: any) => ({
    isConnected: false,
    connectionStatus: 'disconnected' as const,
    lastUpdate: null,
    statusCache: new Map(),
    pendingUpdates: [],
    syncErrors: [],
    getCachedStatus: (id?: any) => null,
    subscribeToStudy: (id?: any) => {},
    requestStatusComputation: (id?: any) => {},
    refreshStatus: async (id?: any) => {}
});

import React, { useState, useEffect, useMemo } from 'react';
import StudyService from '../services/StudyService';
// import { useStatusSynchronization } from '../../../../hooks/useStatusSynchronization';
import StatusIndicator, { CompactStatusIndicator } from '../shared/status/StatusIndicator';
import {
    Search,
    Filter,
    SortAsc,
    SortDesc,
    Eye,
    Edit,
    GitBranch,
    Users,
    MapPin,
    Calendar,
    FileText,
    MoreHorizontal,
    RefreshCw,
    Wifi,
    WifiOff,
    Zap,
    Bell,
    Settings,
    Download,
    Grid,
    List,
    Activity,
    AlertTriangle,
    Clock
} from 'lucide-react';

interface Study {
    id: string | number;
    title?: string;
    protocolNumber?: string;
    sponsor?: string;
    principalInvestigator?: string;
    status: string;
    phase: string;
    sites?: number;
    enrolledSubjects?: number;
    plannedSubjects?: number;
    lastUpdated?: string;
    updatedAt?: string;
    originalStatus?: string;
    isRealtime?: boolean;
}

interface StatusUpdate {
    status: string;
    timestamp: string;
    updatedAt: Date;
}

interface Notification {
    id: number;
    message: string;
    type: 'status' | 'study' | 'info' | 'error';
    timestamp: Date;
}

interface StatusUpdateEvent extends Event {
    detail: {
        studyId: string | number;
        status: string;
        timestamp: string;
    };
}

interface StudyUpdateEvent extends Event {
    detail: {
        studyId: string | number;
    };
}

interface EnhancedStudyListGridProps {
    onStudySelect?: (study: Study) => void;
    onStudyEdit?: (study: Study) => void;
    onCreateVersion?: (study: Study) => void;
    onManageProtocols?: (study: Study) => void;
    showActions?: boolean;
    selectable?: boolean;
    multiSelect?: boolean;
    className?: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'lastUpdated' | 'title' | 'status' | 'phase' | 'startDate' | 'enrolledSubjects';
type SortDirection = 'asc' | 'desc';

/**
 * Enhanced Study List Grid with Real-time Status Updates
 * Displays studies with live status synchronization and advanced filtering
 */
const EnhancedStudyListGrid: React.FC<EnhancedStudyListGridProps> = ({
    onStudySelect,
    onStudyEdit,
    onCreateVersion,
    onManageProtocols,
    showActions = true,
    selectable = false,
    multiSelect = false,
    className = ''
}) => {
    // State management
    const [studies, setStudies] = useState<Study[]>([]);
    const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudies, setSelectedStudies] = useState<Set<string | number>>(new Set());
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [phaseFilter, setPhaseFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('lastUpdated');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [showFilters, setShowFilters] = useState<boolean>(false);

    // Real-time updates state
    const [lastBulkUpdate, setLastBulkUpdate] = useState<Date | null>(null);
    const [statusUpdates, setStatusUpdates] = useState<Map<string | number, StatusUpdate>>(new Map());
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Real-time status synchronization for global updates
    const {
        isConnected,
        connectionStatus,
        lastUpdate,
        statusCache,
        pendingUpdates,
        syncErrors,
        getCachedStatus
    } = useStatusSynchronization({
        studyId: null, // Global monitoring
        enableGlobalUpdates: true,
        autoConnect: true,
        onStatusUpdate: handleGlobalStatusUpdate,
        onError: handleSyncError
    });

    // Load studies on component mount
    useEffect(() => {
        loadStudies();
    }, []);

    // Filter and sort studies when dependencies change
    useEffect(() => {
        filterAndSortStudies();
    }, [studies, searchQuery, statusFilter, phaseFilter, sortField, sortDirection, statusUpdates]);

    // Listen for custom events
    useEffect(() => {
        const handleCustomStatusUpdate = (event: Event): void => {
            const customEvent = event as StatusUpdateEvent;
            const { studyId, status, timestamp } = customEvent.detail;
            updateStudyStatus(studyId, status, timestamp);
            addNotification(`Study ${studyId} status updated to ${status}`, 'status');
        };

        const handleCustomStudyUpdate = (event: Event): void => {
            const customEvent = event as StudyUpdateEvent;
            const { studyId } = customEvent.detail;
            addNotification(`Study ${studyId} data updated`, 'study');
            // Refresh specific study data
            refreshStudyData(studyId);
        };

        window.addEventListener('statusUpdate', handleCustomStatusUpdate as EventListener);
        window.addEventListener('studyUpdate', handleCustomStudyUpdate as EventListener);

        return () => {
            window.removeEventListener('statusUpdate', handleCustomStatusUpdate as EventListener);
            window.removeEventListener('studyUpdate', handleCustomStudyUpdate as EventListener);
        };
    }, []);

    /**
     * Load studies from API
     */
    const loadStudies = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            console.log('Loading studies with real-time enhancement...');
            const studiesData = await StudyService.getStudies() as Study[];

            // Enhance with real-time status if available
            const enhancedStudies = studiesData.map(study => {
                const realtimeStatus = getCachedStatus(study.id);
                return {
                    ...study,
                    originalStatus: study.status,
                    status: realtimeStatus?.status || study.status,
                    lastUpdated: realtimeStatus?.updatedAt || study.updatedAt,
                    isRealtime: !!realtimeStatus
                };
            });

            setStudies(enhancedStudies);
            setLastBulkUpdate(new Date());

            console.log(`Loaded ${enhancedStudies.length} studies with real-time enhancement`);
            addNotification(`Loaded ${enhancedStudies.length} studies`, 'info');

        } catch (err) {
            console.error('Error loading studies:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            addNotification(`Failed to load studies: ${errorMessage}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle global status updates
     */
    function handleGlobalStatusUpdate(data: any): void {
        const { studyId, status, timestamp } = data;
        updateStudyStatus(studyId, status, timestamp);
        addNotification(`Study ${studyId} status: ${status}`, 'status');
    }

    /**
     * Handle sync errors
     */
    function handleSyncError(error: Error): void {
        addNotification(`Sync error: ${error.message}`, 'error');
    }

    /**
     * Update study status in real-time
     */
    const updateStudyStatus = (studyId: string | number, newStatus: string, timestamp: string): void => {
        setStatusUpdates(prev => {
            const newUpdates = new Map(prev);
            newUpdates.set(studyId, {
                status: newStatus,
                timestamp,
                updatedAt: new Date()
            });
            return newUpdates;
        });

        // Update studies array
        setStudies(prev => prev.map(study => {
            if (study.id === studyId) {
                return {
                    ...study,
                    status: newStatus,
                    lastUpdated: timestamp,
                    isRealtime: true
                };
            }
            return study;
        }));
    };

    /**
     * Refresh specific study data
     */
    const refreshStudyData = async (studyId: string | number): Promise<void> => {
        try {
            const updatedStudy = await StudyService.getStudyById(studyId) as Study;
            setStudies(prev => prev.map(study =>
                study.id === studyId ? { ...study, ...updatedStudy, isRealtime: false } : study
            ));
        } catch (error) {
            console.error(`Failed to refresh study ${studyId}:`, error);
        }
    };

    /**
     * Add notification
     */
    const addNotification = (message: string, type: Notification['type']): void => {
        const notification: Notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };

        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10

        // Auto-remove after 5 seconds for non-error notifications
        if (type !== 'error') {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }, 5000);
        }
    };

    /**
     * Filter and sort studies
     */
    const filterAndSortStudies = (): void => {
        let filtered = [...studies];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(study =>
                study.title?.toLowerCase().includes(query) ||
                study.protocolNumber?.toLowerCase().includes(query) ||
                study.sponsor?.toLowerCase().includes(query) ||
                study.principalInvestigator?.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(study => study.status === statusFilter);
        }

        // Apply phase filter
        if (phaseFilter !== 'all') {
            filtered = filtered.filter(study => study.phase === phaseFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any = a[sortField as keyof Study];
            let bValue: any = b[sortField as keyof Study];

            // Handle special cases
            if (sortField === 'lastUpdated' || sortField === 'startDate') {
                aValue = new Date(aValue || 0);
                bValue = new Date(bValue || 0);
            }

            if (sortField === 'enrolledSubjects') {
                aValue = parseInt(aValue) || 0;
                bValue = parseInt(bValue) || 0;
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = (bValue as string).toLowerCase();
            }

            const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return sortDirection === 'asc' ? result : -result;
        });

        setFilteredStudies(filtered);
    };

    /**
     * Handle sort change
     */
    const handleSort = (field: SortField): void => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    /**
     * Handle study selection
     */
    const handleStudySelection = (studyId: string | number, selected: boolean): void => {
        const newSelection = new Set(selectedStudies);

        if (selected) {
            if (multiSelect) {
                newSelection.add(studyId);
            } else {
                newSelection.clear();
                newSelection.add(studyId);
            }
        } else {
            newSelection.delete(studyId);
        }

        setSelectedStudies(newSelection);
    };

    /**
     * Get available status options for filter
     */
    const statusOptions = useMemo(() => {
        const statuses = new Set(studies.map(study => study.status));
        return Array.from(statuses).sort();
    }, [studies]);

    /**
     * Get available phase options for filter
     */
    const phaseOptions = useMemo(() => {
        const phases = new Set(studies.map(study => study.phase));
        return Array.from(phases).sort();
    }, [studies]);

    /**
     * Render header with controls
     */
    const renderHeader = (): React.ReactElement => {
        const unreadNotifications = notifications.filter(n => n.type === 'error' || n.type === 'status').length;

        return (
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-900">Studies</h2>

                        {/* Connection status */}
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <div className="flex items-center gap-1 text-green-600" title="Real-time updates active">
                                    <Wifi className="w-4 h-4" />
                                    <Zap className="w-3 h-3" />
                                </div>
                            ) : (
                                <div title="Real-time updates unavailable">
                                    <WifiOff className="w-4 h-4 text-red-500" />
                                </div>
                            )}

                            {pendingUpdates.length > 0 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    {pendingUpdates.length} pending
                                </span>
                            )}
                        </div>

                        {/* Notifications */}
                        {unreadNotifications > 0 && (
                            <div className="relative">
                                <Bell className="w-4 h-4 text-orange-500" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </div>
                        )}

                        {/* Study count */}
                        <span className="text-sm text-gray-600">
                            {filteredStudies.length} of {studies.length} studies
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View mode toggle */}
                        <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="Grid view"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="List view"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Refresh button */}
                        <button
                            onClick={loadStudies}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            title="Refresh studies"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Filters toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-md ${showFilters ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            title="Toggle filters"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Filters panel */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search studies..."
                                        className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                                    />
                                </div>
                            </div>

                            {/* Status filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All Statuses</option>
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Phase filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                                <select
                                    value={phaseFilter}
                                    onChange={(e) => setPhaseFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All Phases</option>
                                    {phaseOptions.map(phase => (
                                        <option key={phase} value={phase}>{phase}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                <div className="flex gap-2">
                                    <select
                                        value={sortField}
                                        onChange={(e) => setSortField(e.target.value as SortField)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    >
                                        <option value="lastUpdated">Last Updated</option>
                                        <option value="title">Title</option>
                                        <option value="status">Status</option>
                                        <option value="phase">Phase</option>
                                        <option value="startDate">Start Date</option>
                                        <option value="enrolledSubjects">Enrollment</option>
                                    </select>
                                    <button
                                        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                                        title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                                    >
                                        {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Clear filters */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                    setPhaseFilter('all');
                                    setSortField('lastUpdated');
                                    setSortDirection('desc');
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Notifications panel */}
                {notifications.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-blue-900">Recent Updates</h4>
                            <button
                                onClick={() => setNotifications([])}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="space-y-1">
                            {notifications.slice(0, 3).map(notification => (
                                <div key={notification.id} className="flex items-center justify-between">
                                    <span className="text-sm text-blue-800">{notification.message}</span>
                                    <span className="text-xs text-blue-600">
                                        {new Date(notification.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Render study card for grid view
     */
    const renderStudyCard = (study: Study): React.ReactElement => {
        const isSelected = selectedStudies.has(study.id);
        const realtimeUpdate = statusUpdates.get(study.id);

        return (
            <div
                key={study.id}
                className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
                    } ${study.isRealtime ? 'border-l-4 border-l-blue-500' : ''}`}
                onClick={() => onStudySelect?.(study)}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {study.title || 'Untitled Study'}
                        </h3>
                        <p className="text-sm text-gray-600">{study.protocolNumber}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {study.isRealtime && (
                            <div className="flex items-center gap-1 text-blue-600" title="Real-time status">
                                <Zap className="w-3 h-3" />
                            </div>
                        )}

                        <CompactStatusIndicator
                            status={study.status as any}
                            isRealTime={study.isRealtime}
                            connectionStatus={connectionStatus}
                        />

                        {selectable && (
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleStudySelection(study.id, e.target.checked);
                                }}
                                className="rounded border-gray-300"
                            />
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Phase:</span>
                            <span className="ml-2 font-medium">{study.phase}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Sponsor:</span>
                            <span className="ml-2 font-medium">{study.sponsor}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">PI:</span>
                            <span className="ml-2 font-medium">{study.principalInvestigator}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Sites:</span>
                            <span className="ml-2 font-medium">{study.sites || 0}</span>
                        </div>
                    </div>

                    {/* Enrollment progress */}
                    {study.enrolledSubjects !== undefined && study.plannedSubjects !== undefined && (
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Enrollment</span>
                                <span className="font-medium">
                                    {study.enrolledSubjects}/{study.plannedSubjects}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                        width: `${Math.min((study.enrolledSubjects / study.plannedSubjects) * 100, 100)}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Last updated */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated {new Date(study.lastUpdated || study.updatedAt || '').toLocaleDateString()}
                        </div>

                        {realtimeUpdate && (
                            <div className="flex items-center gap-1 text-blue-600">
                                <Activity className="w-3 h-3" />
                                Live
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onStudySelect?.(study);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="View details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onStudyEdit?.(study);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="Edit study"
                        >
                            <Edit className="w-4 h-4" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onManageProtocols?.(study);
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                            title="Manage protocols"
                        >
                            <FileText className="w-4 h-4" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateVersion?.(study);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="Create version"
                        >
                            <GitBranch className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Loading state
    if (loading && studies.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg">
                {renderHeader()}
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading studies...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg">
                {renderHeader()}
                <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading studies</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadStudies}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
            {renderHeader()}

            <div className="p-6">
                {filteredStudies.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all' || phaseFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No studies available yet'
                            }
                        </p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }>
                        {filteredStudies.map(study => renderStudyCard(study))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedStudyListGrid;
