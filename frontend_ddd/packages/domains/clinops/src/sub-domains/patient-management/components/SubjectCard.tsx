// SubjectCard.tsx - Mobile/Tablet Card View for Subjects
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Activity, Calendar, AlertCircle } from 'lucide-react';
import PatientStatusBadge from '../../../shared/PatientStatusBadge';

// Type definitions
interface Subject {
    subjectNumber: string;
    initials?: string;
    studySiteNumber?: string;
    status?: string;
    enrollmentDate?: string;
    patientUuid: string;
}

interface SubjectCardProps {
    subject: Subject;
    onChangeStatus: (subject: Subject) => void;
    onStartVisit: (subject: Subject) => void;
    onWithdraw: (subject: Subject) => void;
    basePath: string;
}

/**
 * SubjectCard - Responsive card layout for mobile/tablet views
 * Provides the same functionality as table rows in a card format
 */
const SubjectCard: React.FC<SubjectCardProps> = ({ 
    subject, 
    onChangeStatus, 
    onStartVisit, 
    onWithdraw, 
    basePath 
}) => {
    const navigate = useNavigate();
    const isWithdrawn = subject.status?.toUpperCase() === 'WITHDRAWN';

    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow">
            {/* Header Row */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <button
                        onClick={() => navigate(`${basePath}/subjects/${subject.patientUuid}/timeline`)}
                        className="text-lg font-semibold text-blue-600 hover:underline"
                    >
                        {subject.subjectNumber}
                    </button>
                    <div className="text-sm text-gray-500 mt-1">
                        {subject.initials || 'No initials'}
                    </div>
                </div>
                {/* @ts-ignore - PatientStatusBadge prop types */}
                <PatientStatusBadge status={subject.status} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                    <div className="text-gray-500 font-medium">Study Site</div>
                    <div className="text-gray-900">{subject.studySiteNumber || '-'}</div>
                </div>
                <div>
                    <div className="text-gray-500 font-medium">Enrollment Date</div>
                    <div className="text-gray-900">
                        {subject.enrollmentDate
                            ? new Date(subject.enrollmentDate).toLocaleDateString()
                            : '-'}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                <button
                    onClick={() => navigate(`${basePath}/subjects/${subject.patientUuid}/timeline`)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                </button>

                {!isWithdrawn && (
                    <>
                        <button
                            onClick={() => onChangeStatus(subject)}
                            className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Status</span>
                        </button>

                        <button
                            onClick={() => onStartVisit(subject)}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Visit</span>
                        </button>

                        <button
                            onClick={() => onWithdraw(subject)}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>Withdraw</span>
                        </button>
                    </>
                )}

                <button
                    onClick={() => navigate(`${basePath}/subjects/${subject.patientUuid}/timeline`)}
                    className="flex items-center space-x-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                >
                    <Activity className="w-4 h-4" />
                    <span>Timeline</span>
                </button>
            </div>
        </div>
    );
};

export default SubjectCard;
