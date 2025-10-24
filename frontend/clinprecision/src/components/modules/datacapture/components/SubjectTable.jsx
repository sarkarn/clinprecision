import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import { Eye, Edit, Activity, Calendar, AlertCircle } from 'lucide-react';
import PatientStatusBadge from '../../../shared/PatientStatusBadge';

/**
 * SubjectTable - Virtualized table component for large subject lists
 * Uses react-window for performance optimization
 */
const SubjectTable = ({
    subjects,
    onViewVisits,
    onChangeStatus,
    onStartVisit,
    onWithdraw,
    tableHeight = 600
}) => {
    const navigate = useNavigate();

    // Row renderer for react-window
    const Row = ({ index, style }) => {
        const subject = subjects[index];
        const isWithdrawn = subject.status === 'withdrawn';

        return (
            <div style={style} className="border-b border-gray-200 hover:bg-gray-50 flex items-center">
                {/* Subject Number */}
                <div className="px-6 py-4 w-1/6 flex-shrink-0">
                    <span className="font-medium text-gray-900">{subject.subjectNumber}</span>
                </div>

                {/* Initials */}
                <div className="px-6 py-4 w-1/6 flex-shrink-0">
                    <span className="text-gray-700">{subject.initials || '-'}</span>
                </div>

                {/* Study Site */}
                <div className="px-6 py-4 w-1/5 flex-shrink-0">
                    <span className="text-gray-700">{subject.studySiteNumber || '-'}</span>
                </div>

                {/* Current Status */}
                <div className="px-6 py-4 w-1/6 flex-shrink-0">
                    <PatientStatusBadge status={subject.status} />
                </div>

                {/* Enrollment Date */}
                <div className="px-6 py-4 w-1/6 flex-shrink-0">
                    <span className="text-gray-700">
                        {subject.enrollmentDate
                            ? new Date(subject.enrollmentDate).toLocaleDateString()
                            : '-'}
                    </span>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 w-1/4 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        {/* View Visits */}
                        <button
                            onClick={() => onViewVisits(subject)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Visits"
                        >
                            <Eye className="w-4 h-4" />
                        </button>

                        {/* Change Status */}
                        {!isWithdrawn && (
                            <button
                                onClick={() => onChangeStatus(subject)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Change Status"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        )}

                        {/* Start Visit */}
                        {!isWithdrawn && (
                            <button
                                onClick={() => onStartVisit(subject)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Start Visit"
                            >
                                <Calendar className="w-4 h-4" />
                            </button>
                        )}

                        {/* Visit Timeline */}
                        <button
                            onClick={() => navigate(`/datacapture/subjects/${subject.patientUuid}/timeline`)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Visit Timeline"
                        >
                            <Activity className="w-4 h-4" />
                        </button>

                        {/* Withdraw */}
                        {!isWithdrawn && (
                            <button
                                onClick={() => onWithdraw(subject)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Withdraw Subject"
                            >
                                <AlertCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Table Header (Sticky) */}
            <div className="bg-gray-50 border-b border-gray-200 flex items-center font-semibold text-gray-700 text-sm">
                <div className="px-6 py-3 w-1/6 flex-shrink-0">Subject Number</div>
                <div className="px-6 py-3 w-1/6 flex-shrink-0">Initials</div>
                <div className="px-6 py-3 w-1/5 flex-shrink-0">Study Site</div>
                <div className="px-6 py-3 w-1/6 flex-shrink-0">Current Status</div>
                <div className="px-6 py-3 w-1/6 flex-shrink-0">Enrollment Date</div>
                <div className="px-6 py-3 w-1/4 flex-shrink-0">Actions</div>
            </div>

            {/* Virtualized Body */}
            {subjects.length > 0 ? (
                <FixedSizeList
                    height={tableHeight}
                    itemCount={subjects.length}
                    itemSize={72}
                    width="100%"
                >
                    {Row}
                </FixedSizeList>
            ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                    No subjects found for the selected study and filters.
                </div>
            )}
        </div>
    );
};

export default SubjectTable;
