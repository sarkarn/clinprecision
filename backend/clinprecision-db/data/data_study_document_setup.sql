


-- Insert sample data for testing (only if studies exist)
INSERT INTO study_documents (study_id, name, document_type, file_name, file_path, file_size, mime_type, version, status, description, uploaded_by)
SELECT 
    s.id,
    CASE 
        WHEN s.id % 3 = 0 THEN CONCAT('Protocol v1.0 - ', s.name)
        WHEN s.id % 3 = 1 THEN CONCAT('Informed Consent v1.0 - ', s.name)
        ELSE CONCAT('Investigator Brochure v1.0 - ', s.name)
    END,
    CASE 
        WHEN s.id % 3 = 0 THEN 'Protocol'
        WHEN s.id % 3 = 1 THEN 'ICF'
        ELSE 'IB'
    END,
    CASE 
        WHEN s.id % 3 = 0 THEN CONCAT('protocol_', s.id, '_v1.0.pdf')
        WHEN s.id % 3 = 1 THEN CONCAT('icf_', s.id, '_v1.0.pdf')
        ELSE CONCAT('ib_', s.id, '_v1.0.pdf')
    END,
    CASE 
        WHEN s.id % 3 = 0 THEN CONCAT('/documents/studies/', s.id, '/protocol_', s.id, '_v1.0.pdf')
        WHEN s.id % 3 = 1 THEN CONCAT('/documents/studies/', s.id, '/icf_', s.id, '_v1.0.pdf')
        ELSE CONCAT('/documents/studies/', s.id, '/ib_', s.id, '_v1.0.pdf')
    END,
    CASE 
        WHEN s.id % 3 = 0 THEN 2500000  -- 2.5MB for protocols
        WHEN s.id % 3 = 1 THEN 500000   -- 500KB for ICFs
        ELSE 1800000                    -- 1.8MB for IBs
    END,
    'application/pdf',
    '1.0',
    'CURRENT',
    CASE 
        WHEN s.id % 3 = 0 THEN 'Study protocol document'
        WHEN s.id % 3 = 1 THEN 'Informed consent form'
        ELSE 'Investigator brochure'
    END,
    COALESCE(s.created_by, 1)
FROM studies s
WHERE s.id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM study_documents sd2 
    WHERE sd2.study_id = s.id 
    AND sd2.document_type = CASE 
        WHEN s.id % 3 = 0 THEN 'Protocol'
        WHEN s.id % 3 = 1 THEN 'ICF'
        ELSE 'IB'
    END
)
LIMIT 10; -- Limit to first 10 studies to avoid overwhelming data



-- Insert some sample document types for reference
INSERT INTO study_document_audit (document_id, action_type, new_values, performed_by, notes)
SELECT 1, 'UPLOAD', 
       JSON_OBJECT('message', 'Document management system initialized'), 
       1, 
       'MVP document management system setup completed'
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM study_document_audit WHERE notes = 'MVP document management system setup completed');


-- Log the sample data insertion
INSERT INTO study_document_audit (document_id, action_type, new_values, performed_by, notes)
SELECT 
    sd.id, 'UPLOAD', 
    JSON_OBJECT('name', sd.name, 'type', sd.document_type, 'size', sd.file_size),
    sd.uploaded_by,
    'Sample document created during MVP setup'
FROM study_documents sd
WHERE sd.description IN ('Study protocol document', 'Informed consent form', 'Investigator brochure')
AND NOT EXISTS (
    SELECT 1 FROM study_document_audit sda 
    WHERE sda.document_id = sd.id 
    AND sda.notes = 'Sample document created during MVP setup'
);




