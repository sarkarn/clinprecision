-- Check what was actually created in database
DESCRIBE study_versions;

-- Or use
SHOW COLUMNS FROM study_versions WHERE Field = 'aggregate_uuid';
