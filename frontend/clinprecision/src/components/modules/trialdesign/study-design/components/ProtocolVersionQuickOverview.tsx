import React from 'react';
import ProtocolVersionPanel from '../protocol-version/ProtocolVersionPanel';
import useProtocolVersioning from '../../hooks/useProtocolVersioning';

interface ProtocolVersionQuickOverviewProps {
    studyId: string | number;
    studyName: string;
    onManageVersions?: () => void;
    className?: string;
}

/**
 * Protocol Version Quick Overview Component
 * Compact version display for dashboard sidebars or overview panels
 */
const ProtocolVersionQuickOverview: React.FC<ProtocolVersionQuickOverviewProps> = ({
    studyId,
    studyName,
    onManageVersions,
    className = ""
}) => {
    const protocolVersioning = useProtocolVersioning(String(studyId)) as any;

    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
            <ProtocolVersionPanel
                studyId={String(studyId)}
                studyName={studyName}
                currentProtocolVersion={protocolVersioning.currentVersion}
                protocolVersions={protocolVersioning.versions}
                loading={protocolVersioning.loading}
                onCreateVersion={() => {
                    protocolVersioning.setEditingVersion(null);
                    onManageVersions?.();
                }}
                onManageVersions={onManageVersions}
                onEditVersion={(versionId: any) => {
                    protocolVersioning.setEditingVersion(versionId);
                    onManageVersions?.();
                }}
                onSubmitReview={protocolVersioning.submitForReview}
                onApproveVersion={protocolVersioning.approveVersion}
                onActivateVersion={protocolVersioning.activateVersion}
                compact={true}
            />
        </div>
    );
};

export default ProtocolVersionQuickOverview;
