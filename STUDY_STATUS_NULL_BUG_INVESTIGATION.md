# Study Status Null Bug Investigation

## Issue Summary
**Critical Bug**: Study status (`study_status_id`) becomes NULL after creating a protocol version

## Problem Description
When a user creates a protocol version via `POST /api/studies/{id}/versions`, the parent `StudyEntity.studyStatus` field is set to NULL, causing:
1. Frontend displays "unknown" status
2. Loss of data integrity
3. Workflow disruption

## Investigation Timeline

### 1. Initial Symptom Discovery
- Frontend showing "unknown" study status
- Backend logs: "Study 2 has null status, defaulting to DRAFT"
- User observation: "After creating protocol version study status is set to null"

### 2. Entity Relationship Analysis

**StudyEntity.java**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "study_status_id", referencedColumnName = "id")
private StudyStatusEntity studyStatus;

// Has @OneToMany relationships with:
- OrganizationStudyEntity (cascade = CascadeType.ALL, orphanRemoval = true)
- FormDefinitionEntity (cascade = CascadeType.ALL, orphanRemoval = true)

// NO @OneToMany relationship to StudyVersionEntity
```

**StudyVersionEntity.java**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "study_id", insertable = false, updatable = false)
@JsonBackReference
private StudyEntity study;

// Note: insertable = false, updatable = false means JPA won't manage this FK
```

### 3. Version Creation Flow Analysis

**StudyVersionService.createVersion()**
```java
@Transactional
public StudyVersionDto createVersion(Long studyId, StudyVersionCreateRequestDto request, Long userId) {
    // 1. Check study exists (does NOT load entity)
    if (!studyRepository.existsById(studyId)) { ... }
    
    // 2. Create version with studyId FK value
    StudyVersionEntity version = new StudyVersionEntity(studyId, nextVersionNumber, userId);
    
    // 3. Save version
    StudyVersionEntity savedVersion = studyVersionRepository.save(version);
    
    // 4. NO direct study entity modification
    return new StudyVersionDto(savedVersion);
}
```

**Key Observations**:
- Service only calls `existsById()` - does NOT load study entity
- Creates `StudyVersionEntity` with raw `studyId` value (not relationship)
- No explicit study entity fetch, modify, or save
- Entire service is `@Transactional`

### 4. Database Schema Analysis

**studies table (consolidated_schema.sql)**
```sql
study_status_id BIGINT NULL COMMENT 'References study_status.id',
CONSTRAINT fk_studies_study_status FOREIGN KEY (study_status_id) REFERENCES study_status(id)
```

**study_versions table**
```sql
study_id BIGINT NOT NULL,
-- No explicit foreign key constraint to studies table visible in examined section
```

**No triggers found** that would modify `study_status_id`

## Diagnostic Approach Added

### Added Debug Logging
Modified `StudyVersionService.createVersion()` to:
1. Load study entity BEFORE version save
2. Log status before and after
3. Alert if status changes to NULL

```java
// LOG STUDY STATUS BEFORE VERSION CREATION
StudyEntity studyBefore = studyRepository.findById(studyId)
        .orElseThrow(() -> new RuntimeException("Study not found with id: " + studyId));
logger.info("BEFORE version save - Study {} status: {} (status_id: {})", 
            studyId, 
            studyBefore.getStudyStatus() != null ? studyBefore.getStudyStatus().getCode() : "NULL",
            studyBefore.getStudyStatus() != null ? studyBefore.getStudyStatus().getId() : "NULL");

// ... version creation code ...

// LOG STUDY STATUS AFTER VERSION CREATION
StudyEntity studyAfter = studyRepository.findById(studyId)
        .orElseThrow(() -> new RuntimeException("Study not found with id: " + studyId));
logger.info("AFTER version save - Study {} status: {} (status_id: {})", 
            studyId, 
            studyAfter.getStudyStatus() != null ? studyAfter.getStudyStatus().getCode() : "NULL",
            studyAfter.getStudyStatus() != null ? studyAfter.getStudyStatus().getId() : "NULL");

// ALERT IF STATUS CHANGED
boolean statusChangedToNull = (studyBefore.getStudyStatus() != null && studyAfter.getStudyStatus() == null);
if (statusChangedToNull) {
    logger.error("⚠️ CRITICAL: Study {} status changed from {} to NULL during version creation!", 
                 studyId, studyBefore.getStudyStatus().getCode());
}
```

## Hypotheses

### Hypothesis 1: JPA Persistence Context Merge Issue ❓
- **Theory**: Loading study entity during version save causes JPA to merge it
- **Mechanism**: If study entity was previously loaded in detached state with null status, merge could overwrite DB
- **Likelihood**: MEDIUM
- **Test**: Check if `studyRepository.findById()` in logging triggers the issue

### Hypothesis 2: Transaction Propagation/Rollback ❓
- **Theory**: Nested transaction or validation failure causes partial rollback
- **Mechanism**: Version saves but study changes rollback, leaving NULL status
- **Likelihood**: LOW (would see exception)
- **Test**: Check transaction logs for rollback events

