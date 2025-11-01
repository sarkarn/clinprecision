import React from 'react';

interface SiteDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  site?: any;
}

const SiteDetailsDialog: React.FC<SiteDetailsDialogProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">Site Details</h2>
        <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Close</button>
      </div>
    </div>
  );
};

export default SiteDetailsDialog;
