# Study Design Module - Complete Implementation Plan
**Module:** Study Design & Protocol Management  
**Service:** Clinical Operations Service (Study Design Service)  
**Port:** 8082  
**Status:** ✅ Database Build Feature Complete (Phase 1)  
**Last Updated:** October 2, 2025

---

## Executive Summary

The Study Design Module is the **foundation** of the clinical trial lifecycle in ClinPrecision. It enables clinical teams to design study protocols, define data collection forms, create visit schedules, and build the operational clinical database. This module bridges the gap between protocol design and operational execution.

**Key Achievement:** Database Build feature successfully migrated to modern React architecture (Phase 1 complete - Oct 2025)

---

## Table of Contents

1. [Module Overview](#module-overview)
2. [Technical Architecture](#technical-architecture)
3. [Key Features](#key-features)
4. [Database Schema](#database-schema)
5. [User Experience](#user-experience)
6. [Implementation Status](#implementation-status)
7. [Integration Points](#integration-points)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)
10. [Future Roadmap](#future-roadmap)

---

## Module Overview

### Purpose

Enable clinical research teams to:
- Design comprehensive study protocols
- Define data collection forms and fields
- Create visit schedules and timelines
- Configure edit checks and validations
- Build operational clinical databases
- Manage protocol amendments and versions

### Scope

**In Scope:**
- Study/Protocol setup and configuration
- Form designer and field definition
- Visit schedule creation
- Edit check configuration
- Database build and validation
- Protocol versioning and amendments
- Study library management

**Out of Scope:**
- Subject enrollment (Data Capture Module)
- Data entry (Data Capture Module)
- Query management (Data Quality Module)
- Medical coding (Medical Coding Module)

### Key Capabilities

1. **Study Setup** - Create studies, define basic attributes, assign roles
2. **Form Designer** - Visual form builder with drag-and-drop
3. **Visit Schedule** - Timeline-based visit definition with form mapping
4. **Edit Checks** - Validation rules, range checks, logical checks
5. **Database Build** - Generate operational database from protocol design ✅
6. **Protocol Amendments** - Version control and change tracking
7. **Study Library** - Template management for reuse

---

## Technical Architecture

### Service Organization

**Current State:**
```
clinprecision-studydesign-service/ (Port: 8082)
```

**Future State** (per MICROSERVICES_ORGANIZATION_ANALYSIS.md):
```
clinprecision-clinical-operations-service/ (Port: 8082)
├── Study Design (current studydesign-service)
└── Data Capture (merge from datacapture-service)
```

**Rationale:** Database Build is the **last step of design**, not first step of data capture. Merging these services creates a cohesive Clinical Operations domain.

### DDD Architecture

```
studydesign/
├── domain/                              # Domain Layer
│   ├── model/
│   │   ├── Study.java                   # Aggregate Root
│   │   ├── Protocol.java                # Aggregate Root
│   │   ├── Form.java                    # Aggregate Root
│   │   ├── Visit.java                   # Entity
│   │   ├── Field.java                   # Entity
│   │   ├── EditCheck.java               # Entity
│   │   ├── StudyId.java                 # Value Object
│   │   ├── ProtocolVersion.java         # Value Object
│   │   ├── StudyPhase.java              # Value Object (Enum)
│   │   └── StudyStatus.java             # Value Object (Enum)
│   ├── service/
│   │   ├── ProtocolValidationDomainService.java
│   │   ├── FormBindingDomainService.java
│   │   └── VersioningDomainService.java
│   ├── repository/
│   │   ├── StudyRepository.java
│   │   ├── ProtocolRepository.java
│   │   └── FormRepository.java
│   └── event/
│       ├── StudyCreatedEvent.java
│       ├── ProtocolAmendedEvent.java
│       ├── FormDefinedEvent.java
│       └── DatabaseBuildCompletedEvent.java
│
├── application/                         # Application Layer
│   ├── command/
│   │   ├── CreateStudyCommand.java
│   │   ├── DefineFormCommand.java
│   │   ├── CreateVisitScheduleCommand.java
│   │   └── BuildDatabaseCommand.java
│   ├── query/
│   │   ├── FindStudyQuery.java
│   │   ├── GetFormsQuery.java
│   │   └── GetDatabaseBuildStatusQuery.java
│   ├── service/
│   │   ├── StudyApplicationService.java
│   │   ├── FormDesignApplicationService.java
│   │   └── DatabaseBuildApplicationService.java
│   └── dto/
│       ├── StudyDto.java
│       ├── FormDto.java
│       └── DatabaseBuildDto.java
│
├── infrastructure/                      # Infrastructure Layer
│   ├── persistence/
│   │   ├── entity/
│   │   │   ├── StudyEntity.java
│   │   │   ├── FormEntity.java
│   │   │   └── FieldEntity.java
│   │   └── repository/
│   │       ├── StudyRepositoryImpl.java
│   │       └── FormRepositoryImpl.java
│   ├── databasebuild/                   # Database Build Engine
│   │   ├── SchemaGenerator.java
│   │   ├── TableCreator.java
│   │   ├── ConstraintBuilder.java
│   │   └── ValidationExecutor.java
│   └── versioning/
│       └── GitBasedVersionControl.java
│
└── api/                                 # API Layer
    └── rest/
        ├── StudyController.java
        ├── FormDesignerController.java
        └── DatabaseBuildController.java
```

### Database Build Architecture (CQRS/Event Sourcing)

**Implemented per STUDY_DATABASE_BUILD_ARCHITECTURE_DIAGRAM.md:**

```
Command Side:
  BuildDatabaseCommand
    ↓
  CommandGateway (Axon)
    ↓
  DatabaseBuildAggregate
    ↓
  DatabaseBuildStartedEvent → Event Store

Event Side:
  DatabaseBuildStartedEvent
    ↓
  DatabaseBuildProjectionHandler
    ↓
  Read Model (database_builds table)
    ↓
  Frontend Query (status polling)
```

**Implementation Status:**
- ✅ Phase 1: Commands & Events (Complete)
- ✅ Phase 2: Aggregate (Complete)
- ✅ Phase 3: Projection & Read Model (Complete)
- ✅ Phase 4: Frontend UI Migration (Complete - Oct 2025)
- ⏳ Phase 5: Service Layer Completion (In Progress)

---

## Key Features

### 1. Study Setup & Configuration

**Purpose:** Create and configure clinical studies with all required metadata.

**Key Capabilities:**
- Study creation with metadata (title, sponsor, phase, indication)
- Protocol upload and version management
- Study team assignment (investigators, coordinators, monitors)
- Site activation and management
- Study status tracking (Planning → Active → Closed)

**API Endpoints:**
```
POST   /api/v1/studies
GET    /api/v1/studies
GET    /api/v1/studies/{id}
PUT    /api/v1/studies/{id}
DELETE /api/v1/studies/{id}
POST   /api/v1/studies/{id}/activate
POST   /api/v1/studies/{id}/close
```

**Frontend Routes:**
```
/studies/list
/studies/create
/studies/{id}/details
/studies/{id}/edit
```

---

### 2. Form Designer

**Purpose:** Visual form builder for creating CRFs (Case Report Forms).

**Key Capabilities:**
- Drag-and-drop form design
- Field types: Text, Number, Date, Select, Radio, Checkbox, File Upload
- Field properties: Label, data type, constraints, help text
- Conditional logic (show/hide fields based on values)
- Section grouping and page breaks
- Preview mode for testing
- Form templates and reuse

**Field Types Supported:**
- Text (single-line, multi-line)
- Numeric (integer, decimal, with units)
- Date/DateTime
- Single-select dropdown
- Multi-select checkboxes
- Radio buttons
- File upload
- Calculated fields
- Auto-populated fields

**API Endpoints:**
```
POST   /api/v1/forms
GET    /api/v1/forms
GET    /api/v1/forms/{id}
PUT    /api/v1/forms/{id}
POST   /api/v1/forms/{id}/publish
GET    /api/v1/forms/templates
```

**Frontend Routes:**
```
/studies/{studyId}/forms/designer
/studies/{studyId}/forms/{formId}/edit
/studies/{studyId}/forms/{formId}/preview
```

---

### 3. Visit Schedule Definition

**Purpose:** Create timeline-based visit schedules with form mappings.

**Key Capabilities:**
- Timeline visualization (Day -14 to Day 365)
- Visit creation with time windows
- Form-to-visit mapping
- Visit types: Screening, Baseline, Treatment, Follow-up, Unscheduled
- Time window definitions (+/- days tolerance)
- Visit dependencies and sequencing

**Visit Types:**
- **Screening** - Pre-enrollment visits
- **Baseline** - Day 0 / Visit 1
- **Treatment** - Ongoing treatment visits
- **Follow-up** - Post-treatment monitoring
- **Early Termination** - Premature discontinuation
- **Unscheduled** - Ad-hoc visits

**API Endpoints:**
```
POST   /api/v1/studies/{studyId}/visits
GET    /api/v1/studies/{studyId}/visits
PUT    /api/v1/studies/{studyId}/visits/{visitId}
POST   /api/v1/studies/{studyId}/visits/{visitId}/forms
```

**Frontend Routes:**
```
/studies/{studyId}/visits/timeline
/studies/{studyId}/visits/{visitId}/forms
```

---

### 4. Edit Check Configuration

**Purpose:** Define validation rules to ensure data quality at entry.

**Key Capabilities:**
- Range checks (min/max values)
- Logical checks (field dependencies)
- Cross-form validations
- Date consistency checks
- Required field enforcement
- Custom validation expressions
- Warning vs error severity

**Check Types:**
- **Range Check** - Value within min/max
- **Consistency Check** - Cross-field logic
- **Required Check** - Field must have value
- **Date Check** - Date logic (not future, within visit window)
- **Format Check** - Pattern matching (email, phone)
- **Custom Check** - SQL or expression-based

**API Endpoints:**
```
POST   /api/v1/forms/{formId}/editchecks
GET    /api/v1/forms/{formId}/editchecks
PUT    /api/v1/editchecks/{id}
DELETE /api/v1/editchecks/{id}
```

---

### 5. Database Build ✅ (Phase 1 Complete)

**Purpose:** Generate operational clinical database from protocol design.

**Status:** ✅ **Frontend migration complete** (October 2, 2025)

**Key Capabilities:**
- Automated database schema generation
- Table creation for all forms
- Constraint and index creation
- Validation rule deployment
- Build status tracking
- Rollback capability
- Build history and versioning

**14-Step Build Process:**
1. **Initialize** - Validate study configuration
2. **Analyze Forms** - Parse form definitions
3. **Generate Schema** - Create DDL statements
4. **Validate Schema** - Check for conflicts
5. **Create Tables** - Execute table creation
6. **Create Constraints** - Add primary/foreign keys
7. **Create Indexes** - Performance optimization
8. **Deploy Edit Checks** - Validation rules
9. **Create Audit Tables** - Audit trail setup
10. **Generate Metadata** - System documentation
11. **Validate Build** - Integrity checks
12. **Grant Permissions** - User access setup
13. **Create Views** - Reporting views
14. **Complete** - Mark database ready

**Build Execution Time:**
- Small study (10 forms): ~2 minutes
- Medium study (30 forms): ~5 minutes
- Large study (100 forms): ~15 minutes

**API Endpoints:**
```
POST   /api/v1/study-database-builds
GET    /api/v1/study-database-builds
GET    /api/v1/study-database-builds/{id}
GET    /api/v1/study-database-builds/{id}/status
GET    /api/v1/study-database-builds/{id}/logs
POST   /api/v1/study-database-builds/{id}/rollback
```

**Frontend Routes:**
```
/trial-design/database-build              # Main dashboard
/trial-design/database-build/wizard       # Build wizard
/trial-design/database-build/{id}/status  # Status tracking
```

**Documentation:**
- `PHASE_1_UI_IMPLEMENTATION_SUMMARY.md` - Complete implementation summary
- `STUDY_DATABASE_BUILD_ARCHITECTURE_DIAGRAM.md` - CQRS architecture
- `AUTOMATED_TRIGGERS_IMPLEMENTATION.md` - Trigger deployment guide

---

### 6. Protocol Amendments & Versioning

**Purpose:** Manage protocol changes with full version control.

**Key Capabilities:**
- Protocol version tracking (v1.0, v1.1, v2.0)
- Amendment creation workflow
- Change impact analysis
- Approval workflow
- Version comparison (diff view)
- Rollback to previous versions
- Amendment documentation

**Amendment Types:**
- **Major Amendment** - Significant protocol changes (e.g., endpoint modification)
- **Minor Amendment** - Administrative changes (e.g., contact info)
- **Emergency Amendment** - Safety-driven urgent changes

**API Endpoints:**
```
POST   /api/v1/protocols/{protocolId}/amendments
GET    /api/v1/protocols/{protocolId}/versions
GET    /api/v1/protocols/{protocolId}/versions/{version}/diff
POST   /api/v1/protocols/{protocolId}/versions/{version}/rollback
```

---

### 7. Study Library & Templates

**Purpose:** Reuse study designs and forms across protocols.

**Key Capabilities:**
- Save study as template
- Form library management
- Template categorization (therapeutic area, phase)
- Template customization
- Version control for templates
- Template sharing across organization

**Template Types:**
- **Study Templates** - Complete study design
- **Form Templates** - Individual forms
- **Visit Templates** - Visit schedule patterns
- **Edit Check Templates** - Validation rule sets

---

## Database Schema

### Core Tables

```sql
-- Studies
CREATE TABLE studies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_number VARCHAR(50) UNIQUE NOT NULL,
    study_title VARCHAR(500) NOT NULL,
    protocol_version VARCHAR(20),
    phase ENUM('PHASE_1', 'PHASE_2', 'PHASE_3', 'PHASE_4'),
    study_type ENUM('INTERVENTIONAL', 'OBSERVATIONAL'),
    therapeutic_area VARCHAR(100),
    indication VARCHAR(255),
    sponsor VARCHAR(255),
    status ENUM('PLANNING', 'ACTIVE', 'ENROLLED', 'CLOSED', 'ARCHIVED'),
    start_date DATE,
    end_date DATE,
    target_enrollment INT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Forms
CREATE TABLE forms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    form_name VARCHAR(255) NOT NULL,
    form_oid VARCHAR(100) UNIQUE,
    form_type ENUM('SCREENING', 'DEMOGRAPHICS', 'MEDICAL_HISTORY', 'VITALS', 'LAB', 'AE', 'CUSTOM'),
    version VARCHAR(20),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id)
);

-- Fields
CREATE TABLE fields (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    form_id BIGINT NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    field_oid VARCHAR(100),
    field_label VARCHAR(500),
    field_type ENUM('TEXT', 'NUMBER', 'DATE', 'DATETIME', 'SELECT', 'RADIO', 'CHECKBOX', 'TEXTAREA', 'FILE'),
    data_type VARCHAR(50),
    is_required BOOLEAN DEFAULT FALSE,
    display_order INT,
    field_properties JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id)
);

-- Visits
CREATE TABLE visits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    visit_name VARCHAR(255) NOT NULL,
    visit_oid VARCHAR(100),
    visit_type ENUM('SCREENING', 'BASELINE', 'TREATMENT', 'FOLLOWUP', 'EARLY_TERM', 'UNSCHEDULED'),
    study_day INT,
    time_window_before INT,
    time_window_after INT,
    display_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id)
);

-- Visit-Form Mapping
CREATE TABLE visit_forms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    visit_id BIGINT NOT NULL,
    form_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    FOREIGN KEY (form_id) REFERENCES forms(id),
    UNIQUE KEY unique_visit_form (visit_id, form_id)
);

-- Edit Checks
CREATE TABLE edit_checks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    form_id BIGINT,
    check_name VARCHAR(255) NOT NULL,
    check_type ENUM('RANGE', 'CONSISTENCY', 'REQUIRED', 'DATE_LOGIC', 'CUSTOM'),
    check_expression TEXT,
    severity ENUM('ERROR', 'WARNING', 'INFO'),
    error_message VARCHAR(1000),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id)
);

-- Database Builds (CQRS Read Model)
CREATE TABLE database_builds (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    build_number INT NOT NULL,
    build_status ENUM('INITIATED', 'IN_PROGRESS', 'VALIDATING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'),
    current_step INT DEFAULT 0,
    total_steps INT DEFAULT 14,
    current_step_name VARCHAR(255),
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id)
);

-- Protocol Versions
CREATE TABLE protocol_versions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    version_date DATE,
    amendment_number INT,
    amendment_description TEXT,
    approved_by BIGINT,
    approved_at TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id)
);
```

---

## User Experience

### Primary Users

1. **Study Designers** - Create protocols and forms
2. **Database Managers** - Build and validate databases
3. **Principal Investigators** - Review and approve protocols
4. **CRAs** - Review study design compliance

### Key User Journeys

See `CLINPRECISION_USER_EXPERIENCE_GUIDE.md` for detailed user journeys including:
- Complete study design workflow
- Form designer experience
- Database build 14-step process
- Protocol amendment workflow

### UI Components

**Frontend Tech Stack:**
- React 18+
- Tailwind CSS
- Heroicons
- React Router v6

**Key Components:**
```
src/components/modules/trialdesign/
├── database-build/
│   ├── DatabaseBuildDashboard.jsx        ✅ Migrated
│   ├── DatabaseBuildWizard.jsx           ✅ Migrated
│   ├── BuildStatusTracker.jsx            ✅ Migrated
│   └── components/
│       ├── BuildStudyDatabaseModal.jsx   ✅ Migrated
│       ├── BuildProgressStepper.jsx      ✅ Migrated
│       └── BuildHistoryTable.jsx         ✅ Migrated
├── forms/
│   ├── FormDesigner.jsx
│   ├── FormPreview.jsx
│   └── FieldPropertiesPanel.jsx
├── visits/
│   ├── VisitTimeline.jsx
│   └── VisitFormMapper.jsx
└── study-setup/
    ├── StudyCreationWizard.jsx
    └── StudyDetailsForm.jsx
```

---

## Implementation Status

### ✅ Completed Features

**Database Build (Phase 1 - October 2025):**
- Backend migration: 22 Java classes ✅
- Frontend migration: 7 React components ✅
- Routing configuration: Fixed 2 routing issues ✅
- CQRS implementation: Commands, Events, Aggregates, Projections ✅
- UI functionality: All 7 key features working ✅
- Documentation: 13 comprehensive guides ✅

**Status:** Ready for integration testing with backend services

### ⏳ In Progress

- Protocol amendment workflow
- Form designer enhancements
- Visit schedule visualization improvements

### 📋 Planned (Q4 2025)

- Study library and templates
- Advanced edit check engine
- Protocol comparison tools
- Study cloning capability

---

## Integration Points

### Internal Integrations

1. **Data Capture Module** - Forms and visits are the foundation for data collection
2. **Data Quality Module** - Edit checks drive query generation
3. **Medical Coding Module** - Form fields define codable terms
4. **Regulatory Module** - Protocol versions feed compliance tracking
5. **User Service** - Study team assignments and permissions

### External Integrations

1. **CTMS Systems** - Study metadata exchange
2. **EDC Systems** - Form export (ODM format)
3. **Document Management** - Protocol document storage
4. **CDISC Standards** - ODM, CDASH compliance

---

## Testing Strategy

### Unit Testing
- Service layer: 85% coverage target
- Domain logic: 90% coverage target
- Utilities: 95% coverage target

### Integration Testing
- API endpoint testing
- Database transaction testing
- Event sourcing flow testing

### UI Testing
- Component testing (Jest + React Testing Library)
- E2E testing (Cypress)
- Visual regression testing

### Performance Testing
- Database build performance (target: <5 min for 30 forms)
- Form rendering (target: <1 sec for 100 fields)
- API response times (target: <500ms)

---

## Deployment Guide

### Prerequisites
- Java 17+
- Spring Boot 3.2+
- MySQL 8.0+
- Axon Server 2024.0+
- Node.js 18+
- React 18+

### Backend Deployment

```bash
cd backend/clinprecision-studydesign-service
mvn clean package
java -jar target/clinprecision-studydesign-service-1.0.0.jar
```

### Frontend Deployment

```bash
cd frontend/clinprecision
npm install
npm run build
npm start
```

### Configuration

**application.yml:**
```yaml
server:
  port: 8082

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/clinprecision_studies
    username: clinprecision
    password: ${DB_PASSWORD}
    
axon:
  axonserver:
    servers: localhost:8124
    
study-database-build:
  max-concurrent-builds: 3
  timeout-minutes: 30
```

---

## Future Roadmap

### Q4 2025
- Complete service merge (Study Design + Data Capture → Clinical Operations Service)
- Study template library
- Enhanced protocol versioning

### Q1 2026
- AI-assisted form design
- Predictive edit checks
- Mobile form preview

### Q2 2026
- CDISC ODM v2.0 support
- Multi-language forms
- Advanced conditional logic

---

## Related Documentation

### Core Documents
- `PHASE_1_UI_IMPLEMENTATION_SUMMARY.md` - Database Build Phase 1 summary
- `STUDY_DATABASE_BUILD_ARCHITECTURE_DIAGRAM.md` - CQRS architecture
- `AUTOMATED_TRIGGERS_IMPLEMENTATION.md` - Trigger deployment
- `MICROSERVICES_ORGANIZATION_ANALYSIS.md` - Service merge rationale

### Function-Level Documents
- `docs/modules/study-design/functions/database-build/` - Database Build detailed docs
- `docs/modules/study-design/functions/form-designer/` - Form Designer docs
- `docs/modules/study-design/functions/visit-schedule/` - Visit Schedule docs

### User Experience Documents
- `CLINPRECISION_USER_EXPERIENCE_GUIDE.md` - Solution-level UX
- `STUDY_DESIGN_USER_EXPERIENCE.md` - Module-level UX (TBD)

---

## Support & Contact

**Module Owner:** Study Design Team  
**Technical Lead:** Database Architecture Team  
**Product Manager:** Clinical Operations PM  

**Documentation Status:** ✅ Complete  
**Last Review:** October 2, 2025  
**Next Review:** January 2, 2026
