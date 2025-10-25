import React from 'react';

interface FormStatusProps {
    status: 'complete' | 'incomplete' | 'not_started';
    lastUpdated?: string;
    showLabel?: boolean;
}

const FormStatus: React.FC<FormStatusProps> = ({ status, lastUpdated, showLabel = true }) => {
    const getStatusBadgeClass = (status: string): string => {
        switch (status) {
            case 'complete':
                return 'bg-green-100 text-green-800';
            case 'incomplete':
                return 'bg-yellow-100 text-yellow-800';
            case 'not_started':
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'complete':
                return 'Complete';
            case 'incomplete':
                return 'Incomplete';
            case 'not_started':
            default:
                return 'Not Started';
        }
    };

    return (
        <div className="flex flex-col">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(status)}`}>
                {getStatusLabel(status)}
            </span>
            {showLabel && lastUpdated && (
                <span className="text-xs text-gray-500 mt-1">
                    {new Date(lastUpdated).toLocaleString()}
                </span>
            )}
        </div>
    );
};

export default FormStatus;
