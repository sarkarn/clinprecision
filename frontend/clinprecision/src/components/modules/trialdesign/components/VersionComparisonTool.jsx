import React, { useState, useEffect } from 'react';
import { ArrowRight, GitCompare, Eye, EyeOff, Plus, Minus, Edit3, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../components/UIComponents';

/**
 * Version Comparison Tool Component
 * Advanced tool for comparing protocol versions with detailed change tracking
 */
const VersionComparisonTool = ({
    versions,
    selectedVersions = [],
    onVersionSelect,
    isVisible,
    onClose
}) => {
    const [compareMode, setCompareMode] = useState('side-by-side'); // 'side-by-side', 'unified', 'change-only'
    const [showMinorChanges, setShowMinorChanges] = useState(true);
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [changeFilter, setChangeFilter] = useState('all'); // 'all', 'additions', 'modifications', 'deletions'

    // Ensure we have exactly 2 versions for comparison
    const versionA = selectedVersions[0];
    const versionB = selectedVersions[1];

    // Mock comparison data - in real implementation, this would come from API
    const getComparisonData = () => {
        if (!versionA || !versionB) return null;

        return {
            summary: {
                totalChanges: 12,
                additions: 4,
                modifications: 6,
                deletions: 2,
                impactLevel: 'MEDIUM'
            },
            sections: [
                {
                    id: 'primary-endpoint',
                    name: 'Primary Endpoint',
                    type: 'MODIFICATION',
                    impactLevel: 'HIGH',
                    oldValue: 'Overall survival (OS) measured from randomization to death from any cause',
                    newValue: 'Progression-free survival (PFS) measured from randomization to disease progression or death',
                    justification: 'Updated FDA guidance and interim analysis results',
                    reviewer: 'Dr. Sarah Johnson',
                    reviewDate: '2024-01-10T14:30:00Z'
                },
                {
                    id: 'inclusion-criteria',
                    name: 'Inclusion Criteria - ECOG Performance Status',
                    type: 'MODIFICATION',
                    impactLevel: 'MEDIUM',
                    oldValue: 'ECOG performance status 0-1',
                    newValue: 'ECOG performance status 0-2',
                    justification: 'Broaden eligible patient population based on investigator feedback',
                    reviewer: 'Dr. Michael Chen',
                    reviewDate: '2024-01-08T10:15:00Z'
                },
                {
                    id: 'biomarker-substudy',
                    name: 'Biomarker Substudy',
                    type: 'ADDITION',
                    impactLevel: 'MEDIUM',
                    oldValue: null,
                    newValue: 'Mandatory tumor biopsy at baseline and progression for biomarker analysis',
                    justification: 'Enable personalized medicine approach and future biomarker-driven analyses',
                    reviewer: 'Dr. Lisa Rodriguez',
                    reviewDate: '2024-01-12T16:45:00Z'
                },
                {
                    id: 'contact-info',
                    name: 'Principal Investigator Contact',
                    type: 'MODIFICATION',
                    impactLevel: 'LOW',
                    oldValue: 'Phone: (555) 123-4567, Email: pi@oldsite.edu',
                    newValue: 'Phone: (555) 987-6543, Email: pi@newsite.edu',
                    justification: 'PI office relocation',
                    reviewer: 'Study Coordinator',
                    reviewDate: '2024-01-05T09:20:00Z'
                },
                {
                    id: 'study-sites',
                    name: 'Study Sites',
                    type: 'ADDITION',
                    impactLevel: 'LOW',
                    oldValue: '15 sites across 3 countries',
                    newValue: '17 sites across 3 countries (added Site 016: Regional Medical Center, Site 017: University Hospital)',
                    justification: 'Enhance recruitment capacity',
                    reviewer: 'Site Management Team',
                    reviewDate: '2024-01-06T11:30:00Z'
                },
                {
                    id: 'safety-monitoring',
                    name: 'Safety Monitoring Frequency',
                    type: 'MODIFICATION',
                    impactLevel: 'MEDIUM',
                    oldValue: 'Liver function tests every 6 weeks',
                    newValue: 'Liver function tests every 3 weeks for first 12 weeks, then every 6 weeks',
                    justification: 'DSMB recommendation following safety review',
                    reviewer: 'Dr. James Wilson',
                    reviewDate: '2024-01-11T13:15:00Z'
                }
            ]
        };
    };

    const comparisonData = getComparisonData();

    // Toggle section expansion
    const toggleSection = (sectionId) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    // Get change type color
    const getChangeTypeColor = (type) => {
        switch (type) {
            case 'ADDITION':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'MODIFICATION':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'DELETION':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    // Get impact level color
    const getImpactLevelColor = (level) => {
        switch (level) {
            case 'HIGH':
                return 'bg-red-100 text-red-800';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800';
            case 'LOW':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get change type icon
    const getChangeTypeIcon = (type) => {
        switch (type) {
            case 'ADDITION':
                return <Plus className="h-4 w-4 text-green-600" />;
            case 'MODIFICATION':
                return <Edit3 className="h-4 w-4 text-blue-600" />;
            case 'DELETION':
                return <Minus className="h-4 w-4 text-red-600" />;
            default:
                return <Info className="h-4 w-4 text-gray-600" />;
        }
    };

    // Filter changes based on current filter
    const getFilteredChanges = () => {
        if (!comparisonData) return [];

        let filtered = comparisonData.sections;

        if (changeFilter !== 'all') {
            const filterMap = {
                'additions': 'ADDITION',
                'modifications': 'MODIFICATION',
                'deletions': 'DELETION'
            };
            filtered = filtered.filter(change => change.type === filterMap[changeFilter]);
        }

        if (!showMinorChanges) {
            filtered = filtered.filter(change => change.impactLevel !== 'LOW');
        }

        return filtered;
    };

    if (!isVisible || !versionA || !versionB) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-3">
                                <GitCompare className="h-6 w-6 text-blue-600" />
                                <h3 className="text-xl font-semibold text-gray-900">Version Comparison</h3>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                    <span className="text-sm text-gray-600">
                                        Version {versionA.version} - {versionA.title}
                                    </span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span className="text-sm text-gray-600">
                                        Version {versionB.version} - {versionB.title}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>

                    {/* Comparison Summary */}
                    {comparisonData && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg border">
                                <div className="text-2xl font-bold text-gray-900">{comparisonData.summary.totalChanges}</div>
                                <div className="text-sm text-gray-600">Total Changes</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="text-2xl font-bold text-green-900">{comparisonData.summary.additions}</div>
                                <div className="text-sm text-green-700">Additions</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="text-2xl font-bold text-blue-900">{comparisonData.summary.modifications}</div>
                                <div className="text-sm text-blue-700">Modifications</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div className="text-2xl font-bold text-red-900">{comparisonData.summary.deletions}</div>
                                <div className="text-sm text-red-700">Deletions</div>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">View:</label>
                                <select
                                    value={compareMode}
                                    onChange={(e) => setCompareMode(e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="side-by-side">Side by Side</option>
                                    <option value="unified">Unified</option>
                                    <option value="change-only">Changes Only</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Filter:</label>
                                <select
                                    value={changeFilter}
                                    onChange={(e) => setChangeFilter(e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Changes</option>
                                    <option value="additions">Additions Only</option>
                                    <option value="modifications">Modifications Only</option>
                                    <option value="deletions">Deletions Only</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={showMinorChanges}
                                    onChange={(e) => setShowMinorChanges(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Show minor changes</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Comparison Content */}
                <div className="overflow-y-auto max-h-[60vh]">
                    {comparisonData && getFilteredChanges().length > 0 ? (
                        <div className="p-6 space-y-4">
                            {getFilteredChanges().map((change) => (
                                <div
                                    key={change.id}
                                    className={`border rounded-lg ${getChangeTypeColor(change.type)}`}
                                >
                                    {/* Change Header */}
                                    <div
                                        className="p-4 cursor-pointer hover:bg-opacity-80"
                                        onClick={() => toggleSection(change.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {getChangeTypeIcon(change.type)}
                                                <h4 className="font-medium text-gray-900">{change.name}</h4>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactLevelColor(change.impactLevel)}`}>
                                                    {change.impactLevel} Impact
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(change.reviewDate).toLocaleDateString()}
                                                </span>
                                                {expandedSections.has(change.id) ? (
                                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Change Details */}
                                    {expandedSections.has(change.id) && (
                                        <div className="border-t border-gray-200 bg-white bg-opacity-50">
                                            <div className="p-4 space-y-4">
                                                {/* Before/After Comparison */}
                                                {compareMode === 'side-by-side' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {change.oldValue && (
                                                            <div>
                                                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                                    Before (v{versionA.version})
                                                                </h5>
                                                                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                                                                    {change.oldValue}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                                {change.type === 'ADDITION' ? 'Added' : 'After'} (v{versionB.version})
                                                            </h5>
                                                            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                                                                {change.newValue}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {compareMode === 'unified' && (
                                                    <div className="space-y-2">
                                                        {change.oldValue && (
                                                            <div className="flex items-start space-x-2">
                                                                <Minus className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm flex-1">
                                                                    {change.oldValue}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex items-start space-x-2">
                                                            <Plus className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                            <div className="p-2 bg-green-50 border border-green-200 rounded text-sm flex-1">
                                                                {change.newValue}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {compareMode === 'change-only' && (
                                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                                                        {change.newValue}
                                                    </div>
                                                )}

                                                {/* Justification */}
                                                <div className="pt-2 border-t border-gray-200">
                                                    <h5 className="text-sm font-medium text-gray-700 mb-1">Justification</h5>
                                                    <p className="text-sm text-gray-600 italic">{change.justification}</p>
                                                </div>

                                                {/* Reviewer Info */}
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>Reviewed by: {change.reviewer}</span>
                                                    <span>Date: {new Date(change.reviewDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <GitCompare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Changes Found</h3>
                            <p className="text-gray-600">
                                {changeFilter !== 'all'
                                    ? `No ${changeFilter} found between these versions.`
                                    : 'These versions appear to be identical.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionComparisonTool;