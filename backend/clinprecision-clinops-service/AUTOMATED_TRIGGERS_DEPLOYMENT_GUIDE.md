# Automated Study Status Computation Triggers - Deployment Guide

## Overview

This document provides comprehensive deployment instructions for the **Automated Study Status Computation Triggers** system. This system automatically updates study status based on changes to related entities (protocol versions and amendments) using database triggers and stored procedures.

## System Components

### 1. Database Components
- **Triggers**: Automatically fire on INSERT/UPDATE/DELETE operations on `study_versions` and `study_amendments` tables
- **Stored Procedures**: Core logic for status computation and logging
- **Logging Table**: Tracks all status computation activities and results
- **Views**: Monitoring and reporting views for system health

### 2. Java Components
- **AutomatedStatusComputationService**: Service layer for programmatic access to trigger system
- **AutomatedStatusComputationController**: REST API endpoints for managing and monitoring triggers
- **Integration**: Seamless integration with existing study management services

## Pre-Deployment Requirements

### 1. Database Prerequisites
- MySQL 8.0 or higher
- Database user with the following privileges:
  - `CREATE ROUTINE` (for stored procedures)
  - `CREATE TRIGGER` (for database triggers)
  - `INSERT, UPDATE, DELETE, SELECT` on all study-related tables
  - `CREATE, DROP` on logging tables

### 2. Application Prerequisites
- Spring Boot 2.7+ or 3.x
- JdbcTemplate configured and available
- Existing study management services and entities

### 3. System Prerequisites
- Sufficient database storage for logging (approximately 1KB per status computation)
- Database monitoring tools for trigger performance tracking

## Deployment Steps

### Step 1: Deploy Database Schema

Execute the trigger system SQL script on your database:

```bash
# Connect to your MySQL database
mysql -u clinprecadmin -p clinprecisiondb

# Execute the trigger system script
source /path/to/study_status_computation_triggers.sql
```

**Alternative using command line:**
```bash
mysql -u clinprecadmin -p clinprecisiondb < study_status_computation_triggers.sql
```

### Step 2: Verify Database Deployment

Check that all components were created successfully:

```sql
-- Check triggers
SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE 
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'clinprecisiondb'
  AND TRIGGER_NAME LIKE '%study_status%';

-- Check stored procedures
SELECT ROUTINE_NAME, ROUTINE_TYPE 
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'clinprecisiondb'
  AND ROUTINE_NAME LIKE '%StudyStatus%';

-- Check logging table
DESCRIBE study_status_computation_log;

-- Check views
SELECT TABLE_NAME 
FROM information_schema.VIEWS 
WHERE TABLE_SCHEMA = 'clinprecisiondb'
  AND TABLE_NAME LIKE '%status%';
```

### Step 3: Deploy Java Components

#### 3.1 Add Service Classes
Deploy the following Java files to your application:
- `AutomatedStatusComputationService.java`
- `AutomatedStatusComputationController.java`

#### 3.2 Verify Dependencies
Ensure the following dependencies are available in your Spring context:
- `JdbcTemplate` (configured for your database)
- `StudyRepository` (existing study repository)

#### 3.3 Configuration
Add any necessary application properties:

```properties
# Optional: Configure trigger system logging level
logging.level.com.clinprecision.studydesignservice.service.AutomatedStatusComputationService=INFO

# Optional: Configure JDBC template settings
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
```

### Step 4: Test Deployment

#### 4.1 System Health Check
```bash
# Test the system health endpoint
curl -X GET "http://localhost:8080/api/v1/studies/status/automated/system-health"
```

Expected response:
```json
{
    "healthy": true,
    "recentComputations": 0,
    "recentErrors": 0,
    "errorRate": 0.0,
    "versionsTriggersExist": true,
    "amendmentsTriggersExist": true,
    "proceduresExist": true,
    "timestamp": "2024-12-19T10:00:00"
}
```

#### 4.2 Manual Trigger Test
```bash
# Test manual computation for a study
curl -X POST "http://localhost:8080/api/v1/studies/status/automated/1/compute?reason=Deployment%20Test"
```

#### 4.3 Database Trigger Test
```sql
-- Test by updating a study version status
UPDATE study_versions 
SET status = 'APPROVED' 
WHERE id = 1;

-- Check if trigger fired and logged the computation
SELECT * FROM study_status_computation_log 
WHERE trigger_source = 'version_update' 
ORDER BY created_at DESC 
LIMIT 5;
```

## API Endpoints

### Core Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/studies/status/automated/{studyId}/compute` | POST | Manually trigger status computation |
| `/api/v1/studies/status/automated/batch-compute` | POST | Batch compute all study statuses |
| `/api/v1/studies/status/automated/{studyId}/refresh` | POST | Force refresh study status |

### Monitoring & Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/studies/status/automated/system-health` | GET | Check trigger system health |
| `/api/v1/studies/status/automated/{studyId}/history` | GET | Get computation history for study |
| `/api/v1/studies/status/automated/recent-changes` | GET | Get recent status changes |
| `/api/v1/studies/status/automated/frequent-changes` | GET | Get studies with frequent changes |
| `/api/v1/studies/status/automated/errors` | GET | Get recent computation errors |
| `/api/v1/studies/status/automated/statistics` | GET | Get system statistics |

## Monitoring and Maintenance

### 1. System Health Monitoring

**Daily Checks:**
- Monitor system health endpoint for trigger status
- Check error rates (should be < 10%)
- Review recent computation activity

**Weekly Checks:**
- Review studies with frequent status changes
- Analyze computation performance metrics
- Check for any failed computations