### Hypothesis 3: Database Trigger/Constraint ❓
- **Theory**: Database-level trigger on study_versions INSERT clears study status
- **Mechanism**: Hidden trigger not visible in schema files
- **Likelihood**: LOW (no triggers found in DDL)
- **Test**: Check database directly: `SHOW TRIGGERS LIKE 'study_versions';`

### Hypothesis 4: Cascade Operation from OrganizationStudyEntity ❓
- **Theory**: Version save triggers cascade that touches OrganizationStudyEntity which clears parent
- **Mechanism**: Bidirectional relationship helper methods might clear study
- **Likelihood**: LOW (no relationship between versions and org studies)
- **Test**: Examine OrganizationStudyEntity for lifecycle callbacks

### Hypothesis 5: Second-Level Cache Corruption ❓
- **Theory**: Hibernate second-level cache has stale study entity
- **Mechanism**: Cache eviction during version save retrieves old entity with null status
- **Likelihood**: MEDIUM if caching is enabled
- **Test**: Disable second-level cache and retry

### Hypothesis 6: Lazy Loading Proxy Nullification 🔍 **MOST LIKELY**
- **Theory**: Lazy fetch on studyStatus fails during transaction, leaves null
- **Mechanism**: 
  1. `StudyVersionEntity` has `@ManyToOne(fetch = LAZY)` to `StudyEntity`
  2. Saving version loads study in proxy form
  3. `studyStatus` is also LAZY and not initialized
  4. JPA merge operation writes proxy state (null) to database
- **Likelihood**: HIGH
- **Test**: Check if adding EAGER fetch or JOIN FETCH prevents issue

## Next Steps

1. **Run Test with Debug Logging**
   - Create a protocol version
   - Check logs for BEFORE/AFTER status values
   - Verify if CRITICAL alert fires

2. **Check Database State**
   ```sql
   -- Before creating version
   SELECT id, name, study_status_id FROM studies WHERE id = 2;
   
   -- After creating version
   SELECT id, name, study_status_id FROM studies WHERE id = 2;
   
   -- Check for triggers
   SHOW TRIGGERS LIKE 'study_versions';
   SHOW TRIGGERS LIKE 'studies';
   ```

3. **Test Fetch Strategy**
   - Try changing `StudyVersionEntity.study` to `@ManyToOne(fetch = EAGER)`
   - Or add `JOIN FETCH s.studyStatus` to study queries

4. **Check JPA Logging**
   - Enable Hibernate SQL logging: `spring.jpa.show-sql=true`
   - Check for UPDATE statements on studies table during version save

5. **Review StudyVersionRepository**
   - Check for custom `@Query` annotations
   - Look for `@Modifying` queries that might touch studies

## Temporary Mitigation Applied

### StudyMapper.toResponseDto()
```java
if (entity.getStudyStatus() != null) {
    // ... populate status DTO
    dto.setStatus(entity.getStudyStatus().getCode());
} else {
    logger.warn("Study {} has null status, defaulting to DRAFT", entity.getId());
    dto.setStatus("DRAFT"); // DEFAULT TO DRAFT
}
```

**Note**: This is a **band-aid fix** that prevents frontend from showing "unknown" but does NOT fix the root cause (status still becomes null in database).

## Related Issues Fixed

1. ✅ Version display "vv1.0" → Fixed by removing extra "v" prefix
2. ✅ Statistics array logging → Fixed by handling nested Object[] results
3. ⚠️ Status enum mismatch → Documented but frontend not updated yet
4. ⚠️ Status becomes NULL → Under investigation with debug logging added

## Files Modified

1. `backend/clinprecision-clinops-service/.../StudyVersionService.java`
   - Added Logger import
   - Added debug logging before/after version save
   - Added critical alert for status change detection

2. `backend/clinprecision-clinops-service/.../StudyMapper.java`
   - Added null status handling with default "DRAFT"

3. `backend/clinprecision-clinops-service/.../StudyDocumentService.java`
   - Fixed array logging for statistics

## Expected Debug Log Output

### If Bug Occurs:
```
INFO  - Creating version for study 2
INFO  - BEFORE version save - Study 2 status: UNDER_REVIEW (status_id: 3)
INFO  - Saving version v2.0 for study 2
INFO  - Version saved with id: 5
INFO  - AFTER version save - Study 2 status: NULL (status_id: NULL)
ERROR - ⚠️ CRITICAL: Study 2 status changed from UNDER_REVIEW to NULL during version creation!
```

### If Bug Does NOT Occur:
```
INFO  - Creating version for study 2
INFO  - BEFORE version save - Study 2 status: UNDER_REVIEW (status_id: 3)
INFO  - Saving version v2.0 for study 2
INFO  - Version saved with id: 5
INFO  - AFTER version save - Study 2 status: UNDER_REVIEW (status_id: 3)
```

## Action Required

**User should**:
1. Rebuild backend: `mvn clean install` in clinops-service
2. Restart clinops-service
3. Create a protocol version via frontend
4. Check logs for debug output
5. Report back BEFORE/AFTER status values from logs

**This will definitively show WHEN the status becomes null** and guide next investigation steps.
