import React, { FC, useState, ChangeEvent } from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { BuildStatus } from '../../../../../../../src/types/domain/DatabaseBuild.types';

interface FilterState {
  status: BuildStatus | 'all';
  studyId: string;
  searchTerm: string;
  sortBy: 'startedAt' | 'completedAt' | 'buildStatus' | 'studyId';
  sortOrder: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

interface StudyDatabaseBuildFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  totalBuilds: number;
  filteredBuilds: number;
}

/**
 * Filter component for study database builds
 */
const StudyDatabaseBuildFilters: FC<StudyDatabaseBuildFiltersProps> = ({
  filters,
  onFilterChange,
  totalBuilds,
  filteredBuilds,
}) => {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Handle status change
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    onFilterChange({ status: e.target.value as BuildStatus | 'all' });
  };

  // Handle search change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onFilterChange({ searchTerm: e.target.value });
  };

  // Handle sort change
  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
    onFilterChange({ sortBy, sortOrder });
  };

  // Handle date from change
  const handleDateFromChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onFilterChange({ dateFrom: e.target.value });
  };

  // Handle date to change
  const handleDateToChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onFilterChange({ dateTo: e.target.value });
  };

  // Handle clear date range
  const handleClearDateRange = (): void => {
    onFilterChange({ dateFrom: undefined, dateTo: undefined });
    setShowDatePicker(false);
  };

  // Handle clear all filters
  const handleClearAllFilters = (): void => {
    onFilterChange({
      status: 'all',
      studyId: '',
      searchTerm: '',
      sortBy: 'startedAt',
      sortOrder: 'desc',
      dateFrom: undefined,
      dateTo: undefined,
    });
    setShowDatePicker(false);
  };

  const hasActiveFilters = filters.status !== 'all' || filters.searchTerm || filters.studyId || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Top Row - Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FunnelIcon className="h-4 w-4 inline mr-1" />
            Status
          </label>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value={BuildStatus.IN_PROGRESS}>In Progress</option>
            <option value={BuildStatus.COMPLETED}>Completed</option>
            <option value={BuildStatus.FAILED}>Failed</option>
            <option value={BuildStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>

        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by study name, protocol, or build ID..."
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {filters.searchTerm && (
              <button
                onClick={() => onFilterChange({ searchTerm: '' })}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="startedAt-desc">Newest First</option>
            <option value="startedAt-asc">Oldest First</option>
            <option value="completedAt-desc">Recently Completed</option>
            <option value="buildStatus-asc">Status (A-Z)</option>
            <option value="buildStatus-desc">Status (Z-A)</option>
            <option value="studyId-asc">Study ID</option>
          </select>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="mt-4">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <CalendarIcon className="h-4 w-4 mr-1" />
          {showDatePicker ? 'Hide' : 'Show'} Date Range
        </button>

        {showDatePicker && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={handleDateFromChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={handleDateToChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(filters.dateFrom || filters.dateTo) && (
              <div className="md:col-span-2">
                <button
                  onClick={handleClearDateRange}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Date Range
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Row - Results and Clear */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredBuilds}</span> of{' '}
          <span className="font-semibold">{totalBuilds}</span> builds
          {hasActiveFilters && (
            <span className="ml-2 text-blue-600">(filtered)</span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearAllFilters}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 font-medium border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            <XMarkIcon className="h-4 w-4 inline mr-1" />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyDatabaseBuildFilters;
