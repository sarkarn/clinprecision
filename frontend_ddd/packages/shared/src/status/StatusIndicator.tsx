// src/components/shared/status/StatusIndicator.tsx
import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    RefreshCw,
    Wifi,
    WifiOff,
    Activity,
    Database,
    Zap
} from 'lucide-react';

type StatusType = 'DRAFT' | 'PLANNING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED';
type ConnectionStatusType = 'connected' | 'connecting' | 'disconnected' | 'failed';
type SizeType = 'sm' | 'md' | 'lg';

interface StatusIndicatorProps {
    status: StatusType;
    lastUpdated?: Date | string;
    isRealTime?: boolean;
    showLastUpdated?: boolean;
    showIcon?: boolean;
    showBadge?: boolean;
    size?: SizeType;
    className?: string;
    onClick?: () => void | null;
    computationInProgress?: boolean;
    connectionStatus?: ConnectionStatusType;
}

interface CompactStatusIndicatorProps {
    status: StatusType;
    isRealTime?: boolean;
    connectionStatus?: ConnectionStatusType;
}

interface DetailedStatusCardProps {
    status: StatusType;
    lastUpdated?: Date | string;
    isRealTime?: boolean;
    connectionStatus?: ConnectionStatusType;
    computationInProgress?: boolean;
    onRefresh?: (() => void) | null;
    additionalInfo?: Record<string, any>;
}

/**
 * Real-time Status Indicator Component
 * Displays study status with real-time updates and visual indicators
 */
