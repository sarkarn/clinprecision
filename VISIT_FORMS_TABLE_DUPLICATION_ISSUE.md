# Visit Forms Table Duplication Issue - ROOT CAUSE ANALYSIS

**Date**: October 17, 2025  
**Issue**: "I don't see assigned forms for the visits"  
**Root Cause**: **TWO different tables** are being used for visit-form associations, causing data to be in the wrong place

---

## 🔴 THE PROBLEM

You have **TWO tables** that serve the same purpose:

| Table | Has build_id? | Java Entity? | Populated by Build? | Queried by UI? |
|-------|---------------|--------------|---------------------|----------------|
| **`visit_forms`** | ✅ YES | ✅ VisitFormEntity.java | ❌ NO | ✅ YES |
| **`study_visit_form_mapping`** | ❌ NO | ❌ NONE | ✅ YES | ❌ NO |

### **The Mismatch**:
```
Study Build Process → Inserts into study_visit_form_mapping (no build_id)
           ↓
    [DATA STORED HERE]
           ↓
Frontend Visit Details → Queries visit_forms (with build_id filter)
           ↓
    [NO DATA FOUND] ← MISMATCH!
           ↓
Result: "No forms assigned to visit"
```

---

## 📊 Table Comparison

### **1. `visit_forms` (Design-Time Table)**

**Schema**:
```sql
CREATE TABLE visit_forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_uuid VARCHAR(255),
    build_id BIGINT,  -- ✅ HAS build_id for protocol versioning
    assignment_uuid VARCHAR(255),
    visit_definition_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    is_conditional BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 1,
    -- Event sourcing fields
    created_at TIMESTAMP,
    created_by BIGINT,
    FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id),
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id),
    FOREIGN KEY (build_id) REFERENCES study_database_builds(id)
);
```

**Purpose**: Event-sourced read model for form assignments  
**Has Java Entity**: ✅ `VisitFormEntity.java`  
**Has Repository**: ✅ `VisitFormRepository.java`  
**Used By**: 
- ✅ `VisitFormQueryService.java` (Lines 84, 118-119)
- ✅ Frontend visit details page
- ✅ Study Design module projectors

**Current State**: ❌ **EMPTY** (0 records) - No data inserted during build

---

### **2. `study_visit_form_mapping` (Configuration Table)**

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS study_visit_form_mapping (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    visit_id BIGINT NOT NULL,
    form_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    sequence INT,
    conditional_logic JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    -- ❌ NO build_id column
    UNIQUE KEY uk_study_visit_form (study_id, visit_id, form_id)
);
```

**Purpose**: Simple mapping table for build process  
**Has Java Entity**: ❌ NO  
**Has Repository**: ❌ NO  
**Used By**: 
- ✅ `StudyDatabaseBuildWorkerService.java` (Lines 354-394)
- ❌ Not queried by any service

**Current State**: ✅ **HAS DATA** - Populated during study build

---

## 🔍 Code Evidence

### **Where Data is INSERTED** (Study Build):

**File**: `StudyDatabaseBuildWorkerService.java` (Lines 346-395)

```java
/**
 * Create form-visit mappings - Associates forms with visits
 * Inserts into study_visit_form_mapping table  ← WRONG TABLE!
 */
private int createFormVisitMappings(Long studyId, UUID buildId, 
                                    List<FormDefinitionEntity> forms, 
                                    List<VisitDefinitionEntity> visits) {
    
    String insertSql = 
        "INSERT INTO study_visit_form_mapping " +  // ← WRONG TABLE!
        "(study_id, visit_id, form_id, is_required, sequence, created_by, created_at) " +
        "VALUES (?, ?, ?, ?, ?, ?, NOW())";
    
    // Inserts data into study_visit_form_mapping (no build_id)
    jdbcTemplate.update(insertSql, studyId, visit.getId(), form.getId(), true, sequence++, 1L);
}
```

**Problem**: Inserts into `study_visit_form_mapping` which:
- ❌ Has no `build_id` column
- ❌ Has no Java entity
- ❌ Is never queried by frontend

---

### **Where Data is QUERIED** (Visit Details Page):

**File**: `VisitFormQueryService.java` (Lines 72-84)

```java
/**
 * Get all forms associated with a visit instance
 */
