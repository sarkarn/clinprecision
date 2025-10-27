import React, { FC, ReactElement } from 'react';
import { BuildStatus } from '../../../../../../../src/types/domain/DatabaseBuild.types';

type BadgeSize = 'small' | 'medium' | 'large';

interface BuildStatusBadgeProps {
  status: BuildStatus;
  size?: BadgeSize;
  showIcon?: boolean;
  animated?: boolean;
}

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: ReactElement;
  animate: boolean;
}

/**
 * Status badge component with color coding and icons
 * Displays build status with appropriate styling
 */
const BuildStatusBadge: FC<BuildStatusBadgeProps> = ({ 
  status, 
  size = 'medium', 
  showIcon = true, 
  animated = false 
}) => {
  // Status configuration
  const statusConfig: Record<BuildStatus, StatusConfig> = {
    IN_PROGRESS: {
      label: 'In Progress',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      animate: true,
    },
    COMPLETED: {
      label: 'Completed',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      animate: false,
    },
    FAILED: {
      label: 'Failed',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      animate: false,
    },
    CANCELLED: {
      label: 'Cancelled',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-300',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      animate: false,
    },
  };

  const config = statusConfig[status] || statusConfig.CANCELLED;

  // Size variants
  const sizeClasses: Record<BadgeSize, string> = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base',
  };

  // Animation for in-progress status
  const animationClass = animated && config.animate ? 'animate-pulse' : '';

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${animationClass}
        transition-all duration-200
      `}
    >
      {showIcon && (
        <span className="mr-1.5">
          {config.icon}
        </span>
      )}
      {config.label}
    </span>
  );
};

export default BuildStatusBadge;
