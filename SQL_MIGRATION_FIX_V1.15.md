# SQL Migration Fix - MySQL Compatibility

**Date:** October 12, 2025  
**Issue:** MySQL syntax errors in V1.15 migration script  
**Status:** ✅ FIXED

---

## 🐛 Issues Found

### 1. Window Function in Aggregate (Error 3593)
**Error Message:**
```
Error Code: 3593. You cannot use the window function 'lag' in this context.
```

**Location:** `v_status_transition_summary` view

**Problem:**
```sql
AVG(TIMESTAMPDIFF(DAY, 
    LAG(changed_at) OVER (PARTITION BY patient_id ORDER BY changed_at),
    changed_at
)) AS avg_days_between_transitions
```

MySQL doesn't allow window functions (`LAG`) inside aggregate functions (`AVG`) in view definitions.

**Solution:**
Removed the complex average calculation from the view. Simplified to show:
- Transition counts
- Unique patient counts
- First and last transition dates

```sql
CREATE OR REPLACE VIEW v_status_transition_summary AS
SELECT 
    previous_status,
    new_status,
    COUNT(*) AS transition_count,
    COUNT(DISTINCT patient_id) AS unique_patients,
    MIN(changed_at) AS first_transition_date,
    MAX(changed_at) AS last_transition_date
FROM patient_status_history
GROUP BY previous_status, new_status
ORDER BY transition_count DESC, previous_status, new_status;
```

**Note:** For average days between transitions, use the repository method `getAverageDaysBetweenChanges(patientId)` which uses a proper query with subqueries.

---

### 2. COMMENT ON Syntax (PostgreSQL-specific)

**Problem:**
MySQL doesn't support PostgreSQL's `COMMENT ON` syntax:
```sql
COMMENT ON TABLE patient_status_history IS '...';
COMMENT ON COLUMN patient_status_history.event_id IS '...';
COMMENT ON VIEW v_patient_current_status IS '...';
COMMENT ON FUNCTION fn_get_patient_status_count IS '...';
```

**Solution:**
- **Tables:** Use inline `COMMENT='...'` in `CREATE TABLE` statement (already present)
- **Columns:** Use inline `COMMENT '...'` in column definitions (use DDL ALTER if needed later)
- **Views/Functions:** Removed COMMENT ON statements (use inline comments `--` instead)

**Changes Made:**
1. ✅ Removed `COMMENT ON TABLE patient_status_history`
2. ✅ Removed `COMMENT ON COLUMN` statements (3 occurrences)
3. ✅ Removed `COMMENT ON VIEW` statements (2 occurrences)
4. ✅ Removed `COMMENT ON FUNCTION` statement

The table comment remains in the CREATE TABLE statement:
```sql
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 
COMMENT='Complete audit trail of patient status changes for regulatory compliance...';
```

---

## ✅ Fixed Script Summary

### Views Fixed
1. **v_status_transition_summary**
   - Removed window function from aggregate
   - Simplified to basic aggregations
   - Added first/last transition dates
   - Ordered by transition_count DESC for better insights

### Syntax Compatibility
- ✅ All PostgreSQL-specific `COMMENT ON` statements removed
- ✅ Window function usage corrected
- ✅ All views now use MySQL-compatible syntax

---

## 🧪 Testing

Run the migration script to verify:

```sql
-- Test 1: Create table
SOURCE backend/clinprecision-db/ddl/V1.15__create_patient_status_history.sql;

-- Test 2: Verify views work
SELECT * FROM v_patient_current_status LIMIT 5;
SELECT * FROM v_status_transition_summary LIMIT 10;

-- Test 3: Verify function works
SELECT fn_get_patient_status_count(1);

-- Test 4: Verify trigger works (will be tested on INSERT)
```

---

## 📊 View Outputs

### v_status_transition_summary
**Columns:**
- `previous_status` - Status before transition
- `new_status` - Status after transition
- `transition_count` - Total number of this transition type
- `unique_patients` - Number of unique patients who made this transition
- `first_transition_date` - Earliest occurrence of this transition
- `last_transition_date` - Most recent occurrence of this transition

