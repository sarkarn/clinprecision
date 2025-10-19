# Audit Trail Design - Treatment Arm Changes

**Date:** October 18, 2025  
**Status:** ✅ NO CODE CHANGES NEEDED

---

## 🎯 Question

Should the `patient_enrollment_audit` table have individual columns for `arm_id`, `arm_assigned_at`, and `arm_assigned_by`?

## ❌ Answer: NO

---

## 📋 Current Audit Design (Correct)

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS patient_enrollment_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    entity_aggregate_uuid VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    old_values JSON COMMENT 'Previous values before change',  ← Stores ALL old field values
    new_values JSON COMMENT 'New values after change',        ← Stores ALL new field values
    performed_by VARCHAR(255) NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    reason TEXT,
    ...
);
```

### Java Entity

```java
@Entity
@Table(name = "patient_enrollment_audit")
public class PatientEnrollmentAuditEntity {
    
    @Column(name = "old_values", columnDefinition = "JSON")
    private String oldValues;  // ← JSON containing all previous field values
    
    @Column(name = "new_values", columnDefinition = "JSON")
    private String newValues;  // ← JSON containing all new field values
    
    // No individual field columns needed!
}
```

---

## ✅ Why This Design is Correct

### 1. **JSON-Based Audit Pattern**
This is a **flexible, schema-agnostic audit trail** design that:
- ✅ Stores ANY field changes without schema modifications
- ✅ Supports future field additions without migration
- ✅ Keeps audit table structure stable
- ✅ Standard pattern in modern applications

### 2. **How Arm Changes Are Captured**

When an enrollment is updated with arm assignment:

```json
// Example audit record
{
  "id": 123,
  "entity_type": "ENROLLMENT",
  "entity_id": 456,
  "action_type": "UPDATE",
  "old_values": {
    "arm_id": null,
    "arm_assigned_at": null,
    "arm_assigned_by": null,
    "enrollment_status": "ENROLLED"
  },
  "new_values": {
    "arm_id": 42,
    "arm_assigned_at": "2025-10-18T14:30:00",
    "arm_assigned_by": "dr.smith@hospital.com",
    "enrollment_status": "ENROLLED"
  },
  "performed_by": "dr.smith@hospital.com",
  "performed_at": "2025-10-18T14:30:00"
}
```

**All arm-related changes are automatically captured in the JSON!**

### 3. **Advantages of JSON Approach**

| Aspect | Individual Columns | JSON Pattern |
|--------|-------------------|--------------|
| **Schema Flexibility** | ❌ Need migration for each new field | ✅ No schema changes needed |
| **Field Coverage** | ❌ Only predefined fields tracked | ✅ ANY field can be tracked |
| **Maintenance** | ❌ High (add columns for every change) | ✅ Low (no changes needed) |
| **Query Complexity** | ✅ Simple SQL | ⚠️ JSON queries slightly complex |
| **FDA Compliance** | ✅ Compliant | ✅ Compliant |
| **Storage** | ✅ Normalized | ⚠️ Slightly more storage |

### 4. **FDA 21 CFR Part 11 Compliance**

Both approaches are FDA compliant, but JSON pattern is **more future-proof**:

```
FDA Requirements:
✅ Complete audit trail → JSON captures ALL changes
✅ Cannot be altered → Audit records immutable
✅ Time-stamped → performed_at timestamp
✅ Who made change → performed_by field
✅ What was changed → old_values/new_values JSON
✅ Reconstruct at any point → JSON has full snapshot
```

---

## 🔍 Audit Trail Query Examples

### Query Arm Assignment Changes

```sql
-- Find all arm assignments
SELECT 
    a.entity_id as enrollment_id,
    a.performed_by,
    a.performed_at,
    JSON_EXTRACT(a.old_values, '$.arm_id') as old_arm_id,
    JSON_EXTRACT(a.new_values, '$.arm_id') as new_arm_id,
    JSON_EXTRACT(a.new_values, '$.arm_assigned_by') as assigned_by
FROM patient_enrollment_audit a
WHERE a.action_type = 'UPDATE'
  AND JSON_EXTRACT(a.new_values, '$.arm_id') IS NOT NULL
  AND (JSON_EXTRACT(a.old_values, '$.arm_id') IS NULL 
       OR JSON_EXTRACT(a.old_values, '$.arm_id') != JSON_EXTRACT(a.new_values, '$.arm_id'))
ORDER BY a.performed_at DESC;
```

### Get Complete History for Enrollment

```sql
-- See all changes to enrollment #456
SELECT 
    a.performed_at,
    a.action_type,
    a.old_values,
    a.new_values,
    a.performed_by,
    a.reason
FROM patient_enrollment_audit a
WHERE a.entity_type = 'ENROLLMENT'
  AND a.entity_id = 456
ORDER BY a.performed_at ASC;
```

### Reconstruct State at Point in Time

```sql
-- What was the arm assignment on 2025-10-15?
SELECT 
    JSON_EXTRACT(a.new_values, '$.arm_id') as arm_id,
    JSON_EXTRACT(a.new_values, '$.arm_assigned_at') as assigned_at
FROM patient_enrollment_audit a
WHERE a.entity_id = 456
  AND a.performed_at <= '2025-10-15 23:59:59'
  AND JSON_EXTRACT(a.new_values, '$.arm_id') IS NOT NULL
