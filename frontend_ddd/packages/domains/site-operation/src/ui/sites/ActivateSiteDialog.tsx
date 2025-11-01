import React from 'react';

interface ActivateSiteDialogProps {
  open: boolean;
  onClose: () => void;
  site?: any;
  onSiteActivated: () => void;
}

const ActivateSiteDialog: React.FC<ActivateSiteDialogProps> = ({ open, onClose }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Activate Site</h2>
        <p className="text-gray-600 mb-4">Site activation dialog placeholder</p>
        <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Close
        </button>
      </div>
    </div>
  );
};

export default ActivateSiteDialog;
