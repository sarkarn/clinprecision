import React from 'react';
import {
    FileText,
    Plus,
    Clock,
    CheckCircle,
    Play,
    AlertTriangle,
    Edit2,
    Eye,
    GitBranch,
    LucideIcon
} from 'lucide-react';
import { ProtocolVersionMiniTimeline } from './ProtocolVersionTimeline';
import { ProtocolVersionQuickActions } from './ProtocolVersionActions';

type QuickActionVersion = NonNullable<React.ComponentProps<typeof ProtocolVersionQuickActions>['version']>;
type TimelineVersions = NonNullable<React.ComponentProps<typeof ProtocolVersionMiniTimeline>['versions']>;
type TimelineVersion = TimelineVersions[number];

type ProtocolVersionStatus = QuickActionVersion['status'] | 'PROTOCOL_REVIEW';

type ProtocolVersion = QuickActionVersion &
    Partial<TimelineVersion> &
    Record<string, unknown>;

interface StatusDisplay {
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    label: string;
}

interface ActionDefinition {
    label: string;
    icon: LucideIcon;
    onClick?: () => void;
    variant: 'primary' | 'success' | 'secondary';
    disabled?: boolean;
}

interface ProtocolVersionPanelProps {
    studyId?: string;
    studyName?: string;
    currentProtocolVersion?: ProtocolVersion | null;
    protocolVersions?: ProtocolVersion[];
    loading?: boolean;
    onCreateVersion?: () => void;
    onManageVersions?: () => void;
    onEditVersion?: (versionId: string | number) => void;
    onSubmitReview?: (versionId: string | number) => void;
    onApproveVersion?: (versionId: string | number) => void;
    onActivateVersion?: (versionId: string | number) => void;
    compact?: boolean;
}

