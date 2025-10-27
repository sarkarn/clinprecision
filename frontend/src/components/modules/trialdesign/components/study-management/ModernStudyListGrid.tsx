import React, { useState, useEffect, useMemo } from 'react';

// Temporary mock hooks until useCodeList is implemented
const useStudyPhases = (options: any) => ({ data: [] as any[], loading: false, refresh: () => {}, lastFetch: '' });
const useStudyStatuses = (options: any) => ({ data: [] as any[], loading: false, refresh: () => {}, lastFetch: '' });
const useRegulatoryStatuses = (options: any) => ({ data: [] as any[], loading: false, refresh: () => {}, lastFetch: '' });

// Temporary mock components
const StudyPhaseDropdown = (props: any) => <select {...props}></select>;
const StudyStatusDropdown = (props: any) => <select {...props}></select>;
const RegulatoryStatusDropdown = (props: any) => <select {...props}></select>;

// Type Definitions
interface Study {
    id: string | number;
    name: string;
    protocolNumber: string;
    phase: string;
    status: string;
    regulatoryStatus?: string;
    sponsor: string;
    principalInvestigator?: string;
    enrolledSubjects?: number;
    plannedSubjects?: number;
}

interface Filters {
    phase: string;
    status: string;
    regulatoryStatus: string;
    searchTerm: string;
}

interface CodeListItem {
    value: string;
    label: string;
    description?: string;
}

interface StudyCardProps {
    study: Study;
    phaseData: CodeListItem[];
    statusData: CodeListItem[];
}

/**
 * Modernized StudyListGrid - Phase 3 Frontend Integration Example
 * 
 * BEFORE: Hardcoded arrays, manual API calls, complex error handling
 * AFTER: CodeList hooks, universal components, automatic caching
 * 
 * This demonstrates the migration from legacy hardcoded dropdowns
 * to modern centralized CodeList integration
 */
