# Date Validation Guide

## Overview

Enhanced date validation has been implemented for clinical trial data capture to ensure data quality and prevent common data entry errors.

## Date Validation Rules

### 1. **Future Date Validation** (Default: Not Allowed)

**Rule**: By default, dates in the future are **not allowed** for most clinical data.

**Rationale**: Most clinical trial data (adverse events, lab results, visit dates, etc.) are historical and should not be in the future.

**Error Message**: "Date cannot be in the future"

**How to Allow Future Dates**:
```json
{
  "validation": {
    "type": "date",
    "allowFutureDates": true
  }
}
```

**Use Cases for Future Dates**:
- Scheduled visit dates
- Expected delivery dates
- Follow-up appointment dates
- Protocol-defined future milestones

---

### 2. **Very Old Dates** (Warning)

**Rule**: Dates more than 100 years in the past trigger a **warning** (not an error).

**Rationale**: Prevents typos (e.g., entering 1925 instead of 2025) while allowing legitimate old dates for elderly patients.

**Warning Message**: "Date is more than 100 years ago. Please verify."

**Behavior**: 
- Yellow warning (not blocking)
- User can proceed after acknowledging
- Useful for birth dates of elderly participants

---

### 3. **Far Future Dates** (Warning)

**Rule**: When future dates are allowed, dates more than 1 year in the future trigger a **warning**.

**Rationale**: Catches data entry errors (e.g., entering 2035 instead of 2025).

**Warning Message**: "Date is more than 1 year in the future. Please verify."

**Use Case**: 
- Scheduled visits usually within 1 year
- Long-term follow-ups might need this warning dismissed

---

### 4. **Minimum Date Constraint**

**Rule**: Date must be on or after a specified minimum date.

**Configuration**:
```json
{
  "validation": {
    "type": "date",
    "minDate": "2020-01-01"
  }
}
```

**Error Message**: "Date must be on or after 2020-01-01"

**Use Cases**:
- Study start date constraints
- "Cannot be before informed consent date"
- Protocol version effective dates

---

### 5. **Maximum Date Constraint**

**Rule**: Date must be on or before a specified maximum date.

**Configuration**:
```json
{
  "validation": {
    "type": "date",
    "maxDate": "2025-12-31"
  }
}
```

**Error Message**: "Date must be on or before 2025-12-31"

**Use Cases**:
- Study end date constraints
- "Cannot be after study completion"
- Protocol cutoff dates

---

## Configuration Examples

### Example 1: Birth Date Field
```json
{
  "id": "birthDate",
  "type": "date",
  "label": "Date of Birth",
  "metadata": {
    "validation": {
      "required": true,
      "type": "date",
      "allowFutureDates": false,
      "maxDate": "today"
    }
  }
}
```

**Validation**:
- ✅ Required field
- ✅ Must be valid date
- ❌ Cannot be in future
- ⚠️ Warning if > 100 years ago

---

### Example 2: Adverse Event Date
```json
{
  "id": "aeStartDate",
  "type": "date",
  "label": "Adverse Event Start Date",
  "metadata": {
    "validation": {
      "required": true,
      "type": "date",
      "allowFutureDates": false,
      "minDate": "2024-01-01"
    }
  }
}
```

**Validation**:
- ✅ Required field
- ✅ Must be valid date
- ❌ Cannot be in future
- ❌ Cannot be before study start (2024-01-01)

---

### Example 3: Scheduled Visit Date (Future Allowed)
```json
{
  "id": "nextVisitDate",
  "type": "date",
  "label": "Next Scheduled Visit",
  "metadata": {
    "validation": {
      "required": true,
      "type": "date",
      "allowFutureDates": true
    }
  }
}
```

**Validation**:
- ✅ Required field
- ✅ Must be valid date
- ✅ Future dates allowed
- ⚠️ Warning if > 1 year in future

---

### Example 4: Date Range Constraint
```json
{
  "id": "visitDate",
  "type": "date",
  "label": "Visit Date",
  "metadata": {
    "validation": {
      "required": true,
      "type": "date",
      "allowFutureDates": false,
      "minDate": "2024-01-01",
      "maxDate": "2025-12-31"
    }
  }
}
```

**Validation**:
- ✅ Required field
- ✅ Must be valid date
- ❌ Cannot be in future
- ❌ Must be between 2024-01-01 and 2025-12-31

---

## Why Enhanced Date Validation?

### Clinical Trial Data Quality Issues

1. **Common Data Entry Errors**:
   - Transposing digits (2025 → 2052)
   - Wrong century (1925 instead of 2025)
   - Copy-paste errors
   - Default date auto-fills

2. **Regulatory Requirements**:
   - 21 CFR Part 11 compliance
   - ICH GCP guidelines
   - Data integrity standards
   - Audit trail requirements

3. **Data Quality Metrics**:
   - Reduced query rates
   - Fewer protocol deviations
   - Improved data completeness
   - Better audit outcomes

