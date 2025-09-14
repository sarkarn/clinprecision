-- Script to fix existing studies with incorrect metadata structure
-- This moves principalInvestigator, studyType, and primaryObjective from metadata JSON to proper columns

-- Temporary backup before making changes (optional)
CREATE TABLE studies_metadata_backup AS SELECT * FROM studies WHERE metadata IS NOT NULL;

-- Update studies with principalInvestigator in metadata
UPDATE studies 
SET 
    principal_investigator = JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.principalInvestigator')),
    metadata = JSON_REMOVE(metadata, '$.principalInvestigator')
WHERE JSON_EXTRACT(metadata, '$.principalInvestigator') IS NOT NULL;

-- Update studies with studyType in metadata  
UPDATE studies 
SET 
    study_type = JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.studyType')),
    metadata = JSON_REMOVE(metadata, '$.studyType')
WHERE JSON_EXTRACT(metadata, '$.studyType') IS NOT NULL;

-- Update studies with primaryObjective in metadata
UPDATE studies 
SET 
    primary_objective = JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.primaryObjective')),
    metadata = JSON_REMOVE(metadata, '$.primaryObjective')
WHERE JSON_EXTRACT(metadata, '$.primaryObjective') IS NOT NULL;

-- Update studies with regulatoryStatusId in metadata (if exists)
UPDATE studies s
JOIN regulatory_status rs ON rs.id = CAST(JSON_UNQUOTE(JSON_EXTRACT(s.metadata, '$.regulatoryStatusId')) AS UNSIGNED)
SET 
    s.regulatory_status_id = rs.id,
    s.metadata = JSON_REMOVE(s.metadata, '$.regulatoryStatusId')
WHERE JSON_EXTRACT(s.metadata, '$.regulatoryStatusId') IS NOT NULL;

-- Clean up empty metadata JSON objects
UPDATE studies 
SET metadata = NULL 
WHERE metadata = '{}' OR metadata = 'null' OR JSON_LENGTH(metadata) = 0;

-- Verify the cleanup
SELECT 
    id, 
    name, 
    principal_investigator, 
    study_type, 
    primary_objective,
    regulatory_status_id,
    metadata 
FROM studies 
WHERE id <= 10
ORDER BY id;