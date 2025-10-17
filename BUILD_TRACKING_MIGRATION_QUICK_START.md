# Build Tracking Migration - Quick Start Guide

## ⚡ Quick Execution Steps

### 1️⃣ Backup Database (5 minutes)
```bash
cd c:\nnsproject\clinprecision

# Create backup
mysqldump -u root -p clinprecision > backup_build_tracking_$(date +%Y%m%d_%H%M%S).sql

# Verify backup created
ls -lh backup_build_tracking_*.sql
```

### 2️⃣ Execute Database Migration (2 minutes)
```bash
cd backend\clinprecision-db

# Execute migration
mysql -u root -p clinprecision < migrations\20251016_add_build_tracking_to_patient_visits.sql

# Expected output: "Query OK" messages, no errors
```

### 3️⃣ Validate Migration (3 minutes)
```sql
-- Connect to database
mysql -u root -p clinprecision

-- Check columns added
DESCRIBE study_visit_instances;
-- Should show build_id column (BIGINT)

DESCRIBE visit_forms;
-- Should show build_id column (BIGINT)

-- Check data backfilled (should be 0 or legacy data only)
SELECT COUNT(*) FROM study_visit_instances WHERE build_id IS NULL;
SELECT COUNT(*) FROM visit_forms WHERE build_id IS NULL;

-- Check foreign keys created
SELECT 
    TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'clinprecision' 
  AND REFERENCED_TABLE_NAME = 'study_database_builds';
-- Should show 4 constraints (study_visit_instances, visit_forms, visit_definitions, form_definitions)

-- Check indexes created
SHOW INDEX FROM study_visit_instances WHERE Key_name LIKE '%build_id%';
SHOW INDEX FROM visit_forms WHERE Key_name LIKE '%build_id%';
-- Should show indexes

-- Exit MySQL
EXIT;
```

### 4️⃣ Rebuild Java Services (3 minutes)
```bash
cd backend\clinprecision-clinops-service

# Clean and rebuild
mvn clean install -DskipTests

# Expected output: BUILD SUCCESS
```

### 5️⃣ Restart Services (2 minutes)
```bash
cd c:\nnsproject\clinprecision

# Stop services
docker-compose down

# Start services
docker-compose up -d

# Check service health
docker ps
# All services should show "Up" status
```

### 6️⃣ Test Patient Enrollment (5 minutes)

#### Test 1: Enrollment WITHOUT Build (Should Fail)
```bash
# Using curl or Postman
POST http://localhost:8080/api/patients/{patientId}/enroll
Content-Type: application/json

{
  "studyId": 123,
  "siteId": 456,
  "baselineDate": "2025-10-16"
}

# Expected Response:
# Status: 500 Internal Server Error
# Error: "No active study database build found for studyId: 123. Study must have a COMPLETED database build before enrolling patients."
```

#### Test 2: Create a Study Build
```bash
# Trigger study build
POST http://localhost:8080/api/studies/{studyId}/build
Content-Type: application/json

# Wait for build to complete (check status)
GET http://localhost:8080/api/studies/{studyId}/builds/latest

# Expected: "buildStatus": "COMPLETED"
```

#### Test 3: Enrollment WITH Build (Should Succeed)
```bash
# Retry enrollment
POST http://localhost:8080/api/patients/{patientId}/enroll
Content-Type: application/json

{
  "studyId": 123,
  "siteId": 456,
  "baselineDate": "2025-10-16"
}

# Expected Response:
# Status: 200 OK
# { "message": "Patient enrolled successfully", "visitCount": 5 }
```

#### Test 4: Verify Build Tracking
```sql
-- Check visit instances have build_id
SELECT id, subject_id, visit_id, build_id 
FROM study_visit_instances 
WHERE subject_id = {patientId};

-- All rows should have build_id populated
```

#### Test 5: Check Logs
```bash
# View service logs
docker logs clinprecision-clinops-service | tail -50

# Should see:
# "Using study build: id=X, version=Y, status=COMPLETED"
# "Created visit instance: buildId=X"
# "Found Y form assignments for visit definition Z in build X"
```

---

## ✅ Success Checklist

After completing above steps, verify:

- [x] Database migration executed without errors
- [x] `build_id` columns added to 4 tables
- [x] Foreign keys created
- [x] Indexes created
- [x] Data backfilled (zero or expected NULL count)
- [x] Java services rebuilt successfully
- [x] Services restarted
- [x] Patient enrollment fails without build
- [x] Patient enrollment succeeds with completed build
- [x] Visit instances have `build_id` populated
- [x] Logs show build tracking messages

---

## 🐛 Troubleshooting

### Issue: Migration Script Fails
```bash
# Check if tables exist
mysql -u root -p clinprecision -e "SHOW TABLES;"

# Check if columns already exist
mysql -u root -p clinprecision -e "DESCRIBE study_visit_instances;"

# If columns exist, migration already applied - skip to step 4
```

### Issue: Foreign Key Constraint Error
```bash
# Check if study_database_builds table exists
mysql -u root -p clinprecision -e "DESCRIBE study_database_builds;"

# Check if any orphaned data (build_id references non-existent build)
mysql -u root -p clinprecision -e "
SELECT COUNT(*) FROM study_visit_instances vi 
LEFT JOIN study_database_builds sdb ON sdb.id = vi.build_id 
WHERE vi.build_id IS NOT NULL AND sdb.id IS NULL;
"
# Should return 0
```

### Issue: Java Compilation Errors
```bash
# Check Java version (should be 17+)
java -version

# Clean Maven cache
rm -rf ~/.m2/repository/com/clinprecision

# Retry build
cd backend/clinprecision-clinops-service
mvn clean install -DskipTests
```

### Issue: Services Won't Start
```bash
# Check logs
docker logs clinprecision-clinops-service

# Common issues:
# - Port already in use: docker-compose down; docker-compose up -d
# - Database connection error: Check DB credentials in application.yml
# - Missing dependency: mvn clean install -DskipTests
```

### Issue: Enrollment Still Fails After Build
```sql
-- Check if build actually COMPLETED
SELECT id, study_id, build_status, build_end_time 
FROM study_database_builds 
WHERE study_id = {studyId} 
ORDER BY build_end_time DESC 
LIMIT 1;

-- Status should be 'COMPLETED', not 'PENDING' or 'IN_PROGRESS'
```

---

## 📞 Need Help?

**Review Full Documentation**: `BUILD_TRACKING_IMPLEMENTATION_COMPLETE.md`

**Common Questions**:
1. **Q**: Can I skip the migration?  
   **A**: NO - Critical P0 compliance fix required.

2. **Q**: Will this affect existing patients?  
   **A**: No - Legacy data handled gracefully with fallback queries.

3. **Q**: Do I need to update the frontend?  
   **A**: Not immediately - backend handles build tracking. UI updates optional.

4. **Q**: How long is downtime?  
   **A**: ~5 minutes for migration + restart.

5. **Q**: Can I rollback?  
   **A**: Yes - Restore database backup and revert code commit. See full doc for rollback commands.

---

## ⏱️ Total Execution Time: ~20 minutes

**Estimated Timeline**:
- Backup: 5 min
- Migration: 2 min
- Validation: 3 min
- Rebuild: 3 min
- Restart: 2 min
- Testing: 5 min

**Status**: ✅ **CODE COMPLETE - READY TO EXECUTE**

---

**Last Updated**: October 16, 2025  
**Migration Script**: `backend/clinprecision-db/migrations/20251016_add_build_tracking_to_patient_visits.sql`
