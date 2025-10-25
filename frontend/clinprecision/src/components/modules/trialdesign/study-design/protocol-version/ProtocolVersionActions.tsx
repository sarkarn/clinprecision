import React from 'react';
import {
    Edit2,
    Send,
    CheckCircle,
    Play,
    Trash2,
    Eye,
    AlertTriangle,
    Clock,
    FileText,
    GitBranch,
    LucideIcon
} from 'lucide-react';

// Type definitions
interface StatusInfo {
    canEdit?: boolean;
    canSubmit?: boolean;
    canApprove?: boolean;
    canActivate?: boolean;
    label?: string;
}

interface ProtocolVersion {
    id?: string | number;
    status: ProtocolVersionStatus;
    statusInfo?: StatusInfo;
    versionNumber?: string;
    [key: string]: any;
}

type ProtocolVersionStatus = 
    | 'DRAFT' 
    | 'UNDER_REVIEW'
    | 'PROTOCOL_REVIEW'
    | 'AMENDMENT_REVIEW' 
    | 'APPROVED' 
    | 'ACTIVE'
    | 'PUBLISHED'
    | 'SUPERSEDED' 
    | 'WITHDRAWN';

type ActionVariant = 'primary' | 'success' | 'danger' | 'warning' | 'secondary';

interface ActionDefinition {
    key: string;
    label: string;
    icon: LucideIcon;
    onClick?: (versionId: string | number) => void;
    variant: ActionVariant;
    always?: boolean;
    disabled?: boolean;
    confirmMessage?: string;
    tooltip?: string;
}

interface ProtocolVersionActionsProps {
    version: ProtocolVersion | null;
    studyStatus?: string | null;
    onEdit?: (versionId: string | number) => void;
    onSubmitReview?: (versionId: string | number) => void;
    onApprove?: (versionId: string | number) => void;
    onActivate?: (versionId: string | number) => void;
    onDelete?: (versionId: string | number) => void;
    onView?: (versionId: string | number) => void;
    onCreateAmendment?: (versionId: string | number) => void;
    canEdit?: boolean;
    canApprove?: boolean;
    canActivate?: boolean;
    loading?: boolean;
    compact?: boolean;
}

/**
 * Protocol Version Actions Component
 * Displays context-sensitive action buttons based on protocol version status
 */