const ProtocolVersionPanel: React.FC<ProtocolVersionPanelProps> = ({
    studyId,
    studyName,
    currentProtocolVersion,
    protocolVersions = [],
    loading = false,
    onCreateVersion,
    onManageVersions,
    onEditVersion,
    onSubmitReview,
    onApproveVersion,
    onActivateVersion,
    compact = false
}) => {
    const getStatusDisplay = (version?: ProtocolVersion | null): StatusDisplay | null => {
        if (!version || !version.status) {
            return null;
        }

        switch (version.status) {
            case 'DRAFT':
                return {
                    icon: FileText,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    borderColor: 'border-gray-300',
                    label: 'Draft'
                };
            case 'UNDER_REVIEW':
            case 'PROTOCOL_REVIEW':
                return {
                    icon: Clock,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-100',
                    borderColor: 'border-yellow-300',
                    label: 'Under Review'
                };
            case 'AMENDMENT_REVIEW':
                return {
                    icon: Clock,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    borderColor: 'border-blue-300',
                    label: 'Pending Approval'
                };
            case 'APPROVED':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    borderColor: 'border-green-300',
                    label: 'Approved'
                };
            case 'ACTIVE':
            case 'PUBLISHED':
                return {
                    icon: Play,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    borderColor: 'border-blue-300',
                    label: 'Active'
                };
            case 'SUPERSEDED':
                return {
                    icon: GitBranch,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100',
                    borderColor: 'border-orange-300',
                    label: 'Superseded'
                };
            case 'WITHDRAWN':
                return {
                    icon: AlertTriangle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    borderColor: 'border-red-300',
                    label: 'Withdrawn'
                };
            default:
                return {
                    icon: FileText,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    borderColor: 'border-gray-300',
                    label: String(version.status)
                };
        }
    };

    const getPrimaryAction = (): ActionDefinition | null => {
        if (!currentProtocolVersion) {
            return {
                label: 'Create Initial Version',
                icon: Plus,
                onClick: onCreateVersion,
                variant: 'primary'
            };
        }

        const versionId = currentProtocolVersion.id;

        switch (currentProtocolVersion.status) {
            case 'DRAFT':
                return {
                    label: 'Submit for Review',
                    icon: Clock,
                    onClick: versionId !== undefined && onSubmitReview ? () => onSubmitReview(versionId) : undefined,
                    variant: 'primary'
                };
            case 'UNDER_REVIEW':
            case 'PROTOCOL_REVIEW':
            case 'AMENDMENT_REVIEW':
                return {
                    label: 'Under Review',
                    icon: Clock,
                    onClick: undefined,
                    variant: 'secondary',
                    disabled: true
                };
            case 'APPROVED':
                return {
                    label: 'Activate Version',
                    icon: Play,
                    onClick: versionId !== undefined && onActivateVersion ? () => onActivateVersion(versionId) : undefined,
                    variant: 'success'
                };
            case 'ACTIVE':
            case 'PUBLISHED':
                return {
                    label: 'Create Amendment',
                    icon: Plus,
                    onClick: onCreateVersion,
                    variant: 'secondary'
                };
            default:
                return null;
        }
    };

    const getSecondaryActions = (): ActionDefinition[] => {
        const actions: ActionDefinition[] = [];

        if (protocolVersions.length > 0) {
            actions.push({
                label: 'Manage Versions',
                icon: Eye,
                onClick: onManageVersions,
                variant: 'secondary'
            });
        }

        if (currentProtocolVersion?.status === 'DRAFT') {
            const versionId = currentProtocolVersion.id;
            actions.push({
                label: 'Edit',
                icon: Edit2,
                onClick: versionId !== undefined && onEditVersion ? () => onEditVersion(versionId) : undefined,
                variant: 'secondary'
            });
        }

        return actions;
    };

    const statusDisplay = getStatusDisplay(currentProtocolVersion);
    const primaryAction = getPrimaryAction();
    const secondaryActions = getSecondaryActions();

    if (compact) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-gray-900">Protocol Version</span>
                        </div>

                        {currentProtocolVersion ? (
                            <div className="flex items-center gap-2">
                                {statusDisplay && (
                                    <>
                                        <statusDisplay.icon className={`h-4 w-4 ${statusDisplay.color}`} />
                                        <span className="text-sm text-gray-600">
                                            v{currentProtocolVersion.versionNumber}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                                            {statusDisplay.label}
                                        </span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-500">No version created</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {primaryAction && (
                            <button
                                onClick={primaryAction.onClick}
                                disabled={primaryAction.disabled || loading}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${primaryAction.variant === 'primary'
                                    ? 'text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                                    : primaryAction.variant === 'success'
                                        ? 'text-white bg-green-600 hover:bg-green-700 disabled:opacity-50'
                                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50'
                                    } disabled:cursor-not-allowed`}
                            >
                                <primaryAction.icon className="h-4 w-4 inline mr-1" />
                                {primaryAction.label}
                            </button>
                        )}

                        {secondaryActions.length > 0 && (
                            <button
                                onClick={onManageVersions}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                                title="Manage Versions"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const totalActiveVersions = protocolVersions.filter(
        (version) => version.status === 'ACTIVE' || version.status === 'PUBLISHED'
    ).length;

    const totalInDevelopment = protocolVersions.filter((version) =>
        version.status === 'DRAFT' ||
        version.status === 'PROTOCOL_REVIEW' ||
        version.status === 'UNDER_REVIEW' ||
        version.status === 'AMENDMENT_REVIEW'
    ).length;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Protocol Version Management
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    {secondaryActions.map((action, index) => {
                        const ActionIcon = action.icon;
                        return (
                            <button
                                key={`${action.label}-${index}`}
                                onClick={action.onClick}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <ActionIcon className="h-4 w-4" />
                                {action.label}
                            </button>
                        );
                    })}

                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            disabled={primaryAction.disabled || loading}
                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${primaryAction.variant === 'primary'
                                ? 'text-white bg-blue-600 border-transparent hover:bg-blue-700 focus:ring-blue-500'
                                : primaryAction.variant === 'success'
                                    ? 'text-white bg-green-600 border-transparent hover:bg-green-700 focus:ring-green-500'
                                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
                                }`}
                        >
                            <primaryAction.icon className="h-4 w-4" />
                            {primaryAction.label}
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                {!currentProtocolVersion ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                            No Protocol Version
                        </h4>
                        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                            Create an initial protocol version to define your study protocol and begin the approval process.
                        </p>
                        <button
                            onClick={onCreateVersion}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create Initial Version
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className={`p-4 rounded-lg border-2 ${statusDisplay?.borderColor ?? 'border-gray-200'} ${statusDisplay?.bgColor ?? 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {statusDisplay && (
                                        <div className={`p-2 rounded-full bg-white ${statusDisplay.borderColor} border`}>
                                            <statusDisplay.icon className={`h-5 w-5 ${statusDisplay.color}`} />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            Protocol {currentProtocolVersion.versionNumber}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Status: {statusDisplay?.label || currentProtocolVersion.status}
                                        </p>
                                        {currentProtocolVersion.amendmentType && currentProtocolVersion.amendmentType !== 'INITIAL' && (
                                            <p className="text-sm text-gray-600">
                                                Type: {currentProtocolVersion.amendmentType}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <ProtocolVersionQuickActions
                                    version={currentProtocolVersion}
                                    onSubmitReview={onSubmitReview}
                                    onApprove={onApproveVersion}
                                    onActivate={onActivateVersion}
                                    onCreateAmendment={onCreateVersion}
                                    onView={onManageVersions}
                                    canApprove={true}
                                    canActivate={true}
                                />
                            </div>

                            <div className="mt-4">
                                <p className="text-gray-700 text-sm">
                                    {currentProtocolVersion.description}
                                </p>
                            </div>

                            {protocolVersions.length > 1 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <ProtocolVersionMiniTimeline
                                        versions={protocolVersions}
                                        currentVersionId={currentProtocolVersion.id}
                                        onVersionSelect={() => onManageVersions?.()}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">
                                    {protocolVersions.length}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Total Versions
                                </div>
                            </div>

                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">
                                    {totalActiveVersions}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Active Versions
                                </div>
                            </div>

                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">
                                    {totalInDevelopment}
                                </div>
                                <div className="text-sm text-gray-600">
                                    In Development
                                </div>
                            </div>
                        </div>

                        {currentProtocolVersion.status === 'PROTOCOL_REVIEW' && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <h5 className="font-medium text-yellow-800">Protocol Under Review</h5>
                                </div>
                                <p className="text-yellow-700 text-sm">
                                    This protocol version is currently under review. Once approved, you'll be able to activate it for the study.
                                </p>
                            </div>
                        )}

                        {currentProtocolVersion.status === 'APPROVED' && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <h5 className="font-medium text-green-800">Protocol Approved</h5>
                                </div>
                                <p className="text-green-700 text-sm">
                                    This protocol version has been approved and is ready to be activated for the study.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProtocolVersionPanel;