---

## Validation Behavior

### Error (Red) vs Warning (Yellow)

| Validation Type | Severity | Behavior | Use Case |
|----------------|----------|----------|----------|
| Future date (when not allowed) | **Error** | Blocks save | Most historical data |
| Past minimum date | **Error** | Blocks save | Study start date |
| After maximum date | **Error** | Blocks save | Study end date |
| Very old date (> 100 years) | **Warning** | Allows save | Birth dates |
| Far future (> 1 year) | **Warning** | Allows save | Scheduled visits |

---

## User Experience

### Error State (Blocks Save)
```
┌─────────────────────────────────────────┐
│ Visit Date                              │
│ ┌─────────────────────────────────────┐ │
│ │ 2026-05-15                          │ │ ← Red border
│ └─────────────────────────────────────┘ │
│ ❌ Date cannot be in the future         │ ← Red text
└─────────────────────────────────────────┘
```

### Warning State (Allows Save)
```
┌─────────────────────────────────────────┐
│ Date of Birth                           │
│ ┌─────────────────────────────────────┐ │
│ │ 1920-03-15                          │ │ ← Yellow border
│ └─────────────────────────────────────┘ │
│ ⚠️ Date is more than 100 years ago.     │ ← Yellow text
│    Please verify.                       │
└─────────────────────────────────────────┘
```

---

## Backend Integration

### ValidationConfig.java Support

The backend `ValidationConfig` class supports these date validation properties:

```java
@Data
public class ValidationConfig {
    private String type;              // "date" or "datetime"
    private Boolean allowFutureDates; // Default: false
    private String minDate;           // ISO 8601 format
    private String maxDate;           // ISO 8601 format
    private Boolean warnIfToday;      // Default: true
}
```

---

## Testing Date Validation

### Test Case 1: Future Date Rejected
1. Field: Any date field with `allowFutureDates: false`
2. Action: Enter tomorrow's date
3. Expected: Red error "Date cannot be in the future"
4. Expected: Cannot save form

### Test Case 2: Very Old Date Warning
1. Field: Birth date field
2. Action: Enter date from 1920
3. Expected: Yellow warning "Date is more than 100 years ago"
4. Expected: Can still save form

### Test Case 3: Date Range Validation
1. Field: Visit date with minDate/maxDate
2. Action: Enter date outside range
3. Expected: Red error with min/max date message
4. Expected: Cannot save form

### Test Case 4: Future Dates Allowed
1. Field: Scheduled visit with `allowFutureDates: true`
2. Action: Enter date 6 months from now
3. Expected: No error or warning
4. Expected: Can save form

### Test Case 5: Far Future Warning
1. Field: Scheduled visit with `allowFutureDates: true`
2. Action: Enter date 2 years from now
3. Expected: Yellow warning "Date is more than 1 year in future"
4. Expected: Can still save form

---

## Best Practices

### 1. Default to Not Allowing Future Dates
```json
// Good - explicit for clarity
{"validation": {"type": "date", "allowFutureDates": false}}

// Also good - false is the default
{"validation": {"type": "date"}}
```

### 2. Use Warnings for Edge Cases
```json
// Warning for very old dates (not blocking)
// Catches typos but allows legitimate old dates
```

### 3. Set Study-Wide Date Constraints
```json
{
  "validation": {
    "type": "date",
    "minDate": "2024-01-01",  // Study start
    "maxDate": "2025-12-31"   // Study end
  }
}
```

### 4. Document Why Future Dates Are Allowed
```json
{
  "validation": {
    "type": "date",
    "allowFutureDates": true,  // Scheduled visit
    "description": "Next scheduled visit date"
  }
}
```

---

## Migration Notes

### Existing Forms Without Type Validation

If your form fields don't have `validation.type: "date"`, the enhanced date validation won't trigger.

**To enable**:
1. Add `"type": "date"` to validation config
2. Optionally add `allowFutureDates`, `minDate`, `maxDate`
3. Test with existing data

### Backward Compatibility

- ✅ Forms without date validation continue to work
- ✅ Forms with `type: "date"` get enhanced validation
- ✅ Default behavior prevents future dates (safest option)
- ✅ Existing data not affected (validation on entry only)

---

## Related Documentation

- [FEATURE_3_TESTING_GUIDE.md](./FEATURE_3_TESTING_GUIDE.md) - Full validation testing
- [ValidationEngine.js](./frontend/clinprecision/src/services/ValidationEngine.js) - Implementation
- [ValidationConfig.java](./backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/dto/metadata/ValidationConfig.java) - Backend schema

---

## Summary

✅ **Enhanced date validation** prevents common data entry errors in clinical trials

✅ **Smart defaults**: Future dates blocked, old dates warned

✅ **Flexible configuration**: Allow future dates, set min/max ranges

✅ **User-friendly**: Errors block save, warnings allow with acknowledgment

✅ **Clinical trial focused**: Designed for GCP compliance and data quality
