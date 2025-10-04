# Study Status Null Bug - ROOT CAUSE FOUND

## 🎯 Root Cause Identified

**The bug is NOT in protocol version creation!** The bug happens when the study is **updated after version creation**.

## 📊 Timeline from Your Logs

```
12:29:19 - Create protocol version v1.0
           BEFORE: Study 10 status = PLANNING ✅
           AFTER: Study 10 status = PLANNING ✅

12:29:25 - Update version status to UNDER_REVIEW
           (This triggers something...)

[Something happens between 12:29:25 and 12:29:48]

12:29:48 - GET /api/studies/10/overview
           Study 10 status = NULL ❌
```

**Key Finding**: Status is fine immediately after version creation, but becomes NULL 29 seconds later!

## 🐛 The Bug Explained

### Hypothesis: Partial Study Update

The frontend likely calls `PUT /api/studies/{id}` with partial data that **doesn't include `studyStatusId`**.

### Code Path Analysis

1. **Backend receives update** (`StudyService.updateStudy`):
   ```java
   StudyEntity existingStudy = studyRepository.findByIdWithAllRelationships(id);
   // Status is PLANNING here ✅
   ```

2. **Mapper updates fields** (`StudyMapper.updateEntityFromDto`):
   ```java
   if (dto.getStudyStatusId() != null) {  // FALSE when DTO doesn't include it
       entity.setStudyStatus(studyStatus);
   }
   // Does nothing - keeps existing studyStatus field
   ```

3. **Entity saved**:
   ```java
   StudyEntity updatedStudy = studyRepository.save(existingStudy);
   ```

4. **Potential JPA Issue**:
   - Entity's `studyStatus` field might be lazy proxy
   - If not initialized properly during transaction
   - JPA merge writes NULL to database

## ✅ Fixes Applied

### 1. Comprehensive Logging in `StudyService.updateStudy()`

Now logs:
- Study status BEFORE update (from database)
- DTO includes statusId or not
- Study status BEFORE save (in memory)
- Study status AFTER save (from database)
- **CRITICAL alert** if status was cleared during save

### 2. Defensive Logging in `StudyMapper`

Now logs:
- When DTO doesn't include statusId (preserving existing)
- When statusId lookup fails

## 🔬 Next Steps - Please Test

1. **Rebuild backend**:
   ```powershell
   cd c:\nnsproject\clinprecision\backend\clinprecision-clinops-service
   mvn clean install
   ```

2. **Restart clinops-service**

3. **Repeat your test**:
   - Create study with PLANNING status
   - Create protocol version  
   - Change version status to UNDER_REVIEW

4. **Check logs for**:
   ```
   PUT /api/studies/{id} - Updating study
   BEFORE update - Study X status: PLANNING, DTO statusId: null
   ```

   If you see this, it confirms the frontend is updating the study!

5. **Look for CRITICAL alert**:
   ```
   ⚠️ CRITICAL: Study X status was cleared during save operation!
   ```

## 🎯 What Logs Will Tell Us

### Scenario A: Frontend Updates Study
```
12:29:25 - PUT /api/studies/10 - Updating study
12:29:25 - BEFORE update - Study 10 status: PLANNING, DTO statusId: null
12:29:25 - BEFORE save - Study 10 status: PLANNING
12:29:25 - AFTER save - Study 10 status: NULL
12:29:25 - ⚠️ CRITICAL: Study 10 status was cleared during save operation!
```
**This means**: JPA is clearing status during save even though it was present

### Scenario B: No Study Update
```
(No PUT /api/studies calls between version creation and overview fetch)
```
**This means**: Something else is touching the study (cascade, trigger, etc.)

## 🔧 Permanent Fix (After Confirmation)

### If Scenario A (Most Likely):

**Option 1**: Add explicit preservation in mapper:
```java
if (dto.getStudyStatusId() != null) {
    entity.setStudyStatus(newStatus);
} else if (entity.getStudyStatus() != null) {
    // Explicitly reassign to prevent JPA from clearing it
    StudyStatusEntity currentStatus = entity.getStudyStatus();
    entity.setStudyStatus(currentStatus);
}
```

**Option 2**: Frontend always includes statusId:
```javascript
const updatePayload = {
    ...changes,
    studyStatusId: study.studyStatus?.id  // Always include
};
```

### If Scenario B:

Need to investigate:
- Database triggers
- JPA cascade operations from other entities
- Entity event listeners

## 📝 Files Modified

1. **StudyService.java**
   - Added logging before update
   - Added logging before/after save
   - Added critical alert for status clearing

2. **StudyMapper.java**
   - Added debug logging when statusId not in DTO
   - Added warning when statusId lookup fails

Run the test and share the logs - they'll tell us exactly what's happening! 🔍
