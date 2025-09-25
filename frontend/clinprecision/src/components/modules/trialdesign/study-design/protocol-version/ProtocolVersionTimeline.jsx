import React from 'react';
import {
    FileText,
    Clock,
    CheckCircle,
    Play,
    GitBranch,
    AlertTriangle,
    Calendar,
    User,
    ChevronRight
} from 'lucide-react';

// Get status icon and color - shared utility function
const getStatusDisplay = (status) => {
    switch (status) {
        case 'DRAFT':
            return {
                icon: FileText,
                color: 'text-gray-500',
                bgColor: 'bg-gray-100',
                borderColor: 'border-gray-300'
            };
        case 'PROTOCOL_REVIEW':
            return {
                icon: Clock,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100',
                borderColor: 'border-yellow-300'
            };
        case 'APPROVED':
            return {
                icon: CheckCircle,
                color: 'text-green-600',
                bgColor: 'bg-green-100',
                borderColor: 'border-green-300'
            };
        case 'ACTIVE':
            return {
                icon: Play,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100',
                borderColor: 'border-blue-300'
            };
        case 'SUPERSEDED':
            return {
                icon: GitBranch,
                color: 'text-orange-600',
                bgColor: 'bg-orange-100',
                borderColor: 'border-orange-300'
            };
        case 'WITHDRAWN':
            return {
                icon: AlertTriangle,
                color: 'text-red-600',
                bgColor: 'bg-red-100',
                borderColor: 'border-red-300'
            };
        default:
            return {
                icon: FileText,
                color: 'text-gray-500',
                bgColor: 'bg-gray-100',
                borderColor: 'border-gray-300'
            };
    }
};

/**
 * Protocol Version Timeline Component
 * Displays version history in a visual timeline
 */
const ProtocolVersionTimeline = ({
    versions = [],
    currentVersionId = null,
    onVersionSelect,
    compact = false,
    maxItems = null
}) => {
    // Sort versions by creation date (newest first)
    const sortedVersions = [...versions].sort((a, b) =>
        new Date(b.createdDate) - new Date(a.createdDate)
    );

    // Limit items if maxItems is specified
    const displayVersions = maxItems
        ? sortedVersions.slice(0, maxItems)
        : sortedVersions;

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format time for display
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get relative time (e.g., "2 days ago")
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return formatDate(dateString);
    };

    if (displayVersions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No protocol versions found</p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="space-y-2">
                {displayVersions.map((version, index) => {
                    const statusDisplay = getStatusDisplay(version.status);
                    const StatusIcon = statusDisplay.icon;
                    const isCurrentVersion = version.id === currentVersionId;

                    return (
                        <div
                            key={version.id}
                            className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${isCurrentVersion
                                ? `${statusDisplay.bgColor} ${statusDisplay.borderColor} border-2`
                                : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            onClick={() => onVersionSelect?.(version)}
                        >
                            <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">
                                        v{version.versionNumber}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                                        {version.statusInfo?.label || version.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {version.description}
                                </p>
                            </div>
                            <div className="text-xs text-gray-400">
                                {getRelativeTime(version.createdDate)}
                            </div>
                            {onVersionSelect && (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
                {displayVersions.map((version, index) => {
                    const statusDisplay = getStatusDisplay(version.status);
                    const StatusIcon = statusDisplay.icon;
                    const isCurrentVersion = version.id === currentVersionId;

                    return (
                        <div key={version.id} className="relative flex items-start gap-4">
                            {/* Timeline dot */}
                            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${statusDisplay.borderColor} ${statusDisplay.bgColor}`}>
                                <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
                            </div>

                            {/* Content */}
                            <div
                                className={`flex-1 min-w-0 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${isCurrentVersion
                                    ? `${statusDisplay.bgColor} ${statusDisplay.borderColor} border-2 shadow-sm`
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                                onClick={() => onVersionSelect?.(version)}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                Protocol Version {version.versionNumber}
                                            </h4>
                                            {isCurrentVersion && (
                                                <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusDisplay.bgColor} ${statusDisplay.color} font-medium`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {version.statusInfo?.label || version.status}
                                            </span>
                                            {version.amendmentType && version.amendmentType !== 'INITIAL' && (
                                                <span className="inline-flex items-center gap-1">
                                                    <GitBranch className="h-3 w-3" />
                                                    {version.amendmentType}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(version.createdDate)}
                                        </div>
                                        <div>{formatTime(version.createdDate)}</div>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-gray-700 mb-3">
                                    {version.description}
                                </p>

                                {/* Amendment details */}
                                {version.amendmentReason && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-md">
                                        <h5 className="text-sm font-medium text-gray-900 mb-1">
                                            Amendment Reason
                                        </h5>
                                        <p className="text-sm text-gray-700">
                                            {version.amendmentReason}
                                        </p>
                                    </div>
                                )}

                                {/* Changes summary */}
                                {version.changesSummary && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-md">
                                        <h5 className="text-sm font-medium text-gray-900 mb-1">
                                            Changes Summary
                                        </h5>
                                        <p className="text-sm text-gray-700">
                                            {version.changesSummary}
                                        </p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            Created by User #{version.createdBy}
                                        </span>
                                        {version.approvedBy && (
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Approved by User #{version.approvedBy}
                                            </span>
                                        )}
                                    </div>

                                    {version.effectiveDate && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Effective: {formatDate(version.effectiveDate)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show more link */}
            {maxItems && versions.length > maxItems && (
                <div className="mt-4 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View {versions.length - maxItems} more versions
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * Mini Timeline - Very compact version for dashboards
 */
export const ProtocolVersionMiniTimeline = ({
    versions = [],
    currentVersionId = null,
    onVersionSelect
}) => {
    const sortedVersions = [...versions].sort((a, b) =>
        new Date(b.createdDate) - new Date(a.createdDate)
    ).slice(0, 5); // Show only last 5 versions

    if (sortedVersions.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">History:</span>
            <div className="flex items-center gap-1">
                {sortedVersions.map((version, index) => {
                    const statusDisplay = getStatusDisplay(version.status);
                    const StatusIcon = statusDisplay.icon;
                    const isCurrentVersion = version.id === currentVersionId;

                    return (
                        <button
                            key={version.id}
                            onClick={() => onVersionSelect?.(version)}
                            className={`p-1 rounded border transition-colors ${isCurrentVersion
                                ? `${statusDisplay.bgColor} ${statusDisplay.borderColor}`
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            title={`v${version.versionNumber} - ${version.statusInfo?.label || version.status}`}
                        >
                            <StatusIcon className={`h-3 w-3 ${statusDisplay.color}`} />
                        </button>
                    );
                })}
                {versions.length > 5 && (
                    <span className="text-xs text-gray-400 ml-1">
                        +{versions.length - 5} more
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProtocolVersionTimeline;