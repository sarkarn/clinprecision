# Planned Date Fields Migration Summary

## Overview
Migrated from ambiguous `startDate`/`endDate` fields to explicit `plannedStartDate`/`plannedEndDate` fields throughout the entire application stack.

**Date:** October 21, 2025  
**Issue:** Dates weren't showing in UI after backend refactoring  
**Root Cause:** Frontend using `startDate`/`endDate` but backend expecting `plannedStartDate`/`plannedEndDate`

---

## Backend Changes ✅

### 1. Commands (CQRS Layer)
**Files Updated:**
- `CreateStudyCommand.java` - Removed `startDate`/`endDate`, kept only `plannedStartDate`/`plannedEndDate`
- `UpdateStudyCommand.java` - Removed `startDate`/`endDate`, kept only `plannedStartDate`/`plannedEndDate`

### 2. Events (Event Sourcing Layer)
**Files Updated:**
- `StudyCreatedEvent.java` - Removed `startDate`/`endDate` fields
- `StudyUpdatedEvent.java` - Removed `startDate`/`endDate` fields

### 3. DTOs (API Layer)
**Files Updated:**
- `StudyCreateRequestDto.java` - Removed `startDate`/`endDate` fields
- `StudyUpdateRequestDto.java` - Removed `startDate`/`endDate` fields
- `StudyResponseDto.java` - Returns `plannedStartDate`/`plannedEndDate`

### 4. Mappers
**Files Updated:**
- `StudyCommandMapper.java` - Maps `plannedStartDate`/`plannedEndDate` to commands
- `StudyResponseMapper.java` - Maps DB `startDate` → response `plannedStartDate`, DB `endDate` → response `plannedEndDate`

### 5. Domain & Projection
**Files Updated:**
- `StudyAggregate.java` - Event builders and handlers use `plannedStartDate`/`plannedEndDate`
- `StudyProjection.java` - Projection handlers use `plannedStartDate`/`plannedEndDate` from events
- `StudyCommandService.java` - Legacy migration service updated

### 6. Tests
**Files Updated:**
- `StudyDDDIntegrationTest.java` - Updated test to use `.plannedStartDate()`/`.plannedEndDate()`

**Database Schema:**
- No changes required - `start_date`/`end_date` columns now unambiguously store planned dates
- Columns semantically represent planned dates going forward

---

## Frontend Changes ✅

### 1. Form Components
**File:** `TimelinePersonnelStep.jsx`
- Changed field names: `startDate` → `plannedStartDate`, `endDate` → `plannedEndDate`
- Updated labels: "Start Date" → "Planned Start Date", "End Date" → "Planned End Date"
- Updated `handleDateChange` logic to use `plannedStartDate`/`plannedEndDate`
- Updated auto-calculation of estimated duration

**File:** `StudyCreationWizard.jsx`
- Updated validation logic: `formData.startDate` → `formData.plannedStartDate`
- Updated error messages to mention "planned" dates

**File:** `ReviewConfirmationStep.jsx`
- Changed display: `formData.startDate` → `formData.plannedStartDate`
- Changed display: `formData.endDate` → `formData.plannedEndDate`
- Updated labels to "Planned Start Date" and "Planned End Date"

### 2. Display/View Components
**File:** `StudyViewPage.jsx`
- Changed display: `study.startDate` → `study.plannedStartDate`
- Changed display: `study.endDate` → `study.plannedEndDate`
- Updated labels to "Planned Start Date" and "Planned End Date"

**File:** `StudyEditPage.jsx`
- Changed input names: `startDate` → `plannedStartDate`, `endDate` → `plannedEndDate`
- Changed values: `study.startDate` → `study.plannedStartDate`, `study.endDate` → `study.plannedEndDate`
- Updated labels to "Planned Start Date" and "Planned End Date"

---

## API Contract

### Request (POST /api/studies)
```json
{
  "name": "Phase III Clinical Trial",
  "plannedStartDate": "2025-01-01",
  "plannedEndDate": "2026-12-31",
  "principalInvestigator": "Dr. Jane Smith",
  ...
}
```

### Response (GET /api/studies/{uuid})
```json
{
  "studyAggregateUuid": "...",
  "name": "Phase III Clinical Trial",
  "plannedStartDate": "2025-01-01",
  "plannedEndDate": "2026-12-31",
  "principalInvestigator": "Dr. Jane Smith",
  ...
}
```

---

## Event Store Migration

**Action Taken:** Event store truncated in development environment
- Old events with `startDate`/`endDate` were causing XStream deserialization errors
- Truncating event store provided clean slate for new field structure

**For Production Migration:**
If event store contains historical events with old field names, configure XStream field aliasing:
```java
@Bean
public XStream xStream() {
    XStream xStream = new XStream();
    // Map old field names to new ones
    xStream.aliasField("plannedStartDate", StudyCreatedEvent.class, "startDate");
    xStream.aliasField("plannedEndDate", StudyCreatedEvent.class, "endDate");
    xStream.aliasField("plannedStartDate", StudyUpdatedEvent.class, "startDate");
    xStream.aliasField("plannedEndDate", StudyUpdatedEvent.class, "endDate");
    return xStream;
}
```

---

## Testing Checklist

### Backend
- [x] Compilation successful (main code)
- [x] Compilation successful (test code)
- [x] Unit tests pass
- [x] Integration tests pass

### Frontend
- [ ] Create study with planned dates → verify saved
- [ ] View study → verify planned dates display
- [ ] Edit study → verify planned dates editable
- [ ] Validate date logic (start < end)
- [ ] Verify estimated duration calculation
- [ ] Check study list displays dates correctly

### End-to-End
- [ ] Create study → retrieve → verify dates match
- [ ] Update study dates → retrieve → verify updated dates
- [ ] Check date validation errors display correctly

---

## Benefits of This Change

1. **Clear Semantics:** "Planned" dates vs "Actual" dates are now distinguishable
2. **Future Extensibility:** Can add `actualStartDate`/`actualEndDate` later without confusion
3. **API Clarity:** API consumers know exactly what the dates represent
4. **Single Source of Truth:** One set of date fields throughout the codebase
5. **Reduced Confusion:** Eliminates ambiguity between study planning vs execution dates

---

## Next Steps

1. ✅ Backend refactoring complete
2. ✅ Frontend refactoring complete
3. ⏳ Test end-to-end flow (create → view → edit)
4. ⏳ Verify UI displays planned dates correctly
5. ⏳ Add `primaryEndpoint` field to form (currently missing)

---

## Notes

- Database column names (`start_date`, `end_date`) remain unchanged for backward compatibility
- Columns now semantically represent "planned" dates in the business logic
- Future schema migration could rename columns to `planned_start_date`/`planned_end_date` if desired
- XStream serialization issue avoided by truncating event store in development
