// src/components/modules/subjectmanagement/components/PatientStatusBadge.tsx
import React from 'react';
import Badge from '../../../shared/ui/Badge';
import PatientStatusService from 'services/data-capture/PatientStatusService';

interface PatientStatusBadgeProps {
    status: string;
    size?: string;
    className?: string;
}

/**
 * Specialized badge component for patient status display
 * 
 * Wraps the generic Badge component with patient status-specific logic:
 * - Automatic color mapping based on status
 * - Formatted status text (Title Case)
 * - Consistent styling across the application
 * 
 * Status Color Mapping:
 * - REGISTERED → info (blue)
 * - SCREENING → warning (yellow)
 * - ENROLLED → success (green)
 * - ACTIVE → violet (purple)
 * - COMPLETED → neutral (gray)
 * - WITHDRAWN → danger (red)
 * 
 * @param {string} status - Patient status (REGISTERED, SCREENING, etc.)
 * @param {string} size - Badge size: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} className - Additional CSS classes
 */
const PatientStatusBadge: React.FC<PatientStatusBadgeProps> = ({ status, size = 'md', className = '' }) => {

    if (!status) {
        return (
            <Badge {...({ variant: "neutral", size, className } as any)}>
                Unknown
            </Badge>
        );
    }

    // Get badge variant using service utility
    const variant = PatientStatusService.getStatusBadgeVariant(status) as any;

    // Format status for display
    const formattedStatus = PatientStatusService.formatStatus(status);

    return (
        <Badge {...({ variant, size, className } as any)}>
            {formattedStatus}
        </Badge>
    );
};

export default PatientStatusBadge;
