-- Update documentation for form_definitions table to clarify the relationship
ALTER TABLE form_definitions 
MODIFY COLUMN fields JSON NOT NULL 
COMMENT 'Array of field definitions with metadata. Each field has a ONE-TO-ONE relationship with its metadata.';
