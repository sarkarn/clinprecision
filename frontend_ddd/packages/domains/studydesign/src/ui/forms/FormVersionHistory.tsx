import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * FormVersionHistory Component
 * Displays version history for a specific form
 * TODO: Implement full version history functionality
 */
const FormVersionHistory: React.FC = () => {
  const { formId, studyId } = useParams<{ formId?: string; studyId?: string }>();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Form Version History</h1>
      <p className="text-gray-600">
        Displaying version history for form: {formId}
        {studyId && ` (Study: ${studyId})`}
      </p>
      <p className="text-sm text-gray-500 mt-4">
        This component is a placeholder and will be implemented in a future update.
      </p>
    </div>
  );
};

export default FormVersionHistory;