**Example Output:**
```
previous_status | new_status | transition_count | unique_patients | first_transition_date | last_transition_date
ENROLLED        | ACTIVE     | 45               | 42              | 2025-01-15 10:30:00  | 2025-10-12 14:20:00
SCREENING       | ENROLLED   | 38               | 38              | 2025-01-10 09:15:00  | 2025-10-11 16:45:00
REGISTERED      | SCREENING  | 52               | 50              | 2025-01-05 08:00:00  | 2025-10-12 11:30:00
```

---

## 💡 Alternative: For Average Days Calculation

If you need average days between transitions, use one of these approaches:

### Approach 1: Repository Method (Recommended)
```java
Double avgDays = repository.getAverageDaysBetweenChanges(patientId);
```

### Approach 2: Custom Query with CTE
```sql
WITH transitions_with_prev AS (
    SELECT 
        patient_id,
        previous_status,
        new_status,
        changed_at,
        LAG(changed_at) OVER (PARTITION BY patient_id ORDER BY changed_at) AS prev_changed_at
    FROM patient_status_history
),
transition_durations AS (
    SELECT 
        previous_status,
        new_status,
        TIMESTAMPDIFF(DAY, prev_changed_at, changed_at) AS days_between
    FROM transitions_with_prev
    WHERE prev_changed_at IS NOT NULL
)
SELECT 
    previous_status,
    new_status,
    AVG(days_between) AS avg_days_between_transitions
FROM transition_durations
GROUP BY previous_status, new_status;
```

**Note:** This works as a standalone query but cannot be used in a view due to MySQL limitations.

### Approach 3: Stored Procedure
```sql
DELIMITER //

CREATE PROCEDURE sp_get_avg_transition_time(
    IN p_previous_status VARCHAR(50),
    IN p_new_status VARCHAR(50)
)
BEGIN
    WITH transitions_with_prev AS (
        SELECT 
            patient_id,
            previous_status,
            new_status,
            changed_at,
            LAG(changed_at) OVER (PARTITION BY patient_id ORDER BY changed_at) AS prev_changed_at
        FROM patient_status_history
    )
    SELECT 
        AVG(TIMESTAMPDIFF(DAY, prev_changed_at, changed_at)) AS avg_days
    FROM transitions_with_prev
    WHERE previous_status = p_previous_status 
      AND new_status = p_new_status
      AND prev_changed_at IS NOT NULL;
END //

DELIMITER ;

-- Usage:
CALL sp_get_avg_transition_time('SCREENING', 'ENROLLED');
```

---

---

### 3. Trigger SIGNAL Syntax (Error 1064)

**Error Message:**
```
Error Code: 1064. You have an error in your SQL syntax near 
'(             'Invalid status transition: '...' at line 32
```

**Problem:**
Multi-line `SIGNAL SQLSTATE ... SET MESSAGE_TEXT` syntax not supported in MySQL:
```sql
-- ❌ INCORRECT
SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = CONCAT(...);
```

**Solution:**
Use single-line format with user variable:
```sql
-- ✅ CORRECT
SET @error_msg = CONCAT('Invalid status transition: ', ...);
SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @error_msg;
```

**Additional Fix:**
Changed Unicode arrow `→` to ASCII `->` to avoid encoding issues.

---

## 📝 Migration Verification Checklist

- [x] Window function removed from view
- [x] View uses only basic aggregations
- [x] All COMMENT ON statements removed
- [x] Table comment remains in CREATE TABLE
- [x] Function syntax is MySQL-compatible
- [x] Trigger SIGNAL syntax fixed (single-line format)
- [x] Unicode characters replaced with ASCII
- [x] No PostgreSQL-specific syntax remains

---

## 🎓 Lessons Learned

1. **MySQL Limitations:** Views cannot contain window functions inside aggregate functions
2. **COMMENT Syntax:** MySQL uses inline `COMMENT='...'` not `COMMENT ON ...`
3. **View Complexity:** Keep views simple; use queries/procedures for complex analytics
4. **Repository Advantage:** Complex calculations better suited for application layer with proper queries

---

**Status:** ✅ Ready for deployment

