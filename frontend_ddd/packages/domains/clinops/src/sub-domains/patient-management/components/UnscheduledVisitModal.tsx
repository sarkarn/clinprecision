import React from 'react';

interface UnscheduledVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (visitData: any) => void;
  onVisitCreated?: () => Promise<void>;
  patientId?: string | number;
  patientName?: string;
  studyId?: string | number;
  siteId?: string | number;
  visitType?: string;
}

/**
 * UnscheduledVisitModal Component
 * Modal for creating unscheduled visits
 * TODO: Implement full unscheduled visit creation functionality
 */
const UnscheduledVisitModal: React.FC<UnscheduledVisitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onVisitCreated,
  patientId,
  patientName,
  studyId,
  siteId,
  visitType
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Create Unscheduled Visit</h2>
        <p className="text-gray-600 mb-4">
          Patient: <span className="font-semibold">{patientName || patientId}</span>
        </p>
        {visitType && (
          <p className="text-sm text-gray-500 mb-2">
            Visit Type: {visitType}
          </p>
        )}
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
            onClick={async () => {
              if (onConfirm) {
                onConfirm({ patientId, studyId, siteId, visitType });
              }
              if (onVisitCreated) {
                await onVisitCreated();
              }
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create (Placeholder)
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnscheduledVisitModal;
