// src/components/modules/datacapture/components/StudySelector.jsx
import React from 'react';
import { useStudy } from '../../../../hooks/useStudy';

/**
 * StudySelector Component
 * 
 * Dropdown selector for choosing a study protocol. Integrates with StudyContext
 * to manage and persist study selection across the application.
 * 
 * Features:
 * - Filters studies by status (PUBLISHED, APPROVED, ACTIVE only)
 * - Displays protocol number, title, and phase
 * - Auto-persists selection to localStorage via context
 * - Shows active study count
 * 
 * Contract:
 * @param {Array} studies - Array of study objects from API
 * @param {Function} onStudyChange - Optional callback for additional logic (deprecated, prefer context)
 * @param {string} className - Additional CSS classes for container
 */
const StudySelector = ({ studies = [], onStudyChange, className = '' }) => {
    const { selectedStudy, setSelectedStudy } = useStudy();

    // Filter for viewable studies (PUBLISHED, APPROVED, ACTIVE)
    const viewableStudies = studies.filter(study => {
        const status = study.status?.toUpperCase();
        return status === 'PUBLISHED' || status === 'APPROVED' || status === 'ACTIVE';
    });

    const handleStudyChange = (e) => {
        const studyId = e.target.value;
        setSelectedStudy(studyId || null);

        // Support legacy callback pattern for gradual migration
        if (onStudyChange) {
            onStudyChange(studyId);
        }
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Study Protocol
                    {viewableStudies.length > 0 && (
                        <span className="text-green-600 ml-2">
                            ({viewableStudies.length} active {viewableStudies.length === 1 ? 'study' : 'studies'})
                        </span>
                    )}
                </label>
                <p className="text-xs text-gray-500 mb-2">
                    Showing only studies with status PUBLISHED, APPROVED, or ACTIVE
                </p>
                <select
                    value={selectedStudy || ''}
                    onChange={handleStudyChange}
                    className="border border-gray-300 rounded-md w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">-- Select a Study Protocol --</option>
                    {viewableStudies.length === 0 ? (
                        <option value="" disabled>No active studies available</option>
                    ) : (
                        viewableStudies.map(study => (
                            <option key={study.id} value={study.id}>
                                {study.protocolNumber ? `${study.protocolNumber} - ` : ''}
                                {study.title || study.name || 'Untitled Study'}
                                {study.phase ? ` (${study.phase})` : ''}
                            </option>
                        ))
                    )}
                </select>
                {viewableStudies.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                        No studies available for viewing subjects. Studies must be PUBLISHED, APPROVED, or ACTIVE.
                    </p>
                )}
            </div>
        </div>
    );
};

export default StudySelector;
