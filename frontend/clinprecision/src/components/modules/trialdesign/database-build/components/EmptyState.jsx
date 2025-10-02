import React from 'react';
import {
    CircleStackIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

/**
 * Empty state component for when no builds are available
 */
const EmptyState = ({ title, description, icon = 'database', actionButton }) => {

    // Icon mapping
    const iconMap = {
        database: CircleStackIcon,
        search: MagnifyingGlassIcon,
        filter: FunnelIcon,
        document: DocumentMagnifyingGlassIcon,
    };

    const IconComponent = iconMap[icon] || CircleStackIcon;

    return (
        <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <IconComponent className="h-8 w-8 text-gray-400" />
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
                {title}
            </h3>

            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                {description}
            </p>

            {actionButton && (
                <div className="mt-6">
                    {actionButton}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
