# Form Binding DDD - Testing Guide

## Quick Test Checklist

### Prerequisites
- [x] Backend service restarted (to load new controller code)
- [x] Frontend running
- [x] MySQL database with updated schema (audit columns added)
- [x] Study ID 11 with visits created

---

## Test 1: Create Form Binding

### Steps:
1. Navigate to Study Design for study ID 11
2. Go to "Form Binding" phase
3. Click on a cell in the matrix to assign a form to a visit
4. Observe the binding appears (green circle for required, yellow for optional)

### Expected Results:
- ✅ Backend logs show: "Assigning form X to visit Y"
- ✅ Backend logs show: "Form binding created with assignment ID: {uuid}"
- ✅ Frontend shows green/yellow circle in matrix
- ✅ No errors in console

### Database Verification:
```sql
-- Check event store
SELECT * FROM domain_event_entry 
WHERE payload_type LIKE '%FormAssignedToVisitEvent%'
ORDER BY timestamp DESC LIMIT 5;

-- Check projection (read model)
SELECT * FROM visit_forms 
WHERE assignment_uuid IS NOT NULL
ORDER BY created_at DESC LIMIT 5;
```

Expected:
- Event in `domain_event_entry` table
- Row in `visit_forms` table with populated UUIDs

---

## Test 2: View Existing Bindings

### Steps:
1. Refresh the browser (F5)
2. Navigate back to Form Binding phase

### Expected Results:
- ✅ Previously created bindings still appear
- ✅ Data loaded from database (not mock)
- ✅ Backend logs show: "Fetching form assignments for design: {uuid}"

### Database Verification:
```sql
SELECT 
    id,
    assignment_uuid,
    visit_uuid,
    form_uuid,
    is_required,
    display_order,
    created_at
FROM visit_forms 
WHERE aggregate_uuid = (
    SELECT study_design_id 
    FROM studies 
    WHERE id = 11
)
AND (is_deleted = 0 OR is_deleted IS NULL);
```

---

## Test 3: Update Form Binding

### Steps:
1. Click on an existing binding (green circle)
2. Binding details panel appears on the right
3. Uncheck "Required Form" (makes it optional)
4. Observe the binding changes from green to yellow

### Expected Results:
- ✅ Backend logs show: "Updating form binding: {uuid}"
- ✅ Backend logs show: "Form binding updated: {uuid}"
- ✅ Circle changes color (green → yellow)
- ✅ No errors

### Database Verification:
```sql
SELECT 
    assignment_uuid,
    is_required,
    updated_at,
    updated_by
FROM visit_forms 
WHERE assignment_uuid = '{uuid-from-test}';
```

Expected:
- `is_required` = 0 (false)
- `updated_at` timestamp changed
- `updated_by` = 1

---

## Test 4: Delete Form Binding

### Steps:
1. Hover over an existing binding
2. Click the small "×" button that appears
3. Confirm deletion
4. Observe the binding disappears

### Expected Results:
- ✅ Backend logs show: "Removing form binding: {uuid}"
- ✅ Backend logs show: "Form binding removed: {uuid}"
- ✅ Circle disappears from matrix
- ✅ No errors

### Database Verification:
```sql
SELECT 
    assignment_uuid,
    is_deleted,
    deleted_at,
    deleted_by,
    deletion_reason
FROM visit_forms 
WHERE assignment_uuid = '{uuid-from-test}';
```

Expected:
- `is_deleted` = 1 (true)
- `deleted_at` timestamp set
- `deleted_by` = "1"
- `deletion_reason` = "User requested removal"

---

## Test 5: Business Rule Validation

### Test 5a: Duplicate Form Assignment
**Steps**:
1. Assign Form #1 to Visit A (success)
2. Try to assign Form #1 to Visit A again

**Expected**:
- ✅ Error message: "This form is already bound to this visit"
- ✅ Backend returns 400 Bad Request
- ✅ Backend logs: "Form 1 is already assigned to visit {uuid}"

### Test 5b: Display Order Conflict
**Note**: This test requires developer tools to manually send request

**Expected**:
- ✅ Error on duplicate display order
- ✅ Backend returns 400 Bad Request

---

## Test 6: Event Replay Verification

### Steps:
1. Create several form bindings
2. Note the assignment UUIDs
3. Restart the backend service
4. Query the aggregate:

```sql
-- Check events were stored
SELECT 
    aggregate_identifier,
    sequence_number,
    type,
    timestamp
FROM domain_event_entry
WHERE aggregate_identifier = '{studyDesignId}'
ORDER BY sequence_number DESC
LIMIT 20;
```

**Expected**:
- All FormAssignedToVisitEvent events present
- Sequential sequence_numbers
- Events can be replayed to reconstruct aggregate

---

## Test 7: Soft Delete Verification

### Steps:
1. Create a binding
2. Delete it
3. Check if it appears in normal queries
4. Check if it's in deleted queries

### Database Verification:
```sql
-- Should NOT appear (filtered out)
SELECT * FROM visit_forms 
WHERE aggregate_uuid = '{studyDesignId}'
AND (is_deleted = 0 OR is_deleted IS NULL);

-- Should appear (includes deleted)
SELECT * FROM visit_forms 
WHERE aggregate_uuid = '{studyDesignId}';
```

---

## Common Issues & Solutions

### Issue 1: "Visit with ID X does not exist"
**Cause**: Visit UUID doesn't exist in StudyDesign aggregate  
**Solution**: Create visits first in Visit Schedule phase

