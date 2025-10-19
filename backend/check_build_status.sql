-- Check current build status
-- Run this in your MySQL client to see what's happening with study builds

-- 1. Show all builds with their status
SELECT 
    id,
    aggregate_uuid,
    study_id,
    build_request_id,
    build_status,
    build_progress,
    phase_number,
    build_started_at,
    build_completed_at,
    build_failed_at,
    error_message,
    TIMESTAMPDIFF(MINUTE, build_started_at, NOW()) as minutes_since_start
FROM study_database_builds
ORDER BY build_started_at DESC
LIMIT 10;

-- 2. Show any builds stuck in IN_PROGRESS
SELECT 
    id,
    aggregate_uuid,
    study_id,
    build_status,
    build_progress,
    phase_number,
    build_started_at,
    TIMESTAMPDIFF(MINUTE, build_started_at, NOW()) as minutes_stuck,
    error_message
FROM study_database_builds
WHERE build_status = 'IN_PROGRESS'
ORDER BY build_started_at DESC;

-- 3. Show recent events related to study database builds
SELECT 
    event_id,
    event_type,
    aggregate_type,
    aggregate_id,
    occurred_at,
    LEFT(event_data, 200) as event_data_preview
FROM event_store
WHERE aggregate_type = 'StudyDatabaseBuild'
ORDER BY occurred_at DESC
LIMIT 20;

-- 4. Count builds by status
SELECT 
    build_status,
    COUNT(*) as count,
    MIN(build_started_at) as oldest,
    MAX(build_started_at) as newest
FROM study_database_builds
GROUP BY build_status
ORDER BY count DESC;

-- TROUBLESHOOTING ACTIONS:

-- ACTION 1: If you see a build stuck in IN_PROGRESS for >5 minutes, it's likely hung
--           You can manually mark it as FAILED to allow retry:
-- UPDATE study_database_builds 
-- SET build_status = 'FAILED',
--     build_failed_at = NOW(),
--     error_message = 'Build timeout - manually marked as failed'
-- WHERE aggregate_uuid = 'YOUR-BUILD-UUID-HERE'
--   AND build_status = 'IN_PROGRESS';

-- ACTION 2: Check if the worker service is running by looking for recent log entries:
--           "Worker received StudyDatabaseBuildStartedEvent"
--           If not present, the event handler isn't being triggered

-- ACTION 3: Restart the clinops-service if the worker is stuck:
--           The idempotency check will prevent re-processing completed builds
