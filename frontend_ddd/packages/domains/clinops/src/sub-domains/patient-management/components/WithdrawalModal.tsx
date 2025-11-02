import React from 'react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (withdrawalData: any) => void;
  patientId?: string | number;
  studyId?: string | number;
}

/**
 * WithdrawalModal Component
 * Modal for managing patient/subject withdrawal from study
 * TODO: Implement full withdrawal functionality with reason tracking
 */
const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patientId,
  studyId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-red-600">Withdraw Subject</h2>
        <p className="text-gray-600 mb-4">
          Patient ID: <span className="font-semibold">{patientId}</span>
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> Withdrawal is a significant action that may affect the study data.
          </p>
        </div>
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
          <button
            onClick={() => {
              onConfirm({ patientId, studyId, reason: 'Placeholder' });
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm Withdrawal (Placeholder)
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
