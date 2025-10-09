# Database UUID Updates - Quick Reference

## What's Done ✅

### 1. Schema Files (DDL)
- ✅ `consolidated_schema.sql` - All CREATE TABLE statements updated
- ✅ `add_aggregate_uuid_columns.sql` - Migration script created
- ✅ All indexes added

### 2. Study Data
- ✅ `data_study_setup.sql` - All 10 studies have aggregate_uuid values

## What Needs To Be Done 🔄

### File: `data_study_design_arm_visit_forms.sql`

This file contains ~1000 lines with multiple INSERT statements that need UUID columns added.

#### Tables Affected:
1. `study_arms` - Lines 4-13 (9 rows)
2. `study_interventions` - Lines 18-59 (3 SELECT statements)
3. `visit_definitions` - Lines 105-157 (9 rows)
4. `form_definitions` - Lines 161+ (6+ rows)

---

## How To Update Each Table

### 1. Study Arms (9 rows, Line 4-13)

**Current Structure**:
```sql
INSERT INTO study_arms (name, description, type, sequence_number, planned_subjects, study_id, created_by, updated_by)
VALUES 
    ('Treatment Arm A', '...', 'TREATMENT', 1, 150, 3, 'system', 'system'),
    ...
```

**Update To**:
```sql
INSERT INTO study_arms (aggregate_uuid, arm_uuid, name, description, type, sequence_number, planned_subjects, study_id, created_by, updated_by)
VALUES 
    -- Study 3 Arms
    ('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440031', 'Treatment Arm A', '...', 'TREATMENT', 1, 150, 3, 'system', 'system'),
    ('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440032', 'Control Arm', '...', 'CONTROL', 2, 75, 3, 'system', 'system'),
    ('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440033', 'Placebo Arm', '...', 'PLACEBO', 3, 75, 3, 'system', 'system'),
    -- Study 1 Arms
    ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440011', 'Treatment Arm A', '...', 'TREATMENT', 1, 150, 1, 'system', 'system'),
    ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440012', 'Control Arm', '...', 'CONTROL', 2, 75, 1, 'system', 'system'),
    ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440013', 'Placebo Arm', '...', 'PLACEBO', 3, 75, 1, 'system', 'system'),
    -- Study 2 Arms
    ('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440021', 'Treatment Arm A', '...', 'TREATMENT', 1, 150, 2, 'system', 'system'),
    ('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440022', 'Control Arm', '...', 'CONTROL', 2, 75, 2, 'system', 'system'),
    ('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440023', 'Placebo Arm', '...', 'PLACEBO', 3, 75, 2, 'system', 'system');
```

**UUID Pattern**: 
- `aggregate_uuid`: `550e8400-e29b-41d4-a716-4466554400XX` (XX = study_id padded)
- `arm_uuid`: `650e8400-e29b-41d4-a716-4466554400XY` (X = study_id, Y = sequence)

---

### 2. Study Interventions (3 SELECT statements, Lines 18-59)

**Current Structure**:
```sql
INSERT INTO study_interventions (name, description, type, dosage, frequency, route, study_arm_id, created_by, updated_by)
SELECT 
    'Experimental Drug XYZ', 
    'Novel compound targeting specific pathway',
    'DRUG',
    '10mg',
    'Once daily',
    'Oral',
    sa.id,
    'system',
    'system'
FROM study_arms sa 
WHERE sa.study_id = 3 AND sa.sequence_number = 1;
```

**Update To**:
```sql
INSERT INTO study_interventions (aggregate_uuid, intervention_uuid, arm_uuid, name, description, type, dosage, frequency, route, study_arm_id, created_by, updated_by)
SELECT 
    sa.aggregate_uuid,
    '950e8400-e29b-41d4-a716-446655440031',  -- Unique intervention_uuid
    sa.arm_uuid,
    'Experimental Drug XYZ', 
    'Novel compound targeting specific pathway',
    'DRUG',
    '10mg',
    'Once daily',
    'Oral',
    sa.id,
    'system',
    'system'
FROM study_arms sa 
WHERE sa.study_id = 3 AND sa.sequence_number = 1;
```

**UUID Pattern for interventions**:
- `aggregate_uuid`: Copy from study_arms.aggregate_uuid
- `intervention_uuid`: `950e8400-e29b-41d4-a716-4466554400XY` (X = study_id, Y = sequence)
- `arm_uuid`: Copy from study_arms.arm_uuid

**Repeat for all 3 intervention INSERT statements** (lines 18-59)

---

### 3. Visit Definitions (9 rows, Lines 105-157)

**Current Structure**:
```sql
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(1, 1, 1, 'Baseline Visit', 'Initial screening and assessment', 0, 'BASELINE');
```

**Update To**:
```sql
INSERT INTO visit_definitions (id, aggregate_uuid, visit_uuid, arm_uuid, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(1, '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440101', '650e8400-e29b-41d4-a716-446655440011', 1, 1, 'Baseline Visit', 'Initial screening and assessment', 0, 'BASELINE');
```

