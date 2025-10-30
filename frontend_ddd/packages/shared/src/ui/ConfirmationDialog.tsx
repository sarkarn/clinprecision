// src/components/shared/ConfirmationDialog.tsx
import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Loader2,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

/**
 * Severity levels for the confirmation dialog
 */
export type ConfirmationSeverity = 'info' | 'warning' | 'error' | 'success';

/**
 * Props for the ConfirmationDialog component
 */
export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Callback when user confirms the action */
  onConfirm: () => void | Promise<void>;
  /** Callback when user cancels or closes the dialog */
  onCancel: () => void;
  /** Text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Severity level affects icon and colors (default: "info") */
  severity?: ConfirmationSeverity;
  /** Whether the confirm action is currently loading */
  loading?: boolean;
  /** Whether to show a close icon button in the title */
  showCloseButton?: boolean;
  /** Whether clicking outside the dialog should close it (default: true) */
  disableBackdropClick?: boolean;
  /** Whether pressing escape should close it (default: true) */
  disableEscapeKeyDown?: boolean;
  /** Maximum width of the dialog (default: "sm") */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional content to show below the message */
  children?: React.ReactNode;
  /** Error message to display (if action failed) */
  error?: string;
  /** Disable the confirm button */
  confirmDisabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * A reusable confirmation dialog component with TypeScript support
 * 
 * Features:
 * - Four severity variants (info, warning, error, success)
 * - Async action support with loading states
 * - Error handling display
 * - Customizable buttons and text
 * - Material-UI integration
 * 
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * 
 * const handleDelete = async () => {
 *   await deleteStudy(studyId);
 *   setOpen(false);
 * };
 * 
 * <ConfirmationDialog
 *   open={open}
 *   title="Delete Study"
 *   message="Are you sure you want to delete this study? This action cannot be undone."
 *   severity="error"
 *   confirmText="Delete"
 *   onConfirm={handleDelete}
 *   onCancel={() => setOpen(false)}
 * />
 * ```
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'info',
  loading = false,
  showCloseButton = true,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  maxWidth = 'sm',
  children,
  error,
  confirmDisabled = false,
}) => {
  
  // ============================================================================
  // Handlers
  // ============================================================================

  const handleConfirm = async () => {
    const result = onConfirm();
    // Handle both sync and async onConfirm
    if (result instanceof Promise) {
      await result;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableBackdropClick || e.target !== e.currentTarget) {
      return;
    }
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && !disableEscapeKeyDown) {
      onCancel();
    }
  };

  // ============================================================================
  // Severity Configuration
  // ============================================================================

  const getSeverityConfig = () => {
    switch (severity) {
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          titleColor: 'text-green-700',
          buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
          titleColor: 'text-yellow-700',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
      case 'error':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          titleColor: 'text-red-700',
          buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-12 h-12 text-blue-500" />,
          titleColor: 'text-blue-700',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        };
    }
  };

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'xs':
        return 'max-w-xs';
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      default:
        return 'max-w-sm';
    }
  };

  const severityConfig = getSeverityConfig();

  // Don't render if not open
  if (!open) {
    return null;
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full ${getMaxWidthClass()}`}
        >
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {severityConfig.icon}
                <h3
                  id="confirmation-dialog-title"
                  className={`text-lg font-semibold leading-6 ${severityConfig.titleColor}`}
                >
                  {title}
                </h3>
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 pb-4">
            <p
              id="confirmation-dialog-description"
              className="text-sm text-gray-600"
            >
              {message}
            </p>

            {children && (
              <div className="mt-4">
                {children}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || confirmDisabled}
              className={`inline-flex justify-center items-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${severityConfig.buttonClass}`}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Processing...' : confirmText}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Convenience Hook for Dialog State Management
// ============================================================================

/**
 * Custom hook to manage confirmation dialog state
 * 
 * @example
 * ```tsx
 * const { 
 *   open, 
 *   openDialog, 
 *   closeDialog, 
 *   loading, 
 *   error 
 * } = useConfirmationDialog();
 * 
 * const handleDeleteClick = () => {
 *   openDialog();
 * };
 * 
 * const handleConfirm = async () => {
 *   try {
 *     await deleteStudy(studyId);
 *     closeDialog();
 *   } catch (err) {
 *     // Error is automatically captured
 *   }
 * };
 * 
 * <ConfirmationDialog
 *   open={open}
 *   loading={loading}
 *   error={error}
 *   onConfirm={handleConfirm}
 *   onCancel={closeDialog}
 *   {...otherProps}
 * />
 * ```
 */
export const useConfirmationDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const openDialog = () => {
    setOpen(true);
    setError(undefined);
  };

  const closeDialog = () => {
    setOpen(false);
    setLoading(false);
    setError(undefined);
  };

  const executeAction = async (action: () => Promise<void>) => {
    try {
      setLoading(true);
      setError(undefined);
      await action();
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return {
    open,
    loading,
    error,
    openDialog,
    closeDialog,
    executeAction,
    setError,
  };
};

export default ConfirmationDialog;
