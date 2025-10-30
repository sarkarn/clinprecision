import React, { FC, useState } from 'react';
import StudyDatabaseBuildCard from './StudyDatabaseBuildCard';
import StudyDatabaseBuildFilters from './StudyDatabaseBuildFilters';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import type { StudyDatabaseBuild, BuildStatus } from '../../../../../types/study/DatabaseBuild.types';

interface FilterState {
  status: BuildStatus | 'all';
  studyId: string;
  searchTerm: string;
  sortBy: 'startedAt' | 'completedAt' | 'buildStatus' | 'studyId';
  sortOrder: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

interface StudyDatabaseBuildListProps {
  builds: Array<StudyDatabaseBuild & {
    studyName?: string;
    studyProtocol?: string;
    inProgress?: boolean;
    buildStartTime?: string;
    buildEndTime?: string;
    buildDurationSeconds?: number;
    indexesCreated?: number;
  }>;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void | Promise<void>;
  onBuildDatabase?: () => void;
}

/**
 * List container for study database builds with filtering and sorting
 */
const StudyDatabaseBuildList: FC<StudyDatabaseBuildListProps> = ({
  builds,
  loading = false,
  error = null,
  onRefresh,
  onBuildDatabase,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    studyId: '',
    searchTerm: '',
    sortBy: 'startedAt',
    sortOrder: 'desc',
  });

  // Filter builds
  const filteredBuilds = builds.filter((build) => {
    // Status filter
    if (filters.status !== 'all' && build.buildStatus !== filters.status) {
      return false;
    }

    // Study ID filter
    if (filters.studyId && build.studyId.toString() !== filters.studyId) {
      return false;
    }

    // Search term (searches in study name, protocol, build ID)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesStudyName = build.studyName?.toLowerCase().includes(searchLower);
      const matchesProtocol = build.studyProtocol?.toLowerCase().includes(searchLower);
      const matchesBuildId = build.buildRequestId.toLowerCase().includes(searchLower);
      
      if (!matchesStudyName && !matchesProtocol && !matchesBuildId) {
        return false;
      }
    }

    return true;
  });

  // Sort builds
  const sortedBuilds = [...filteredBuilds].sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'startedAt':
        comparison = new Date(a.startedAt || 0).getTime() - new Date(b.startedAt || 0).getTime();
        break;
      case 'completedAt':
        comparison = new Date(a.completedAt || 0).getTime() - new Date(b.completedAt || 0).getTime();
        break;
      case 'buildStatus':
        comparison = a.buildStatus.localeCompare(b.buildStatus);
        break;
      case 'studyId':
        comparison = a.studyId - b.studyId;
        break;
      default:
        comparison = 0;
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>): void => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner message="Loading database builds..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Builds"
        description={error}
        icon="database"
        actionButton={
          onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <StudyDatabaseBuildFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        totalBuilds={builds.length}
        filteredBuilds={sortedBuilds.length}
      />

      {/* Build Cards */}
      {sortedBuilds.length === 0 ? (
        <EmptyState
          title="No Builds Found"
          description={
            filters.status !== 'all' || filters.searchTerm || filters.studyId
              ? 'No builds match your filter criteria. Try adjusting your filters.'
              : 'No database builds have been created yet.'
          }
          icon={filters.searchTerm ? 'search' : 'database'}
          actionButton={
            onBuildDatabase && !filters.searchTerm && !filters.studyId && filters.status === 'all' && (
              <button
                onClick={onBuildDatabase}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Build Database
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {sortedBuilds.map((build) => (
            <StudyDatabaseBuildCard
              key={build.buildRequestId}
              build={build}
              onRefresh={onRefresh}
              onBuildUpdated={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyDatabaseBuildList;
