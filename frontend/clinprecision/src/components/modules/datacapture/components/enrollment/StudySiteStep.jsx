import React from 'react';
import { useFormContext } from 'react-hook-form';

const StudySiteStep = ({ studies, sites }) => {
    const {
        register,
        formState: { errors },
        watch,
    } = useFormContext();

    const selectedStudyId = watch('studyId');

    // Filter sites based on selected study
    const filteredSites = selectedStudyId
        ? sites.filter((site) => site.studyId === selectedStudyId)
        : [];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Study & Site Assignment</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Select the study and site where this subject will be enrolled.
                </p>
            </div>

            {/* Study Selection */}
            <div>
                <label htmlFor="studyId" className="block text-sm font-medium text-gray-700 mb-2">
                    Study <span className="text-red-500">*</span>
                </label>
                <select
                    id="studyId"
                    {...register('studyId')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.studyId
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                >
                    <option value="">Select a study</option>
                    {studies.map((study) => (
                        <option key={study.studyId} value={study.studyId}>
                            {study.studyName} ({study.studyProtocolNo})
                        </option>
                    ))}
                </select>
                {errors.studyId && (
                    <p className="mt-1 text-sm text-red-600">{errors.studyId.message}</p>
                )}
            </div>

            {/* Site Selection */}
            <div>
                <label htmlFor="siteId" className="block text-sm font-medium text-gray-700 mb-2">
                    Site <span className="text-red-500">*</span>
                </label>
                <select
                    id="siteId"
                    {...register('siteId')}
                    disabled={!selectedStudyId}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.siteId
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        } ${!selectedStudyId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                    <option value="">
                        {selectedStudyId ? 'Select a site' : 'Please select a study first'}
                    </option>
                    {filteredSites.map((site) => (
                        <option key={site.siteId} value={site.siteId}>
                            {site.siteName} - {site.siteNo}
                        </option>
                    ))}
                </select>
                {errors.siteId && (
                    <p className="mt-1 text-sm text-red-600">{errors.siteId.message}</p>
                )}
                {selectedStudyId && filteredSites.length === 0 && (
                    <p className="mt-1 text-sm text-amber-600">
                        No sites available for the selected study.
                    </p>
                )}
            </div>

            {/* Info Box */}
            {selectedStudyId && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                        <svg
                            className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Study Selected</h4>
                            <p className="text-sm text-blue-800">
                                {filteredSites.length} site(s) available for this study.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudySiteStep;
