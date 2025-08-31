import React, { useState, useEffect, useRef } from 'react';
import FormCanvas from './FormCanvas';
import ClinicalTemplates from './ClinicalTemplates';

// Create a simple icon component instead of using Font Awesome
const Icon = ({ type }) => {
  const getIcon = () => {
    switch (type) {
      case 'text': return 'T';
      case 'number': return '#';
      case 'date': return '📅';
      case 'checkbox': return '☑';
      case 'radio': return '◉';
      case 'select': return '▼';
      case 'template': return '📋';
      default: return '⬦';
    }
  };

  return (
    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 rounded">
      {getIcon()}
    </span>
  );
};

// Original constants - update these
const MIN_WIDTH = 700;  // Change to 910 (30% increase)
const MIN_CANVAS_HEIGHT = 400;

const CRFBuilder = ({ onSave, onCancel, initialData = null, readOnly = false }) => {
  const [fields, setFields] = useState(initialData?.fields || []);
  const [crfName, setCrfName] = useState(initialData?.name || '');
  const [draggedField, setDraggedField] = useState(null);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
  const [showMetadataPanel, setShowMetadataPanel] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  // Add state for preview mode
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Use the templates from the imported file
  const DOMAIN_TEMPLATES = [
    { id: 'ae', ...ClinicalTemplates.adverseEvent },
    { id: 'cm', ...ClinicalTemplates.concomitantMedication },
    { id: 'vs', ...ClinicalTemplates.vitalSigns },
    { id: 'lb', ...ClinicalTemplates.laboratoryResults },
    { id: 'dm', ...ClinicalTemplates.demographics },
    { id: 'mh', ...ClinicalTemplates.medicalHistory }
  ];

  // Basic field types
  const fieldTypes = [
    { type: 'text', label: 'Text Field' },
    { type: 'number', label: 'Number Field' },
    { type: 'date', label: 'Date Field' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'radio', label: 'Radio Button' },
    { type: 'select', label: 'Select Dropdown' }
  ];

  // Handle field drag start
  const handleDragStart = (e, fieldType) => {
    setDraggedField(fieldType);
  };

  // Handle field drop onto canvas
  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedField) {
      const newField = {
        type: draggedField.type,
        label: `New ${draggedField.label}`,
        width: 'full',
        widthPercent: 100,
        height: 'auto',
        metadata: {
          variableName: '',
          dataType: draggedField.type === 'number' ? 'numeric' : draggedField.type,
          required: false,
          validationRules: []
        }
      };

      setFields([...fields, newField]);
      setDraggedField(null);

      // Select the newly added field to edit its metadata
      setSelectedFieldIndex(fields.length);
      setShowMetadataPanel(true);
    }
  };

  // Handle field drag over canvas
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle field label change
  const handleLabelChange = (index, newLabel) => {
    const updatedFields = [...fields];
    updatedFields[index].label = newLabel;
    setFields(updatedFields);
  };

  // Handle removing a field
  const handleRemoveField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);

    // Reset selection if the selected field was removed
    if (selectedFieldIndex === index) {
      setSelectedFieldIndex(null);
      setShowMetadataPanel(false);
    } else if (selectedFieldIndex > index) {
      // Adjust the selected index if a field before it was removed
      setSelectedFieldIndex(selectedFieldIndex - 1);
    }
  };

  // Handle moving a field (reordering)
  const handleMoveField = (fromIndex, toIndex) => {
    const updatedFields = [...fields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, movedField);
    setFields(updatedFields);

    // Update selected field index if needed
    if (selectedFieldIndex === fromIndex) {
      setSelectedFieldIndex(toIndex);
    } else if (
      (selectedFieldIndex > fromIndex && selectedFieldIndex <= toIndex) ||
      (selectedFieldIndex < fromIndex && selectedFieldIndex >= toIndex)
    ) {
      // Adjust selection for fields moved past it
      setSelectedFieldIndex(
        selectedFieldIndex > fromIndex
          ? selectedFieldIndex - 1
          : selectedFieldIndex + 1
      );
    }
  };

  // Toggle field width between half and full
  const toggleFieldWidth = (index) => {
    const updatedFields = [...fields];
    const field = updatedFields[index];

    if (field.widthPercent === 100) {
      field.widthPercent = 50;
      field.width = 'half';
    } else {
      field.widthPercent = 100;
      field.width = 'full';
    }

    setFields(updatedFields);
  };

  // Update field size (width/height)
  const updateFieldSize = (index, widthPercent, height) => {
    const updatedFields = [...fields];
    const field = updatedFields[index];

    field.widthPercent = widthPercent;
    field.width = widthPercent === 100 ? 'full' : 'half';

    if (height !== undefined) {
      field.height = height;
    }

    setFields(updatedFields);
  };

  // Handle selecting a field for editing metadata
  const handleSelectField = (index) => {
    setSelectedFieldIndex(index);
    setShowMetadataPanel(true);
  };

  // Update field metadata
  const updateFieldMetadata = (property, value) => {
    if (selectedFieldIndex === null) return;

    const updatedFields = [...fields];
    updatedFields[selectedFieldIndex].metadata[property] = value;
    setFields(updatedFields);
  };

  // Open template selection modal
  const openTemplateModal = () => {
    setShowTemplateModal(true);
  };

  // Apply selected template
  const applyTemplate = (templateId) => {
    const template = DOMAIN_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setCrfName(template.name);
      setFields([...template.fields]);
      setShowTemplateModal(false);
      setSelectedTemplate(template);
    }
  };

  // Save the CRF
  const handleSave = () => {
    if (!crfName.trim()) {
      alert('Please enter a CRF name');
      return;
    }

    onSave({
      name: crfName,
      fields: fields,
      templateId: selectedTemplate?.id
    });
  };

  // Render template selection modal
  const renderTemplateModal = () => {
    if (!showTemplateModal) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Select a Domain Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {DOMAIN_TEMPLATES.map(template => (
              <div
                key={template.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50"
                onClick={() => applyTemplate(template.id)}
              >
                <h3 className="font-medium text-blue-700">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                <p className="text-xs text-gray-500 mt-2">{template.fields?.length || 0} fields</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
              onClick={() => setShowTemplateModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render metadata panel for the selected field
  const renderMetadataPanel = () => {
    if (selectedFieldIndex === null) return null;

    const field = fields[selectedFieldIndex];
    const { metadata } = field;

    return (
      <div className="bg-white shadow-md rounded p-4 mt-4">
        <h3 className="text-lg font-medium mb-3">Field Metadata</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CDASH/SDTM Variable Name
            </label>
            <input
              type="text"
              value={metadata.variableName || ''}
              onChange={(e) => updateFieldMetadata('variableName', e.target.value)}
              className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
              placeholder="e.g., AETERM, CMTRT"
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SDTM Mapping
            </label>
            <input
              type="text"
              value={metadata.sdtmMapping || ''}
              onChange={(e) => updateFieldMetadata('sdtmMapping', e.target.value)}
              className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
              placeholder="e.g., AE.AETERM"
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Field
            </label>
            <select
              value={metadata.required ? 'true' : 'false'}
              onChange={(e) => updateFieldMetadata('required', e.target.value === 'true')}
              className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
              disabled={readOnly}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Source
            </label>
            <select
              value={metadata.source || 'clinician'}
              onChange={(e) => updateFieldMetadata('source', e.target.value)}
              className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
              disabled={readOnly}
            >
              <option value="clinician">Clinician</option>
              <option value="patient">Patient</option>
              <option value="lab">Laboratory</option>
              <option value="device">Device/Instrument</option>
              <option value="derived">Derived</option>
            </select>
          </div>
        </div>

        {/* Field type specific metadata */}
        {field.type === 'text' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Length
              </label>
              <input
                type="number"
                value={metadata.maxLength || ''}
                onChange={(e) => updateFieldMetadata('maxLength', parseInt(e.target.value) || '')}
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                disabled={readOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coding Required
              </label>
              <select
                value={metadata.codingRequired ? 'true' : 'false'}
                onChange={(e) => updateFieldMetadata('codingRequired', e.target.value === 'true')}
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                disabled={readOnly}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {metadata.codingRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coding Dictionary
                </label>
                <select
                  value={metadata.codingDictionary || ''}
                  onChange={(e) => updateFieldMetadata('codingDictionary', e.target.value)}
                  className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                  disabled={readOnly}
                >
                  <option value="">Select Dictionary</option>
                  <option value="MedDRA">MedDRA</option>
                  <option value="WHODrug">WHO Drug</option>
                  <option value="LOINC">LOINC</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}
          </div>
        )}

        {field.type === 'number' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Units
              </label>
              <input
                type="text"
                value={metadata.units || ''}
                onChange={(e) => updateFieldMetadata('units', e.target.value)}
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                placeholder="e.g., kg, mmHg"
                disabled={readOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={metadata.format || '#.##'}
                onChange={(e) => updateFieldMetadata('format', e.target.value)}
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                disabled={readOnly}
              >
                <option value="#.##">2 Decimal Places</option>
                <option value="#.#">1 Decimal Place</option>
                <option value="#">Integer</option>
                <option value="#.###">3 Decimal Places</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Value
              </label>
              <input
                type="number"
                value={metadata.minValue !== null ? metadata.minValue : ''}
                onChange={(e) => updateFieldMetadata('minValue', e.target.value === '' ? null : parseFloat(e.target.value))}
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                disabled={readOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Value
              </label>
              <input
                type="number"
                value={metadata.maxValue !== null ? metadata.maxValue : ''}
                onChange={(e) => updateFieldMetadata('maxValue', e.target.value === '' ? null : parseFloat(e.target.value))}
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                disabled={readOnly}
              />
            </div>
          </div>
        )}

        {field.type === 'date' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={metadata.format || 'YYYY-MM-DD'}
                onChange={(e) => updateFieldMetadata('format', e.target.value)}
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                disabled={readOnly}
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allow Partial Dates
              </label>
              <select
                value={metadata.allowPartialDate ? 'true' : 'false'}
                onChange={(e) => updateFieldMetadata('allowPartialDate', e.target.value === 'true')}
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                disabled={readOnly}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {metadata.allowPartialDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precision Qualifier Field
                </label>
                <input
                  type="text"
                  value={metadata.qualifierField || ''}
                  onChange={(e) => updateFieldMetadata('qualifierField', e.target.value)}
                  className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                  placeholder="e.g., AESTDTC_QUAL"
                  disabled={readOnly}
                />
              </div>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description / Help Text
          </label>
          <textarea
            value={metadata.description || ''}
            onChange={(e) => updateFieldMetadata('description', e.target.value)}
            className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
            rows="2"
            placeholder="Instructions for data entry"
            disabled={readOnly}
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowMetadataPanel(false)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm mr-2"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Render preview panel
  const renderPreviewPanel = () => {
    return (
      <div className="bg-white p-6 border rounded-md">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">{crfName || "Form Preview"}</h2>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div
              key={index}
              className={`${field.width === 'full' ? 'w-full' : `w-${field.widthPercent}%`} inline-block align-top px-2`}
              style={{ width: `${field.widthPercent}%` }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.metadata?.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md w-full p-2"
                    placeholder={field.metadata?.description || "Enter text"}
                    disabled
                  />
                )}

                {field.type === 'number' && (
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md w-full p-2"
                      placeholder="0"
                      disabled
                    />
                    {field.metadata?.units && (
                      <span className="ml-2 text-gray-500">{field.metadata.units}</span>
                    )}
                  </div>
                )}

                {field.type === 'date' && (
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md w-full p-2"
                    placeholder={field.metadata?.format || "YYYY-MM-DD"}
                    disabled
                  />
                )}

                {field.type === 'checkbox' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 border-gray-300 rounded text-blue-600"
                      disabled
                    />
                    <span className="ml-2 text-gray-500">
                      {field.metadata?.description || "Check this option"}
                    </span>
                  </div>
                )}

                {field.type === 'radio' && (
                  <div className="space-y-2">
                    {field.metadata?.options?.map((option, i) => (
                      <div key={i} className="flex items-center">
                        <input
                          type="radio"
                          name={`radio_${index}`}
                          className="h-4 w-4 border-gray-300 text-blue-600"
                          disabled
                        />
                        <span className="ml-2 text-gray-500">{option.label}</span>
                      </div>
                    )) || (
                        <>
                          <div className="flex items-center">
                            <input type="radio" className="h-4 w-4" disabled />
                            <span className="ml-2 text-gray-500">Option 1</span>
                          </div>
                          <div className="flex items-center">
                            <input type="radio" className="h-4 w-4" disabled />
                            <span className="ml-2 text-gray-500">Option 2</span>
                          </div>
                        </>
                      )}
                  </div>
                )}

                {field.type === 'select' && (
                  <select
                    className="border border-gray-300 rounded-md w-full p-2 text-gray-500"
                    disabled
                  >
                    <option>Select an option...</option>
                    {field.metadata?.options?.map((option, i) => (
                      <option key={i}>{option.label}</option>
                    ))}
                  </select>
                )}

                {field.metadata?.description && field.type !== 'checkbox' && (
                  <p className="mt-1 text-xs text-gray-500">{field.metadata.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No fields added to this form yet.</p>
            <p className="text-sm mt-2">Switch to Design mode to add fields.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Container with increased width */}
      <div className="bg-white rounded-lg shadow-md p-6" style={{ maxWidth: "1300px", margin: "0 auto" }}>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex-grow mr-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CRF Name
            </label>
            <input
              type="text"
              value={crfName}
              onChange={(e) => setCrfName(e.target.value)}
              className="border border-gray-300 rounded-md w-full px-3 py-2"
              placeholder="Enter CRF name"
              disabled={readOnly}
            />
          </div>
          <div>
            <button
              onClick={openTemplateModal}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={readOnly}
            >
              Use Template
            </button>
          </div>
        </div>

        {selectedTemplate && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-blue-700">Using template: </span>
                <span className="text-sm text-blue-800">{selectedTemplate.name}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setFields([]);
                  setCrfName('');
                }}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear Template
              </button>
            </div>
          </div>
        )}

        {/* Add mode toggle buttons */}
        <div className="mb-4 flex space-x-2 border-b pb-3">
          <button
            onClick={() => setIsPreviewMode(false)}
            className={`px-4 py-2 rounded-t ${!isPreviewMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Design
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            className={`px-4 py-2 rounded-t ${isPreviewMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Preview
          </button>
        </div>

        {/* Show either form canvas or preview based on mode */}
        {isPreviewMode ? (
          renderPreviewPanel()
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4" style={{ height: MIN_CANVAS_HEIGHT }}>
              {/* Field Type Palette - Keep same width */}
              <div
                className="bg-gray-50 p-4 rounded-md flex flex-col overflow-y-auto"
                style={{ width: "300px", minWidth: "300px" }}
              >
                <h4 className="font-medium mb-3 text-sm">Field Types</h4>
                <div className="space-y-2">
                  {fieldTypes.map((fieldType, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded shadow-sm cursor-move flex items-center gap-2 text-sm"
                      draggable
                      onDragStart={(e) => handleDragStart(e, fieldType)}
                    >
                      <Icon type={fieldType.type} />
                      <span>{fieldType.label}</span>
                    </div>
                  ))}
                </div>

                <h4 className="font-medium mb-3 mt-6 text-sm">Domain Templates</h4>
                <div className="space-y-2">
                  {DOMAIN_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white p-3 rounded shadow-sm cursor-pointer flex items-center gap-2 text-sm hover:bg-blue-50"
                      onClick={() => applyTemplate(template.id)}
                    >
                      <Icon type="template" />
                      <span>{template.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Canvas - Increase width */}
              <div
                className="flex-1 overflow-hidden"
                style={{ minWidth: "900px" }} // Increased width
              >
                <FormCanvas
                  fields={fields}
                  onDropField={handleDrop}
                  onDragOverField={handleDragOver}
                  onLabelChange={handleLabelChange}
                  onRemoveField={handleRemoveField}
                  onMoveField={handleMoveField}
                  draggingIndex={selectedFieldIndex}
                  setDraggingIndex={setSelectedFieldIndex}
                  toggleFieldWidth={toggleFieldWidth}
                  updateFieldSize={updateFieldSize}
                  onSelectField={handleSelectField}
                />
              </div>
            </div>

            {/* Metadata Panel */}
            {showMetadataPanel && renderMetadataPanel()}
          </>
        )}

        {/* Template Modal */}
        {renderTemplateModal()}

        <div className="flex justify-end mt-6 space-x-2">
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save CRF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRFBuilder;