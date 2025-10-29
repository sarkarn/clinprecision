/**
 * StatusBadge Component
 * 
 * Generic, type-safe status badge component for displaying entity statuses
 * across the ClinPrecision application.
 * 
 * Supports all status types defined in the application:
 * - EntityStatus (Study, Site, Protocol, Form statuses)
 * - PatientStatus (Subject/Patient workflow statuses)
 * - FormStatus (CRF instance statuses)
 * - VisitType (Visit classifications)
 * 
 * Features:
 * - TypeScript type safety
 * - Automatic color mapping based on status
 * - Multiple size variants (sm, md, lg)
 * - Optional icon display
 * - Customizable styling via className
 * - Dot indicator variant for compact display
 * - Tailwind CSS styling
 * 
 * @example
 * // Study status
 * <StatusBadge status="ACTIVE" />
 * 
 * // Patient status with icon
 * <StatusBadge status="SCREENING" showIcon />
 * 
 * // Small size with dot
 * <StatusBadge status="COMPLETED" size="sm" variant="dot" />
 * 
 * // Custom className
 * <StatusBadge status="DRAFT" className="ml-2" />
 */

import React from 'react';
import { 
  EntityStatus, 
  PatientStatus, 
  FormStatus, 
  VisitType 
} from '../../types';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Archive,
  FileText,
  User,
  Calendar,
} from 'lucide-react';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * All supported status types
 */
export type StatusValue = EntityStatus | PatientStatus | FormStatus | VisitType | string;

/**
 * Display variant
 */
export type StatusBadgeVariant = 'default' | 'dot' | 'outline';

/**
 * Size variants
 */
export type StatusBadgeSize = 'sm' | 'md' | 'lg';

/**
 * Component props
 */
export interface StatusBadgeProps {
  /** Status value to display */
  status: StatusValue;
  /** Display variant (default: 'default') */
  variant?: StatusBadgeVariant;
  /** Size (default: 'md') */
  size?: StatusBadgeSize;
  /** Show icon before text (default: false) */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom label (overrides default status text) */
  label?: string;
}

/**
 * Color configuration for a status
 */
interface StatusColorConfig {
  bg: string;
  text: string;
  border?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// ============================================================================
// Status Configuration Maps
// ============================================================================

/**
 * Color mapping for all statuses
 * Uses Tailwind CSS classes for consistent styling
 */
const STATUS_COLORS: Record<string, StatusColorConfig> = {
  // EntityStatus - Active/Success states
  'ACTIVE': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: CheckCircle,
  },
  'APPROVED': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: CheckCircle,
  },
  'PUBLISHED': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: FileText,
  },

  // EntityStatus - Draft/Pending states
  'DRAFT': {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    icon: FileText,
  },
  'UNDER_REVIEW': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: Clock,
  },

  // EntityStatus - Inactive/Ended states
  'INACTIVE': {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: XCircle,
  },
  'ARCHIVED': {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: Archive,
  },
  'REJECTED': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: XCircle,
  },

  // PatientStatus - Enrollment workflow
  'SCREENING': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: Clock,
  },
  'ENROLLED': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: User,
  },
  'COMPLETED': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: CheckCircle,
  },
  'WITHDRAWN': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: XCircle,
  },
  'DISCONTINUED': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: AlertCircle,
  },
  'SCREEN_FAILED': {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    icon: AlertCircle,
  },

  // FormStatus - CRF workflow
  'NOT_STARTED': {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: FileText,
  },
  'IN_PROGRESS': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: Clock,
  },
  'VERIFIED': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: CheckCircle,
  },
  'LOCKED': {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: Archive,
  },

  // VisitType
  'ENROLLMENT': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: User,
  },
  'SCHEDULED': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: Calendar,
  },
  'UNSCHEDULED': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: AlertCircle,
  },
  'ADVERSE_EVENT': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: AlertCircle,
  },
  'EARLY_TERMINATION': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: XCircle,
  },
  'FOLLOW_UP': {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: Calendar,
  },
};

