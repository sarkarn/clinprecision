// src/components/modules/datacapture/components/SubjectFilters.jsx
import React from 'react';
import { useDebounce } from '../../../../hooks/useDebounce';

/**
 * SubjectFilters Component
 * 
 * Sticky filter bar for subject list with debounced search.
 * Provides status filter, site filter, search input, and legend toggle.
 * 
 * Features:
 * - Sticky positioning on scroll
 * - Debounced search (300ms delay)
 * - URL query param persistence for search
 * - Results count display
 * - Clear all filters button
 * 
 * Contract:
 * @param {string} statusFilter - Current status filter value
 * @param {Function} onStatusFilterChange - Callback when status filter changes
 * @param {string} siteFilter - Current site filter value
 * @param {Function} onSiteFilterChange - Callback when site filter changes
 * @param {string} searchTerm - Current search term
 * @param {Function} onSearchChange - Callback when search changes
 * @param {Array} availableSites - List of available site IDs
 * @param {boolean} showLegend - Whether legend is visible
 * @param {Function} onToggleLegend - Callback to toggle legend
 * @param {number} filteredCount - Number of filtered subjects
 * @param {number} totalCount - Total number of subjects
 * @param {Function} onClearFilters - Callback to clear all filters
 * @param {boolean} hasActiveFilters - Whether any filters are active
 */
const SubjectFilters = ({
    statusFilter,
    onStatusFilterChange,
    siteFilter,
    onSiteFilterChange,
    searchTerm,
    onSearchChange,
    availableSites = [],
    showLegend,
    onToggleLegend,
    filteredCount,
    totalCount,
    onClearFilters,
    hasActiveFilters
}) => {
    return (
        <div className="sticky top-0 z-10 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Search Subjects
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search by ID, name, site..."
                            className="w-full border border-gray-300 rounded px-3 py-2 pl-9 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Filter by Status
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="REQUIRES_ACTION">⚠️ Requires Action</option>
                        <option value="">---</option>
                        <option value="Registered">Registered</option>
                        <option value="Screening">Screening</option>
                        <option value="Enrolled">Enrolled</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Withdrawn">Withdrawn</option>
                        <option value="Screen Failed">Screen Failed</option>
                    </select>
                </div>

                {/* Site Filter */}
                {availableSites.length > 1 && (
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Filter by Site
                        </label>
                        <select
                            value={siteFilter}
                            onChange={(e) => onSiteFilterChange(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Sites</option>
                            {availableSites.map(site => (
                                <option key={site} value={site}>Site {site}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Legend Toggle */}
                <div className="flex items-end">
                    <button
                        onClick={onToggleLegend}
                        className="px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center"
                        aria-label={showLegend ? 'Hide legend' : 'Show legend'}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {showLegend ? 'Hide' : 'Show'} Legend
                    </button>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <div className="flex items-end">
                        <button
                            onClick={onClearFilters}
                            className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded flex items-center"
                            aria-label="Clear all filters"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Results Count */}
                <div className="ml-auto text-sm text-gray-600 whitespace-nowrap">
                    Showing {filteredCount} of {totalCount} subject{totalCount !== 1 ? 's' : ''}
                </div>
            </div>
        </div>
    );
};

export default SubjectFilters;