const ProtocolVersionActions: React.FC<ProtocolVersionActionsProps> = ({
    version,
    studyStatus = null,
    onEdit,
    onSubmitReview,
    onApprove,
    onActivate,
    onDelete,
    onView,
    onCreateAmendment,
    canEdit = false,
    canApprove = false,
    canActivate = false,
    loading = false,
    compact = false
}) => {
    if (!version || version.id === undefined || version.id === null) return null;

    const { status, statusInfo } = version;
    const versionId = version.id;

    // Get available actions based on status and permissions
    const getAvailableActions = (): ActionDefinition[] => {
        const actions: ActionDefinition[] = [];

        // View action - always available
        actions.push({
            key: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: onView,
            variant: 'secondary',
            always: true
        });

        switch (status) {
            case 'DRAFT':
                if (canEdit || statusInfo?.canEdit) {
                    actions.push({
                        key: 'edit',
                        label: 'Edit',
                        icon: Edit2,
                        onClick: onEdit,
                        variant: 'secondary'
                    });
                }

                if (statusInfo?.canSubmit) {
                    actions.push({
                        key: 'submit',
                        label: 'Submit for Review',
                        icon: Send,
                        onClick: onSubmitReview,
                        variant: 'primary'
                    });
                }

                actions.push({
                    key: 'delete',
                    label: 'Delete',
                    icon: Trash2,
                    onClick: onDelete,
                    variant: 'danger',
                    confirmMessage: 'Are you sure you want to delete this protocol version? This action cannot be undone.'
                });
                break;

            case 'UNDER_REVIEW':
                // Protocol is with IRB/EC - limited actions
                break;

            case 'AMENDMENT_REVIEW':
                if (canApprove || statusInfo?.canApprove) {
                    actions.push({
                        key: 'approve',
                        label: 'Approve',
                        icon: CheckCircle,
                        onClick: onApprove,
                        variant: 'success'
                    });
                }
                break;

            case 'APPROVED':
                if (canActivate || statusInfo?.canActivate) {
                    // Protocol version lifecycle is independent of study lifecycle
                    // When protocol is APPROVED, it can be activated at any time
                    actions.push({
                        key: 'activate',
                        label: 'Activate',
                        icon: Play,
                        onClick: onActivate,
                        variant: 'primary',
                        confirmMessage: 'Are you sure you want to activate this protocol version? This will make it the active protocol for the study.'
                    });
                }
                break;

            case 'ACTIVE':
            case 'PUBLISHED':
                if (onCreateAmendment) {
                    actions.push({
                        key: 'amend',
                        label: 'Create Amendment',
                        icon: GitBranch,
                        onClick: onCreateAmendment,
                        variant: 'secondary'
                    });
                }
                break;

            default:
                // SUPERSEDED, WITHDRAWN - only view action
                break;
        }

        return actions;
    };

    // Get button styling based on variant
    const getButtonStyle = (variant: ActionVariant, isCompact = false): string => {
        const baseStyle = isCompact
            ? 'inline-flex items-center px-2 py-1 text-xs font-medium rounded border focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
            : 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        switch (variant) {
            case 'primary':
                return `${baseStyle} text-white bg-blue-600 border-transparent hover:bg-blue-700 focus:ring-blue-500`;
            case 'success':
                return `${baseStyle} text-white bg-green-600 border-transparent hover:bg-green-700 focus:ring-green-500`;
            case 'danger':
                return `${baseStyle} text-white bg-red-600 border-transparent hover:bg-red-700 focus:ring-red-500`;
            case 'warning':
                return `${baseStyle} text-white bg-yellow-600 border-transparent hover:bg-yellow-700 focus:ring-yellow-500`;
            case 'secondary':
            default:
                return `${baseStyle} text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-blue-500`;
        }
    };

    // Handle action click with confirmation if needed
    const handleActionClick = (action: ActionDefinition): void => {
        if (versionId === undefined || versionId === null) {
            return;
        }
        if (action.confirmMessage) {
            if (window.confirm(action.confirmMessage)) {
                action.onClick?.(versionId);
            }
        } else {
            action.onClick?.(versionId);
        }
    };

    const actions = getAvailableActions();

    if (actions.length === 0) return null;

    return (
        <div className={`flex ${compact ? 'gap-1' : 'gap-2'} ${compact ? 'flex-wrap' : 'flex-row'}`}>
            {actions.map((action) => {
                const Icon = action.icon;
                const isLoading = loading;
                const isDisabled = action.disabled || isLoading;

                return (
                    <button
                        key={action.key}
                        onClick={() => !isDisabled && handleActionClick(action)}
                        disabled={isDisabled}
                        className={getButtonStyle(action.variant, compact)}
                        title={action.tooltip || action.label}
                    >
                        <Icon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${compact || action.always ? '' : 'mr-2'}`} />
                        {!compact && <span>{action.label}</span>}
                    </button>
                );
            })}
        </div>
    );
};

/**
 * Status-specific action groups for better organization
 */
interface ProtocolVersionStatusActionsProps extends Omit<ProtocolVersionActionsProps, 'compact'> {
    version: ProtocolVersion | null;
}

export const ProtocolVersionStatusActions: React.FC<ProtocolVersionStatusActionsProps> = ({ version, ...props }) => {
    if (!version) return null;

    const getStatusIcon = (status: ProtocolVersionStatus): React.ReactElement => {
        switch (status) {
            case 'DRAFT':
                return <FileText className="h-4 w-4 text-gray-500" />;
            case 'UNDER_REVIEW':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'AMENDMENT_REVIEW':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'APPROVED':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'ACTIVE':
                return <Play className="h-4 w-4 text-emerald-500" />;
            case 'SUPERSEDED':
                return <GitBranch className="h-4 w-4 text-orange-500" />;
            case 'WITHDRAWN':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
                {getStatusIcon(version.status)}
                <span className="text-sm font-medium text-gray-900">
                    {version.statusInfo?.label || version.status}
                </span>
                <span className="text-sm text-gray-500">
                    {version.versionNumber}
                </span>
            </div>

            <ProtocolVersionActions
                version={version}
                compact={true}
                {...props}
            />
        </div>
    );
};

/**
 * Quick Actions - Minimal action set for list views
 */
interface ProtocolVersionQuickActionsProps extends Omit<ProtocolVersionActionsProps, 'compact' | 'loading'> {
    version: ProtocolVersion | null;
}

export const ProtocolVersionQuickActions: React.FC<ProtocolVersionQuickActionsProps> = ({ version, ...props }) => {
    if (!version || version.id === undefined || version.id === null) return null;

    // Only show the most relevant action based on status
    const getPrimaryAction = (): ActionDefinition | null => {
        switch (version.status) {
            case 'DRAFT':
                return {
                    key: 'submit',
                    label: 'Submit',
                    icon: Send,
                    onClick: props.onSubmitReview,
                    variant: 'primary'
                };
            case 'UNDER_REVIEW':
                return null; // No actions while under external review
            case 'AMENDMENT_REVIEW':
                if (props.canApprove) {
                    return {
                        key: 'approve',
                        label: 'Approve',
                        icon: CheckCircle,
                        onClick: props.onApprove,
                        variant: 'success'
                    };
                }
                break;
            case 'APPROVED':
                if (props.canActivate) {
                    return {
                        key: 'activate',
                        label: 'Activate',
                        icon: Play,
                        onClick: props.onActivate,
                        variant: 'primary'
                    };
                }
                break;
            case 'ACTIVE':
            case 'PUBLISHED':
                if (props.onCreateAmendment) {
                    return {
                        key: 'amend',
                        label: 'Amend',
                        icon: GitBranch,
                        onClick: props.onCreateAmendment,
                        variant: 'secondary'
                    };
                }
                break;
            default:
                return null;
        }

        return null;
    };

    const primaryAction = getPrimaryAction();
    const versionId = version.id;

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => props.onView?.(versionId)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
                title="View Details"
            >
                <Eye className="h-4 w-4" />
            </button>

            {primaryAction && (
                <button
                    onClick={() => primaryAction.onClick?.(versionId)}
                    className={`px-2 py-1 text-xs font-medium rounded ${primaryAction.variant === 'primary'
                        ? 'text-white bg-blue-600 hover:bg-blue-700'
                        : primaryAction.variant === 'success'
                            ? 'text-white bg-green-600 hover:bg-green-700'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                        }`}
                    title={primaryAction.label}
                >
                    <primaryAction.icon className="h-3 w-3" />
                </button>
            )}
        </div>
    );
};

export default ProtocolVersionActions;
