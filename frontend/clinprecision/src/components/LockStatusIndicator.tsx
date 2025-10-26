import React from 'react';
import { Tag, Tooltip } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';

interface LockStatusIndicatorProps {
    isLocked: boolean;
    entityType: string;
}

/**
 * Component to display lock status for studies and forms
 */
const LockStatusIndicator: React.FC<LockStatusIndicatorProps> = ({ isLocked, entityType }) => {
    const color = isLocked ? 'red' : 'green';
    const icon = isLocked ? <LockOutlined /> : <UnlockOutlined />;
    const text = isLocked ? 'Locked' : 'Unlocked';
    const tooltip = isLocked
        ? `This ${entityType} is locked and cannot be modified`
        : `This ${entityType} is unlocked and can be modified`;

    return (
        <Tooltip title={tooltip}>
            <Tag color={color} icon={icon}>
                {text}
            </Tag>
        </Tooltip>
    );
};

export default LockStatusIndicator;