export const ModernStudyListGrid: React.FC = () => {
    const [studies, setStudies] = useState<Study[]>([]);
    const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filters state
    const [filters, setFilters] = useState<Filters>({
        phase: '',
        status: '',
        regulatoryStatus: '',
        searchTerm: ''
    });

    // PHASE 3 INTEGRATION: Replace hardcoded arrays with hooks
    // ✅ No more StudyService.getStudyLookupData()
    // ✅ No more hardcoded fallback arrays
    // ✅ Automatic error handling and caching
    const studyPhases = useStudyPhases({
        enableCache: true,
        cacheTimeMs: 10 * 60 * 1000, // 10 minutes
        autoRefresh: true
    });

    const studyStatuses = useStudyStatuses({
        enableCache: true,
        cacheTimeMs: 10 * 60 * 1000
    });

    const regulatoryStatuses = useRegulatoryStatuses({
        enableCache: true,
        cacheTimeMs: 10 * 60 * 1000,
        filters: { allowsEnrollment: 'true' } // Example: Only enrollment-allowing statuses
    });

    // Load studies data
    useEffect(() => {
        const fetchStudies = async () => {
            try {
                setLoading(true);
                // StudyService now focuses only on study business logic
                const response = await fetch('/api/studies');
                const data: Study[] = await response.json();
                setStudies(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudies();
    }, []);

    // Filter studies based on selected criteria
    const filteredStudiesMemo = useMemo(() => {
        let filtered = studies;

        if (filters.phase) {
            filtered = filtered.filter(study => study.phase === filters.phase);
        }

        if (filters.status) {
            filtered = filtered.filter(study => study.status === filters.status);
        }

        if (filters.regulatoryStatus) {
            filtered = filtered.filter(study => study.regulatoryStatus === filters.regulatoryStatus);
        }

        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(study =>
                study.name.toLowerCase().includes(term) ||
                study.protocolNumber.toLowerCase().includes(term) ||
                study.sponsor.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [studies, filters]);

    // Handle filter changes
    const handleFilterChange = (filterName: keyof Filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // Loading state - show loading for both studies and reference data
    if (loading || studyPhases.loading || studyStatuses.loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading studies and reference data...</p>
                <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <div>Studies: {loading ? 'Loading...' : '✅ Loaded'}</div>
                    <div>Study Phases: {studyPhases.loading ? 'Loading...' : `✅ ${studyPhases.data.length} items`}</div>
                    <div>Study Statuses: {studyStatuses.loading ? 'Loading...' : `✅ ${studyStatuses.data.length} items`}</div>
                    <div>Regulatory Statuses: {regulatoryStatuses.loading ? 'Loading...' : `✅ ${regulatoryStatuses.data.length} items`}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Phase 3 Integration Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                    🚀 Phase 3: Frontend Integration Demo
                </h2>
                <p className="text-blue-700 text-sm">
                    This component demonstrates the migration from hardcoded arrays to centralized CodeList integration.
                    All dropdown data now comes from the Admin Service via cached hooks.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                    <div>
                        <strong>Study Phases:</strong> {studyPhases.data.length} items
                        <br />
                        <span className="text-gray-600">Cache: {studyPhases.lastFetch}</span>
                    </div>
                    <div>
                        <strong>Study Statuses:</strong> {studyStatuses.data.length} items
                        <br />
                        <span className="text-gray-600">Cache: {studyStatuses.lastFetch}</span>
                    </div>
                    <div>
                        <strong>Regulatory Statuses:</strong> {regulatoryStatuses.data.length} items
                        <br />
                        <span className="text-gray-600">Cache: {regulatoryStatuses.lastFetch}</span>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Filters</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Studies
                        </label>
                        <input
                            type="text"
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            placeholder="Search by name, protocol, sponsor..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Study Phase Dropdown - PHASE 3 INTEGRATION */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Study Phase
                        </label>
                        <StudyPhaseDropdown
                            value={filters.phase}
                            onChange={(e) => handleFilterChange('phase', e.target.value)}
                            allowEmpty
                            emptyText="All Phases"
                            showDescription
                            data-testid="phase-filter"
                        />
                    </div>

                    {/* Study Status Dropdown - PHASE 3 INTEGRATION */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Study Status
                        </label>
                        <StudyStatusDropdown
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            allowEmpty
                            emptyText="All Statuses"
                            data-testid="status-filter"
                        />
                    </div>

                    {/* Regulatory Status Dropdown - PHASE 3 INTEGRATION */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Regulatory Status
                        </label>
                        <RegulatoryStatusDropdown
                            value={filters.regulatoryStatus}
                            onChange={(e) => handleFilterChange('regulatoryStatus', e.target.value)}
                            allowEmpty
                            emptyText="All Regulatory Statuses"
                            showDescription
                            data-testid="regulatory-status-filter"
                        />
                    </div>
                </div>

                {/* Active Filters Summary */}
                {Object.values(filters).some(v => v) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                        {filters.phase && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Phase: {studyPhases.data.find(p => p.value === filters.phase)?.label}
                                <button
                                    onClick={() => handleFilterChange('phase', '')}
                                    className="ml-1 hover:text-blue-600"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filters.status && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Status: {studyStatuses.data.find(s => s.value === filters.status)?.label}
                                <button
                                    onClick={() => handleFilterChange('status', '')}
                                    className="ml-1 hover:text-green-600"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {/* Clear all filters */}
                        <button
                            onClick={() => setFilters({ phase: '', status: '', regulatoryStatus: '', searchTerm: '' })}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Studies Grid */}
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">
                            Studies ({filteredStudiesMemo.length} of {studies.length})
                        </h3>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                New Study
                            </button>
                            <button
                                onClick={() => {
                                    studyPhases.refresh();
                                    studyStatuses.refresh();
                                    regulatoryStatuses.refresh();
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Refresh Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Study Cards */}
                <div className="p-6">
                    {filteredStudiesMemo.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No studies match your filters.</p>
                            <button
                                onClick={() => setFilters({ phase: '', status: '', regulatoryStatus: '', searchTerm: '' })}
                                className="mt-2 text-blue-600 hover:text-blue-800 underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStudiesMemo.map((study) => (
                                <StudyCard
                                    key={study.id}
                                    study={study}
                                    phaseData={studyPhases.data}
                                    statusData={studyStatuses.data}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Migration Comparison */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">📊 Phase 3 Integration Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h5 className="font-medium text-red-700 mb-2">❌ BEFORE (Legacy)</h5>
                        <ul className="space-y-1 text-red-600">
                            <li>• Hardcoded arrays in StudyService.js</li>
                            <li>• Manual API calls for each dropdown</li>
                            <li>• Complex error handling per component</li>
                            <li>• No caching - repeated network requests</li>
                            <li>• Inconsistent data formats</li>
                            <li>• Maintenance nightmare</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-medium text-green-700 mb-2">✅ AFTER (Modern)</h5>
                        <ul className="space-y-1 text-green-600">
                            <li>• Dynamic data from Admin Service</li>
                            <li>• useCodeList hooks with auto-caching</li>
                            <li>• Built-in error handling & fallbacks</li>
                            <li>• Smart caching with TTL</li>
                            <li>• Consistent data format everywhere</li>
                            <li>• Single source of truth</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Individual Study Card Component
 */
const StudyCard: React.FC<StudyCardProps> = ({ study, phaseData, statusData }) => {
    const phase = phaseData.find(p => p.value === study.phase);
    const status = statusData.find(s => s.value === study.status);

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900 truncate">{study.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(study.status)}`}>
                    {status?.label || study.status}
                </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
                <div>Protocol: {study.protocolNumber}</div>
                <div>Phase: {phase?.label || study.phase}</div>
                <div>Sponsor: {study.sponsor}</div>
                {study.principalInvestigator && (
                    <div>PI: {study.principalInvestigator}</div>
                )}
            </div>

            <div className="mt-4 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                    {study.enrolledSubjects || 0} / {study.plannedSubjects || 0} subjects
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View Details
                </button>
            </div>
        </div>
    );
};

const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        'ACTIVE': 'bg-green-100 text-green-800',
        'DRAFT': 'bg-gray-100 text-gray-800',
        'COMPLETED': 'bg-blue-100 text-blue-800',
        'PAUSED': 'bg-yellow-100 text-yellow-800',
        'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

export default ModernStudyListGrid;
