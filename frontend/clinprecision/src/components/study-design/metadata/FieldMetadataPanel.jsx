import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MetadataStyles.css';

/**
 * FieldMetadataPanel Component
 * 
 * Displays and edits comprehensive field-level metadata including:
 * - Clinical flags (SDV, medical review, critical data, safety)
 * - Regulatory flags (FDA, EMA, CFR 21 Part 11, GCP, HIPAA)
 * - Audit trail configuration
 * - Data entry configuration
 * 
 * @component
 * @param {number} studyId - The study ID
 * @param {number} formId - The form ID
 * @param {string} fieldName - The field name
 * @param {function} onSave - Callback when metadata is saved
 * @param {function} onClose - Callback to close the panel
 */
const FieldMetadataPanel = ({ studyId, formId, fieldName, onSave, onClose }) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9093/clinops-ws';

  // Fetch field metadata on mount
  useEffect(() => {
    fetchFieldMetadata();
  }, [studyId, formId, fieldName]);

  /**
   * Fetch field metadata from backend
   */
  const fetchFieldMetadata = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/api/study-metadata/${studyId}/fields/${formId}/${fieldName}`
      );
      
      if (response.data) {
        setMetadata(response.data);
      } else {
        // Initialize empty metadata structure if not found
        setMetadata(createEmptyMetadata());
      }
      
      setValidationErrors([]);
    } catch (error) {
      console.error('Error fetching field metadata:', error);
      
      // If 404, initialize empty metadata
      if (error.response?.status === 404) {
        setMetadata(createEmptyMetadata());
      } else {
        alert('Failed to load field metadata. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create empty metadata structure
   */
  const createEmptyMetadata = () => ({
    studyId,
    formId,
    fieldName,
    fieldLabel: fieldName,
    clinical: {
      sdvRequired: false,
      medicalReviewRequired: false,
      criticalDataPoint: false,
      safetyDataPoint: false,
      efficacyDataPoint: false,
      dataReviewRequired: false
    },
    regulatory: {
      fdaRequired: false,
      emaRequired: false,
      cfr21Part11: false,
      gcpRequired: false,
      hipaaProtected: false
    },
    auditTrail: {
      level: 'NONE',
      electronicSignatureRequired: false,
      reasonForChangeRequired: false
    },
    dataEntry: {
      isDerivedField: false,
      derivationFormula: '',
      isQueryEnabled: true,
      isEditableAfterLock: false
    }
  });

  /**
   * Update metadata field
   */
  const updateField = (section, field, value) => {
    setMetadata(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setIsDirty(true);
  };

  /**
   * Validate metadata before saving
   */
  const validateMetadata = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/study-metadata/${studyId}/fields/validate`,
        metadata
      );
      
      if (response.data && Array.isArray(response.data)) {
        setValidationErrors(response.data);
        return response.data.length === 0;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating metadata:', error);
      return false;
    }
  };

  /**
   * Save metadata to backend
   */
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Validate first
      const isValid = await validateMetadata();
      
      if (!isValid && validationErrors.length > 0) {
        alert('Please fix validation errors before saving.');
        setSaving(false);
        return;
      }

      // Save to backend
      const response = await axios.put(
        `${API_BASE}/api/study-metadata/${studyId}/fields/${formId}/${fieldName}`,
        metadata
      );

      if (response.data) {
        setMetadata(response.data);
        setIsDirty(false);
        setValidationErrors([]);
        
        // Call parent callback
        if (onSave) {
          onSave(response.data);
        }
        
        alert('Metadata saved successfully!');
      }
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert('Failed to save metadata. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cancel and close panel
   */
  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    
    if (onClose) {
      onClose();
    }
  };

  /**
   * Reset to original values
   */
  const handleReset = () => {
    const confirmed = window.confirm('Are you sure you want to reset all changes?');
    if (confirmed) {
      fetchFieldMetadata();
      setIsDirty(false);
    }
  };

  if (loading) {
    return (
      <div className="metadata-panel">
        <div className="loading-spinner">Loading metadata...</div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="metadata-panel">
        <div className="error-message">Failed to load metadata</div>
      </div>
    );
  }

  return (
    <div className="metadata-panel">
      {/* Header */}
      <div className="metadata-panel-header">
        <h3>Field Metadata: {fieldName}</h3>
        <button className="close-button" onClick={handleCancel} title="Close">
          ✕
        </button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h4>⚠️ Validation Errors</h4>
          {validationErrors.map((error, index) => (
            <div key={index} className="validation-error">
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Clinical Flags */}
      <div className="metadata-section">
        <div className="metadata-section-header">
          📋 Clinical Flags
        </div>
        <div className="metadata-checkboxes">
          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.clinical?.sdvRequired || false}
              onChange={(e) => updateField('clinical', 'sdvRequired', e.target.checked)}
            />
            <span>SDV Required (Source Data Verification)</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.clinical?.medicalReviewRequired || false}
              onChange={(e) => updateField('clinical', 'medicalReviewRequired', e.target.checked)}
            />
            <span>Medical Review Required</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.clinical?.criticalDataPoint || false}
              onChange={(e) => updateField('clinical', 'criticalDataPoint', e.target.checked)}
            />
            <span>Critical Data Point</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.clinical?.safetyDataPoint || false}
              onChange={(e) => updateField('clinical', 'safetyDataPoint', e.target.checked)}
            />
            <span>Safety Data Point</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.clinical?.efficacyDataPoint || false}
              onChange={(e) => updateField('clinical', 'efficacyDataPoint', e.target.checked)}
            />
            <span>Efficacy Data Point</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.clinical?.dataReviewRequired || false}
              onChange={(e) => updateField('clinical', 'dataReviewRequired', e.target.checked)}
            />
            <span>Data Review Required</span>
          </label>
        </div>
      </div>

      {/* Regulatory Flags */}
      <div className="metadata-section">
        <div className="metadata-section-header">
          🏛️ Regulatory Flags
        </div>
        <div className="metadata-checkboxes">
          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.regulatory?.fdaRequired || false}
              onChange={(e) => updateField('regulatory', 'fdaRequired', e.target.checked)}
            />
            <span>FDA Required</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.regulatory?.emaRequired || false}
              onChange={(e) => updateField('regulatory', 'emaRequired', e.target.checked)}
            />
            <span>EMA Required (European Medicines Agency)</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.regulatory?.cfr21Part11 || false}
              onChange={(e) => updateField('regulatory', 'cfr21Part11', e.target.checked)}
            />
            <span>21 CFR Part 11 (Electronic Records/Signatures)</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.regulatory?.gcpRequired || false}
              onChange={(e) => updateField('regulatory', 'gcpRequired', e.target.checked)}
            />
            <span>GCP Required (Good Clinical Practice)</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.regulatory?.hipaaProtected || false}
              onChange={(e) => updateField('regulatory', 'hipaaProtected', e.target.checked)}
            />
            <span>HIPAA Protected (Health Information Privacy)</span>
          </label>
        </div>
      </div>

      {/* Audit Trail Configuration */}
      <div className="metadata-section">
        <div className="metadata-section-header">
          📝 Audit Trail Configuration
        </div>
        <div className="metadata-fields">
          <div className="metadata-field">
            <label>Audit Trail Level:</label>
            <select
              value={metadata.auditTrail?.level || 'NONE'}
              onChange={(e) => updateField('auditTrail', 'level', e.target.value)}
              className="metadata-select"
            >
              <option value="NONE">None - No audit trail</option>
              <option value="BASIC">Basic - Track changes only</option>
              <option value="FULL">Full - Track changes + reasons + signatures</option>
            </select>
          </div>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.auditTrail?.electronicSignatureRequired || false}
              onChange={(e) => updateField('auditTrail', 'electronicSignatureRequired', e.target.checked)}
              disabled={metadata.auditTrail?.level !== 'FULL'}
            />
            <span>Electronic Signature Required (Requires FULL audit trail)</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.auditTrail?.reasonForChangeRequired || false}
              onChange={(e) => updateField('auditTrail', 'reasonForChangeRequired', e.target.checked)}
              disabled={metadata.auditTrail?.level === 'NONE'}
            />
            <span>Reason for Change Required</span>
          </label>
        </div>
      </div>

      {/* Data Entry Configuration */}
      <div className="metadata-section">
        <div className="metadata-section-header">
          ⌨️ Data Entry Configuration
        </div>
        <div className="metadata-fields">
          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.dataEntry?.isDerivedField || false}
              onChange={(e) => updateField('dataEntry', 'isDerivedField', e.target.checked)}
            />
            <span>Derived Field (Calculated automatically)</span>
          </label>

          {metadata.dataEntry?.isDerivedField && (
            <div className="metadata-field">
              <label>Derivation Formula:</label>
              <textarea
                value={metadata.dataEntry?.derivationFormula || ''}
                onChange={(e) => updateField('dataEntry', 'derivationFormula', e.target.value)}
                className="metadata-textarea"
                placeholder="e.g., field1 + field2"
                rows="2"
              />
            </div>
          )}

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.dataEntry?.isQueryEnabled !== false}
              onChange={(e) => updateField('dataEntry', 'isQueryEnabled', e.target.checked)}
            />
            <span>Query Enabled (Allow data queries on this field)</span>
          </label>

          <label className="metadata-checkbox">
            <input
              type="checkbox"
              checked={metadata.dataEntry?.isEditableAfterLock || false}
              onChange={(e) => updateField('dataEntry', 'isEditableAfterLock', e.target.checked)}
            />
            <span>Editable After Lock (Allow editing after database lock)</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="metadata-panel-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!isDirty || saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={!isDirty || saving}
        >
          Reset
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>

      {/* Status Indicator */}
      {isDirty && (
        <div className="metadata-status">
          <span className="unsaved-indicator">● Unsaved changes</span>
        </div>
      )}
    </div>
  );
};

export default FieldMetadataPanel;
