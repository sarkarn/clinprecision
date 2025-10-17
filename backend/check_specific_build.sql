-- Quick check: Is the build complete?
SELECT 
    aggregate_uuid,
    study_id,
    build_status,
    build_progress,
    build_started_at,
    build_completed_at,
    TIMESTAMPDIFF(SECOND, build_started_at, build_completed_at) as duration_seconds
FROM study_database_builds
WHERE aggregate_uuid = '093edb6c-fd47-40a2-b148-6b1148a28a7f';
