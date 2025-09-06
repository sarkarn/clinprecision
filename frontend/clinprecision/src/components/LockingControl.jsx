import React, { useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import LockingService from '../services/LockingService';

/**
 * Component for locking and unlocking studies and forms
 */
const LockingControl = ({
    entityId,
    entityType,
    initialLockStatus = false,
    onLockStatusChange,
    userId
}) => {
    const [isLocked, setIsLocked] = useState(initialLockStatus);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    // Check current lock status when component mounts
    React.useEffect(() => {
        checkLockStatus();
    }, [entityId, entityType]);

    const checkLockStatus = async () => {
        try {
            let response;
            if (entityType === 'study') {
                response = await LockingService.checkStudyLockStatus(entityId);
            } else if (entityType === 'form') {
                response = await LockingService.checkFormLockStatus(entityId);
            }

            if (response.data && response.data.success) {
                const newLockStatus = response.data.lockStatus;
                setIsLocked(newLockStatus);

                // Notify parent component of lock status change
                if (onLockStatusChange) {
                    onLockStatusChange(newLockStatus);
                }
            }
        } catch (error) {
            console.error('Error checking lock status:', error);
            message.error('Failed to check lock status');
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            let response;
            if (entityType === 'study') {
                if (isLocked) {
                    response = await LockingService.unlockStudy(entityId, values.reason, userId);
                } else {
                    response = await LockingService.lockStudy(entityId, values.reason, userId);
                }
            } else if (entityType === 'form') {
                if (isLocked) {
                    response = await LockingService.unlockForm(entityId, values.reason, userId);
                } else {
                    response = await LockingService.lockForm(entityId, values.reason, userId);
                }
            }

            if (response.data && response.data.success) {
                message.success(response.data.message);
                setIsLocked(!isLocked);

                // Notify parent component of lock status change
                if (onLockStatusChange) {
                    onLockStatusChange(!isLocked);
                }

                setIsModalVisible(false);
                form.resetFields();
            } else {
                message.error(response.data?.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error during lock/unlock operation:', error);
            message.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const entityName = entityType === 'study' ? 'Study' : 'Form';
    const actionText = isLocked ? `Unlock ${entityName}` : `Lock ${entityName}`;
    const modalTitle = isLocked ? `Unlock ${entityName}` : `Lock ${entityName}`;
    const buttonType = isLocked ? 'primary' : 'default';
    const buttonDanger = !isLocked;

    return (
        <>
            <Button
                type={buttonType}
                danger={buttonDanger}
                icon={isLocked ? <LockOutlined /> : <UnlockOutlined />}
                onClick={showModal}
            >
                {actionText}
            </Button>

            <Modal
                title={modalTitle}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={loading}
                okText={actionText}
                cancelText="Cancel"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="reason"
                        label="Reason"
                        rules={[{ required: true, message: 'Please provide a reason' }]}
                    >
                        <Input.TextArea rows={4} placeholder={`Reason for ${isLocked ? 'unlocking' : 'locking'} this ${entityType}`} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default LockingControl;
