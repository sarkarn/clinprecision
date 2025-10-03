import React from 'react';
import { Filter, SortAsc } from 'lucide-react';
import SearchBar from './SearchBar';

/**
 * Universal List Controls component with search, filter, and sort
 * @param {function} onSearch - Search callback
 * @param {Array} filters - Array of filter objects: [{label, value, options: [{label, value}]}]
 * @param {function} onFilterChange - Filter change callback (filterName, value)
 * @param {Array} sortOptions - Array of sort options: [{label, value}]
 * @param {string} currentSort - Current sort value
 * @param {function} onSortChange - Sort change callback
 * @param {string} searchPlaceholder - Search placeholder text
 */
const ListControls = ({
    onSearch,
    filters = [],
    onFilterChange,
    sortOptions = [],
    currentSort = '',
    onSortChange,
    searchPlaceholder = "Search...",
    className = ""
}) => {
    return (
        <div className={`bg-white p-4 rounded-lg border border-gray-200 mb-6 ${className}`}>
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                    <SearchBar
                        onSearch={onSearch}
                        placeholder={searchPlaceholder}
                    />
                </div>

                {/* Filters */}
                {filters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {filters.map(filter => (
                            <div key={filter.value} className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <select
                                    value={filter.currentValue || ''}
                                    onChange={(e) => onFilterChange(filter.value, e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">{filter.label}</option>
                                    {filter.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sort */}
                {sortOptions.length > 0 && (
                    <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4 text-gray-400" />
                        <select
                            value={currentSort}
                            onChange={(e) => onSortChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Sort by...</option>
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListControls;