### Issue 2: "Form binding not found"
**Cause**: Trying to update/delete with wrong UUID  
**Solution**: Check assignment_uuid in visit_forms table

### Issue 3: Foreign key constraint violation
**Cause**: Entity still has NOT NULL FK constraints  
**Solution**: Verify VisitFormEntity has `nullable = true` for visitDefinition/formDefinition

### Issue 4: "Unknown column 'created_by'"
**Cause**: Database schema not updated  
**Solution**: Run migration script: `fix_visit_forms_audit_columns.sql`

---

## Backend Log Analysis

### Successful Create Flow:
```
REST: Assigning form 1 to visit {uuid} for study: 11
REST: Using StudyDesignId: {uuid} for study: 11
Assigning form: {formUuid} to visit: {visitUuid} in study design: {studyDesignId}
Projecting FormAssignedToVisitEvent - Assignment: {assignmentUuid}
Form assignment entity saved: {assignmentUuid}
REST: Form binding created with assignment ID: {assignmentUuid}
```

### Successful Update Flow:
```
REST: Updating form binding: {assignmentUuid}
Updating form assignment: {assignmentUuid} in design: {studyDesignId}
Projecting FormAssignmentUpdatedEvent - Assignment: {assignmentUuid}
Form assignment entity updated: {assignmentUuid}
REST: Form binding updated: {assignmentUuid}
```

### Successful Delete Flow:
```
REST: Removing form binding: {assignmentUuid}
Removing form assignment: {assignmentUuid} from design: {studyDesignId}
Projecting FormAssignmentRemovedEvent - Assignment: {assignmentUuid}
Form assignment entity marked deleted: {assignmentUuid}
REST: Form binding removed: {assignmentUuid}
```

---

## Performance Benchmarks

### Target Performance:
- Create binding: < 200ms
- Update binding: < 150ms
- Delete binding: < 150ms
- Query bindings: < 100ms

### Monitoring:
```sql
-- Check event store growth
SELECT COUNT(*) FROM domain_event_entry;

-- Check projection updates
SELECT COUNT(*) FROM visit_forms WHERE assignment_uuid IS NOT NULL;

-- Check soft deletes
SELECT COUNT(*) FROM visit_forms WHERE is_deleted = 1;
```

---

## Success Criteria

✅ **All tests must pass**:
- [ ] Create binding → persists to DB
- [ ] View bindings → loads from DB after refresh
- [ ] Update binding → changes persist
- [ ] Delete binding → soft-deletes correctly
- [ ] Business rules enforced
- [ ] Event replay works
- [ ] No errors in console or logs

---

## Next Steps After Testing

1. **If all tests pass**:
   - Document any edge cases found
   - Consider implementing async command processing
   - Plan migration of Forms to event sourcing

2. **If tests fail**:
   - Check backend logs for exact error
   - Verify database schema (audit columns present)
   - Confirm entity FKs are nullable
   - Check event store for events
   - Verify projection handlers executed

3. **Performance tuning** (if needed):
   - Add caching for frequently queried bindings
   - Implement async command processing
   - Optimize projection queries

---

## Debug Queries

### Find Recent Events:
```sql
SELECT 
    aggregate_identifier,
    sequence_number,
    type,
    timestamp,
    payload
FROM domain_event_entry
WHERE type LIKE '%FormAssignment%'
ORDER BY timestamp DESC
LIMIT 10;
```

### Find Bindings for Study:
```sql
SELECT 
    vf.*,
    vd.name as visit_name,
    fd.name as form_name
FROM visit_forms vf
LEFT JOIN visit_definitions vd ON vf.visit_definition_id = vd.id
LEFT JOIN form_definitions fd ON vf.form_definition_id = fd.id
WHERE vf.aggregate_uuid = (
    SELECT study_design_id FROM studies WHERE id = 11
)
ORDER BY vf.created_at DESC;
```

### Check Aggregate Consistency:
```sql
-- Count events
SELECT 
    aggregate_identifier,
    COUNT(*) as event_count,
    MAX(sequence_number) as max_sequence
FROM domain_event_entry
WHERE aggregate_identifier = '{studyDesignId}'
GROUP BY aggregate_identifier;

-- Count projections
SELECT 
    COUNT(*) as total_bindings,
    SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as deleted_count
FROM visit_forms
WHERE aggregate_uuid = '{studyDesignId}';
```

---

## Rollback Plan

If issues occur and you need to rollback:

```sql
-- Remove events (DANGER: This removes event history)
DELETE FROM domain_event_entry 
WHERE type LIKE '%FormAssignment%'
AND timestamp > '{timestamp-before-testing}';

-- Remove projections
DELETE FROM visit_forms 
WHERE assignment_uuid IS NOT NULL;

-- OR just soft-delete all new bindings
UPDATE visit_forms 
SET is_deleted = 1, deleted_at = NOW(), deletion_reason = 'Rollback'
WHERE assignment_uuid IS NOT NULL AND created_at > '{timestamp-before-testing}';
```

**WARNING**: Only use in development environment!

---

## Congratulations! 🎉

Once all tests pass, you have a **fully functional DDD/CQRS/Event Sourcing implementation** for form bindings!

This is a significant milestone in the DDD migration journey and demonstrates:
- ✅ Proper aggregate design
- ✅ Command handling with business rules
- ✅ Event sourcing with event store
- ✅ Projection to read model
- ✅ Bridge pattern for legacy compatibility
- ✅ Full CRUD via events