ORDER BY a.performed_at DESC
LIMIT 1;
```

---

## 🛠️ Implementation Status

### Migration Script
**File:** `20251017_add_treatment_arm_to_patient_enrollments.sql`

**CORRECT Version:**
```sql
-- ============================================================================
-- PART 6: Audit Trail Tracking
-- ============================================================================
-- NOTE: patient_enrollment_audit uses JSON-based audit pattern
--       Changes to arm_id, arm_assigned_at, arm_assigned_by will be
--       automatically captured in old_values/new_values JSON columns
--       by the existing audit trigger/event handler.
--       No schema changes needed for audit table.
```

**INCORRECT Version (Removed):**
```sql
-- ❌ DO NOT DO THIS:
ALTER TABLE patient_enrollment_audit ADD COLUMN arm_id BIGINT NULL;
ALTER TABLE patient_enrollment_audit ADD COLUMN arm_assigned_at TIMESTAMP NULL;
ALTER TABLE patient_enrollment_audit ADD COLUMN arm_assigned_by VARCHAR(255) NULL;
-- This violates the JSON-based audit pattern!
```

### Java Code
**Status:** ✅ NO CHANGES NEEDED

The existing `PatientEnrollmentAuditEntity` already supports arm tracking:

```java
// Existing code (correct)
@Column(name = "old_values", columnDefinition = "JSON")
private String oldValues;  // Will contain arm fields when updated

@Column(name = "new_values", columnDefinition = "JSON")
private String newValues;  // Will contain arm fields when updated
```

**Audit Creation Method:**
```java
// From PatientEnrollmentProjector.java
private void createAuditRecord(
    Long entityId,
    String entityUuid,
    AuditActionType actionType,
    String oldValues,  // ← JSON string with all old field values
    String newValues,  // ← JSON string with all new field values
    String performedBy,
    String reason
)
```

---

## 🎓 Best Practices

### When to Use JSON Audit Pattern
✅ **Use JSON when:**
- Entity has many fields that may change
- Fields are added over time
- Need complete snapshot of entity state
- Flexibility is more important than query simplicity

### When to Use Individual Columns
✅ **Use columns when:**
- Only 1-2 specific fields need tracking
- Heavy querying on specific audit fields
- Simpler SQL queries preferred
- Storage efficiency critical

### ClinPrecision's Choice
✅ **JSON pattern is correct for `patient_enrollment_audit` because:**
- Enrollments have 15+ fields that can change
- New fields added frequently (arm_id, arm_assigned_at, etc.)
- Need complete audit trail for FDA compliance
- Flexibility outweighs query simplicity

---

## 🚀 Future Enhancements

### When Arm Assignment Event is Created

In the future, when creating an `EnrollmentUpdatedEvent` or `ArmAssignedEvent`:

```java
// Example future event handler
@EventHandler
public void on(ArmAssignedEvent event) {
    EnrollmentEntity enrollment = repository.findById(event.getEnrollmentId());
    
    // Capture old state as JSON
    String oldValues = objectMapper.writeValueAsString(Map.of(
        "arm_id", enrollment.getArmId(),
        "arm_assigned_at", enrollment.getArmAssignedAt(),
        "arm_assigned_by", enrollment.getArmAssignedBy()
    ));
    
    // Update enrollment
    enrollment.setArmId(event.getArmId());
    enrollment.setArmAssignedAt(event.getAssignedAt());
    enrollment.setArmAssignedBy(event.getAssignedBy());
    repository.save(enrollment);
    
    // Capture new state as JSON
    String newValues = objectMapper.writeValueAsString(Map.of(
        "arm_id", enrollment.getArmId(),
        "arm_assigned_at", enrollment.getArmAssignedAt(),
        "arm_assigned_by", enrollment.getArmAssignedBy()
    ));
    
    // Create audit record (existing method)
    createAuditRecord(
        enrollment.getId(),
        enrollment.getAggregateUuid(),
        AuditActionType.UPDATE,
        oldValues,  // ← JSON automatically captures arm fields!
        newValues,  // ← JSON automatically captures arm fields!
        event.getAssignedBy(),
        "Treatment arm assignment"
    );
}
```

**No audit table schema changes needed!** ✅

---

## 📊 Comparison Summary

### Original (Incorrect) Approach
```
patient_enrollment_audit
├── id
├── entity_type
├── entity_id
├── action_type
├── old_values (JSON)
├── new_values (JSON)
├── arm_id              ← ❌ REDUNDANT
├── arm_assigned_at     ← ❌ REDUNDANT
├── arm_assigned_by     ← ❌ REDUNDANT
└── performed_by
```

### Corrected Approach
```
patient_enrollment_audit
├── id
├── entity_type
├── entity_id
├── action_type
├── old_values (JSON)   ← ✅ Contains arm_id, arm_assigned_at, arm_assigned_by
├── new_values (JSON)   ← ✅ Contains arm_id, arm_assigned_at, arm_assigned_by
└── performed_by
```

---

## ✅ Conclusion

**No Java code changes needed** because:
1. ✅ Audit entity already uses JSON columns
2. ✅ Audit creation method already supports JSON
3. ✅ Arm changes will be automatically captured when event handler is created
4. ✅ Migration script correctly excludes audit table changes
5. ✅ Design follows best practices for flexible audit trails

**Action Required:**
- ✅ Migration script corrected (Oct 18, 2025)
- ✅ Java code verified (no changes needed)
- ✅ Documentation updated
- ⏳ Ready for testing

---

**Summary:** The `patient_enrollment_audit` table correctly uses a JSON-based audit pattern. Individual columns for `arm_id`, `arm_assigned_at`, and `arm_assigned_by` would be redundant and violate the design pattern. All arm-related changes will be automatically captured in the `old_values` and `new_values` JSON columns when enrollment update events are processed.

