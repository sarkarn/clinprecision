import React, { useState } from 'react';
import StudyDatabaseBuildCard from './StudyDatabaseBuildCard';
import StudyDatabaseBuildFilters from './StudyDatabaseBuildFilters';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { PlusIcon } from '@heroicons/react/24/outline';

/**
 * List component for displaying study database builds
 * Includes filtering, sorting, and search capabilities
 */
const StudyDatabaseBuildList = ({ builds, loading, error, onRefresh, onBuildDatabase }) => {
    const [filters, setFilters] = useState({
        status: 'ALL',
        studyId: null,
        searchTerm: '',
        sortBy: 'buildStartTime',
        sortOrder: 'desc',
    });

    /**
     * Filter builds based on current filter state
     */
    const filteredBuilds = builds.filter(build => {
        // Status filter
        if (filters.status !== 'ALL' && build.buildStatus !== filters.status) {
            return false;
        }

        // Study filter
        if (filters.studyId && build.studyId !== filters.studyId) {
            return false;
        }

        // Search filter
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            const matchesSearch = (
                build.studyName?.toLowerCase().includes(searchLower) ||
                build.buildRequestId?.toLowerCase().includes(searchLower) ||
                build.studyProtocol?.toLowerCase().includes(searchLower) ||
                build.aggregateUuid?.toLowerCase().includes(searchLower)
            );
            if (!matchesSearch) return false;
        }

        return true;
    });

    /**
     * Sort filtered builds
     */
    const sortedBuilds = [...filteredBuilds].sort((a, b) => {
        const aValue = a[filters.sortBy];
        const bValue = b[filters.sortBy];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Compare values
        let comparison = 0;
        if (typeof aValue === 'string') {
            comparison = aValue.localeCompare(bValue);
        } else if (aValue instanceof Date || typeof aValue === 'number') {
            comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            // For other types, convert to string
            comparison = String(aValue).localeCompare(String(bValue));
        }

        // Apply sort order
        return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    // Loading state
    if (loading && builds.length === 0) {
        return <LoadingSpinner message="Loading builds..." />;
    }

    // Empty state
    if (!loading && builds.length === 0) {
        return (
            <EmptyState
                title="No Database Builds"
                description="Get started by building a database for your study. This will configure the data capture structure based on your study design."
                icon="database"
                actionButton={
                    onBuildDatabase && (
                        <button
                            onClick={() => onBuildDatabase()}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Build Your First Database
                        </button>
                    )
                }
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <StudyDatabaseBuildFilters
                filters={filters}
                onFilterChange={setFilters}
                totalBuilds={builds.length}
                filteredBuilds={sortedBuilds.length}
            />

            {/* Build Cards */}
            {sortedBuilds.length > 0 ? (
                <div className="space-y-3 p-4">
                    {sortedBuilds.map(build => (
                        <StudyDatabaseBuildCard
                            key={build.id || build.aggregateUuid}
                            build={build}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-4">
                    <EmptyState
                        title="No Matching Builds"
                        description="Try adjusting your filters or search criteria to find what you're looking for."
                        icon="filter"
                    />
                </div>
            )}
        </div>
    );
};

export default StudyDatabaseBuildList;
