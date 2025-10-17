# Database View Usage Analysis: v_study_design_progress_summary

**Date**: October 16, 2025  
**View Name**: `v_study_design_progress_summary`  
**Status**: ❌ **NOT USED** in Backend Code

---

## Summary

The view **`v_study_design_progress_summary`** is **NOT being used** anywhere in the Java backend code.

---

## Search Results

### 1. Java Code Search
```
Query: v_study_design_progress_summary
Location: backend/**/*.java
Result: ❌ No matches found
```

### 2. XML Configuration Search
```
Query: v_study_design_progress_summary
Location: backend/**/*.xml
Result: ❌ No matches found
```

### 3. SQL Script Search
```
Query: v_study_design_progress_summary
Location: backend/**/*.sql
Result: ✅ 2 matches found
```

**Found in**:
1. `backend/clinprecision-db/ddl/consolidated_views.sql` (line 7) - View definition
2. `backend/clinprecision-db/ddl/consolidated_grants.sql` (line 7) - Grant statement

---

## View Definition

### consolidated_views.sql
```sql
CREATE VIEW v_study_design_progress_summary AS
SELECT 
    s.id as study_id,
    s.name as study_name,
    COUNT(sdp.id) as total_phases,
    SUM(CASE WHEN sdp.completed = TRUE THEN 1 ELSE 0 END) as completed_phases,
    ROUND(AVG(sdp.percentage), 2) as overall_completion_percentage,
    MAX(sdp.updated_at) as last_progress_update
FROM studies s
LEFT JOIN study_design_progress sdp ON s.id = sdp.study_id
GROUP BY s.id, s.name;
```

### consolidated_grants.sql
```sql
GRANT SELECT ON v_study_design_progress_summary TO 'clinprecadmin'@'localhost';
```

---

## What the Backend Actually Uses

Instead of using the view, the backend code uses:

### 1. Direct Table Access via JPA

**Entity**: `DesignProgressEntity`
```java
@Entity
@Table(name = "study_design_progress")
public class DesignProgressEntity {
    private Long id;
    private Long studyId;
    private String phase;
    private Boolean completed;
    private Integer percentage;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // ...
}
```

**Repository**: `DesignProgressRepository`
```java
@Repository
public interface DesignProgressRepository extends JpaRepository<DesignProgressEntity, Long> {
    
    List<DesignProgressEntity> findByStudyIdOrderByPhaseAsc(Long studyId);
    
    Optional<DesignProgressEntity> findByStudyIdAndPhase(Long studyId, String phase);
    
    List<DesignProgressEntity> findByStudyIdAndCompletedTrueOrderByPhaseAsc(Long studyId);
    
    // Custom query that does what the view does
    @Query("SELECT AVG(dp.percentage) FROM DesignProgressEntity dp WHERE dp.studyId = :studyId")
    Double calculateOverallCompletionPercentage(@Param("studyId") Long studyId);
    
    Long countByStudyIdAndCompletedTrue(Long studyId);
    
    Long countByStudyId(Long studyId);
    
    // ...
}
```

### 2. Service Layer

**Service**: `DesignProgressService`
```java
@Service
public class DesignProgressService {
    
    private final DesignProgressRepository designProgressRepository;
    
    public DesignProgressResponseDto getDesignProgress(Long studyId) {
        // Queries study_design_progress table directly via JPA
        List<DesignProgressEntity> entities = 
            designProgressRepository.findByStudyIdOrderByPhaseAsc(studyId);
        
        // Calculates summary in Java code, not using the view
        // ...
    }
}
```

---

## Why the View is Not Used

### 1. JPA/Hibernate Approach
The backend uses **JPA/Hibernate** for data access, which:
- Maps entities to tables (not views)
- Performs aggregations in Java code or custom JPQL queries
- Provides type-safe, object-oriented data access

### 2. Repository Pattern
The repository provides methods that:
- Return strongly-typed entities
- Can be composed/filtered in service layer
- Provide better flexibility than a fixed view

