# ClinPrecision Database Specification

**Version**: 2.0  
**Last Updated**: October 16, 2025  
**Database**: MySQL 8.0+  
**Architecture**: Event Sourcing + CQRS with Axon Framework

---

## 📋 Table of Contents

1. [Database Overview](#database-overview)
2. [Architectural Patterns](#architectural-patterns)
3. [Schema Categories](#schema-categories)
4. [Core Domain Tables](#core-domain-tables)
5. [Build Tracking Implementation](#build-tracking-implementation)
6. [Event Sourcing Tables](#event-sourcing-tables)
7. [Data Relationships](#data-relationships)
8. [Indexes and Performance](#indexes-and-performance)
9. [Audit Trail and Compliance](#audit-trail-and-compliance)
10. [Migration History](#migration-history)

---

## 1. Database Overview

### Database Configuration

```sql
Database Name: clinprecisiondb
Character Set: utf8mb4
Collation: utf8mb4_unicode_ci
Engine: InnoDB
Time Zone: UTC
```

### Administrative Setup

```sql
-- Admin User
CREATE USER 'clinprecadmin'@'localhost' IDENTIFIED BY 'passw0rd';
GRANT ALL PRIVILEGES ON clinprecisiondb.* TO 'clinprecadmin'@'localhost';

-- Application User (recommended for production)
CREATE USER 'clinprecapp'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE ON clinprecisiondb.* TO 'clinprecapp'@'%';
```

---

## 2. Architectural Patterns

### Event Sourcing + CQRS

```
┌─────────────────────────────────────────────────────────────┐
│                      WRITE MODEL (Commands)                  │
├─────────────────────────────────────────────────────────────┤
│  Controller → Service → CommandGateway → Aggregate          │
│                              ↓                               │
│                        Domain Event                          │
│                              ↓                               │
│                    Event Store (Axon)                        │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                      READ MODEL (Queries)                    │
├─────────────────────────────────────────────────────────────┤
│  Event → Projector → Repository → Database Tables           │
│                              ↓                               │
│                      Query Service                           │
│                              ↓                               │
│                        API Response                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Immutability**: Events in event store are immutable
2. **Audit Trail**: All changes tracked via events and audit tables
3. **Idempotency**: Projectors handle duplicate events gracefully
4. **Eventual Consistency**: Read models updated asynchronously
5. **FDA Compliance**: 21 CFR Part 11 compliant audit trail

---

## 3. Schema Categories

The database is organized into the following logical categories:

### 3.1 Event Sourcing (Axon Framework)
- `domain_event_entry` - Event store
- `snapshot_event_entry` - Performance snapshots
- `association_value_entry` - Saga associations
- `token_entry` - Event processor tracking
- `saga_entry` - Saga state
- `dead_letter_entry` - Failed event handling

### 3.2 Code Lists and Reference Data
- `code_lists` - Central code list management
- `code_lists_audit` - Code list change history
- `code_list_translations` - Multi-language support

### 3.3 Organization Management
- `organizations` - Healthcare organizations
- `sites` - Study sites
- `users` - System users
- `roles` - User roles
- `user_roles` - User-role mapping

### 3.4 Study Management
- `studies` - Clinical studies
- `study_database_builds` - **Protocol versions** (critical for build tracking)
- `study_amendments` - Protocol amendments
- `study_milestones` - Study timeline
- `study_teams` - Study staff

### 3.5 Study Design (Protocol Definitions)
- `visit_definitions` - Protocol visit templates
- `form_definitions` - Form templates
- `visit_forms` - Form-to-visit assignments
- `field_definitions` - Form field metadata
- `validation_rules` - Form validation rules

### 3.6 Patient Management
- `patients` - Patient records
- `patient_enrollments` - Study enrollments
- `patient_status_history` - Status changes (screening → enrolled → completed)

### 3.7 Visit Management
- `study_visit_instances` - **Patient visit instances** (with build tracking)
- `visit_windows` - Visit window compliance

### 3.8 Data Collection (EDC)
- `study_form_data` - **Form submissions** (with build tracking)
- `study_form_data_audit` - **Form change audit trail** (with build tracking)

### 3.9 Safety and Compliance
- `adverse_events` - AE reporting
- `protocol_deviations` - Protocol violations
- `data_quality_issues` - Data quality tracking

---

## 4. Core Domain Tables

### 4.1 Studies

```sql
CREATE TABLE studies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_number VARCHAR(50) UNIQUE NOT NULL,
    study_name VARCHAR(500) NOT NULL,
    protocol_version VARCHAR(50),
    study_phase ENUM('PHASE_I', 'PHASE_II', 'PHASE_III', 'PHASE_IV'),
    study_status VARCHAR(50) DEFAULT 'PLANNING',
    sponsor_id BIGINT,
    therapeutic_area VARCHAR(200),
    indication TEXT,
    study_type ENUM('INTERVENTIONAL', 'OBSERVATIONAL', 'EXPANDED_ACCESS'),
    
    -- Dates
    protocol_date DATE,
    approval_date DATE,
    first_patient_in DATE,
    last_patient_in DATE,
    last_patient_out DATE,
    database_lock_date DATE,
    
    -- Target enrollment
    target_enrollment INT,
    current_enrollment INT DEFAULT 0,
    
    -- Metadata
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_studies_status (study_status),
    INDEX idx_studies_phase (study_phase),
    INDEX idx_studies_sponsor (sponsor_id)
) COMMENT='Clinical studies';
```

**Key Points**:
- Central study registry
- Tracks study lifecycle from planning to completion
- Links to builds, sites, patients, forms

---

### 4.2 Study Database Builds ⭐ CRITICAL

```sql
CREATE TABLE study_database_builds (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    build_number VARCHAR(50) NOT NULL,
    build_version VARCHAR(50) NOT NULL,
    build_status ENUM('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED') 
        DEFAULT 'DRAFT',
    
    -- Build metadata
    build_description TEXT,
    build_type ENUM('INITIAL', 'AMENDMENT', 'CORRECTION') DEFAULT 'INITIAL',
    amendment_id BIGINT COMMENT 'FK to study_amendments if applicable',
    
    -- Build timeline
    build_start_time TIMESTAMP NULL,
    build_end_time TIMESTAMP NULL,
    build_duration_seconds INT,
    
    -- Build configuration
    configuration_snapshot JSON COMMENT 'Complete config at build time',
    
    -- Build results
    total_visits INT DEFAULT 0,
    total_forms INT DEFAULT 0,
    total_fields INT DEFAULT 0,
    validation_rules_count INT DEFAULT 0,
    
    -- Status tracking
    visits_built INT DEFAULT 0,
    forms_built INT DEFAULT 0,
    
    -- Error tracking
    error_count INT DEFAULT 0,
    error_log JSON,
    
    -- Metadata
    built_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_study_build (study_id, build_number),
    INDEX idx_builds_status (build_status),
    INDEX idx_builds_study (study_id),
    INDEX idx_builds_version (study_id, build_version),
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
) COMMENT='Study protocol versions - tracks each build of the study database';
```

**Purpose**:
- **Protocol Versioning**: Each build represents a frozen snapshot of the protocol
- **Build Tracking**: Links all data to specific protocol versions
- **Amendment Support**: Enables protocol amendments without breaking existing data
- **Compliance**: Required for FDA 21 CFR Part 11 compliance

**Build Lifecycle**:
```
DRAFT → IN_PROGRESS → COMPLETED
         ↓
       FAILED (retry possible)
         ↓
     CANCELLED (manual abort)
```

**Related Tables**: All tables with `build_id` column reference this table

---

### 4.3 Visit Definitions

```sql
CREATE TABLE visit_definitions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    build_id BIGINT COMMENT 'FK to study_database_builds - protocol version',
    
    visit_code VARCHAR(50) NOT NULL,
    visit_name VARCHAR(200) NOT NULL,
    visit_type ENUM('SCREENING', 'BASELINE', 'TREATMENT', 'FOLLOW_UP', 
                    'END_OF_STUDY', 'UNSCHEDULED') DEFAULT 'TREATMENT',
    
    -- Visit scheduling
    sequence_number INT NOT NULL COMMENT 'Order in study timeline',
    day_offset INT COMMENT 'Days from baseline visit',
    window_before_days INT DEFAULT 0,
    window_after_days INT DEFAULT 0,
    
    -- Visit properties
    is_required BOOLEAN DEFAULT TRUE,
    is_baseline BOOLEAN DEFAULT FALSE,
    allow_multiple BOOLEAN DEFAULT FALSE COMMENT 'Can occur multiple times',
    
    -- Metadata
    description TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_visit_def (study_id, build_id, visit_code),
    INDEX idx_visit_def_study (study_id),
    INDEX idx_visit_def_build (build_id),
    INDEX idx_visit_def_sequence (study_id, sequence_number),
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (build_id) REFERENCES study_database_builds(id) ON DELETE RESTRICT
) COMMENT='Protocol visit templates - defines which visits in each protocol version';
```

**Key Points**:
- Templates for visit instances
- **build_id**: Links to specific protocol version
- Defines visit schedule and windows
- Each build can have different visit definitions

---

### 4.4 Form Definitions

```sql
CREATE TABLE form_definitions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    build_id BIGINT COMMENT 'FK to study_database_builds - protocol version',
    
    form_code VARCHAR(50) NOT NULL,
    form_name VARCHAR(200) NOT NULL,
    form_type ENUM('CRF', 'QUESTIONNAIRE', 'LAB', 'ASSESSMENT', 'OTHER') 
        DEFAULT 'CRF',
    
    -- Form structure
    form_structure JSON COMMENT 'Complete form layout and fields',
    version_number INT DEFAULT 1,
    
    -- Form properties
    is_repeating BOOLEAN DEFAULT FALSE,
    max_repetitions INT,
    allow_draft BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    description TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_form_def (study_id, build_id, form_code),
    INDEX idx_form_def_study (study_id),
    INDEX idx_form_def_build (build_id),
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (build_id) REFERENCES study_database_builds(id) ON DELETE RESTRICT
) COMMENT='Form templates - defines form structure per protocol version';
```

---

### 4.5 Visit Forms (Assignment Table)

```sql
CREATE TABLE visit_forms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    build_id BIGINT COMMENT 'FK to study_database_builds - protocol version',
    
    visit_definition_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    
    -- Assignment properties
    display_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    is_conditional BOOLEAN DEFAULT FALSE,
    condition_expression TEXT COMMENT 'Conditional display logic',
    
    -- Metadata
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_visit_form (visit_definition_id, form_definition_id, build_id),
    INDEX idx_visit_forms_visit (visit_definition_id),
    INDEX idx_visit_forms_form (form_definition_id),
    INDEX idx_visit_forms_build (build_id),
    INDEX idx_visit_forms_order (visit_definition_id, display_order),
    
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (build_id) REFERENCES study_database_builds(id) ON DELETE RESTRICT,
    FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id) ON DELETE CASCADE
) COMMENT='Assigns forms to visits - which forms appear in which visits per build';
```

**Purpose**: Links forms to visits for a specific protocol version

---

### 4.6 Study Visit Instances ⭐ WITH BUILD TRACKING

```sql
CREATE TABLE study_visit_instances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    visit_id BIGINT NOT NULL COMMENT 'FK to visit_definitions',
    subject_id BIGINT NOT NULL COMMENT 'FK to patients',
    site_id BIGINT,
    
    -- BUILD TRACKING (CRITICAL)
    build_id BIGINT COMMENT 'FK to study_database_builds - protocol version at enrollment',
    
    -- Visit scheduling
    visit_date DATE,
    actual_visit_date DATE,
    
    -- Visit status
    visit_status ENUM('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED') 
        DEFAULT 'SCHEDULED',
    window_status ENUM('ON_TIME', 'EARLY', 'LATE', 'OUT_OF_WINDOW'),
    
    -- Progress tracking
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Event sourcing
    aggregate_uuid VARCHAR(36) COMMENT 'UUID for unscheduled visits',
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_visit_inst_subject (subject_id),
    INDEX idx_visit_inst_study (study_id),
    INDEX idx_visit_inst_status (visit_status),
    INDEX idx_visit_inst_build (build_id),
    INDEX idx_visit_inst_uuid (aggregate_uuid),
    
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (visit_id) REFERENCES visit_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (build_id) REFERENCES study_database_builds(id) ON DELETE RESTRICT
) COMMENT='Patient visit instances - actual visits with build tracking';
```

**Critical Field**:
- **build_id**: Locks patient to protocol version at enrollment
- Ensures patient continues with same protocol even after amendments

---

### 4.7 Study Form Data ⭐ WITH BUILD TRACKING

```sql
CREATE TABLE study_form_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_uuid VARCHAR(36) UNIQUE COMMENT 'Event sourcing UUID',
    
    study_id BIGINT NOT NULL,
    form_id BIGINT NOT NULL COMMENT 'FK to form_definitions',
    subject_id BIGINT COMMENT 'NULL for screening forms',
    visit_id BIGINT COMMENT 'FK to study_visit_instances',
    site_id BIGINT,
    
    -- BUILD TRACKING (CRITICAL FOR DATA INTEGRITY)
    build_id BIGINT COMMENT 'FK to study_database_builds - form version used',
    
    -- Form data
    form_data JSON NOT NULL COMMENT 'Complete form submission as JSON',
    
    -- Status
    status ENUM('DRAFT', 'SUBMITTED', 'LOCKED') DEFAULT 'DRAFT',
    
    -- Versioning
    version INT DEFAULT 1 COMMENT 'Optimistic locking',
    is_locked BOOLEAN DEFAULT FALSE,
    
    -- Field completion tracking
    total_fields INT,
    completed_fields INT,
    required_fields INT,
    completed_required_fields INT,
    
    -- Related records
    related_record_id VARCHAR(36) COMMENT 'Link to status changes, queries, etc.',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_by BIGINT,
    
    INDEX idx_form_data_uuid (aggregate_uuid),
    INDEX idx_form_data_study (study_id),
    INDEX idx_form_data_subject (subject_id),
    INDEX idx_form_data_visit (visit_id),
    INDEX idx_form_data_form (form_id),
    INDEX idx_form_data_build (build_id),
    INDEX idx_form_data_status (status),
    INDEX idx_form_data_study_build (study_id, build_id),
    INDEX idx_form_data_form_build (form_id, build_id),
    
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (form_id) REFERENCES form_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (visit_id) REFERENCES study_visit_instances(id) ON DELETE CASCADE,
    FOREIGN KEY (build_id) REFERENCES study_database_builds(id) ON DELETE RESTRICT
) COMMENT='Form submissions - electronic data capture with build tracking';
```

**Critical Fields**:
- **build_id**: Tracks which form definition version was used
- **form_data**: JSON storage for flexible schema
- Enables correct form display for historical data

**Why build_id is critical**:
```
Build 1: Demographics has 10 fields (age 18-65)
Build 2: Demographics has 12 fields (age 18-85)

Without build_id: Cannot determine which version patient filled out
With build_id: Can always display correct form structure
```

---

### 4.8 Study Form Data Audit ⭐ WITH BUILD TRACKING (FDA COMPLIANCE)

```sql
CREATE TABLE study_form_data_audit (
    audit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    study_id BIGINT NOT NULL,
    record_id BIGINT NOT NULL COMMENT 'FK to study_form_data',
    aggregate_uuid VARCHAR(36),
    
    -- BUILD TRACKING (FDA 21 CFR PART 11 COMPLIANCE)
    build_id BIGINT COMMENT 'Protocol version active when change was made',
    
    -- Audit action
    action ENUM('INSERT', 'UPDATE', 'DELETE', 'LOCK', 'UNLOCK', 
                'VERIFY', 'RESOLVE_QUERY') NOT NULL,
    
    -- Change tracking
    old_data JSON COMMENT 'Data before change',
    new_data JSON COMMENT 'Data after change',
    
    -- Audit metadata
    changed_by BIGINT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    
    -- Additional audit info
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    event_id VARCHAR(36) COMMENT 'Link to event store',
    
    INDEX idx_audit_study (study_id),
    INDEX idx_audit_record (record_id),
    INDEX idx_audit_build (build_id),
    INDEX idx_audit_changed_at (changed_at),
    INDEX idx_audit_changed_by (changed_by),
    INDEX idx_audit_record_build (record_id, build_id),
    INDEX idx_audit_study_build (study_id, build_id),
    
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES study_form_data(id) ON DELETE CASCADE,
    FOREIGN KEY (build_id) REFERENCES study_database_builds(id) ON DELETE RESTRICT
) COMMENT='Complete audit trail for form data changes - FDA 21 CFR Part 11 compliant';
```

**FDA Compliance**:
- **build_id**: Proves which protocol version was active at time of change
- Required for temporal data reconstruction
- Enables protocol deviation detection
- Complete audit trail for regulatory inspections

**Audit Use Cases**:
1. "Show all changes to subject 1001's demographics"
2. "What was the validation rule when this data was entered?"
3. "Which protocol version was active during FDA inspection period?"
4. "Reconstruct form data as it appeared on 2025-03-15"

---

## 5. Build Tracking Implementation

### 5.1 Overview

**Purpose**: Link all study data to specific protocol versions (builds)

**Tables with build_id** (6 total):
1. ✅ `visit_definitions` - Visit templates per build
2. ✅ `form_definitions` - Form templates per build
3. ✅ `visit_forms` - Form assignments per build
4. ✅ `study_visit_instances` - Patient enrollment build
5. ✅ `study_form_data` - Form submission build
6. ✅ `study_form_data_audit` - Audit trail build

### 5.2 Build Tracking Flow

```
1. Study Created
   └─> Status: PLANNING

2. Study Design
   ├─> Create visit_definitions (no build_id yet)
   ├─> Create form_definitions (no build_id yet)
   └─> Assign forms to visits (no build_id yet)

3. Build Initiated
   ├─> Create study_database_builds record
   ├─> Status: IN_PROGRESS
   └─> Copy all designs with build_id

4. Build Completed
   ├─> Status: COMPLETED
   ├─> All definitions frozen with build_id
   └─> Ready for patient enrollment

5. Patient Enrollment
   ├─> Create study_visit_instances (with build_id)
   └─> Patient locked to this build version

6. Form Submission
   ├─> Get build_id from visit instance
   ├─> Create study_form_data (with build_id)
   └─> Create audit record (with build_id)

7. Protocol Amendment
   ├─> Create new build (Build 2)
   ├─> Existing patients continue with Build 1
   └─> New patients get Build 2
```

### 5.3 Build ID Strategy

**Priority Order**:

| Priority | Source | Use Case |
|----------|--------|----------|
| 1 (HIGHEST) | Visit instance | Visit-based forms |
| 2 (EXPLICIT) | Request | Manual override |
| 3 (FALLBACK) | Active build | Screening forms |

**Java Implementation**:
```java
Long determineBuildId(FormSubmissionRequest request) {
    // 1. Try visit instance
    if (request.getVisitId() != null) {
        StudyVisitInstanceEntity visit = visitRepo.findById(request.getVisitId());
        if (visit.getBuildId() != null) {
            return visit.getBuildId();
        }
    }
    
    // 2. Try explicit from request
    if (request.getBuildId() != null) {
        return request.getBuildId();
    }
    
    // 3. Fallback to active build
    StudyDatabaseBuildEntity build = buildRepo.findActiveBuild(studyId);
    if (build != null) {
        return build.getId();
    }
    
    throw new RuntimeException("No active build found");
}
```

### 5.4 Migration Script

**File**: `backend/clinprecision-db/migrations/20251016_add_build_tracking_to_patient_visits.sql`

**Parts**:
- Part 1-2: Add columns to visit instances and visit forms
- Part 3-5: Backfill existing data
- Part 6-7: Add columns to visit/form definitions
- Part 8: Add build_id to study_form_data
- Part 9: Add build_id to study_form_data_audit
- Part 10: Verification queries
- Rollback Plan: Complete rollback instructions

---

## 6. Event Sourcing Tables

### 6.1 Domain Event Entry

```sql
CREATE TABLE domain_event_entry (
    global_index BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_identifier VARCHAR(255) NOT NULL UNIQUE,
    aggregate_identifier VARCHAR(255) NOT NULL,
    sequence_number BIGINT NOT NULL,
    type VARCHAR(255),
    meta_data LONGBLOB,
    payload LONGBLOB NOT NULL,
    payload_revision VARCHAR(255),
    payload_type VARCHAR(255) NOT NULL,
    time_stamp VARCHAR(255) NOT NULL,
    
    UNIQUE KEY UK_domain_event_entry (aggregate_identifier, sequence_number),
    KEY IDX_domain_event_entry_time_stamp (time_stamp)
) COMMENT='Axon event store - immutable event history';
```

**Purpose**: Stores all domain events for event sourcing

**Key Events**:
- `PatientStatusChangedEvent`
- `FormDataSubmittedEvent`
- `VisitCompletedEvent`
- `ProtocolDeviationReportedEvent`

---

### 6.2 Token Entry

```sql
CREATE TABLE token_entry (
    processor_name VARCHAR(255) NOT NULL,
    segment INTEGER NOT NULL DEFAULT 0,
    token BLOB,
    token_type VARCHAR(255),
    timestamp VARCHAR(255),
    owner VARCHAR(255),
    
    PRIMARY KEY (processor_name, segment)
) COMMENT='Tracks event processor progress (projections)';
```

**Purpose**: Tracks which events have been processed by projectors

**Processors**:
- `FormDataProjector`
- `PatientStatusProjector`
- `VisitProjector`

---

## 7. Data Relationships

### 7.1 Entity Relationship Diagram (Key Tables)

```
studies (1) ────── (N) study_database_builds
   │                          │
   │                          │ build_id
   │                          ↓
   ├───── (N) visit_definitions
   │              │
   │              │ build_id
   │              ↓
   ├───── (N) form_definitions
   │              │
   │              │
   ├───── (N) visit_forms (assignment)
   │              │
   │              │ build_id
   │              ↓
   ├───── (N) study_visit_instances
   │              │
   │              │ build_id
   │              ↓
   └───── (N) study_form_data
                  │
                  │ build_id
                  ↓
           study_form_data_audit
```

### 7.2 Foreign Key Constraints

**ON DELETE Behavior**:

| Parent Table | Child Table | On Delete |
|-------------|-------------|-----------|
| studies | visit_definitions | CASCADE |
| studies | form_definitions | CASCADE |
| studies | study_form_data | CASCADE |
| study_database_builds | visit_definitions | RESTRICT |
| study_database_builds | form_definitions | RESTRICT |
| study_database_builds | study_form_data | RESTRICT |
| study_visit_instances | study_form_data | CASCADE |

**Why RESTRICT for builds**:
- Cannot delete a build if data references it
- Prevents accidental data loss
- Maintains referential integrity

---

## 8. Indexes and Performance

### 8.1 Index Strategy

**Primary Indexes**:
- All tables have `id` as PRIMARY KEY (AUTO_INCREMENT)
- Event store has `aggregate_identifier + sequence_number` unique index

**Foreign Key Indexes**:
- All FK columns have indexes for join performance
- Composite indexes for common query patterns

**Build Tracking Indexes**:
```sql
-- study_form_data
INDEX idx_form_data_build (build_id)
INDEX idx_form_data_study_build (study_id, build_id)
INDEX idx_form_data_form_build (form_id, build_id)

-- study_form_data_audit
INDEX idx_audit_build (build_id)
INDEX idx_audit_record_build (record_id, build_id)
INDEX idx_audit_study_build (study_id, build_id)
```

### 8.2 Performance Considerations

**Query Patterns**:
1. Get all forms for a visit: `visit_id + build_id`
2. Get form data for patient: `subject_id + build_id`
3. Audit trail for form: `record_id + build_id`

**JSON Performance**:
- MySQL 8.0+ has native JSON support
- Can index JSON fields using virtual columns (future enhancement)
- Consider denormalization for frequently queried JSON fields

---

## 9. Audit Trail and Compliance

### 9.1 FDA 21 CFR Part 11 Requirements

**Compliance Elements**:
1. ✅ Complete audit trail (study_form_data_audit)
2. ✅ Immutable event store (domain_event_entry)
3. ✅ User attribution (changed_by, created_by)
4. ✅ Timestamp tracking (changed_at, created_at)
5. ✅ Reason for change (change_reason)
6. ✅ Protocol version tracking (build_id)
7. ✅ Before/after values (old_data, new_data)

### 9.2 Audit Tables

**All audit tables follow pattern**:
```sql
- audit_id (PK)
- record_id (FK to main table)
- action (INSERT, UPDATE, DELETE, LOCK, etc.)
- old_data JSON
- new_data JSON
- changed_by
- changed_at
- change_reason
- build_id (protocol version context)
```

**Audit Tables**:
- `study_form_data_audit` - Form changes
- `code_lists_audit` - Code list changes
- `patient_status_history` - Status changes (separate table)

---

## 10. Migration History

### 10.1 Major Migrations

| Date | Version | Description |
|------|---------|-------------|
| 2025-09-06 | 1.0 | Initial schema |
| 2025-10-15 | 1.13 | Field tracking for forms |
| 2025-10-16 | 2.0 | Build tracking implementation |

### 10.2 Build Tracking Migration

**File**: `20251016_add_build_tracking_to_patient_visits.sql`

**Changes**:
1. Add `build_id` to 6 tables
2. Backfill existing data
3. Add foreign key constraints
4. Create performance indexes
5. Update audit tables

**Impact**:
- Zero downtime (nullable columns first)
- Backward compatible
- Complete verification queries

---

## 📊 Database Statistics

### Current Table Count: **~50 tables**

| Category | Count |
|----------|-------|
| Event Sourcing | 8 |
| Core Domain | 15 |
| Audit Tables | 5 |
| Reference Data | 10 |
| Supporting Tables | 12 |

### Storage Estimates

| Table | Rows/Study | Size/Row | Total |
|-------|-----------|----------|-------|
| domain_event_entry | 50,000 | 2 KB | 100 MB |
| study_form_data | 10,000 | 5 KB | 50 MB |
| study_form_data_audit | 30,000 | 5 KB | 150 MB |
| **Total per study** | | | **~300 MB** |

---

## 🔐 Security Considerations

### Data Protection

1. **Sensitive Data**: Patient identifiers encrypted at rest
2. **Access Control**: Row-level security via site_id filtering
3. **Audit Trail**: Complete logging of all data access
4. **Backup**: Daily backups, 30-day retention

### Best Practices

1. Use prepared statements (prevent SQL injection)
2. Encrypt connections (SSL/TLS)
3. Limit user privileges (principle of least privilege)
4. Regular security audits

---

## 📚 References

### Related Documents

1. **BUILD_TRACKING_FINAL_COMPLETE.md** - Build tracking implementation
2. **BUILD_TRACKING_JAVA_UPDATES_COMPLETE.md** - Java code changes
3. **BUILD_TRACKING_STUDY_FORM_DATA_ANALYSIS.md** - Why build tracking is critical
4. **BUILD_TRACKING_AUDIT_TABLE_COMPLIANCE.md** - FDA compliance details
5. **20251016_add_build_tracking_to_patient_visits.sql** - Migration script

### External Standards

- FDA 21 CFR Part 11 - Electronic Records
- ICH E6(R2) - Good Clinical Practice
- CDISC SDTM - Clinical Data Standards
- ISO 27001 - Information Security

---

**Document Version**: 2.0  
**Last Updated**: October 16, 2025  
**Maintained By**: ClinPrecision Development Team