/**
 * Default color configuration for unknown statuses
 */
const DEFAULT_COLOR: StatusColorConfig = {
  bg: 'bg-gray-100',
  text: 'text-gray-800',
  border: 'border-gray-200',
  icon: FileText,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get color configuration for a status
 */
const getStatusColor = (status: StatusValue): StatusColorConfig => {
  const upperStatus = String(status).toUpperCase();
  return STATUS_COLORS[upperStatus] || DEFAULT_COLOR;
};

/**
 * Format status for display
 * Converts "UNDER_REVIEW" -> "Under Review"
 */
const formatStatusLabel = (status: StatusValue): string => {
  return String(status)
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get size classes based on size variant
 */
const getSizeClasses = (size: StatusBadgeSize) => {
  switch (size) {
    case 'sm':
      return {
        badge: 'px-2 py-0.5 text-xs',
        icon: 'w-3 h-3',
        dot: 'w-1.5 h-1.5',
      };
    case 'lg':
      return {
        badge: 'px-3 py-1.5 text-base',
        icon: 'w-5 h-5',
        dot: 'w-3 h-3',
      };
    case 'md':
    default:
      return {
        badge: 'px-2.5 py-1 text-sm',
        icon: 'w-4 h-4',
        dot: 'w-2 h-2',
      };
  }
};

// ============================================================================
// Component
// ============================================================================

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'md',
  showIcon = false,
  className = '',
  label,
}) => {
  const colorConfig = getStatusColor(status);
  const sizeClasses = getSizeClasses(size);
  const displayLabel = label || formatStatusLabel(status);
  const Icon = colorConfig.icon;

  // ============================================================================
  // Variant: Dot (minimal display)
  // ============================================================================

  if (variant === 'dot') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span
          className={`${sizeClasses.dot} rounded-full ${colorConfig.bg}`}
          aria-hidden="true"
        />
        <span className={`${sizeClasses.badge.split(' ')[2]} font-medium ${colorConfig.text}`}>
          {displayLabel}
        </span>
      </span>
    );
  }

  // ============================================================================
  // Variant: Outline
  // ============================================================================

  if (variant === 'outline') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 ${sizeClasses.badge} font-medium rounded-full border ${colorConfig.border} ${colorConfig.text} bg-white ${className}`}
      >
        {showIcon && Icon && <Icon className={sizeClasses.icon} aria-hidden="true" />}
        {displayLabel}
      </span>
    );
  }

  // ============================================================================
  // Variant: Default (filled badge)
  // ============================================================================

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses.badge} font-medium rounded-full ${colorConfig.bg} ${colorConfig.text} ${className}`}
    >
      {showIcon && Icon && <Icon className={sizeClasses.icon} aria-hidden="true" />}
      {displayLabel}
    </span>
  );
};

// ============================================================================
// Convenience Components for Specific Status Types
// ============================================================================

/**
 * Study/Site/Protocol status badge
 */
export const EntityStatusBadge: React.FC<Omit<StatusBadgeProps, 'status'> & { status: EntityStatus }> = (props) => (
  <StatusBadge {...props} />
);

/**
 * Patient/Subject status badge
 */
export const PatientStatusBadge: React.FC<Omit<StatusBadgeProps, 'status'> & { status: PatientStatus }> = (props) => (
  <StatusBadge {...props} />
);

/**
 * Form/CRF instance status badge
 */
export const FormStatusBadge: React.FC<Omit<StatusBadgeProps, 'status'> & { status: FormStatus }> = (props) => (
  <StatusBadge {...props} />
);

/**
 * Visit type badge
 */
export const VisitTypeBadge: React.FC<Omit<StatusBadgeProps, 'status'> & { status: VisitType }> = (props) => (
  <StatusBadge {...props} />
);

export default StatusBadge;
