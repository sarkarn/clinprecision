import React, { useState } from 'react';
import { PlusIcon, ArrowPathIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import StudyDatabaseBuildList from './components/StudyDatabaseBuildList';
import BuildMetricsCard from './components/BuildMetricsCard';
import BuildStudyDatabaseModal from './components/BuildStudyDatabaseModal';
import { useStudyDatabaseBuilds } from '../../../../../../src/hooks/api/database-build/useStudyDatabaseBuilds';

interface Study {
    id: number | string;
    name: string;
}

/**
 * Main page for Study Database Build management
 * Provides overview of all database builds with metrics and actions
 */
const StudyDatabaseBuildPage: React.FC = () => {
    const [showBuildModal, setShowBuildModal] = useState<boolean>(false);
    const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);

    const {
        builds,
        loading,
        error,
        refreshBuilds,
        inProgressCount,
        completedCount,
        failedCount,
        cancelledCount,
        totalCount,
    } = useStudyDatabaseBuilds();

    /**
     * Handle successful build creation
     */
    const handleBuildSuccess = (): void => {
        setShowBuildModal(false);
        setSelectedStudy(null);
        refreshBuilds();
    };

    /**
     * Open build modal with optional pre-selected study
     */
    const handleBuildDatabase = (study: Study | null = null): void => {
        setSelectedStudy(study);
        setShowBuildModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CircleStackIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Study Database Builds
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Manage and monitor study database build processes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={refreshBuilds}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>

                            <button
                                onClick={() => handleBuildDatabase()}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Build Database
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <BuildMetricsCard
                        title="In Progress"
                        count={inProgressCount}
                        color="blue"
                        icon="clock"
                        description="Active builds"
                    />
                    <BuildMetricsCard
                        title="Completed"
                        count={completedCount}
                        color="green"
                        icon="check"
                        description="Successfully built"
                    />
                    <BuildMetricsCard
                        title="Failed"
                        count={failedCount}
                        color="red"
                        icon="exclamation"
                        description="Build failures"
                    />
                    <BuildMetricsCard
                        title="Cancelled"
                        count={cancelledCount}
                        color="gray"
                        icon="stop"
                        description="User cancelled"
                    />
                    <BuildMetricsCard
                        title="Total Builds"
                        count={totalCount}
                        color="purple"
                        icon="database"
                        description="All time"
                    />
                </div>

                {/* Error Display */}
                {error && !loading && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Unable to connect to server
                                </h3>
                                <p className="mt-1 text-sm text-yellow-700">
                                    {(error as any)?.message || 'Please check if the backend service is running and try again.'}
                                </p>
                                <p className="mt-1 text-xs text-yellow-600">
                                    Expected endpoint: http://localhost:8083/api/v1/study-database-builds (via API Gateway)
                                </p>
                            </div>
                            <button
                                onClick={refreshBuilds}
                                className="ml-3 inline-flex items-center px-3 py-1.5 border border-yellow-300 rounded text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                <ArrowPathIcon className="h-4 w-4 mr-1" />
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Build List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <StudyDatabaseBuildList
                        builds={builds}
                        loading={loading}
                        error={error as any}
                        onRefresh={refreshBuilds}
                        onBuildDatabase={handleBuildDatabase as any}
                    />
                </div>

                {/* Build Modal */}
                {showBuildModal && (
                    <BuildStudyDatabaseModal
                        isOpen={showBuildModal}
                        onClose={() => {
                            setShowBuildModal(false);
                            setSelectedStudy(null);
                        }}
                        onSuccess={handleBuildSuccess}
                        selectedStudy={selectedStudy as any}
                    />
                )}
            </div>
        </div>
    );
};

export default StudyDatabaseBuildPage;
