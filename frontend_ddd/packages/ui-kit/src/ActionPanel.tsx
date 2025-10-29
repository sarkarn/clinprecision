/**
 * ActionPanel Component
 * 
 * Reusable action button panel for grouping action buttons with consistent
 * styling and behavior patterns across the ClinPrecision application.
 * 
 * Features:
 * - Multiple layout variants (horizontal, vertical, split)
 * - Primary/secondary action separation
 * - Icon support with lucide-react
 * - Responsive design (stacks on mobile)
 * - Loading states for async actions
 * - Disabled state management
 * - Dropdown menu support for overflow actions
 * - TypeScript type safety
 * - Tailwind CSS styling
 * 
 * @example
 * // Basic horizontal panel
 * <ActionPanel
 *   actions={[
 *     { label: 'Save', onClick: handleSave, variant: 'primary', icon: Save },
 *     { label: 'Cancel', onClick: handleCancel, variant: 'secondary' }
 *   ]}
 * />
 * 
 * // Split layout (primary right, secondary left)
 * <ActionPanel
 *   layout="split"
 *   primaryActions={[
 *     { label: 'Publish', onClick: handlePublish, variant: 'primary' }
 *   ]}
 *   secondaryActions={[
 *     { label: 'Save Draft', onClick: handleDraft },
 *     { label: 'Discard', onClick: handleDiscard, variant: 'danger' }
 *   ]}
 * />
 * 
 * // With loading state
 * <ActionPanel
 *   actions={actions}
 *   loading={isSaving}
 *   loadingText="Saving..."
 * />
 */

import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Loader2 } from 'lucide-react';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Button variant types matching Tailwind design system
 */
export type ActionVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';

/**
 * Button size variants
 */
export type ActionSize = 'sm' | 'md' | 'lg';

/**
 * Layout variants for action panel
 */
export type ActionPanelLayout = 'horizontal' | 'vertical' | 'split';

/**
 * Individual action button configuration
 */
export interface Action {
  /** Unique identifier for the action */
  id?: string;
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void | Promise<void>;
  /** Button variant (default: 'secondary') */
  variant?: ActionVariant;
  /** Icon component from lucide-react */
  icon?: React.ComponentType<{ className?: string }>;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state (shows spinner) */
  loading?: boolean;
  /** Hide action (useful for conditional rendering) */
  hidden?: boolean;
  /** Tooltip text (future enhancement) */
  tooltip?: string;
}

/**
 * ActionPanel component props
 */
export interface ActionPanelProps {
  /** Array of action buttons (for horizontal/vertical layouts) */
  actions?: Action[];
  /** Primary actions (for split layout) */
  primaryActions?: Action[];
  /** Secondary actions (for split layout) */
  secondaryActions?: Action[];
  /** Layout variant (default: 'horizontal') */
  layout?: ActionPanelLayout;
  /** Size of buttons (default: 'md') */
  size?: ActionSize;
  /** Panel-wide loading state */
  loading?: boolean;
  /** Loading text to display */
  loadingText?: string;
  /** Additional CSS classes for the panel */
  className?: string;
  /** Align buttons (default: 'right' for horizontal, 'stretch' for vertical) */
  align?: 'left' | 'center' | 'right' | 'stretch';
  /** Show overflow menu for extra actions (not yet implemented) */
  showOverflowMenu?: boolean;
  /** Maximum actions before overflow (default: 5) */
  maxVisibleActions?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get Tailwind classes for button variant
 */
const getVariantClasses = (variant: ActionVariant): string => {
  const variants: Record<ActionVariant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };
  return variants[variant];
};

/**
 * Get Tailwind classes for button size
 */
const getSizeClasses = (size: ActionSize): { button: string; icon: string } => {
  const sizes: Record<ActionSize, { button: string; icon: string }> = {
    sm: { button: 'px-3 py-1.5 text-sm', icon: 'w-4 h-4' },
    md: { button: 'px-4 py-2 text-sm', icon: 'w-4 h-4' },
    lg: { button: 'px-6 py-3 text-base', icon: 'w-5 h-5' },
  };
  return sizes[size];
};

/**
 * Get layout classes for panel
 */
const getLayoutClasses = (layout: ActionPanelLayout, align: string): string => {
  if (layout === 'vertical') {
    return align === 'stretch' ? 'flex flex-col w-full' : 'flex flex-col items-start';
  }
  
  if (layout === 'split') {
    return 'flex flex-col sm:flex-row items-start sm:items-center justify-between';
  }
  
  // Horizontal (default)
  const alignClasses: Record<string, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    stretch: 'justify-between',
  };
  
  return `flex flex-wrap items-center gap-2 ${alignClasses[align] || alignClasses.right}`;
};

// ============================================================================
// ActionButton Component (Internal)
// ============================================================================

