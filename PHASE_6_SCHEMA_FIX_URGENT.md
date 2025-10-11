# Phase 6 Database Schema Fix - URGENT

**Date**: October 11, 2025 16:35  
**Issue**: Missing `data_origin` column in `study_cdash_mappings` table  
**Status**: ⚠️ **REQUIRES IMMEDIATE FIX**

---

## Problem

The application is trying to insert into `study_cdash_mappings` table but the column `data_origin` doesn't exist in the database.

**Error**:
```
Unknown column 'data_origin' in 'field list'
```

---

## Root Cause

The JPA entity `StudyCdashMappingEntity` has the field:
```java
@Column(name = "data_origin", length = 20)
private String dataOrigin;
```

But the database table was created without this column.

---

## Solution

### Option 1: Run SQL Script Manually

**File**: `database/migrations/phase6_add_data_origin_column.sql`

```sql
USE clinprecision_studydb_11;

ALTER TABLE study_cdash_mappings 
ADD COLUMN data_origin VARCHAR(20) NULL 
COMMENT 'Data origin: COLLECTED, DERIVED, PROTOCOL, etc.' 
AFTER cdisc_terminology_code;

-- Verify
DESCRIBE study_cdash_mappings;

-- Set default for existing records
UPDATE study_cdash_mappings 
SET data_origin = 'COLLECTED' 
WHERE data_origin IS NULL;
```

**Steps**:
1. Open MySQL Workbench or command line
2. Connect to MySQL server
3. Run the above SQL commands
4. Restart the Spring Boot application

### Option 2: Use MySQL Command Line

```powershell
# Find MySQL installation
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p

# Then run:
USE clinprecision_studydb_11;
ALTER TABLE study_cdash_mappings 
ADD COLUMN data_origin VARCHAR(20) NULL 
COMMENT 'Data origin' 
AFTER cdisc_terminology_code;
```

### Option 3: Drop and Recreate Table

If the table has no important data yet:

```sql
USE clinprecision_studydb_11;

DROP TABLE IF EXISTS study_cdash_mappings;

CREATE TABLE study_cdash_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    form_id BIGINT NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    
    -- CDASH (data collection standard)
    cdash_domain VARCHAR(10),
    cdash_variable VARCHAR(50),
    cdash_label VARCHAR(255),
    
    -- SDTM (submission format)
    sdtm_domain VARCHAR(10),
    sdtm_variable VARCHAR(50),
    sdtm_label VARCHAR(255),
    sdtm_datatype VARCHAR(20),
    sdtm_length INT,
    
    -- CDISC compliance
    cdisc_terminology_code VARCHAR(100),
    data_origin VARCHAR(20),  -- ← MISSING COLUMN
    
    -- Transformations
    transformation_rule TEXT,
    unit_conversion_rule VARCHAR(500),
    
    -- Codelists
    codelist_name VARCHAR(255),
    codelist_version VARCHAR(50),
    
    -- Metadata
    mapping_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY uk_study_form_field (study_id, form_id, field_name),
    INDEX idx_study_id (study_id),
    INDEX idx_form_id (form_id),
    INDEX idx_cdash_domain (cdash_domain),
    INDEX idx_sdtm_domain (sdtm_domain),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='CDASH/SDTM mappings for regulatory submissions';
```

---

## Verification

After running the fix, verify the column exists:

```sql
USE clinprecision_studydb_11;
DESCRIBE study_cdash_mappings;
```

**Expected Output** (should include):
```
+-------------------------+--------------+------+-----+
| Field                   | Type         | Null | Key |
+-------------------------+--------------+------+-----+
| data_origin             | varchar(20)  | YES  |     |
+-------------------------+--------------+------+-----+
```

---

## After Fix - Restart Application

1. Stop the Spring Boot application (if running)
2. Clear any cached connections
3. Restart: `mvn spring-boot:run`
4. Trigger database build again: `POST /api/study-database-builds/start` with studyId=11

---

## Prevention

To prevent this in the future:

1. Always run Hibernate schema validation in development:
   ```yaml
   spring:
     jpa:
       hibernate:
         ddl-auto: validate  # Catches schema mismatches
   ```

2. Use database migration tools (Flyway or Liquibase)

3. Keep entity and schema in sync

---

## Related Files

- **Entity**: `StudyCdashMappingEntity.java` (line 121)
- **SQL Fix**: `database/migrations/phase6_add_data_origin_column.sql`
- **Worker Service**: `StudyDatabaseBuildWorkerService.java` (line 738)

---

## Next Steps After Fix

1. ✅ Run SQL fix to add `data_origin` column
2. ✅ Restart Spring Boot application
3. ✅ Test database build for Study 11
4. ✅ Verify Phase 6E service layer works correctly
5. ⏳ Proceed with Phase 6F frontend components

---

## Status

**Current State**: Database schema incomplete  
**Fix Required**: Add 1 column  
**Estimated Time**: 2 minutes  
**Impact**: **HIGH** - Blocks Phase 6 functionality

