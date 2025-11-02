import React from 'react';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (newStatus: string, reason: string) => void;
  onStatusChanged?: (result: any) => Promise<void>;
  currentStatus: string;
  patientId?: string | number;
  patientName?: string;
}

/**
 * StatusChangeModal Component
 * Modal for changing patient/subject status
 * TODO: Implement full status change functionality
 */
const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  patientId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Change Status</h2>
        <p className="text-gray-600 mb-4">
          Current Status: <span className="font-semibold">{currentStatus}</span>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          This component is a placeholder and will be implemented in a future update.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
