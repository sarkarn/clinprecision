import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    onSearch: (searchTerm: string) => void;
    placeholder?: string;
    debounceMs?: number;
    className?: string;
}

/**
 * Universal SearchBar component with debounce
 */
const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = "Search...",
    debounceMs = 300,
    className = ""
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchTerm, debounceMs, onSearch]);

    const handleClear = () => {
        setSearchTerm('');
        onSearch('');
    };

    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   placeholder-gray-400 text-gray-900"
                placeholder={placeholder}
            />
            {searchTerm && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 
                     hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
