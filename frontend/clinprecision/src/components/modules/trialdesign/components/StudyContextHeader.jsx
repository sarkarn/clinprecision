import React from 'react';
import { ArrowLeft, Users, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import { useStudyNavigation } from '../hooks/useStudyNavigation';

/**
 * StudyContextHeader - Provides consistent study context across all study-specific pages
 * Shows study name, status, version, and navigation aids
 */
const StudyContextHeader = ({
    study,
    currentPage,
    onBack,
    showProgress = false,
    progressValue = 0,
    actions = []
}) => {
    const { navigateBack } = useStudyNavigation();

    // Default back handler using navigation hook
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigateBack();
        }
    };

    // Get status badge configuration
    const getStatusConfig = (status) => {
        const configs = {
            'ACTIVE': {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: CheckCircle,
                label: 'Active'
            },
            'DRAFT': {
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: FileText,
                label: 'Draft'
            },
            'RECRUITING': {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: Users,
                label: 'Recruiting'
            },
            'PAUSED': {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: Clock,
                label: 'Paused'
            },
            'COMPLETED': {
                color: 'bg-purple-100 text-purple-800 border-purple-200',
                icon: CheckCircle,
                label: 'Completed'
            }
        };

        return configs[status] || configs['DRAFT'];
    };

    const statusConfig = getStatusConfig(study?.status || study?.studyStatus?.name);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-4">
                    {/* Back Navigation */}
                    <div className="flex items-center mb-4">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Studies
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Study Information */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900 truncate">
                                    {study?.name || study?.title || 'Loading...'}
                                </h1>

                                {/* Status Badge */}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                                    <StatusIcon className="w-4 h-4 mr-1" />
                                    {statusConfig.label}
                                </span>

                                {/* Version Badge */}
                                {study?.version && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        v{study.version}
                                    </span>
                                )}
                            </div>

                            {/* Study Details */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                {study?.protocolNumber && (
                                    <span className="flex items-center">
                                        <FileText className="w-4 h-4 mr-1" />
                                        {study.protocolNumber}
                                    </span>
                                )}

                                {study?.studyPhase && (
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {study.studyPhase.name || study.studyPhase}
                                    </span>
                                )}

                                {study?.principalInvestigator && (
                                    <span className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        PI: {study.principalInvestigator}
                                    </span>
                                )}

                                {/* Current Page Indicator */}
                                {currentPage && (
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                        {currentPage}
                                    </span>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {showProgress && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Study Completion</span>
                                        <span>{progressValue}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progressValue}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {actions.length > 0 && (
                            <div className="flex items-center gap-2">
                                {actions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={action.onClick}
                                        disabled={action.disabled}
                                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${action.variant === 'primary'
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
                                            : action.variant === 'danger'
                                                ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100'
                                            }`}
                                    >
                                        {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyContextHeader;