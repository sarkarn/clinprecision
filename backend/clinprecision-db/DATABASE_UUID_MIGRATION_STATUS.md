# Database UUID Migration Status

## Overview
This document tracks the progress of adding `aggregate_uuid` and entity UUID columns to the database schema for CQRS/Event Sourcing implementation.

## Migration Date
November 2024

## Purpose
Enable proper event-sourced entity tracking by adding:
- `aggregate_uuid` - Links entities to their aggregate root in the event store
- Entity-specific UUIDs (`arm_uuid`, `visit_uuid`, `form_uuid`, etc.) - Unique identifiers for individual entities
- `is_deleted` flags - Support soft deletes for event sourcing

## Progress Summary

### ✅ Completed

#### 1. Schema DDL Files
- **File**: `consolidated_schema.sql`
- **Status**: ✅ Complete
- **Changes**:
  - Added `aggregate_uuid VARCHAR(255)` to 6 tables
  - Added entity UUID columns (`arm_uuid`, `visit_uuid`, etc.)
  - Added `is_deleted BOOLEAN DEFAULT FALSE` flags
  - Added 12 new indexes for UUID columns
  
**Tables Updated**:
1. `studies` - Added `aggregate_uuid`
2. `study_arms` - Added `aggregate_uuid`, `arm_uuid`, `is_deleted`
3. `visit_definitions` - Added `aggregate_uuid`, `visit_uuid`, `arm_uuid`, `is_deleted`
4. `visit_forms` - Added `aggregate_uuid`, `assignment_uuid`, `visit_uuid`, `form_uuid`, `is_deleted`
5. `study_interventions` - Added `aggregate_uuid`, `intervention_uuid`, `arm_uuid`, `is_deleted`
6. `form_definitions` - Added `aggregate_uuid`, `form_uuid`

**Indexes Created**:
```sql
-- Studies
CREATE UNIQUE INDEX idx_studies_aggregate_uuid ON studies(aggregate_uuid);

-- Study Arms
CREATE INDEX idx_study_arms_aggregate_uuid ON study_arms(aggregate_uuid);
CREATE UNIQUE INDEX idx_study_arms_arm_uuid ON study_arms(arm_uuid);

-- Visit Definitions
CREATE INDEX idx_visit_definitions_aggregate_uuid ON visit_definitions(aggregate_uuid);
CREATE UNIQUE INDEX idx_visit_definitions_visit_uuid ON visit_definitions(visit_uuid);
CREATE INDEX idx_visit_definitions_arm_uuid ON visit_definitions(arm_uuid);

-- Visit Forms
CREATE INDEX idx_visit_forms_aggregate_uuid ON visit_forms(aggregate_uuid);
CREATE UNIQUE INDEX idx_visit_forms_assignment_uuid ON visit_forms(assignment_uuid);
CREATE INDEX idx_visit_forms_visit_uuid ON visit_forms(visit_uuid);
CREATE INDEX idx_visit_forms_form_uuid ON visit_forms(form_uuid);

-- Study Interventions
CREATE INDEX idx_study_interventions_aggregate_uuid ON study_interventions(aggregate_uuid);
CREATE UNIQUE INDEX idx_study_interventions_intervention_uuid ON study_interventions(intervention_uuid);
CREATE INDEX idx_study_interventions_arm_uuid ON study_interventions(arm_uuid);

-- Form Definitions
CREATE INDEX idx_form_definitions_aggregate_uuid ON form_definitions(aggregate_uuid);
CREATE UNIQUE INDEX idx_form_definitions_form_uuid ON form_definitions(form_uuid);
```

#### 2. ALTER Script for Existing Databases
- **File**: `add_aggregate_uuid_columns.sql` (NEW)
- **Status**: ✅ Complete
- **Purpose**: Migration script for existing databases
- **Contents**:
  - ALTER TABLE statements for all 6 tables
  - Index creation statements
  - Verification queries
  - Complete documentation

#### 3. Data Initialization - Studies
- **File**: `data_study_setup.sql`
- **Status**: ✅ Complete (10/10 studies)
- **Changes**: Added `aggregate_uuid` column and values to all 10 study INSERT statements