@Transactional(readOnly = true)
public List<VisitFormDto> getFormsForVisitInstance(Long visitInstanceId) {
    
    StudyVisitInstanceEntity visitInstance = visitInstanceRepository.findById(visitInstanceId)
        .orElseThrow(() -> new RuntimeException("Visit instance not found: " + visitInstanceId));

    // Extract build_id from visit instance
    Long buildId = visitInstance.getBuildId();
    
    if (buildId == null) {
        log.error("Visit has NULL build_id! Cannot retrieve forms.");
        return Collections.emptyList();
    }

    Long visitDefinitionId = visitInstance.getVisitId();
    
    // Query visit_forms table (WITH build_id filter)  ← CORRECT TABLE BUT NO DATA!
    List<VisitFormEntity> visitForms = visitFormRepository
        .findByVisitDefinitionIdAndBuildIdOrderByDisplayOrderAsc(visitDefinitionId, buildId);

    log.info("Found {} form assignments for visit definition {} in build {}", 
             visitForms.size(), visitDefinitionId, buildId);
    
    // Returns empty list because visit_forms table is empty!
    return visitForms.stream()
        .map(vf -> mapToDto(vf, visitInstance))
        .collect(Collectors.toList());
}
```

**Problem**: Queries `visit_forms` table which:
- ✅ Has `build_id` column (correct)
- ✅ Has proper entity and repository (correct)
- ❌ **Is EMPTY** because build process inserts into the other table

---

## 🎯 THE ROOT CAUSE

**Timeline of how this happened**:

1. **Phase 1**: `visit_forms` table created for event-sourced study design
   - Has `build_id` for protocol versioning
   - Has Java entity `VisitFormEntity.java`
   - Has repository `VisitFormRepository.java`
   - Designed for event sourcing pattern

2. **Phase 2**: Study build process implemented
   - Created `study_visit_form_mapping` as "simple mapping table"
   - Did NOT add `build_id` column
   - Did NOT create Java entity
   - **MISTAKE**: Used different table instead of `visit_forms`

3. **Phase 3**: Visit form query service implemented
   - Queries `visit_forms` table (correct table)
   - Filters by `build_id` (correct approach)
   - **BUG**: No data in this table!

4. **Result**: Data in wrong table → Queries return empty → No forms shown

---

## ✅ THE SOLUTION

**Option 1: Use `visit_forms` table (RECOMMENDED)**

### **Why this is correct**:
- ✅ Already has `build_id` column for protocol versioning
- ✅ Already has Java entity and repository
- ✅ Already queried by frontend
- ✅ Follows event sourcing pattern
- ✅ Supports soft deletes, audit trail, UUIDs

### **What needs to change**:

#### **1. Update StudyDatabaseBuildWorkerService.java**

**File**: `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/studydatabase/service/StudyDatabaseBuildWorkerService.java`

**BEFORE** (Lines 346-395):
```java
private int createFormVisitMappings(Long studyId, UUID buildId, 
                                    List<FormDefinitionEntity> forms, 
                                    List<VisitDefinitionEntity> visits) {
    
    String insertSql = 
        "INSERT INTO study_visit_form_mapping " +  // ← WRONG TABLE
        "(study_id, visit_id, form_id, is_required, sequence, created_by, created_at) " +
        "VALUES (?, ?, ?, ?, ?, ?, NOW())";
    
    // ... rest of code
}
```

**AFTER** (FIXED):
```java
private int createFormVisitMappings(Long studyId, UUID buildId, 
                                    List<FormDefinitionEntity> forms, 
                                    List<VisitDefinitionEntity> visits) {
    
    // Get the Long build ID from UUID
    Long buildIdLong = getBuildIdFromUuid(studyId, buildId);
    
    String insertSql = 
        "INSERT INTO visit_forms " +  // ← CORRECT TABLE
        "(visit_definition_id, form_definition_id, build_id, is_required, display_order, created_by, created_at) " +
        "VALUES (?, ?, ?, ?, ?, ?, NOW())";  // ← Added build_id
    
    try {
        int sequence = 1;
        for (VisitDefinitionEntity visit : visits) {
            for (FormDefinitionEntity form : forms) {
                // Check if mapping already exists in visit_forms
                String checkSql = 
                    "SELECT COUNT(*) FROM visit_forms " +  // ← CORRECT TABLE
                    "WHERE visit_definition_id = ? AND form_definition_id = ? AND build_id = ?";
                
                Integer existingCount = jdbcTemplate.queryForObject(
                    checkSql, Integer.class, 
                    visit.getId(), form.getId(), buildIdLong);
                
                if (existingCount == null || existingCount == 0) {
                    jdbcTemplate.update(insertSql, 
                        visit.getId(),      // visit_definition_id
                        form.getId(),       // form_definition_id
                        buildIdLong,        // build_id ← CRITICAL FIX
                        true,               // is_required
                        sequence++,         // display_order
                        1L);                // created_by
                    
                    mappingsCreated++;
                }
            }
        }
        
        log.info("Created {} form-visit mappings in visit_forms table with build_id={}", 
                 mappingsCreated, buildIdLong);
        
    } catch (Exception e) {
        log.error("Failed to create form-visit mappings: {}", e.getMessage(), e);
        throw new RuntimeException("Failed to create form-visit mappings", e);
    }
    
    return mappingsCreated;
}

