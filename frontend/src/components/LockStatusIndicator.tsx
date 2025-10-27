import React from 'react';
import { Lock, Unlock } from 'lucide-react';

interface LockStatusIndicatorProps {
    isLocked: boolean;
    entityType: string;
}

/**
 * Component to display lock status for studies and forms
 */
const LockStatusIndicator: React.FC<LockStatusIndicatorProps> = ({ isLocked, entityType }) => {
    const Icon = isLocked ? Lock : Unlock;
    const text = isLocked ? 'Locked' : 'Unlocked';
    const tooltip = isLocked
        ? `This ${entityType} is locked and cannot be modified`
        : `This ${entityType} is unlocked and can be modified`;
    const colorClasses = isLocked
        ? 'border-red-300 bg-red-100 text-red-800'
        : 'border-green-300 bg-green-100 text-green-800';

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${colorClasses}`}
            title={tooltip}
        >
            <Icon className="h-3 w-3" aria-hidden="true" />
            <span>{text}</span>
        </span>
    );
};

export default LockStatusIndicator;