**UUID Mapping**:
- Study 1 (COVID-19 Vaccine): `550e8400-e29b-41d4-a716-446655440001`
- Study 2 (Diabetes Management): `550e8400-e29b-41d4-a716-446655440002`
- Study 3 (Alzheimer's Disease): `550e8400-e29b-41d4-a716-446655440003`
- Study 4 (Rheumatoid Arthritis): `550e8400-e29b-41d4-a716-446655440004`
- Study 5 (Hypertension Management): `550e8400-e29b-41d4-a716-446655440005`
- Study 6 (Pediatric Asthma): `550e8400-e29b-41d4-a716-446655440006`
- Study 7 (Oncology Immunotherapy): `550e8400-e29b-41d4-a716-446655440007`
- Study 8 (Cardiovascular Prevention): `550e8400-e29b-41d4-a716-446655440008`
- Study 9 (Mental Health Digital): `550e8400-e29b-41d4-a716-446655440009`
- Study 10 (Rare Disease Gene Therapy): `550e8400-e29b-41d4-a716-446655440010`

### 🔄 In Progress

#### 4. Data Initialization - Study Design Elements
- **File**: `data_study_design_arm_visit_forms.sql`
- **Status**: 🔄 Needs Updates
- **Required Changes**:

##### Study Arms (~9 rows)
Need to add `aggregate_uuid` and `arm_uuid` columns to INSERT statements:
```sql
-- BEFORE
INSERT INTO study_arms (name, description, type, ...)
VALUES ('Treatment Arm A', ..., study_id=3, ...);

-- AFTER
INSERT INTO study_arms (aggregate_uuid, arm_uuid, name, description, type, ...)
VALUES ('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440031', 'Treatment Arm A', ..., study_id=3, ...);
```

**UUID Convention**:
- `aggregate_uuid`: Use study's aggregate_uuid (matches study_id)
- `arm_uuid`: Generate unique UUID for each arm (suggested pattern: 650e8400-e29b-41d4-a716-4466554400XY where X=study_id, Y=arm_sequence)

##### Study Interventions (~3+ rows)
Need to add `aggregate_uuid`, `intervention_uuid`, `arm_uuid`:
```sql
-- Will require updates to SELECT statements that reference study_arm_id
-- Need to generate unique intervention_uuid for each intervention
```

##### Visit Definitions (~9+ rows)
Need to add `aggregate_uuid`, `visit_uuid`, `arm_uuid`:
```sql
-- BEFORE
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES (1, 1, 1, 'Baseline Visit', 'Initial assessment', 0, 'BASELINE');

-- AFTER
INSERT INTO visit_definitions (id, aggregate_uuid, visit_uuid, arm_uuid, study_id, arm_id, name, description, timepoint, visit_type)
VALUES (1, '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440101', '650e8400-e29b-41d4-a716-446655440011', 1, 1, 'Baseline Visit', 'Initial assessment', 0, 'BASELINE');
```

**UUID Convention**:
- `aggregate_uuid`: Use study's aggregate_uuid
- `visit_uuid`: Generate unique UUID for each visit (suggested pattern: 750e8400-...)
- `arm_uuid`: Reference the arm's arm_uuid

##### Form Definitions (~6+ rows)
Need to add `aggregate_uuid`, `form_uuid`:
```sql
-- BEFORE
INSERT INTO form_definitions (
    id, study_id, name, form_type, description, version, ...
) VALUES (1, 1, 'Demographics Form', 'DEMOGRAPHICS', ...);

-- AFTER
INSERT INTO form_definitions (
    id, aggregate_uuid, form_uuid, study_id, name, form_type, description, version, ...
) VALUES (1, '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440101', 1, 'Demographics Form', 'DEMOGRAPHICS', ...);
```

**UUID Convention**:
- `aggregate_uuid`: Could use study's aggregate_uuid OR a FormAggregate UUID (depends on domain model)
- `form_uuid`: Generate unique UUID for each form (suggested pattern: 850e8400-...)

### ⬜ Pending Review

#### 5. Other Data Initialization Files
These files may need updates if they insert into affected tables:

- **data_admin_setup.sql** - Check for site-related UUIDs (already has some aggregate_uuid usage)
- **data_datacapture_setup.sql** - Review for any study design data
- **data_form_templates_setup.sql** - Review for form_definitions INSERTs

## UUID Generation Strategy

### Pattern Used
Using UUID v4 format: `550e8400-e29b-41d4-a716-446655440XXX`

### Conventions
1. **Studies**: `...440001` through `...440010` (last 3 digits = study ID padded)
2. **Arms**: `650e8400-e29b-41d4-a716-4466554400XY` (X = study_id, Y = arm_sequence)
3. **Visits**: `750e8400-e29b-41d4-a716-4466554401XX` (last 3 digits = visit sequence)
4. **Forms**: `850e8400-e29b-41d4-a716-4466554401XX` (last 3 digits = form sequence)
5. **Interventions**: `950e8400-e29b-41d4-a716-4466554400XX` (sequential)

### Production Recommendation
⚠️ **For production**: Use proper UUID generation:
```sql
-- MySQL 8.0+
UUID()

-- Or in Java/Application
UUID.randomUUID().toString()
```

## Testing Checklist

### Fresh Database Creation
- [ ] Drop and recreate database
- [ ] Run `consolidated_schema.sql`
- [ ] Verify all UUID columns exist: `SHOW COLUMNS FROM studies LIKE '%uuid%';`
- [ ] Verify all indexes exist: `SHOW INDEX FROM studies WHERE Key_name LIKE '%uuid%';`
- [ ] Run `data_admin_setup.sql`
- [ ] Run `data_study_setup.sql`
- [ ] Run `data_study_design_arm_visit_forms.sql` (after updates)
- [ ] Verify data populated: `SELECT COUNT(*), COUNT(aggregate_uuid) FROM studies;`

### Existing Database Migration
- [ ] Backup database
- [ ] Run `add_aggregate_uuid_columns.sql`
- [ ] Verify columns added successfully
- [ ] Verify indexes created successfully
- [ ] Populate UUID values for existing data (manual or script)
- [ ] Test application integration

### Application Integration Tests
- [ ] StudyDesignAggregate can store events with aggregate_uuid
- [ ] Projection handlers populate UUID columns correctly
- [ ] Query side can retrieve entities by UUID
- [ ] Soft delete flag (`is_deleted`) works correctly
- [ ] Foreign key relationships via UUIDs work
- [ ] Index performance is acceptable

## Next Steps

1. **Complete data_study_design_arm_visit_forms.sql updates**:
   - Add UUID columns to all INSERT statements
   - Generate appropriate UUID values following conventions
   - Test with fresh database

2. **Review other data files**:
   - Check data_admin_setup.sql
   - Check data_datacapture_setup.sql  
   - Check data_form_templates_setup.sql
   - Update if they insert into affected tables

3. **Create database initialization script**:
   - Script to run all SQL files in order
   - Verification queries after each step
   - Rollback procedures

4. **Update application code**:
   - Ensure event handlers populate UUID columns
   - Update queries to use UUIDs where appropriate
   - Update DTOs/entities to include UUID fields

5. **Documentation**:
   - README for database setup process
   - Migration guide for existing deployments
   - UUID usage guidelines for developers

## File Summary

| File | Purpose | Status |
|------|---------|--------|
| `consolidated_schema.sql` | Fresh database schema | ✅ Complete |
| `add_aggregate_uuid_columns.sql` | Existing database migration | ✅ Complete |
| `data_study_setup.sql` | Study sample data | ✅ Complete |
| `data_study_design_arm_visit_forms.sql` | Arms/visits/forms data | 🔄 Needs Updates |
| `data_admin_setup.sql` | Admin/org/site data | ⬜ Review Needed |
| `data_datacapture_setup.sql` | Data capture configs | ⬜ Review Needed |
| `data_form_templates_setup.sql` | Form templates | ⬜ Review Needed |

## Contact
For questions about this migration, refer to:
- DDD_CQRS_EVENT_SOURCING_MIGRATION_PLAN.md
- DDD_CQRS_QUICK_REFERENCE.md
- Entity files: StudyArmEntity, VisitDefinitionEntity, VisitFormEntity

---
**Last Updated**: November 2024
**Next Review**: After completing data_study_design_arm_visit_forms.sql updates
