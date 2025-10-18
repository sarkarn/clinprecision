import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BreadcrumbNavigation = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Define module mapping for better breadcrumb names
    const moduleNames = {
        'study-design': 'Protocol Design',
        'datacapture-management': 'Data Capture & Entry',
        'dq-management': 'Data Quality & Validation',
        'user-management': 'User & Site Management',
        'subject-management': 'Subject Management',
        'audit-trail': 'Audit Trail & Compliance',
        'medical-coding': 'Medical Coding',
        'reports': 'Clinical Reports',
        'data-integration': 'Data Integration',
        'system-monitoring': 'System Monitoring'
    };

    // Build breadcrumbs with smart segment handling
    const breadcrumbs = [];
    let currentPath = '';

    for (let index = 0; index < pathSegments.length; index++) {
        const segment = pathSegments[index];
        const prevSegment = index > 0 ? pathSegments[index - 1] : null;
        const nextSegment = index < pathSegments.length - 1 ? pathSegments[index + 1] : null;

        // Build path incrementally
        currentPath += '/' + segment;

        // Skip numeric IDs and certain segments for display, but keep them in the path
        const isNumeric = /^\d+$/.test(segment);
        const shouldSkipDisplay = isNumeric || segment === 'entry' || segment === 'view';

        if (shouldSkipDisplay) {
            continue;
        }

        // Get display name
        let name = moduleNames[segment] || segment.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        // Special handling for "visits" - should link back to subject details page
        // because there's no standalone visits list route
        let linkPath = currentPath;
        if (segment === 'visits') {
            // Remove /visits from the path to go back to subject details
            // e.g., /datacapture-management/subjects/4/visits -> /datacapture-management/subjects/4
            linkPath = currentPath.substring(0, currentPath.lastIndexOf('/visits'));
        }

        breadcrumbs.push({
            name,
            path: linkPath,
            isLast: false // We'll set this properly at the end
        });
    }

    // Ensure the last visible breadcrumb is marked as last
    if (breadcrumbs.length > 0) {
        breadcrumbs[breadcrumbs.length - 1].isLast = true;
    }

    if (pathSegments.length === 0) {
        return null; // Don't show breadcrumbs on home page
    }

    return (
        <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
            <Link
                to="/"
                className="flex items-center hover:text-blue-600 transition-colors duration-200"
            >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5v4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 5v4" />
                </svg>
                Dashboard
            </Link>

            {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.path}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>

                    {breadcrumb.isLast ? (
                        <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
                    ) : (
                        <Link
                            to={breadcrumb.path}
                            className="hover:text-blue-600 transition-colors duration-200"
                        >
                            {breadcrumb.name}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default BreadcrumbNavigation;