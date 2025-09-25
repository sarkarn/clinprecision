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
    GitBranch
} from 'lucide-react';

/**
 * Protocol Version Actions Component
 * Displays context-sensitive action buttons based on protocol version status
 */
const ProtocolVersionActions = ({
    version,
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
    if (!version) return null;

    const { status, statusInfo } = version;

    // Get available actions based on status and permissions
    const getAvailableActions = () => {
        const actions = [];

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

            case 'PROTOCOL_REVIEW':
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
                    actions.push({
                        key: 'activate',
                        label: 'Activate',
                        icon: Play,
                        onClick: onActivate,
                        variant: 'primary',
                        confirmMessage: 'Are you sure you want to activate this protocol version? This will supersede the current active version.'
                    });
                }
                break;

            case 'ACTIVE':
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
    const getButtonStyle = (variant, isCompact = false) => {
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
    const handleActionClick = (action) => {
        if (action.confirmMessage) {
            if (window.confirm(action.confirmMessage)) {
                action.onClick?.(version.id);
            }
        } else {
            action.onClick?.(version.id);
        }
    };

    const actions = getAvailableActions();

    if (actions.length === 0) return null;

    return (
        <div className={`flex ${compact ? 'gap-1' : 'gap-2'} ${compact ? 'flex-wrap' : 'flex-row'}`}>
            {actions.map((action) => {
                const Icon = action.icon;
                const isLoading = loading;

                return (
                    <button
                        key={action.key}
                        onClick={() => handleActionClick(action)}
                        disabled={isLoading}
                        className={getButtonStyle(action.variant, compact)}
                        title={action.label}
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
export const ProtocolVersionStatusActions = ({ version, ...props }) => {
    if (!version) return null;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'DRAFT':
                return <FileText className="h-4 w-4 text-gray-500" />;
            case 'PROTOCOL_REVIEW':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'APPROVED':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'ACTIVE':
                return <Play className="h-4 w-4 text-blue-500" />;
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
                    v{version.versionNumber}
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
export const ProtocolVersionQuickActions = ({ version, ...props }) => {
    if (!version) return null;

    // Only show the most relevant action based on status
    const getPrimaryAction = () => {
        switch (version.status) {
            case 'DRAFT':
                return {
                    key: 'submit',
                    label: 'Submit',
                    icon: Send,
                    onClick: props.onSubmitReview,
                    variant: 'primary'
                };
            case 'PROTOCOL_REVIEW':
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

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => props.onView?.(version.id)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
                title="View Details"
            >
                <Eye className="h-4 w-4" />
            </button>

            {primaryAction && (
                <button
                    onClick={() => primaryAction.onClick?.(version.id)}
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