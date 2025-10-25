// StudySiteStep.tsx - Study and Site Selection Step
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { SiteService } from '../../../../../services/SiteService';

// Type definitions
interface Study {
    id: number;
    protocolNumber?: string;
    title?: string;
    name?: string;
    phase?: string;
}

interface Site {
    id: number;
    name: string;
    siteNumber: string;
    associationId: number;
    enrollmentCap?: number;
    enrollmentCount?: number;
}

interface StudySiteStepProps {
    studies: Study[];
}

const StudySiteStep: React.FC<StudySiteStepProps> = ({ studies }) => {
    const {
        register,
        formState: { errors },
        watch,
    } = useFormContext();

    const selectedStudyId = watch('studyId');
    const [sites, setSites] = useState<Site[]>([]);
    const [loadingSites, setLoadingSites] = useState<boolean>(false);

    // Fetch sites when study is selected
    useEffect(() => {
        const fetchSitesForStudy = async () => {
            if (!selectedStudyId) {
                setSites([]);
                return;
            }

            setLoadingSites(true);
            try {
                // Get site associations for the selected study
                const associations = await SiteService.getSiteAssociationsForStudy(selectedStudyId) as any;
                console.log('[StudySiteStep] Site associations for study', selectedStudyId, ':', associations);

                // Filter only ACTIVE sites and map to site data
                const activeSites = associations
                    .filter((assoc: any) => assoc.status === 'ACTIVE')
                    .map((assoc: any) => ({
                        id: assoc.siteId,
                        name: assoc.siteName,
                        siteNumber: assoc.siteNumber,
                        // Include association details for potential use
                        associationId: assoc.id,
                        enrollmentCap: assoc.subjectEnrollmentCap,
                        enrollmentCount: assoc.subjectEnrollmentCount
                    }));

                console.log('[StudySiteStep] Active sites for study:', activeSites);
                setSites(activeSites);
            } catch (error: any) {
                console.error('[StudySiteStep] Error fetching sites for study:', error);
                setSites([]);
            } finally {
                setLoadingSites(false);
            }
        };

        fetchSitesForStudy();
    }, [selectedStudyId]);

    const filteredSites = sites;

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
                        <option key={study.id} value={study.id}>
                            {study.protocolNumber ? `${study.protocolNumber} - ` : ''}
                            {study.title || study.name || 'Untitled Study'}
                            {study.phase ? ` (${study.phase})` : ''}
                        </option>
                    ))}
                </select>
                {errors.studyId && (
                    <p className="mt-1 text-sm text-red-600">{errors.studyId.message as string}</p>
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
                    disabled={!selectedStudyId || loadingSites}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.siteId
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        } ${!selectedStudyId || loadingSites ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                    <option value="">
                        {loadingSites
                            ? 'Loading sites...'
                            : selectedStudyId
                                ? 'Select a site'
                                : 'Please select a study first'}
                    </option>
                    {filteredSites.map((site) => (
                        <option key={site.id} value={site.id}>
                            {site.name} - {site.siteNumber}
                        </option>
                    ))}
                </select>
                {errors.siteId && (
                    <p className="mt-1 text-sm text-red-600">{errors.siteId.message as string}</p>
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