const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    status,
    lastUpdated,
    isRealTime = false,
    showLastUpdated = true,
    showIcon = true,
    showBadge = true,
    size = 'md',
    className = '',
    onClick = null,
    computationInProgress = false,
    connectionStatus = 'connected'
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [timeAgo, setTimeAgo] = useState('');

    // Status configurations
    const STATUS_CONFIG = {
        DRAFT: {
            icon: Clock,
            color: 'gray',
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-700',
            borderColor: 'border-gray-300',
            label: 'Draft',
            description: 'Study in initial planning phase'
        },
        PLANNING: {
            icon: RefreshCw,
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-700',
            borderColor: 'border-blue-300',
            label: 'Planning',
            description: 'Study design being finalized'
        },
        APPROVED: {
            icon: CheckCircle2,
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-700',
            borderColor: 'border-green-300',
            label: 'Approved',
            description: 'Study approved and ready to start'
        },
        ACTIVE: {
            icon: Activity,
            color: 'emerald',
            bgColor: 'bg-emerald-100',
            textColor: 'text-emerald-700',
            borderColor: 'border-emerald-300',
            label: 'Active',
            description: 'Study actively enrolling participants'
        },
        COMPLETED: {
            icon: CheckCircle2,
            color: 'purple',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-700',
            borderColor: 'border-purple-300',
            label: 'Completed',
            description: 'Study successfully completed'
        },
        TERMINATED: {
            icon: XCircle,
            color: 'red',
            bgColor: 'bg-red-100',
            textColor: 'text-red-700',
            borderColor: 'border-red-300',
            label: 'Terminated',
            description: 'Study terminated before completion'
        },
        SUSPENDED: {
            icon: AlertTriangle,
            color: 'yellow',
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-700',
            borderColor: 'border-yellow-300',
            label: 'Suspended',
            description: 'Study temporarily halted'
        }
    };

    // Size configurations
    const SIZE_CONFIG = {
        sm: {
            icon: 'w-3 h-3',
            text: 'text-xs',
            padding: 'px-2 py-1',
            gap: 'gap-1'
        },
        md: {
            icon: 'w-4 h-4',
            text: 'text-sm',
            padding: 'px-3 py-1.5',
            gap: 'gap-2'
        },
        lg: {
            icon: 'w-5 h-5',
            text: 'text-base',
            padding: 'px-4 py-2',
            gap: 'gap-2'
        }
    };

    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
    const sizeConfig = SIZE_CONFIG[size];

    /**
     * Update time ago display
     */
    useEffect(() => {
        if (!lastUpdated) return;

        const updateTimeAgo = () => {
            const now = new Date();
            const diff = now.getTime() - new Date(lastUpdated).getTime();
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) {
                setTimeAgo(`${days}d ago`);
            } else if (hours > 0) {
                setTimeAgo(`${hours}h ago`);
            } else if (minutes > 0) {
                setTimeAgo(`${minutes}m ago`);
            } else if (seconds > 10) {
                setTimeAgo(`${seconds}s ago`);
            } else {
                setTimeAgo('just now');
            }
        };

        updateTimeAgo();
        const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [lastUpdated]);

    /**
     * Trigger animation on status change
     */
    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 600);
        return () => clearTimeout(timer);
    }, [status]);

    /**
     * Get connection indicator
     */
    const renderConnectionIndicator = (): React.ReactElement | null => {
        if (!isRealTime) return null;

        const connectionConfig = {
            connected: { icon: Wifi, color: 'text-green-500', label: 'Connected' },
            connecting: { icon: RefreshCw, color: 'text-yellow-500', label: 'Connecting' },
            disconnected: { icon: WifiOff, color: 'text-red-500', label: 'Disconnected' },
            failed: { icon: WifiOff, color: 'text-red-500', label: 'Connection Failed' }
        };

        const config = connectionConfig[connectionStatus] || connectionConfig.disconnected;
        const Icon = config.icon;

        return (
            <div className={`flex items-center ${sizeConfig.gap}`} title={`Real-time updates: ${config.label}`}>
                <Icon className={`${sizeConfig.icon} ${config.color} ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
            </div>
        );
    };

    /**
     * Get computation indicator
     */
    const renderComputationIndicator = (): React.ReactElement | null => {
        if (!computationInProgress) return null;

        return (
            <div className="flex items-center gap-1" title="Status computation in progress">
                <Database className={`${sizeConfig.icon} text-blue-500 animate-pulse`} />
            </div>
        );
    };

    /**
     * Render main status badge
     */
    const renderStatusBadge = (): React.ReactElement => {
        const Icon = statusConfig.icon;

        return (
            <div
                className={`
                    inline-flex items-center ${sizeConfig.gap} ${sizeConfig.padding} 
                    ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}
                    border rounded-full font-medium ${sizeConfig.text}
                    ${isAnimating ? 'animate-pulse' : ''}
                    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                    ${className}
                `}
                onClick={onClick || undefined}
                title={statusConfig.description}
            >
                {showIcon && (
                    <Icon className={`${sizeConfig.icon} ${isAnimating ? 'animate-spin' : ''}`} />
                )}
                {statusConfig.label}
                {renderComputationIndicator()}
                {renderConnectionIndicator()}
            </div>
        );
    };

    /**
     * Render status with additional info
     */
    const renderStatusWithInfo = (): React.ReactElement => {
        return (
            <div className={`flex flex-col ${sizeConfig.gap}`}>
                {renderStatusBadge()}
                {showLastUpdated && lastUpdated && (
                    <div className={`flex items-center ${sizeConfig.gap} ${sizeConfig.text} text-gray-500`}>
                        <Clock className={`${sizeConfig.icon}`} />
                        <span>Updated {timeAgo}</span>
                        {isRealTime && (
                            <div className="flex items-center gap-1">
                                <Zap className={`${sizeConfig.icon} text-blue-500`} />
                                <span className="text-xs">Live</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (showBadge && (showLastUpdated || isRealTime)) {
        return renderStatusWithInfo();
    }

    return renderStatusBadge();
};

/**
 * Compact Status Indicator for tables and lists
 */
export const CompactStatusIndicator: React.FC<CompactStatusIndicatorProps> = ({ 
    status, 
    isRealTime = false, 
    connectionStatus = 'connected' 
}) => {
    return (
        <StatusIndicator
            status={status}
            isRealTime={isRealTime}
            connectionStatus={connectionStatus}
            showLastUpdated={false}
            showBadge={true}
            size="sm"
        />
    );
};

/**
 * Detailed Status Card with full information
 */
export const DetailedStatusCard: React.FC<DetailedStatusCardProps> = ({
    status,
    lastUpdated,
    isRealTime = false,
    connectionStatus = 'connected',
    computationInProgress = false,
    onRefresh = null,
    additionalInfo = {}
}) => {
    const STATUS_CONFIG: any = {
        DRAFT: { color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200', label: 'Draft' },
        PLANNING: { color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', label: 'Planning' },
        APPROVED: { color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200', label: 'Approved' },
        ACTIVE: { color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', label: 'Active' },
        COMPLETED: { color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200', label: 'Completed' },
        TERMINATED: { color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200', label: 'Terminated' },
        SUSPENDED: { color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200', label: 'Suspended' }
    };

    const statusConfig = STATUS_CONFIG[status] || {
        color: 'gray',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        label: status || 'Unknown'
    };

    return (
        <div className={`p-4 rounded-lg border ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Study Status</h3>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-white transition-colors"
                        title="Refresh status"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <StatusIndicator
                    status={status}
                    lastUpdated={lastUpdated}
                    isRealTime={isRealTime}
                    connectionStatus={connectionStatus}
                    computationInProgress={computationInProgress}
                    showLastUpdated={true}
                    size="lg"
                />

                {additionalInfo && Object.keys(additionalInfo).length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(additionalInfo).map(([key, value]) => (
                                <div key={key}>
                                    <span className="text-gray-600">{key}:</span>
                                    <span className="ml-2 font-medium text-gray-900">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusIndicator;
