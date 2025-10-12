# Phase 6A-6E Backend Code Removal Summary
**Date**: 2025-01-25  
**Status**: 🗑️ READY FOR REMOVAL

## Files to Delete

### Entities (4 files)
```
backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydatabase/entity/
├── StudyFieldMetadataEntity.java          ← DELETE (26 fields, relationships)
├── StudyCdashMappingEntity.java           ← DELETE (15 fields, relationships)
├── StudyMedicalCodingConfigEntity.java    ← DELETE (13 fields, relationships)
└── StudyFormDataReviewEntity.java         ← DELETE (14 fields, relationships)
```

### Repositories (4 files)
```
backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydatabase/repository/
├── StudyFieldMetadataRepository.java      ← DELETE (16 query methods)
├── StudyCdashMappingRepository.java       ← DELETE (8 query methods)
├── StudyMedicalCodingConfigRepository.java ← DELETE (7 query methods)
└── StudyFormDataReviewRepository.java     ← DELETE (9 query methods)
```

### Services (1 file - 485 lines!)
```
backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydatabase/service/
└── StudyFieldMetadataService.java         ← DELETE (485 lines, 14 methods, caching)
```

### Controllers (1 file)
```
backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydatabase/controller/
└── StudyMetadataQueryController.java      ← DELETE (10 REST endpoints)
```

### DTOs (3 files)
```
backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydatabase/dto/
├── CdashMappingDTO.java                   ← DELETE
├── MedicalCodingConfigDTO.java            ← DELETE
└── (FieldMetadataDTO.java if exists)      ← DELETE
```

## Worker Service Methods to Remove

### File: StudyDatabaseBuildWorkerService.java
**Location**: `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydatabase/service/StudyDatabaseBuildWorkerService.java`

### Methods to DELETE:
1. **Line ~609-709**: `private int createFieldMetadata(Long studyId, UUID buildId, List<FormDefinitionEntity> forms)`
2. **Line ~710-850**: `private int createCdashMappings(Long studyId, UUID buildId, List<FormDefinitionEntity> forms)`
3. **Line ~851-950**: `private int createMedicalCodingConfig(Long studyId, UUID buildId, List<FormDefinitionEntity> forms)`

### Method calls to REMOVE:
**Line ~188**: Remove this call:
```java
fieldMetadataCreated = createFieldMetadata(studyId, buildId, forms);
```

## Database Script to Execute

**File**: `database/migrations/PHASE_6_BACKEND_REMOVAL.sql`

Execute this script to remove:
- 4 main tables (study_field_metadata, study_cdash_mappings, study_medical_coding_config, study_form_data_reviews)
- 1 audit table (study_field_metadata_audit)
- 2 triggers (study_field_metadata_after_insert, study_field_metadata_after_update)
- 2 views (v_study_sdv_required_fields, v_study_pending_reviews_summary)
- 6 indexes

## Consolidated Schema File to Update

**File**: `backend/clinprecision-db/ddl/consolidated_schema.sql`

**Lines to REMOVE**: 1610-1940 (Phase 6 table definitions)

**Lines to REMOVE** in storeproc_and_function.sql:
- Line 297-330: Triggers for study_field_metadata
- Line 340-360: Indexes for Phase 6 tables
- Line 370-400: Views for Phase 6 queries
- Line 406-440: Sample INSERT statements for Phase 6 tables
- Line 443-500: Verification queries for Phase 6 tables

## Removal Statistics

| Category | Count | Lines of Code |
|----------|-------|---------------|
| **Entities** | 4 files | ~400 lines |
| **Repositories** | 4 files | ~300 lines |
| **Services** | 1 file | 485 lines |
| **Controllers** | 1 file | ~200 lines |
| **DTOs** | 3 files | ~150 lines |
| **Worker Methods** | 3 methods | ~400 lines |
| **SQL Tables** | 4 tables + 1 audit | N/A |
| **SQL Triggers** | 2 triggers | ~50 lines |
| **SQL Views** | 2 views | ~30 lines |
| **SQL Indexes** | 6 indexes | ~30 lines |
| **Total Backend Code** | 16 files | **~2,085 lines** |

## Execution Steps

### Step 1: Database Removal (Manual - Run SQL Script)
```bash
# Execute the SQL script
mysql -u clinprecadmin -p clinprecisiondb < database/migrations/PHASE_6_BACKEND_REMOVAL.sql

# Verify tables are removed
mysql -u clinprecadmin -p clinprecisiondb -e "SHOW TABLES LIKE 'study_%metadata%';"
# Expected: Empty set

mysql -u clinprecadmin -p clinprecisiondb -e "SHOW TABLES LIKE '%cdash%';"
# Expected: Empty set
```

### Step 2: Backend Code Removal (Automated - via Copilot)
Files will be deleted in this order:
1. Controller (StudyMetadataQueryController.java)
2. Service (StudyFieldMetadataService.java)
3. DTOs (3 files)
4. Repositories (4 files)
5. Entities (4 files)
6. Worker methods (edit StudyDatabaseBuildWorkerService.java)

### Step 3: SQL File Cleanup
1. Remove Phase 6 sections from consolidated_schema.sql (lines 1610-1940)
2. Remove Phase 6 sections from storeproc_and_function.sql

### Step 4: Testing
1. Run database build: `./gradlew :clinprecision-clinops-service:bootRun`
2. Check logs for errors (should be clean)
3. Test CRF Builder form save (should work normally)
4. Test form load with metadata (should display all 6 tabs correctly)
5. Test Export functionality (should export JSON/CSV/Excel)

## Expected Outcome

✅ **No Functional Loss**:
- CRF Builder continues to work perfectly
- All 6 metadata tabs continue to save to form JSON
- Forms load and display all metadata correctly
- Export functionality continues to work

✅ **Simplified Architecture**:
- Single source of truth: form JSON
- No data synchronization issues
- Easier to maintain
- No dummy/fake data in database

✅ **Performance**:
- Database build will be faster (no Phase 6 table population)
- Postgres JSON queries are sufficient for current scale
- No noticeable performance degradation

## Rollback Plan

If removal causes issues (unlikely):
1. Restore database tables from `PHASE_6_BACKEND_REMOVAL.sql` rollback section
2. Restore backend code from git history
3. Note: Tables will be empty until you implement JSON parsing logic

## Reference

See `PHASE_6_BACKEND_NECESSITY_ANALYSIS.md` for complete analysis and rationale.

---

**Ready to proceed with automated removal? All files identified and removal plan created.**
