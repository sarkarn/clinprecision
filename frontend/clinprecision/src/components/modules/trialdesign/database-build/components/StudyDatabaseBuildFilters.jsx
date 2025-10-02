import React, { useState } from 'react';
import {
    MagnifyingGlassIcon,
    CalendarIcon,
    XMarkIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

/**
 * Enhanced filters component for build list with date range picker
 * Phase 2: Full implementation with all filtering capabilities
 */
const StudyDatabaseBuildFilters = ({ filters, onFilterChange, totalBuilds, filteredBuilds }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleStatusChange = (e) => {
        onFilterChange({ ...filters, status: e.target.value });
    };

    const handleSearchChange = (e) => {
        onFilterChange({ ...filters, searchTerm: e.target.value });
    };

    const handleSortChange = (e) => {
        onFilterChange({ ...filters, sortBy: e.target.value });
    };

    const handleDateFromChange = (e) => {
        onFilterChange({ ...filters, dateFrom: e.target.value });
    };

    const handleDateToChange = (e) => {
        onFilterChange({ ...filters, dateTo: e.target.value });
    };

    const handleClearDateRange = () => {
        onFilterChange({ ...filters, dateFrom: '', dateTo: '' });
    };

    const handleClearAllFilters = () => {
        onFilterChange({
            status: 'ALL',
            searchTerm: '',
            sortBy: 'buildStartTime',
            dateFrom: '',
            dateTo: '',
        });
    };

    // Check if any filters are active (excluding default sort)
    const hasActiveFilters =
        filters.status !== 'ALL' ||
        filters.searchTerm !== '' ||
        filters.dateFrom !== '' ||
        filters.dateTo !== '';

    // Format date for display
    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="bg-white border-b border-gray-200">
            {/* Main Filters Row */}
            <div className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Status Filter */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                            Status:
                        </label>
                        <select
                            id="status-filter"
                            value={filters.status}
                            onChange={handleStatusChange}
                            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="FAILED">Failed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    {/* Date Range Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${filters.dateFrom || filters.dateTo
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                                {filters.dateFrom || filters.dateTo
                                    ? `${formatDateDisplay(filters.dateFrom) || 'Start'} - ${formatDateDisplay(filters.dateTo) || 'End'}`
                                    : 'Date Range'}
                            </span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="flex-1 min-w-[250px] max-w-md">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by study name, protocol, or request ID..."
                                value={filters.searchTerm}
                                onChange={handleSearchChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="sort-filter" className="text-sm font-medium text-gray-700">
                            Sort by:
                        </label>
                        <select
                            id="sort-filter"
                            value={filters.sortBy}
                            onChange={handleSortChange}
                            className="block w-44 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="buildStartTime">Latest First</option>
                            <option value="-buildStartTime">Oldest First</option>
                            <option value="studyName">Study Name (A-Z)</option>
                            <option value="-studyName">Study Name (Z-A)</option>
                            <option value="buildStatus">Status</option>
                            <option value="buildDurationSeconds">Duration</option>
                        </select>
                    </div>

                    {/* Clear All Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearAllFilters}
                            className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <XMarkIcon className="h-4 w-4" />
                            <span>Clear All</span>
                        </button>
                    )}

                    {/* Results count */}
                    <div className="ml-auto flex items-center space-x-2 text-sm">
                        <FunnelIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{filteredBuilds}</span> of{' '}
                            <span className="font-semibold text-gray-900">{totalBuilds}</span> builds
                        </span>
                    </div>
                </div>
            </div>

            {/* Date Range Picker (collapsible) */}
            {showDatePicker && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="mt-4 flex items-center space-x-4">
                        <div className="flex-1">
                            <label htmlFor="date-from" className="block text-xs font-medium text-gray-700 mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                id="date-from"
                                value={filters.dateFrom || ''}
                                onChange={handleDateFromChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="date-to" className="block text-xs font-medium text-gray-700 mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                id="date-to"
                                value={filters.dateTo || ''}
                                onChange={handleDateToChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="pt-5">
                            <button
                                onClick={handleClearDateRange}
                                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-md border border-gray-300 transition-colors"
                            >
                                Clear Dates
                            </button>
                        </div>
                        <div className="pt-5">
                            <button
                                onClick={() => setShowDatePicker(false)}
                                className="px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Filter builds by their start time within the selected date range
                    </p>
                </div>
            )}
        </div>
    );
};

export default StudyDatabaseBuildFilters;