### 2. Log Management

The system creates detailed logs in the `study_status_computation_log` table:

**Log Retention Strategy:**
```sql
-- Archive logs older than 90 days
CREATE TABLE study_status_computation_log_archive LIKE study_status_computation_log;

INSERT INTO study_status_computation_log_archive 
SELECT * FROM study_status_computation_log 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

DELETE FROM study_status_computation_log 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### 3. Performance Monitoring

**Monitor trigger performance:**
```sql
-- Check average computation time
SELECT 
    trigger_source,
    COUNT(*) as computation_count,
    AVG(computation_time_ms) as avg_time_ms,
    MAX(computation_time_ms) as max_time_ms
FROM study_status_computation_log 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY trigger_source;
```

**Monitor high-frequency studies:**
```sql
-- Identify studies requiring attention
SELECT * FROM studies_frequent_status_changes;
```

## Troubleshooting

### Common Issues

#### 1. Triggers Not Firing
**Symptoms:** No entries in computation log after version/amendment changes
**Resolution:**
```sql
-- Check if triggers exist
SHOW TRIGGERS LIKE 'study_%';

-- Recreate triggers if missing
SOURCE study_status_computation_triggers.sql;
```

#### 2. High Error Rate
**Symptoms:** Many ERROR entries in computation log
**Resolution:**
```sql
-- Check recent errors
SELECT * FROM status_computation_errors;

-- Common fixes:
-- 1. Check foreign key relationships
-- 2. Verify study_status lookup table has all required codes
-- 3. Check for null values in required fields
```

#### 3. Performance Issues
**Symptoms:** Slow status computations, timeouts
**Resolution:**
```sql
-- Check for missing indexes
ANALYZE TABLE study_versions;
ANALYZE TABLE study_amendments;
ANALYZE TABLE studies;

-- Add missing indexes if needed
CREATE INDEX idx_study_versions_study_status_combo ON study_versions (study_id, status, amendment_type);
```

### 4. Manual Recovery Procedures

**Reset a study's status:**
```sql
-- If a study gets into an inconsistent state
CALL ManuallyComputeStudyStatus(study_id, 'Manual recovery');
```

**Batch recompute all studies:**
```sql
-- Recompute all study statuses (use with caution)
CALL BatchComputeAllStudyStatuses();
```

## Security Considerations

### 1. Database Security
- Ensure trigger execution user has minimal required privileges
- Regularly review and rotate database credentials
- Monitor for unusual trigger activity

### 2. API Security
- Secure automated computation endpoints with appropriate authentication
- Log all manual computation requests for audit trails
- Implement rate limiting for batch operations

### 3. Data Privacy
- Computation logs may contain sensitive study information
- Implement appropriate data retention policies
- Ensure logs are included in backup and recovery procedures

## Integration Testing

### Test Scenarios

#### 1. Basic Trigger Functionality
```sql
-- Test version status change trigger
INSERT INTO study_versions (study_id, version_number, status, created_by, description) 
VALUES (1, 'v1.1-test', 'DRAFT', 1, 'Test version');

UPDATE study_versions SET status = 'ACTIVE' WHERE version_number = 'v1.1-test';
```

#### 2. Amendment Trigger Functionality
```sql
-- Test amendment trigger
INSERT INTO study_amendments (study_version_id, title, amendment_type, created_by) 
VALUES (1, 'Test Amendment', 'SAFETY', 1);

UPDATE study_amendments SET status = 'APPROVED' WHERE title = 'Test Amendment';
```

#### 3. API Integration Test
```bash
# Test all endpoints
./run_integration_tests.sh
```

## Performance Benchmarks

### Expected Performance
- **Single computation**: < 100ms
- **Batch computation (100 studies)**: < 5 seconds
- **Trigger firing**: < 50ms additional overhead per database operation
- **Log query performance**: < 200ms for 30-day history

### Performance Optimization
- Database indexes are optimized for trigger performance
- Stored procedures use efficient query patterns
- Logging is asynchronous where possible
- Batch operations use transaction boundaries appropriately

## Rollback Procedures

### Emergency Rollback

If issues occur, disable triggers temporarily:
```sql
-- Disable all status computation triggers
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_change;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_change;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_insert;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_insert;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_delete;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_delete;
```

### Full Rollback
```sql
-- Remove all components (use with extreme caution)
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_change;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_change;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_insert;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_insert;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_delete;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_delete;

DROP PROCEDURE IF EXISTS ComputeAndUpdateStudyStatus;
DROP PROCEDURE IF EXISTS DetermineStudyStatusFromVersions;
DROP PROCEDURE IF EXISTS LogStudyStatusChange;
DROP PROCEDURE IF EXISTS ManuallyComputeStudyStatus;
DROP PROCEDURE IF EXISTS BatchComputeAllStudyStatuses;
DROP PROCEDURE IF EXISTS GetStudyStatusComputationHistory;

DROP VIEW IF EXISTS recent_status_changes;
DROP VIEW IF EXISTS studies_frequent_status_changes;
DROP VIEW IF EXISTS status_computation_errors;

-- Archive log table before dropping
CREATE TABLE study_status_computation_log_backup AS SELECT * FROM study_status_computation_log;
DROP TABLE study_status_computation_log;
```

## Conclusion

The Automated Study Status Computation Triggers system provides robust, real-time status management for studies based on their protocol versions and amendments. Proper deployment and monitoring ensure reliable operation and maintain data integrity across the study lifecycle.

For additional support or questions, refer to the system logs and monitoring endpoints, or contact the development team.