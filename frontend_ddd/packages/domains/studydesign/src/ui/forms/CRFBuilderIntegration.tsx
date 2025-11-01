import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * CRFBuilderIntegration Component
 * Integration with CRF (Case Report Form) Builder
 * TODO: Implement full CRF builder integration
 */
const CRFBuilderIntegration: React.FC = () => {
  const { formId, versionId, studyId } = useParams<{ formId?: string; versionId?: string; studyId?: string }>();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">CRF Builder</h1>
      <p className="text-gray-600">
        {formId ? `Editing form: ${formId}` : 'Create new form'}
        {versionId && ` (Version: ${versionId})`}
        {studyId && ` (Study: ${studyId})`}
      </p>
      <p className="text-sm text-gray-500 mt-4">
        This component is a placeholder and will be implemented in a future update.
      </p>
    </div>
  );
};

export default CRFBuilderIntegration;
