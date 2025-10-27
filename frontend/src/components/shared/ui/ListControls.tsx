import React from 'react';
import { Filter, SortAsc } from 'lucide-react';
import SearchBar from './SearchBar';

interface FilterOption {
    label: string;
    value: string;
}

interface ListFilter {
    label: string;
    value: string;
    options: FilterOption[];
    currentValue?: string;
}

interface SortOption {
    label: string;
    value: string;
}

interface ListControlsProps {
    onSearch: (searchTerm: string) => void;
    filters?: ListFilter[];
    onFilterChange: (filterName: string, value: string) => void;
    sortOptions?: SortOption[];
    currentSort?: string;
    onSortChange: (value: string) => void;
    searchPlaceholder?: string;
    className?: string;
}

/**
 * Universal List Controls component with search, filter, and sort
 */
const ListControls: React.FC<ListControlsProps> = ({
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
