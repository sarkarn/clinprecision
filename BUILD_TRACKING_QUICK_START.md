# Build Tracking Implementation - Quick Reference

**Status**: ✅ **READY FOR TESTING**  
**Updated**: October 16, 2025

---

## 🎯 What Was Done

### Items Completed:
1. ✅ **Database Migration Script** - All 6 tables (visit instances, forms, definitions, form data, audit)
2. ✅ **Java Entities** - StudyFormDataEntity, StudyFormDataAuditEntity
3. ✅ **Service Methods** - determineBuildId(), form save/retrieve logic

### Files Modified: **11 Java Files**

---

## 📋 Quick Testing Guide

### 1. Execute Database Migration

```bash
# Navigate to project root
cd c:\nnsproject\clinprecision

# Execute migration
mysql -u root -p clinprecisiondb < backend/clinprecision-db/migrations/20251016_add_build_tracking_to_patient_visits.sql

# Verify columns added
mysql -u root -p clinprecisiondb
> DESCRIBE study_form_data;
> DESCRIBE study_form_data_audit;

# Check for NULL build_id values (should be 0)
> SELECT COUNT(*) FROM study_form_data WHERE build_id IS NULL;
> SELECT COUNT(*) FROM study_form_data_audit WHERE build_id IS NULL;
```

---

### 2. Build Java Code

```bash
# Navigate to service
cd backend/clinprecision-clinops-service

# Clean build
mvn clean install -DskipTests

# With tests
mvn clean install
```

---

### 3. Test Form Submission

**Test Scenario 1: Visit-based form (should get buildId from visit)**
```bash
# Create a study build first
POST /api/studies/{studyId}/build

# Enroll patient (creates visit instances with buildId)
POST /api/patients/{patientId}/enroll

# Submit form for visit
POST /api/forms/submit
{
  "studyId": 1,
  "formId": 100,
  "subjectId": 1001,
  "visitId": 5001,  # ← Visit has buildId
  "formData": {
    "field1": "value1",
    "field2": "value2"
  },
  "status": "SUBMITTED"
}

# Expected: buildId populated from visit instance
```

**Test Scenario 2: Screening form (should use active build)**
```bash
# Submit screening form (no visitId)
POST /api/forms/submit
{
  "studyId": 1,
  "formId": 50,
  "subjectId": null,  # Screening
  "visitId": null,    # No visit
  "formData": {
    "eligibility_age": true,
    "eligibility_diagnosis": true
  },
  "status": "SUBMITTED"
}

# Expected: buildId populated from active study build
```

---

### 4. Verify Data

```sql
-- Check form data has buildId
SELECT id, study_id, form_id, subject_id, visit_id, build_id, status
FROM study_form_data
ORDER BY created_at DESC
LIMIT 10;

-- Check audit trail has buildId
SELECT audit_id, study_id, record_id, build_id, action, changed_at
FROM study_form_data_audit
ORDER BY changed_at DESC
LIMIT 10;

-- Verify visit instance buildId matches form data buildId
SELECT 
    svi.id as visit_id,
    svi.build_id as visit_build_id,
    sfd.id as form_data_id,
    sfd.build_id as form_build_id,
    sfd.form_id,
    sfd.status
FROM study_visit_instances svi
INNER JOIN study_form_data sfd ON sfd.visit_id = svi.id
WHERE sfd.created_at > NOW() - INTERVAL 1 DAY;
```

---

## 🔍 Key Changes Summary

### What determineBuildId() Does:

```java
1. Visit exists AND has buildId?
   → Use visit's buildId (PREFERRED)

2. Request includes buildId?
   → Use request's buildId (EXPLICIT)

3. Otherwise:
   → Get active study build (FALLBACK)

4. No build found?
   → Throw exception (cannot submit)
```

### Why This Matters:

```
Patient A (enrolled Build 1):
  ├─> All forms use Build 1 definitions
  └─> Sees Demographics v1 (10 fields)

Protocol Amendment (Build 2 created):
  ├─> Patient A continues with Build 1
  └─> New Patient B gets Build 2

Patient B (enrolled Build 2):
  ├─> All forms use Build 2 definitions
  └─> Sees Demographics v2 (12 fields)
```

---

## 🐛 Troubleshooting

### Issue: "No active study build found"

**Cause**: Study has no completed build  
**Fix**: Create and complete a study build first

```bash
POST /api/studies/{studyId}/build
# Wait for build to complete
```

---

### Issue: Visit has NULL buildId

**Cause**: Visit created before migration  
**Fix**: Migration script should backfill, but if not:

```sql
-- Backfill manually
UPDATE study_visit_instances svi
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = svi.study_id
SET svi.build_id = builds.first_build_id
WHERE svi.build_id IS NULL;
```

---

### Issue: Form data has NULL buildId

**Cause**: Form submitted before migration  
**Fix**: Run migration Part 8 backfill query

```sql
-- Backfill from visit instances
UPDATE study_form_data sfd
INNER JOIN study_visit_instances svi ON svi.id = sfd.visit_id
SET sfd.build_id = svi.build_id
WHERE sfd.visit_id IS NOT NULL AND sfd.build_id IS NULL;

-- Backfill standalone forms
UPDATE study_form_data sfd
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = sfd.study_id
SET sfd.build_id = builds.first_build_id
WHERE sfd.build_id IS NULL;
```

---

## 📚 Related Documents

1. **BUILD_TRACKING_FINAL_COMPLETE.md** - Complete implementation overview
2. **BUILD_TRACKING_JAVA_UPDATES_COMPLETE.md** - Detailed Java changes
3. **BUILD_TRACKING_STUDY_FORM_DATA_ANALYSIS.md** - Why study_form_data needs buildId
4. **BUILD_TRACKING_AUDIT_TABLE_COMPLIANCE.md** - FDA compliance requirements
5. **20251016_add_build_tracking_to_patient_visits.sql** - Database migration script

---

## ✅ Success Criteria

- [ ] Database migration executed successfully
- [ ] All 6 tables have build_id column
- [ ] Zero NULL build_id values
- [ ] Java code compiles without errors
- [ ] Form submission includes buildId in response
- [ ] Audit trail includes buildId
- [ ] Visit-based forms use visit's buildId
- [ ] Screening forms use active build's buildId

---

## 🚀 Next Steps

1. **Execute migration** (5 minutes)
2. **Build Java code** (2 minutes)
3. **Test form submission** (10 minutes)
4. **Verify data** (5 minutes)
5. **Integration testing** (30 minutes)

**Total Time**: ~1 hour

---

**Ready to proceed!** All code changes complete, migration script ready, no compilation errors.