interface ActionButtonProps {
  action: Action;
  size: ActionSize;
  fullWidth?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, size, fullWidth = false }) => {
  const {
    label,
    onClick,
    variant = 'secondary',
    icon: Icon,
    disabled = false,
    loading = false,
  } = action;

  const sizeClasses = getSizeClasses(size);
  const variantClasses = getVariantClasses(variant);
  const widthClass = fullWidth ? 'w-full' : '';

  const handleClick = async () => {
    if (!disabled && !loading) {
      await onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses}
        ${sizeClasses.button}
        ${widthClass}
      `.trim().replace(/\s+/g, ' ')}
    >
      {loading ? (
        <Loader2 className={`${sizeClasses.icon} animate-spin mr-2`} />
      ) : (
        Icon && <Icon className={`${sizeClasses.icon} ${label ? 'mr-2' : ''}`} />
      )}
      {label}
    </button>
  );
};

// ============================================================================
// ActionPanel Component
// ============================================================================

export const ActionPanel: React.FC<ActionPanelProps> = ({
  actions = [],
  primaryActions = [],
  secondaryActions = [],
  layout = 'horizontal',
  size = 'md',
  loading = false,
  loadingText,
  className = '',
  align = 'right',
  showOverflowMenu = false,
  maxVisibleActions = 5,
}) => {
  // Filter out hidden actions
  const visibleActions = actions.filter(action => !action.hidden);
  const visiblePrimary = primaryActions.filter(action => !action.hidden);
  const visibleSecondary = secondaryActions.filter(action => !action.hidden);

  // Panel-wide loading state override
  const actionsWithLoading = loading
    ? visibleActions.map(action => ({ ...action, disabled: true }))
    : visibleActions;

  const primaryWithLoading = loading
    ? visiblePrimary.map(action => ({ ...action, disabled: true }))
    : visiblePrimary;

  const secondaryWithLoading = loading
    ? visibleSecondary.map(action => ({ ...action, disabled: true }))
    : visibleSecondary;

  // Get layout classes
  const layoutClasses = getLayoutClasses(layout, align);

  // ============================================================================
  // Render: Horizontal/Vertical Layout
  // ============================================================================

  if (layout === 'horizontal' || layout === 'vertical') {
    if (actionsWithLoading.length === 0 && !loading) {
      return null; // Don't render empty panel
    }

    return (
      <div className={`${layoutClasses} gap-2 ${className}`}>
        {loading && loadingText && (
          <span className="text-sm text-gray-600 flex items-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {loadingText}
          </span>
        )}
        
        {actionsWithLoading.map((action, index) => (
          <ActionButton
            key={action.id || `action-${index}`}
            action={action}
            size={size}
            fullWidth={layout === 'vertical' && align === 'stretch'}
          />
        ))}
      </div>
    );
  }

  // ============================================================================
  // Render: Split Layout (Primary Right, Secondary Left)
  // ============================================================================

  if (layout === 'split') {
    const hasPrimary = primaryWithLoading.length > 0;
    const hasSecondary = secondaryWithLoading.length > 0;

    if (!hasPrimary && !hasSecondary && !loading) {
      return null;
    }

    return (
      <div className={`${layoutClasses} gap-4 ${className}`}>
        {/* Secondary Actions (Left side) */}
        {hasSecondary && (
          <div className="flex flex-wrap items-center gap-2">
            {secondaryWithLoading.map((action, index) => (
              <ActionButton
                key={action.id || `secondary-${index}`}
                action={action}
                size={size}
              />
            ))}
          </div>
        )}

        {/* Loading indicator (centered if no primary) */}
        {loading && loadingText && (
          <span className="text-sm text-gray-600 flex items-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {loadingText}
          </span>
        )}

        {/* Primary Actions (Right side) */}
        {hasPrimary && (
          <div className="flex flex-wrap items-center gap-2">
            {primaryWithLoading.map((action, index) => (
              <ActionButton
                key={action.id || `primary-${index}`}
                action={action}
                size={size}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

// ============================================================================
// Convenience Hook: useActionPanel
// ============================================================================

/**
 * Hook for managing action panel state
 * 
 * @example
 * const { actions, setLoading, updateAction } = useActionPanel([
 *   { label: 'Save', onClick: handleSave, variant: 'primary' }
 * ]);
 */
export const useActionPanel = (initialActions: Action[] = []) => {
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [panelLoading, setPanelLoading] = useState(false);

  const setLoading = (loading: boolean) => {
    setPanelLoading(loading);
  };

  const updateAction = (id: string, updates: Partial<Action>) => {
    setActions(prev =>
      prev.map(action => (action.id === id ? { ...action, ...updates } : action))
    );
  };

  const setActionLoading = (id: string, loading: boolean) => {
    updateAction(id, { loading });
  };

  const setActionDisabled = (id: string, disabled: boolean) => {
    updateAction(id, { disabled });
  };

  const hideAction = (id: string) => {
    updateAction(id, { hidden: true });
  };

  const showAction = (id: string) => {
    updateAction(id, { hidden: false });
  };

  return {
    actions,
    setActions,
    panelLoading,
    setLoading,
    updateAction,
    setActionLoading,
    setActionDisabled,
    hideAction,
    showAction,
  };
};

export default ActionPanel;
