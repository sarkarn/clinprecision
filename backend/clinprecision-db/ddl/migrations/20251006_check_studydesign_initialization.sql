-- Script to manually initialize StudyDesignAggregate for existing studies
-- This is needed for studies created before the auto-initialization feature was added
-- Date: 2025-10-06

USE clinprecisiondb;

-- Check which studies need StudyDesign initialization
SELECT 
    s.id,
    s.name,
    HEX(s.aggregate_uuid) as study_uuid,
    s.created_at,
    COUNT(DISTINCT e.aggregate_identifier) as design_initialized
FROM studies s
LEFT JOIN domain_event_entry e ON e.aggregate_identifier = s.aggregate_uuid
    AND e.type LIKE '%StudyDesignInitializedEvent%'
GROUP BY s.id, s.name, s.aggregate_uuid, s.created_at
HAVING design_initialized = 0
ORDER BY s.id;

-- Expected output: Studies that need initialization
-- For each study, you'll need to call the REST endpoint:
-- POST /clinops-ws/api/clinops/study-design
-- Body: {
--   "studyAggregateUuid": "<uuid_from_query>",
--   "studyName": "<name_from_query>",
--   "createdBy": "system"
-- }
