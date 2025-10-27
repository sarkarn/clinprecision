/**
 * Shared Components Barrel Export
 * 
 * Central export point for all shared/reusable TypeScript components.
 * Import from this file to maintain clean, consistent imports throughout the application.
 * 
 * Example usage:
 * import { ConfirmationDialog, useConfirmationDialog, StatusBadge, ActionPanel } from '@/components/shared';
 */

// Dialogs
export { ConfirmationDialog, useConfirmationDialog } from './ConfirmationDialog';
export type { ConfirmationDialogProps, ConfirmationSeverity } from './ConfirmationDialog';

// Status Indicators
export { 
  StatusBadge,
  EntityStatusBadge,
  PatientStatusBadge,
  FormStatusBadge,
  VisitTypeBadge,
} from './StatusBadge';
export type { 
  StatusBadgeProps, 
  StatusBadgeVariant, 
  StatusBadgeSize,
  StatusValue,
} from './StatusBadge';

// Action Panels & Buttons
export { ActionPanel, useActionPanel } from './ActionPanel';
export type {
  ActionPanelProps,
  Action,
  ActionVariant,
  ActionSize,
  ActionPanelLayout,
} from './ActionPanel';
