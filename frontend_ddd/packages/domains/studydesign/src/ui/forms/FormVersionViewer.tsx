import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * FormVersionViewer Component
 * Displays a specific version of a form
 * TODO: Implement full form version viewing functionality
 */
const FormVersionViewer: React.FC = () => {
  const { formId, versionId, studyId } = useParams<{ formId?: string; versionId?: string; studyId?: string }>();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Form Version Viewer</h1>
      <p className="text-gray-600">
        Viewing version {versionId} of form: {formId}
        {studyId && ` (Study: ${studyId})`}
      </p>
      <p className="text-sm text-gray-500 mt-4">
        This component is a placeholder and will be implemented in a future update.
      </p>
    </div>
  );
};

export default FormVersionViewer;