/**
 * Helper method to get Long build ID from UUID
 */
private Long getBuildIdFromUuid(Long studyId, UUID buildId) {
    String sql = "SELECT id FROM study_database_builds WHERE build_request_id = ?";
    return jdbcTemplate.queryForObject(sql, Long.class, buildId.toString());
}
```

#### **2. Migrate existing data**

**SQL Migration**:
```sql
-- Copy data from study_visit_form_mapping to visit_forms
INSERT INTO visit_forms 
    (visit_definition_id, form_definition_id, build_id, is_required, display_order, created_by, created_at)
SELECT 
    svfm.visit_id,
    svfm.form_id,
    (SELECT id FROM study_database_builds 
     WHERE study_id = svfm.study_id 
       AND build_status = 'COMPLETED' 
     ORDER BY build_end_time DESC 
     LIMIT 1) as build_id,  -- Get most recent completed build
    svfm.is_required,
    svfm.sequence,
    svfm.created_by,
    svfm.created_at
FROM study_visit_form_mapping svfm
WHERE NOT EXISTS (
    SELECT 1 FROM visit_forms vf 
    WHERE vf.visit_definition_id = svfm.visit_id 
      AND vf.form_definition_id = svfm.form_id
);

-- Verify data was copied
SELECT 
    'visit_forms' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT build_id) as builds
FROM visit_forms
UNION ALL
SELECT 
    'study_visit_form_mapping',
    COUNT(*),
    COUNT(DISTINCT study_id)
FROM study_visit_form_mapping;
```

#### **3. Delete redundant table (after migration)**

```sql
-- After confirming everything works:
DROP TABLE study_visit_form_mapping;
```

---

## 🧪 Testing Steps

### **Step 1: Verify Current State**
```sql
-- Check data in wrong table
SELECT COUNT(*) FROM study_visit_form_mapping;
-- Expected: > 0 (has data)

-- Check data in correct table
SELECT COUNT(*) FROM visit_forms;
-- Expected: 0 (empty)
```

### **Step 2: Migrate Data**
```sql
-- Run migration SQL above
-- Then verify:
SELECT COUNT(*) FROM visit_forms WHERE build_id IS NOT NULL;
-- Expected: Same count as study_visit_form_mapping
```

### **Step 3: Update Build Service**
1. Modify `StudyDatabaseBuildWorkerService.java` as shown above
2. Compile backend: `.\mvnw.cmd clean compile -DskipTests`
3. Restart clinops-service

### **Step 4: Rebuild Study Database**
1. Delete existing build: `DELETE FROM study_database_builds WHERE study_id = 11;`
2. Trigger new build from UI
3. Verify data goes into `visit_forms`:
   ```sql
   SELECT vf.*, vd.name as visit_name, fd.name as form_name
   FROM visit_forms vf
   JOIN visit_definitions vd ON vd.id = vf.visit_definition_id
   JOIN form_definitions fd ON fd.id = vf.form_definition_id
   WHERE vf.build_id = (SELECT MAX(id) FROM study_database_builds WHERE study_id = 11);
   ```

### **Step 5: Test Frontend**
1. Navigate to SubjectDetails page
2. Click on a visit
3. Click "View Details"
4. **Expected**: ✅ Forms should appear with proper names

---

## 📋 Summary

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| No forms showing in visit details | Build process inserts into `study_visit_form_mapping`<br>Query service reads from `visit_forms` | Change build process to insert into `visit_forms` table with `build_id` |
| Two tables doing same thing | Historical accident during development | Migrate data to `visit_forms`, drop `study_visit_form_mapping` |
| Missing `build_id` in data | `study_visit_form_mapping` has no `build_id` column | Use `visit_forms` which has `build_id` column |

---

## 🎯 Next Steps

1. ✅ **Review this document** - Understand the root cause
2. ⏳ **Migrate existing data** - Copy from `study_visit_form_mapping` to `visit_forms`
3. ⏳ **Update build service** - Change INSERT target table
4. ⏳ **Test with new build** - Verify forms appear
5. ⏳ **Drop old table** - Remove `study_visit_form_mapping` after confirming everything works

**Priority**: 🔴 **CRITICAL** - Blocks all visit form functionality

**Estimated Fix Time**: 1-2 hours (including testing)
