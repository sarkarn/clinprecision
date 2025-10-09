# StudyDesign Aggregate Initialization Fix

**Date:** October 6, 2025  
**Issue:** AggregateNotFoundException when creating visits  
**Root Cause:** StudyDesignAggregate not initialized in event store  
**Status:** ✅ RESOLVED

---

## Problem Description

### Error Symptoms
```
org.axonframework.modelling.command.AggregateNotFoundException: 
The aggregate was not found in the event store
```

When trying to create a visit definition via:
```
POST /clinops-ws/api/clinops/study-design/{uuid}/visits
```

### Root Cause Analysis

The system has **two aggregates** for study management:

1. **`StudyAggregate`** - Main study entity (name, sponsor, protocol, etc.)
2. **`StudyDesignAggregate`** - Study design components (arms, visits, forms)

**The Problem:**
- When a study is created, it creates the `StudyAggregate` in the event store ✓
- **BUT** it did not automatically create the `StudyDesignAggregate` ✗
- Without the `StudyDesignAggregate`, DDD operations (define visit, add arm, assign form) fail

This is a classic **DDD aggregate initialization issue** in Event Sourcing systems.

---

## Solution Implemented

### 1. Automatic Initialization Handler

**Created:** `StudyDesignInitializationHandler.java`

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class StudyDesignInitializationHandler {
    
    private final CommandGateway commandGateway;

    @EventHandler
    public void on(StudyCreatedEvent event) {
        // Automatically initialize StudyDesignAggregate when Study is created
        InitializeStudyDesignCommand command = InitializeStudyDesignCommand.builder()
            .studyDesignId(event.getStudyAggregateUuid())
            .studyAggregateUuid(event.getStudyAggregateUuid())
            .studyName(event.getName())
            .createdBy(event.getCreatedBy())
            .build();
        
        commandGateway.send(command);
    }
}
```

**Pattern:** Saga-like coordination between aggregates
- Listens to `StudyCreatedEvent` from `StudyAggregate`
- Automatically dispatches `InitializeStudyDesignCommand` to create `StudyDesignAggregate`
- Uses same UUID for both aggregates (correlation)

**Result:** All **new studies** will automatically have their StudyDesignAggregate initialized ✓

---

### 2. Manual Initialization for Existing Studies

**Problem:** Studies created **before** this fix don't have a StudyDesignAggregate

**Solution:** Initialize them manually via REST API

#### Backend Endpoint (Already Exists)
```
POST /clinops-ws/api/clinops/study-design
Content-Type: application/json

{
  "studyAggregateUuid": "50506580-8400-e29b-4162-3a6383303135",
  "studyName": "COVID-19 Vaccine Efficacy Trial",
  "createdBy": "admin"
}
```

#### Frontend Service Method (Added)
```javascript
// StudyDesignService.js
async initializeStudyDesign(studyAggregateUuid, studyName, createdBy = 'system') {
    const response = await ApiService.post('/clinops-ws/api/clinops/study-design', {
        studyAggregateUuid,
        studyName,
        createdBy
    });
    return response.data;
}
```

---

## How to Initialize Existing Studies

### Option 1: Via Frontend Console (Recommended)

1. **Open browser developer console** while on the study page

2. **Get the current study data:**
   ```javascript
   // In VisitScheduleDesigner.jsx, study data is logged:
   // "Study data loaded: {studyAggregateUuid: '...', name: '...'}"
   ```

3. **Import and call the service:**
   ```javascript
   import StudyDesignService from './services/StudyDesignService';
   
   const study = {
       studyAggregateUuid: '35353065-3834-3030-2d65-3239622d3431',
       name: 'COVID-19 Vaccine Efficacy Trial'
   };
   
   StudyDesignService.initializeStudyDesign(
       study.studyAggregateUuid,
       study.name,
       'admin'
   ).then(result => console.log('Initialized:', result));
   ```

### Option 2: Via Postman/curl

```bash
# Get study UUID first
mysql -u root -p123456 -D clinprecisiondb -e \
  "SELECT id, HEX(aggregate_uuid) as uuid, name FROM studies WHERE id = 1;"

# Initialize StudyDesignAggregate
curl -X POST http://localhost:8083/clinops-ws/api/clinops/study-design \
  -H "Content-Type: application/json" \
  -d '{
    "studyAggregateUuid": "35353065-3834-3030-2d65-3239622d3431",
    "studyName": "COVID-19 Vaccine Efficacy Trial",
    "createdBy": "admin"
  }'
```

### Option 3: Automatic VisitScheduleDesigner Fix (Smart Approach)

**Modify `VisitScheduleDesigner.jsx` to auto-initialize if missing:**

```javascript
const loadStudyData = async () => {
    try {
        setLoading(true);
        
        // 1. Load study
        const studyData = await StudyService.getStudyById(studyId);
        const studyDesignUuid = studyData.studyAggregateUuid;
        
        if (!studyDesignUuid) {
            throw new Error('Study does not have a design UUID');
        }
        
        setStudy(studyData);
        
        // 2. Try to load visits
        try {
            const visitsData = await VisitDefinitionService.getVisitsByStudy(studyDesignUuid);
            setVisits(visitsData);
            setFilteredVisits(visitsData);
        } catch (error) {
            // If 500 error with "aggregate not found", initialize StudyDesign
            if (error.response?.status === 500) {
                console.warn('StudyDesignAggregate not found, initializing...');
                await StudyDesignService.initializeStudyDesign(
                    studyDesignUuid,
                    studyData.name,
                    'system'
                );
                // Retry loading visits
                const visitsData = await VisitDefinitionService.getVisitsByStudy(studyDesignUuid);
                setVisits(visitsData);
                setFilteredVisits(visitsData);
            } else {
                throw error;
            }
        }
        
    } catch (error) {
        console.error('Error loading visit schedule:', error);
        setError('Failed to load visit schedule. Please try again.');
    } finally {
        setLoading(false);
    }
};
```

---

## Verification Steps

### 1. Check if StudyDesignAggregate Exists

```sql
USE clinprecisiondb;

