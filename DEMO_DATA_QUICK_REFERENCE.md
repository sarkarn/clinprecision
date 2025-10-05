# Quick Reference: Load Demo Data

## Prerequisites Check ✅

Before loading demo data, verify:

```sql
-- 1. Check database exists
SHOW DATABASES LIKE 'clinprecisiondb';

-- 2. Check users exist
SELECT id, email FROM users WHERE email IN (
    'nsarkar@clinprecision.com',
    'rjohnson@medicalresearch.org',
    'echen@neurocare.org',
    'mrodriguez@arthricare.com'
);

-- 3. Check organizations exist
SELECT id, name, external_id FROM organizations WHERE external_id IN (
    'PG12345',
    'BAC7890'
);

-- 4. Check roles exist
SELECT id, name FROM roles WHERE name IN (
    'SYSTEM_ADMIN',
    'SPONSOR_ADMIN'
);
```

**Expected Results**:
- Database: `clinprecisiondb` exists
- Users: At least 4 users found
- Organizations: At least 2 organizations found
- Roles: At least 2 roles found

If any are missing, run setup scripts first (see below).

---

## Loading Order (IMPORTANT!)

**Must be executed in this exact order:**

```bash
cd backend/clinprecision-db/data

# Step 1: Code lists (lookup data)
mysql -u root -p clinprecisiondb < code_lists_data.sql

# Step 2: Study lookup tables
mysql -u root -p clinprecisiondb < data_study_lookup_setup.sql

# Step 3: Admin data (users, roles, organizations)
mysql -u root -p clinprecisiondb < data_admin_setup.sql

# Step 4: Demo studies (10 studies with UUIDs)
mysql -u root -p clinprecisiondb < demo_data_10_studies.sql
```

---

## Quick Load (All in One)

```bash
cd backend/clinprecision-db/data

mysql -u root -p clinprecisiondb << EOF
SOURCE code_lists_data.sql;
SOURCE data_study_lookup_setup.sql;
SOURCE data_admin_setup.sql;
SOURCE demo_data_10_studies.sql;
EOF
```

---

## Verification After Load

```sql
-- Check study count
SELECT COUNT(*) as study_count FROM studies;
-- Expected: 10

-- Check UUIDs
SELECT id, aggregate_uuid, name, protocol_number 
FROM studies 
ORDER BY id;

-- Verify UUID format
SELECT 
    COUNT(*) as total,
    COUNT(DISTINCT aggregate_uuid) as unique_uuids,
    MIN(LENGTH(aggregate_uuid)) as min_len,
    MAX(LENGTH(aggregate_uuid)) as max_len
FROM studies;
-- Expected: 10, 10, 36, 36

-- Check organization relationships
SELECT COUNT(*) FROM organization_studies;
-- Expected: 10

-- Check user study roles
SELECT COUNT(*) FROM user_study_roles;
-- Expected: 10
```

---

## Test API Endpoints

### 1. Get All Studies
```bash
curl http://localhost:8080/api/studies/ddd
```

**Expected**: JSON array with 10 studies

### 2. Get Study by UUID
```bash
# COVID-19 Vaccine Trial
curl http://localhost:8080/api/studies/uuid/550e8400-e29b-41d4-a716-446655440001

# Diabetes AI Study
curl http://localhost:8080/api/studies/uuid/550e8400-e29b-41d4-a716-446655440002

# Alzheimer's Study
curl http://localhost:8080/api/studies/uuid/550e8400-e29b-41d4-a716-446655440003
```

**Expected**: Full study details in JSON

### 3. Create New Study
```bash
curl -X POST http://localhost:8080/api/studies/ddd \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Study via API",
    "organizationId": 1,
    "studyType": "INTERVENTIONAL",
    "indication": "Test Indication",
    "targetEnrollment": 100
  }'
```

**Expected**: 201 Created with new study UUID

---

## Troubleshooting

### Error: "Table studies doesn't exist"
**Solution**: Run schema creation first
```bash
mysql -u root -p < backend/clinprecision-db/ddl/consolidated_schema.sql
```

### Error: "Unknown column 'aggregate_uuid'"
**Solution**: Your schema is outdated. Re-run:
```bash
mysql -u root -p < backend/clinprecision-db/ddl/consolidated_schema.sql
```

