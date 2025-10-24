import React, { useState } from 'react';
import {
    GitBranch, Clock, Users, CheckCircle,
    ChevronRight, ChevronDown,
    Calendar, FileText, Activity
} from 'lucide-react';

/**
 * Enhanced Version Management Interface Component
 * Provides improved visual hierarchy and better version status indicators
 */
const EnhancedVersionManager = ({
    versions,
    selectedVersion,
    onSelectVersion,
    onCompareVersions,
    currentVersion,
    pendingRevisions = []
}) => {
    const [groupBy, setGroupBy] = useState('chronological'); // 'chronological', 'type', 'status'
    const [expandedGroups, setExpandedGroups] = useState(new Set(['active', 'recent']));
    const [selectedForComparison, setSelectedForComparison] = useState([]);
    const [showTimeline, setShowTimeline] = useState(false);

    // Group versions based on selected criteria
    const getGroupedVersions = () => {
        switch (groupBy) {
            case 'type':
                return groupByType(versions);
            case 'status':
                return groupByStatus(versions);
            case 'chronological':
            default:
                return groupByDate(versions);
        }
    };

    const groupByDate = (versions) => {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
        const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));

        const groups = {
            active: {
                title: 'Current Version',
                versions: versions.filter(v => v.status === 'ACTIVE'),
                icon: <Activity className="h-4 w-4" />,
                color: 'green'
            },
            recent: {
                title: 'Recent (Last 6 months)',
                versions: versions.filter(v =>
                    v.status !== 'ACTIVE' &&
                    new Date(v.publishedDate) > sixMonthsAgo
                ),
                icon: <Clock className="h-4 w-4" />,
                color: 'blue'
            },
            archived: {
                title: 'Archived (6 months - 1 year)',
                versions: versions.filter(v => {
                    const date = new Date(v.publishedDate);
                    return date <= sixMonthsAgo && date > oneYearAgo;
                }),
                icon: <FileText className="h-4 w-4" />,
                color: 'gray'
            },
            legacy: {
                title: 'Legacy (Over 1 year)',
                versions: versions.filter(v =>
                    new Date(v.publishedDate) <= oneYearAgo
                ),
                icon: <FileText className="h-4 w-4" />,
                color: 'gray'
            }
        };

        return Object.entries(groups).filter(([_, group]) => group.versions.length > 0);
    };

    const groupByType = (versions) => {
        const typeGroups = {
            'ORIGINAL': { title: 'Original Protocol', color: 'purple' },
            'SUBSTANTIAL_AMENDMENT': { title: 'Major Amendments', color: 'red' },
            'MINOR_AMENDMENT': { title: 'Minor Amendments', color: 'yellow' },
            'ADMINISTRATIVE_CHANGE': { title: 'Administrative Changes', color: 'blue' }
        };

        const groups = {};
        Object.entries(typeGroups).forEach(([type, config]) => {
            const typeVersions = versions.filter(v => v.type === type);
            if (typeVersions.length > 0) {
                groups[type] = {
                    title: config.title,
                    versions: typeVersions,
                    icon: <GitBranch className="h-4 w-4" />,
                    color: config.color
                };
            }
        });

        return Object.entries(groups);
    };

    const groupByStatus = (versions) => {
        const statusGroups = {
            'ACTIVE': { title: 'Active', color: 'green' },
            'ARCHIVED': { title: 'Archived', color: 'gray' },
            'DRAFT': { title: 'Draft', color: 'blue' }
        };

        const groups = {};
        Object.entries(statusGroups).forEach(([status, config]) => {
            const statusVersions = versions.filter(v => v.status === status);
            if (statusVersions.length > 0) {
                groups[status] = {
                    title: config.title,
                    versions: statusVersions,
                    icon: getStatusIcon(status),
                    color: config.color
                };
            }
        });

        return Object.entries(groups);
    };

    // Toggle group expansion
    const toggleGroup = (groupKey) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupKey)) {
            newExpanded.delete(groupKey);
        } else {
            newExpanded.add(groupKey);
        }
        setExpandedGroups(newExpanded);
    };

    // Handle version selection for comparison
    const handleVersionToggle = (version) => {
        const newSelected = [...selectedForComparison];
        const index = newSelected.findIndex(v => v.id === version.id);

        if (index >= 0) {
            newSelected.splice(index, 1);
        } else if (newSelected.length < 2) {
            newSelected.push(version);
        } else {
            // Replace oldest selection
            newSelected.shift();
            newSelected.push(version);
        }

        setSelectedForComparison(newSelected);

        // Auto-trigger comparison when 2 versions are selected
        if (newSelected.length === 2) {
            onCompareVersions(newSelected);
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'ARCHIVED':
                return <FileText className="h-4 w-4 text-gray-500" />;
            case 'DRAFT':
                return <Clock className="h-4 w-4 text-blue-500" />;
            default:
                return <div className="h-4 w-4 rounded-full bg-gray-300" />;
        }
    };

    // Get version status color
    const getVersionStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'ARCHIVED':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'DRAFT':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get revision type color
    const getRevisionTypeColor = (type) => {
        switch (type) {
            case 'SUBSTANTIAL_AMENDMENT':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'MINOR_AMENDMENT':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ADMINISTRATIVE_CHANGE':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ORIGINAL':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get group color classes
    const getGroupColorClasses = (color) => {
        const colorMap = {
            green: 'bg-green-50 border-green-200',
            blue: 'bg-blue-50 border-blue-200',
            red: 'bg-red-50 border-red-200',
            yellow: 'bg-yellow-50 border-yellow-200',
            purple: 'bg-purple-50 border-purple-200',
            gray: 'bg-gray-50 border-gray-200'
        };
        return colorMap[color] || colorMap.gray;
    };

    return (
        <div className="space-y-6">
            {/* Enhanced Header with Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Version Management</h3>
                        <p className="text-gray-600 mt-1">
                            Track protocol changes and manage version history
                        </p>
                    </div>

                    {/* Control Panel */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Group by:</label>
                            <select
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                                className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="chronological">Date</option>
                                <option value="type">Type</option>
                                <option value="status">Status</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="timeline-view"
                                checked={showTimeline}
                                onChange={(e) => setShowTimeline(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="timeline-view" className="text-sm text-gray-700">
                                Timeline View
                            </label>
                        </div>
                    </div>
                </div>

                {/* Version Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-green-900">
                                    v{currentVersion}
                                </div>
                                <div className="text-sm text-green-700">Current Version</div>
                            </div>
                            <Activity className="h-6 w-6 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-blue-900">{versions.length}</div>
                                <div className="text-sm text-blue-700">Total Versions</div>
                            </div>
                            <GitBranch className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-yellow-900">{pendingRevisions.length}</div>
                                <div className="text-sm text-yellow-700">Pending Reviews</div>
                            </div>
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-purple-900">
                                    {versions.filter(v => v.subjectsEnrolled > 0).length}
                                </div>
                                <div className="text-sm text-purple-700">With Subjects</div>
                            </div>
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Comparison Selection Info */}
                {selectedForComparison.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    {selectedForComparison.length} version{selectedForComparison.length > 1 ? 's' : ''} selected for comparison
                                </span>
                            </div>
                            {selectedForComparison.length === 2 && (
                                <span className="text-xs text-blue-700">
                                    v{selectedForComparison[0].version} ↔ v{selectedForComparison[1].version}
                                </span>
                            )}
                        </div>
                        {selectedForComparison.length === 1 && (
                            <p className="text-xs text-blue-700 mt-1">
                                Select one more version to compare
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Version Groups */}
            <div className="space-y-4">
                {getGroupedVersions().map(([groupKey, group]) => (
                    <div key={groupKey} className={`rounded-lg border ${getGroupColorClasses(group.color)}`}>
                        {/* Group Header */}
                        <div
                            className="p-4 cursor-pointer hover:bg-opacity-80"
                            onClick={() => toggleGroup(groupKey)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {group.icon}
                                    <h4 className="font-medium text-gray-900">{group.title}</h4>
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-50">
                                        {group.versions.length} version{group.versions.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                {expandedGroups.has(groupKey) ? (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-gray-500" />
                                )}
                            </div>
                        </div>

                        {/* Group Content */}
                        {expandedGroups.has(groupKey) && (
                            <div className="border-t border-gray-200 bg-white bg-opacity-50">
                                {showTimeline ? (
                                    <VersionTimeline
                                        versions={group.versions}
                                        selectedVersion={selectedVersion}
                                        selectedForComparison={selectedForComparison}
                                        onSelectVersion={onSelectVersion}
                                        onVersionToggle={handleVersionToggle}
                                        getVersionStatusColor={getVersionStatusColor}
                                        getRevisionTypeColor={getRevisionTypeColor}
                                        getStatusIcon={getStatusIcon}
                                    />
                                ) : (
                                    <VersionList
                                        versions={group.versions}
                                        selectedVersion={selectedVersion}
                                        selectedForComparison={selectedForComparison}
                                        onSelectVersion={onSelectVersion}
                                        onVersionToggle={handleVersionToggle}
                                        getVersionStatusColor={getVersionStatusColor}
                                        getRevisionTypeColor={getRevisionTypeColor}
                                        getStatusIcon={getStatusIcon}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Version List Component
const VersionList = ({
    versions,
    selectedVersion,
    selectedForComparison,
    onSelectVersion,
    onVersionToggle,
    getVersionStatusColor,
    getRevisionTypeColor,
    getStatusIcon
}) => {
    return (
        <div className="divide-y divide-gray-200">
            {versions.map((version) => {
                const isSelected = selectedVersion?.id === version.id;
                const isSelectedForComparison = selectedForComparison.some(v => v.id === version.id);

                return (
                    <div
                        key={version.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                        onClick={() => onSelectVersion(version)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h5 className="font-semibold text-gray-900">
                                        Version {version.version}
                                    </h5>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVersionStatusColor(version.status)}`}>
                                        {version.status}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRevisionTypeColor(version.type)}`}>
                                        {version.type.replace('_', ' ')}
                                    </span>
                                </div>

                                <h6 className="font-medium text-gray-700 mb-1">{version.title}</h6>
                                <p className="text-sm text-gray-600 mb-3">{version.summary}</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>Published: {new Date(version.publishedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Users className="h-3 w-3" />
                                        <span>{version.subjectsEnrolled} subjects</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <FileText className="h-3 w-3" />
                                        <span>{version.changes?.length || 0} changes</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>By {version.createdBy}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                                <input
                                    type="checkbox"
                                    checked={isSelectedForComparison}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onVersionToggle(version);
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    title="Select for comparison"
                                />
                                {getStatusIcon(version.status)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Version Timeline Component
const VersionTimeline = ({
    versions,
    selectedVersion,
    selectedForComparison,
    onSelectVersion,
    onVersionToggle,
    getVersionStatusColor,
    getRevisionTypeColor,
    getStatusIcon
}) => {
    // Sort versions by date for timeline
    const sortedVersions = [...versions].sort((a, b) =>
        new Date(b.publishedDate) - new Date(a.publishedDate)
    );

    return (
        <div className="p-4">
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-4 bottom-4 w-px bg-gray-300"></div>

                <div className="space-y-6">
                    {sortedVersions.map((version, index) => {
                        const isSelected = selectedVersion?.id === version.id;
                        const isSelectedForComparison = selectedForComparison.some(v => v.id === version.id);

                        return (
                            <div key={version.id} className="relative flex items-start space-x-4">
                                {/* Timeline dot */}
                                <div className={`flex-shrink-0 w-3 h-3 rounded-full border-2 bg-white z-10 ${version.status === 'ACTIVE' ? 'border-green-500' :
                                    version.status === 'ARCHIVED' ? 'border-gray-400' : 'border-blue-500'
                                    }`}></div>

                                {/* Version card */}
                                <div
                                    className={`flex-1 p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                                        }`}
                                    onClick={() => onSelectVersion(version)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h5 className="font-semibold text-gray-900">
                                                    Version {version.version}
                                                </h5>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVersionStatusColor(version.status)}`}>
                                                    {version.status}
                                                </span>
                                            </div>

                                            <h6 className="font-medium text-gray-700 mb-1">{version.title}</h6>
                                            <p className="text-sm text-gray-600 mb-2">{version.summary}</p>

                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <span>{new Date(version.publishedDate).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{version.subjectsEnrolled} subjects</span>
                                                <span>•</span>
                                                <span>{version.createdBy}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={isSelectedForComparison}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    onVersionToggle(version);
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            {getStatusIcon(version.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EnhancedVersionManager;