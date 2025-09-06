/**
 * CRF Data Models
 * 
 * This file contains the data models for CRF components including
 * field groups, tables, and fields.
 */

// CRF Field Group Model
export const createFieldGroup = ({
  id = generateId(),
  name = "New Group",
  type = "standard",
  fields = [],
  tableConfig = null
}) => ({
  id,
  name,
  type,
  fields,
  tableConfig
});

// CRF Table Group Model (extension of Field Group)
export const createTableGroup = ({
  id = generateId(),
  name = "New Table",
  rows = 2,
  columns = 2,
  headers = []
}) => {
  // Generate default headers if none provided
  const defaultHeaders = headers.length > 0 
    ? headers 
    : Array(columns).fill().map((_, i) => `Column ${i+1}`);
  
  return createFieldGroup({
    id,
    name,
    type: "table",
    fields: [],
    tableConfig: {
      rows,
      columns,
      headers: defaultHeaders
    }
  });
};

// CRF Field Model
export const createField = ({
  id = generateId(),
  name = "",
  label = "New Field",
  type = "text",
  groupId = null,
  required = false,
  description = "",
  tablePosition = null,
  metadata = {}
}) => ({
  id,
  name,
  label,
  type,
  groupId,
  required,
  description,
  tablePosition,
  // Each field has exactly ONE metadata object (ONE-TO-ONE relationship)
  metadata: {
    variableName: label ? label.toUpperCase().replace(/\s+/g, '_') : "",
    dataType: type === "number" ? "numeric" : type,
    required: required,
    validationRules: [],
    sdvRequired: false,
    medicalReview: false,
    dataReview: false,
    criticalDataPoint: false,
    ...metadata
  }
});

// Helper to generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};
