import React from 'react';

interface CreateSiteDialogProps {
  open: boolean;
  onClose: () => void;
  onSiteCreated: () => void;
  organizations?: any[];
  site?: any;
}

const CreateSiteDialog: React.FC<CreateSiteDialogProps> = ({ open, onClose }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">Create Site</h2>
        <p className="text-gray-600 mb-4">Site creation dialog placeholder</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CreateSiteDialog;
