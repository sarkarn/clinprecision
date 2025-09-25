import React from 'react';
import ProtocolVersionPanel from '../protocol-version/ProtocolVersionPanel';
import useProtocolVersioning from '../../hooks/useProtocolVersioning';

/**
 * Protocol Version Quick Overview Component
 * Compact version display for dashboard sidebars or overview panels
 */
const ProtocolVersionQuickOverview = ({
    studyId,
    studyName,
    onManageVersions,
    className = ""
}) => {
    const protocolVersioning = useProtocolVersioning(studyId);

    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
            <ProtocolVersionPanel
                studyId={studyId}
                studyName={studyName}
                currentProtocolVersion={protocolVersioning.currentVersion}
                protocolVersions={protocolVersioning.versions}
                loading={protocolVersioning.loading}
                onCreateVersion={() => {
                    protocolVersioning.setEditingVersion(null);
                    onManageVersions?.();
                }}
                onManageVersions={onManageVersions}
                onEditVersion={(versionId) => {
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