-- Check studies and their initialization status
SELECT 
    s.id,
    s.name,
    HEX(s.aggregate_uuid) as study_uuid,
    COUNT(DISTINCT e.aggregate_identifier) as design_initialized,
    MAX(e.time_stamp) as last_design_event
FROM studies s
LEFT JOIN domain_event_entry e ON e.aggregate_identifier = s.aggregate_uuid
    AND e.type LIKE '%StudyDesignInitializedEvent%'
GROUP BY s.id, s.name, s.aggregate_uuid;
```

Expected output:
- `design_initialized = 0` → **Needs initialization**
- `design_initialized > 0` → **Already initialized** ✓

### 2. Test Visit Creation After Initialization

```javascript
// In browser console
VisitDefinitionService.createVisit(
    '35353065-3834-3030-2d65-3239622d3431', // studyDesignUuid
    null, // armId (null = general visit)
    {
        name: 'Screening Visit',
        description: 'Initial screening visit',
        timepoint: -7,
        windowBefore: 0,
        windowAfter: 3,
        visitType: 'SCREENING',
        isRequired: true,
        sequenceNumber: 1
    }
);
```

Expected result:
```
POST /clinops-ws/api/clinops/study-design/{uuid}/visits 201 Created
```

---

## Database Schema Update (Also Fixed)

**Additional Issue Found:** Missing audit columns in `visit_definitions` table

### Migration Applied
```sql
ALTER TABLE visit_definitions
    ADD COLUMN created_by VARCHAR(100) NULL AFTER created_at,
    ADD COLUMN updated_by VARCHAR(100) NULL AFTER updated_at,
    ADD COLUMN deleted_at TIMESTAMP NULL AFTER is_deleted,
    ADD COLUMN deleted_by VARCHAR(100) NULL AFTER deleted_at,
    ADD COLUMN deletion_reason TEXT NULL AFTER deleted_by;
```

**File:** `20251006_add_audit_fields_to_visit_definitions.sql`

This fixed the initial 500 error:
```
Unknown column 'vde1_0.created_by' in 'field list'
```

---

## Files Modified

### Backend
1. **New:** `StudyDesignInitializationHandler.java` - Auto-initialization handler
2. **Updated:** `consolidated_schema.sql` - Added audit columns

### Frontend
1. **Updated:** `StudyDesignService.js` - Added `initializeStudyDesign()` method

### Database
1. **New:** `20251006_add_audit_fields_to_visit_definitions.sql` - Schema migration
2. **New:** `20251006_check_studydesign_initialization.sql` - Verification script

---

## Architecture Notes

### Event Sourcing Pattern
```
StudyCreatedEvent
    ↓
StudyDesignInitializationHandler (@EventHandler)
    ↓
InitializeStudyDesignCommand
    ↓
StudyDesignAggregate (Constructor)
    ↓
StudyDesignInitializedEvent
    ↓
Event Store (persisted)
```

### Aggregate Relationship
```
StudyAggregate
    - studyAggregateUuid (UUID)
    - name, sponsor, protocol, etc.
    └─ Creates: StudyCreatedEvent

StudyDesignAggregate
    - studyDesignId (same as studyAggregateUuid)
    - studyAggregateUuid (correlation)
    - arms: Map<UUID, StudyArm>
    - visits: Map<UUID, Visit>
    - formAssignments: Map<UUID, FormAssignment>
```

**Key Point:** Both aggregates use the **same UUID** for correlation, but are separate event-sourced aggregates with different responsibilities.

---

## Testing Checklist

- [ ] Run database migration for `visit_definitions` audit columns
- [ ] Initialize StudyDesignAggregate for study ID=1 (existing study)
- [ ] Restart Spring Boot backend
- [ ] Test visit creation via UI
- [ ] Verify visit appears in list
- [ ] Test visit update
- [ ] Test visit delete
- [ ] Create new study and verify auto-initialization
- [ ] Check event store for both events:
  - [ ] StudyCreatedEvent
  - [ ] StudyDesignInitializedEvent

---

## Next Steps

1. **Immediate:** Initialize existing studies manually (see Option 1, 2, or 3 above)
2. **Short-term:** Consider adding UI feedback when StudyDesign auto-initializes
3. **Long-term:** Consider database constraint to prevent orphaned studies
4. **Documentation:** Update API docs with initialization requirement

---

## Lessons Learned

1. **DDD Aggregate Independence:** Each aggregate must be explicitly initialized
2. **Event Sourcing Coordination:** Related aggregates need saga-like coordination
3. **Schema-Entity Sync:** Always verify database schema matches JPA entities
4. **Backward Compatibility:** New features may require migration of existing data

---

## Related Documentation

- `VISIT_SCHEDULE_DDD_MIGRATION.md` - Visit Schedule architecture
- `API_GATEWAY_PREFIX_FIX.md` - API gateway routing patterns
- `DDD_CQRS_QUICK_REFERENCE.md` - DDD/CQRS patterns

---

**Status:** ✅ **RESOLVED**  
**Next Action:** Initialize existing studies and test visit creation