**UUID Pattern**:
- `aggregate_uuid`: `550e8400-e29b-41d4-a716-4466554400XX` (XX = study_id)
- `visit_uuid`: `750e8400-e29b-41d4-a716-4466554401XX` (XX = visit sequence 01-09)
- `arm_uuid`: `650e8400-e29b-41d4-a716-4466554400XY` (must match the arm's arm_uuid based on arm_id)

**Mapping for arm_uuid** (based on arm_id in visit):
- arm_id=1, study_id=1 → `650e8400-e29b-41d4-a716-446655440011`
- arm_id=2, study_id=1 → `650e8400-e29b-41d4-a716-446655440012`
- arm_id=3, study_id=1 → `650e8400-e29b-41d4-a716-446655440013`
- etc.

---

### 4. Form Definitions (6+ rows, Lines 161+)

**Current Structure**:
```sql
INSERT INTO form_definitions (
    id, study_id, name, form_type, description, version, status, ...
) VALUES (
    1, 1, 'Demographics Form', 'DEMOGRAPHICS', 'Patient demographics and baseline characteristics', '1.0', 'ACTIVE', ...
);
```

**Update To**:
```sql
INSERT INTO form_definitions (
    id, aggregate_uuid, form_uuid, study_id, name, form_type, description, version, status, ...
) VALUES (
    1, '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440101', 1, 'Demographics Form', 'DEMOGRAPHICS', 'Patient demographics and baseline characteristics', '1.0', 'ACTIVE', ...
);
```

**UUID Pattern**:
- `aggregate_uuid`: `550e8400-e29b-41d4-a716-4466554400XX` (XX = study_id)
- `form_uuid`: `850e8400-e29b-41d4-a716-4466554401XX` (XX = form sequence 01-06+)

---

## UUID Reference Table

### Study Aggregate UUIDs (Already Created)
| Study ID | Study Name | aggregate_uuid |
|----------|------------|----------------|
| 1 | COVID-19 Vaccine | `550e8400-e29b-41d4-a716-446655440001` |
| 2 | Diabetes Management | `550e8400-e29b-41d4-a716-446655440002` |
| 3 | Alzheimer's Disease | `550e8400-e29b-41d4-a716-446655440003` |

### Study Arms UUIDs (To Be Created)
| Study | Arm Name | arm_uuid |
|-------|----------|----------|
| 1 | Treatment Arm A | `650e8400-e29b-41d4-a716-446655440011` |
| 1 | Control Arm | `650e8400-e29b-41d4-a716-446655440012` |
| 1 | Placebo Arm | `650e8400-e29b-41d4-a716-446655440013` |
| 2 | Treatment Arm A | `650e8400-e29b-41d4-a716-446655440021` |
| 2 | Control Arm | `650e8400-e29b-41d4-a716-446655440022` |
| 2 | Placebo Arm | `650e8400-e29b-41d4-a716-446655440023` |
| 3 | Treatment Arm A | `650e8400-e29b-41d4-a716-446655440031` |
| 3 | Control Arm | `650e8400-e29b-41d4-a716-446655440032` |
| 3 | Placebo Arm | `650e8400-e29b-41d4-a716-446655440033` |

### Visit UUIDs (Sequential by line appearance)
Start with `750e8400-e29b-41d4-a716-446655440101` and increment: 102, 103, 104...

### Form UUIDs (Sequential by line appearance)
Start with `850e8400-e29b-41d4-a716-446655440101` and increment: 102, 103, 104...

### Intervention UUIDs (Sequential by line appearance)
Start with `950e8400-e29b-41d4-a716-446655440031` and increment: 032, 033, 034...

---

## Verification SQL

After updates, run these to verify:

```sql
-- Check all studies have UUIDs
SELECT id, name, aggregate_uuid FROM studies;

-- Check all arms have UUIDs
SELECT id, name, study_id, aggregate_uuid, arm_uuid FROM study_arms;

-- Check all visits have UUIDs
SELECT id, name, study_id, arm_id, aggregate_uuid, visit_uuid, arm_uuid FROM visit_definitions;

-- Check all forms have UUIDs
SELECT id, name, study_id, aggregate_uuid, form_uuid FROM form_definitions;

-- Check all interventions have UUIDs
SELECT id, name, aggregate_uuid, intervention_uuid, arm_uuid FROM study_interventions;

-- Verify UUID uniqueness
SELECT COUNT(*) as total, COUNT(DISTINCT aggregate_uuid) as unique_agg FROM studies;
SELECT COUNT(*) as total, COUNT(DISTINCT arm_uuid) as unique_arms FROM study_arms;
SELECT COUNT(*) as total, COUNT(DISTINCT visit_uuid) as unique_visits FROM visit_definitions;
SELECT COUNT(*) as total, COUNT(DISTINCT form_uuid) as unique_forms FROM form_definitions;
```

---

## Files Summary

| File | Status | What's Done | What Needs Work |
|------|--------|-------------|-----------------|
| `consolidated_schema.sql` | ✅ Complete | All tables updated | None |
| `add_aggregate_uuid_columns.sql` | ✅ Complete | Migration script ready | None |
| `data_study_setup.sql` | ✅ Complete | All 10 studies | None |
| `data_study_design_arm_visit_forms.sql` | 🔄 In Progress | Column names identified | Add UUID values to INSERTs |

---

## Next Actions

1. **Manually edit** `data_study_design_arm_visit_forms.sql`:
   - Update study_arms INSERT (lines 4-13)
   - Update study_interventions SELECTs (lines 18-59)
   - Update visit_definitions INSERTs (lines 105-157)
   - Update form_definitions INSERTs (lines 161+)

2. **Test** with fresh database:
   ```sql
   DROP DATABASE IF EXISTS clinprecisiondb_fresh;
   CREATE DATABASE clinprecisiondb_fresh;
   USE clinprecisiondb_fresh;
   SOURCE consolidated_schema.sql;
   SOURCE data/data_admin_setup.sql;
   SOURCE data/data_study_setup.sql;
   SOURCE data/data_study_design_arm_visit_forms.sql;
   -- Run verification queries above
   ```

3. **Review** remaining data files:
   - data_admin_setup.sql (check sites - already has some UUIDs)
   - data_datacapture_setup.sql
   - data_form_templates_setup.sql

---

**Estimated Time**: 30-45 minutes to complete all updates in `data_study_design_arm_visit_forms.sql`

**Priority**: High - Required for fresh database initialization