### Error: "Cannot add foreign key constraint"
**Solution**: Load data in correct order (see "Loading Order" above)

### Error: "Duplicate entry for key 'PRIMARY'"
**Solution**: Clear existing data first
```sql
-- WARNING: This deletes all study data!
DELETE FROM user_study_roles;
DELETE FROM organization_studies;
DELETE FROM studies;

-- Reset auto-increment
ALTER TABLE studies AUTO_INCREMENT = 1;
```

### Error: Variable @admin_user_id is NULL
**Solution**: Users don't exist. Load admin data first:
```bash
mysql -u root -p clinprecisiondb < data_admin_setup.sql
```

---

## Study UUID Reference

Quick lookup for testing:

| Study ID | UUID | Name | Status |
|----------|------|------|--------|
| 1 | 550e8400-e29b-41d4-a716-446655440001 | COVID-19 Vaccine | Recruiting |
| 2 | 550e8400-e29b-41d4-a716-446655440002 | Diabetes AI | Completed |
| 3 | 550e8400-e29b-41d4-a716-446655440003 | Alzheimer's | Recruiting |
| 4 | 550e8400-e29b-41d4-a716-446655440004 | Rheumatoid Arthritis | Recruiting |
| 5 | 550e8400-e29b-41d4-a716-446655440005 | Hypertension Elderly | Completed |
| 6 | 550e8400-e29b-41d4-a716-446655440006 | Pediatric Asthma | Completed |
| 7 | 550e8400-e29b-41d4-a716-446655440007 | Oncology PD-1 | Recruiting |
| 8 | 550e8400-e29b-41d4-a716-446655440008 | CV Prevention | Recruiting |
| 9 | 550e8400-e29b-41d4-a716-446655440009 | Mental Health | Recruiting |
| 10 | 550e8400-e29b-41d4-a716-446655440010 | Gene Therapy | Recruiting |

---

## Clean Slate (Start Over)

If you need to completely reset:

```sql
-- 1. Drop and recreate database
DROP DATABASE IF EXISTS clinprecisiondb;
CREATE DATABASE clinprecisiondb;
USE clinprecisiondb;

-- 2. Re-run schema
SOURCE /path/to/consolidated_schema.sql;

-- 3. Re-run data scripts (in order)
SOURCE code_lists_data.sql;
SOURCE data_study_lookup_setup.sql;
SOURCE data_admin_setup.sql;
SOURCE demo_data_10_studies.sql;
```

---

## Integration Test with Demo Data

```bash
cd backend/clinprecision-clinops-service

# Run all tests
mvn test -Dtest=StudyDDDIntegrationTest

# Run specific test
mvn test -Dtest=StudyDDDIntegrationTest#testGetStudyByUuid_Found
```

**Note**: Tests will create additional studies, so you'll have >10 studies after testing.

---

## Database State After Load

```
Studies:           10 studies with UUIDs
Organizations:     2+ organizations with UUIDs
Sites:             Multiple sites (from other scripts)
Users:             Multiple users with roles
Relationships:     10 org-study mappings
User Roles:        10 user-study-role assignments
```

**Ready for**: Phase 2 integration testing, API testing, frontend development

---

## Quick Commands Cheat Sheet

```bash
# Connect to database
mysql -u root -p clinprecisiondb

# Load demo data
mysql -u root -p clinprecisiondb < demo_data_10_studies.sql

# Verify studies
mysql -u root -p clinprecisiondb -e "SELECT id, name FROM studies;"

# Check UUIDs
mysql -u root -p clinprecisiondb -e "SELECT aggregate_uuid, name FROM studies;"

# Count studies
mysql -u root -p clinprecisiondb -e "SELECT COUNT(*) FROM studies;"

# Start application
cd backend/clinprecision-clinops-service
mvn spring-boot:run

# Run tests
mvn test -Dtest=StudyDDDIntegrationTest

# Test API
curl http://localhost:8080/api/studies/ddd
```

---

**Last Updated**: October 4, 2025  
**Status**: Ready to load  
**Estimated Time**: 2-5 minutes
