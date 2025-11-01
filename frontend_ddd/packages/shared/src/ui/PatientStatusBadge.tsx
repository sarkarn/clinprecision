// src/components/shared/PatientStatusBadge.tsx
import React from 'react';
import Badge from './Badge';
import PatientStatusService from '@domains/clinops/src/sub-domains/patient-management/services/PatientStatusService';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'blue' | 'violet' | 'amber';
type BadgeSize = 'sm' | 'md' | 'lg';

interface PatientStatusBadgeProps {
    status: string;
    size?: BadgeSize;
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
 */
const PatientStatusBadge: React.FC<PatientStatusBadgeProps> = ({ 
    status, 
    size = 'md', 
    className = '' 
}) => {

    if (!status) {
        return (
            <Badge variant="neutral" size={size} className={className}>
                Unknown
            </Badge>
        );
    }

    // Get badge variant using service utility
    const variant = PatientStatusService.getStatusBadgeVariant(status) as BadgeVariant;

    // Format status for display
    const formattedStatus = PatientStatusService.formatStatus(status);

    return (
        <Badge variant={variant} size={size} className={className}>
            {formattedStatus}
        </Badge>
    );
};

export default PatientStatusBadge;
