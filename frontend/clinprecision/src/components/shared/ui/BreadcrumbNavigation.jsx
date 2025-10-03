import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Dynamic Breadcrumb Navigation component
 * @param {Array} items - Array of breadcrumb items: [{label, path}]
 * @param {boolean} showHome - Show home icon as first item
 */
const BreadcrumbNavigation = ({ items = [], showHome = true, className = "" }) => {
    return (
        <nav className={`flex items-center text-sm text-gray-600 mb-4 ${className}`}>
            {showHome && (
                <>
                    <Link
                        to="/"
                        className="flex items-center hover:text-blue-600 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                    </Link>
                    {items.length > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
                </>
            )}

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.path ? (
                        <Link
                            to={item.path}
                            className="hover:text-blue-600 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-gray-900">
                            {item.label}
                        </span>
                    )}

                    {index < items.length - 1 && (
                        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default BreadcrumbNavigation;
