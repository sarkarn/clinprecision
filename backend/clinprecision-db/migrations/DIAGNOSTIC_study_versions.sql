-- =====================================================
-- Diagnostic: Check study_versions table structure
-- =====================================================

-- Check if table exists and show all columns
DESC study_versions;

-- Or use INFORMATION_SCHEMA
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_TYPE,
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'study_versions'
ORDER BY ORDINAL_POSITION;

-- Check specifically for aggregate_uuid
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'study_versions'
  AND COLUMN_NAME = 'aggregate_uuid';
