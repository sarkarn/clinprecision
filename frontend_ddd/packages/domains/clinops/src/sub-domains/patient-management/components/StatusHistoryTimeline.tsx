import React from 'react';

interface StatusHistoryItem {
  id: string | number;
  status: string;
  timestamp: string;
  changedBy?: string;
  reason?: string;
}

interface StatusHistoryTimelineProps {
  isOpen?: boolean;
  onClose: () => void;
  history?: StatusHistoryItem[];
  patientId?: string | number;
}

/**
 * StatusHistoryTimeline Component
 * Displays the timeline of status changes for a patient/subject
 * TODO: Implement full timeline visualization
 */
const StatusHistoryTimeline: React.FC<StatusHistoryTimelineProps> = ({
  isOpen = true,
  onClose,
  history = [],
  patientId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Status History</h2>
        <div className="space-y-4">
          {history && history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="font-semibold">{item.status}</div>
                <div className="text-sm text-gray-600">{item.timestamp}</div>
                {item.changedBy && (
                  <div className="text-sm text-gray-500">By: {item.changedBy}</div>
                )}
                {item.reason && (
                  <div className="text-sm text-gray-500">Reason: {item.reason}</div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No status history available</p>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          This component is a placeholder and will be enhanced in a future update.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusHistoryTimeline;