### 3. Service Layer Aggregation
Summary calculations are done in the service layer:
```java
// Example: Calculate summary from entities
Double avgPercentage = designProgressRepository
    .calculateOverallCompletionPercentage(studyId);

Long completedCount = designProgressRepository
    .countByStudyIdAndCompletedTrue(studyId);

Long totalCount = designProgressRepository
    .countByStudyId(studyId);
```

---

## Comparison: View vs Current Implementation

### View Provides:
```sql
SELECT 
    study_id,
    study_name,
    total_phases,              -- COUNT(sdp.id)
    completed_phases,          -- SUM(CASE WHEN completed = TRUE...)
    overall_completion_percentage,  -- ROUND(AVG(percentage), 2)
    last_progress_update       -- MAX(updated_at)
FROM v_study_design_progress_summary
WHERE study_id = ?;
```

### Current Implementation Does:
```java
// Get all design progress records
List<DesignProgressEntity> entities = 
    designProgressRepository.findByStudyIdOrderByPhaseAsc(studyId);

// Calculate in Java
int totalPhases = entities.size();
long completedPhases = entities.stream()
    .filter(DesignProgressEntity::getCompleted)
    .count();
double avgPercentage = entities.stream()
    .mapToInt(DesignProgressEntity::getPercentage)
    .average()
    .orElse(0.0);
LocalDateTime lastUpdate = entities.stream()
    .map(DesignProgressEntity::getUpdatedAt)
    .max(Comparator.naturalOrder())
    .orElse(null);
```

---

## Impact Analysis

### If View is Removed:

✅ **NO IMPACT** on backend functionality
- No Java code references the view
- All calculations done via JPA repository methods
- Service layer handles aggregations

### If View is Kept:

⚠️ **Maintenance Overhead**
- Must maintain view definition in sync with table structure
- Grants must be managed
- No current benefit since it's unused

---

## Recommendation

### Option 1: Remove the View (Recommended)
**Reason**: Not used by backend, creates maintenance overhead

**Action**:
1. Drop view from database:
   ```sql
   DROP VIEW IF EXISTS v_study_design_progress_summary;
   ```
2. Remove from `consolidated_views.sql`
3. Remove grant from `consolidated_grants.sql`

### Option 2: Keep for Potential Use
**Reason**: May be useful for:
- Direct SQL queries/reports
- Database administration
- Third-party reporting tools
- Future frontend direct queries (not recommended)

**Action**: Document that it's unused by backend but available for reporting

### Option 3: Create Entity Mapping (If needed)
**Reason**: If you want to use the view in future

**Action**: Create read-only entity
```java
@Entity
@Table(name = "v_study_design_progress_summary")
@Immutable
public class StudyDesignProgressSummaryView {
    @Id
    @Column(name = "study_id")
    private Long studyId;
    
    @Column(name = "study_name")
    private String studyName;
    
    @Column(name = "total_phases")
    private Integer totalPhases;
    
    @Column(name = "completed_phases")
    private Integer completedPhases;
    
    @Column(name = "overall_completion_percentage")
    private Double overallCompletionPercentage;
    
    @Column(name = "last_progress_update")
    private LocalDateTime lastProgressUpdate;
}
```

---

## Related Views in Database

The database has 3 views total:

| View Name | Used in Backend? | Purpose |
|-----------|------------------|---------|
| `v_study_design_progress_summary` | ❌ No | Design progress aggregation |
| `v_patient_current_status` | ❓ Unknown | Patient current status |
| `v_status_transition_summary` | ❓ Unknown | Status transition stats |

**Recommendation**: Check usage of other views as well.

---

## Conclusion

**Status**: ❌ **NOT USED** in backend code

**Current Approach**: Backend uses JPA repository with custom queries and service-layer aggregation

**Recommendation**: Remove view unless needed for external reporting/SQL queries

**Files to Check**:
- `backend/clinprecision-db/ddl/consolidated_views.sql` (remove CREATE VIEW)
- `backend/clinprecision-db/ddl/consolidated_grants.sql` (remove GRANT)

---

**Analysis Date**: October 16, 2025  
**Analyzed By**: GitHub Copilot  
**Backend Framework**: Spring Boot + JPA/Hibernate
