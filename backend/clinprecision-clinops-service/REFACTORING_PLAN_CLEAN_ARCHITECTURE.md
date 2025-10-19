# ClinOps Service Refactoring Plan - Clean Domain-Driven Architecture

## Executive Summary
Current structure mixes concerns and has confusing package organization. This plan reorganizes into clear business domains while maintaining all existing API endpoints.

---

## Current Problems Identified

### 1. **Scattered Controllers**
- Root `controller/` package mixed with domain packages
- No clear separation between study design vs operations
- Visit management split across multiple locations
- Protocol versions using confusing naming (study-versions vs protocol-versions)

### 2. **Mixed Concerns**
- Study design (forms, visits, arms) mixed with operations (enrollment, data capture)
- Database build logic separate from study design
- Visit creation (operational) mixed with visit definition (design)

### 3. **Confusing Naming**
- `studydesign` vs `study` packages both exist
- `studydatabase` separate from `studydesign`
- `formdata` separate from form design
- `patientenrollment` vs `visit` both handle patient operations

---

## Proposed Clean Structure

```
com.clinprecision.clinopsservice/
│
├── ClinicalOperationsServiceApplication.java
│
├── common/                           # Shared infrastructure
│   ├── config/                       # Spring configuration
│   ├── security/                     # Security & auth
│   ├── exception/                    # Global exception handlers
│   ├── mapper/                       # Shared mappers/converters
│   └── entity/                       # Shared base entities (audit, etc.)
│
├── studydesign/                      # DOMAIN 1: Study Design (Pre-Launch)
│   │
│   ├── study/                        # Study Setup & Info
│   │   ├── controller/
│   │   │   ├── StudyCommandController.java          # /api/studies (POST, PUT, DELETE)
│   │   │   └── StudyQueryController.java            # /api/studies (GET)
│   │   ├── service/
│   │   │   ├── StudyCommandService.java
│   │   │   └── StudyQueryService.java
│   │   ├── dto/
│   │   ├── entity/
│   │   │   └── StudyEntity.java
│   │   └── repository/
│   │       └── StudyRepository.java
│   │
│   ├── protocol/                     # Protocol Design & Amendments
│   │   ├── controller/
│   │   │   ├── ProtocolVersionCommandController.java    # /api/protocol-versions
│   │   │   ├── ProtocolVersionQueryController.java      # /api/protocol-versions
│   │   │   └── ProtocolVersionBridgeController.java     # /api/study-versions (legacy alias)
│   │   ├── service/
│   │   ├── dto/
│   │   ├── entity/
│   │   │   └── ProtocolVersionEntity.java
│   │   └── repository/
│   │
│   ├── design/                       # Study Design Components
│   │   │
│   │   ├── form/                     # Form Design
│   │   │   ├── controller/
│   │   │   │   ├── FormTemplateController.java          # /api/form-templates
│   │   │   │   ├── FormDefinitionController.java        # /api/form-definitions
│   │   │   │   └── FormBindingController.java           # /api/form-bindings
│   │   │   ├── service/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   │   ├── FormTemplateEntity.java
│   │   │   │   ├── FormDefinitionEntity.java
│   │   │   │   └── FormBindingEntity.java
│   │   │   └── repository/
│   │   │
│   │   ├── visit/                    # Visit Schedule Design
│   │   │   ├── controller/
│   │   │   │   ├── VisitDefinitionController.java       # /api/visit-definitions
│   │   │   │   └── UnscheduledVisitConfigController.java # /api/clinops/unscheduled-visit-config
│   │   │   ├── service/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   │   ├── VisitDefinitionEntity.java
│   │   │   │   ├── VisitFormEntity.java
│   │   │   │   └── UnscheduledVisitConfigEntity.java
│   │   │   └── repository/
│   │   │
│   │   ├── arm/                      # Study Arms Design
│   │   │   ├── controller/
│   │   │   │   └── StudyArmsCommandController.java      # /api/arms
│   │   │   ├── service/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   │   └── StudyArmEntity.java
│   │   │   └── repository/
│   │   │
│   │   └── phase/                    # Design Phases (screening, treatment, etc.)
│   │       ├── service/
│   │       ├── dto/
│   │       └── entity/
│   │
│   ├── build/                        # Study Database Build
│   │   ├── controller/
│   │   │   └── StudyDatabaseBuildController.java        # /api/v1/study-database-builds
│   │   ├── service/
│   │   │   ├── StudyDatabaseBuildService.java
│   │   │   └── StudyDatabaseBuildWorkerService.java
│   │   ├── dto/
│   │   ├── entity/
│   │   │   └── StudyDatabaseBuildEntity.java
│   │   ├── repository/
│   │   ├── projection/               # Event sourcing projectors
│   │   │   └── StudyBuildProjector.java
│   │   └── command/                  # CQRS commands
│   │       └── BuildStudyDatabaseCommand.java
│   │
│   └── reference/                    # Reference Data Management
│       ├── controller/
│       │   ├── CodeListController.java                  # /api/admin/codelists
│       │   └── StudyDocumentController.java             # /api/v1/documents
│       ├── service/
│       ├── dto/
│       ├── entity/
│       └── repository/
│
└── studyoperation/                   # DOMAIN 2: Study Operations (Post-Launch)
    │
    ├── enrollment/                   # Patient Enrollment & Lifecycle
    │   ├── controller/
    │   │   ├── PatientEnrollmentController.java         # /api/v1/patients (enrollment)
    │   │   ├── PatientStatusController.java             # /api/v1/patients (status mgmt)
    │   │   └── AutomatedStatusController.java           # /api/v1/studies/status/automated
    │   ├── service/
    │   │   ├── PatientEnrollmentService.java
    │   │   ├── PatientStatusService.java
    │   │   └── StatusComputationService.java
    │   ├── dto/
    │   ├── entity/
    │   │   ├── PatientEntity.java
    │   │   └── PatientStatusHistoryEntity.java
    │   ├── repository/
    │   ├── projection/               # Event sourcing projectors
    │   │   └── PatientProjector.java
    │   └── command/                  # CQRS commands
    │       ├── EnrollPatientCommand.java
    │       └── ChangePatientStatusCommand.java
    │
    ├── visit/                        # Visit Management (Operational)
    │   ├── controller/
    │   │   └── VisitController.java                     # /api/v1/visits
    │   ├── service/
    │   │   ├── UnscheduledVisitService.java
    │   │   └── VisitFormQueryService.java
    │   ├── dto/
    │   │   ├── CreateVisitRequest.java
    │   │   ├── VisitResponse.java
    │   │   ├── VisitDto.java
    │   │   ├── VisitFormDto.java
    │   │   └── UnscheduledVisitTypeDto.java
    │   ├── entity/
    │   │   └── StudyVisitInstanceEntity.java
    │   ├── repository/
    │   ├── projection/               # Event sourcing projectors
    │   │   └── VisitProjector.java
    │   └── command/                  # CQRS commands
    │       └── CreateVisitCommand.java
    │
    └── datacapture/                  # Form Data Capture
        ├── controller/
        │   └── StudyFormDataController.java             # /api/v1/form-data
        ├── service/
        │   ├── FormDataService.java
        │   └── FormDataValidationService.java
        ├── dto/
        ├── entity/
        │   └── FormDataEntity.java
        ├── repository/
        └── integration/              # External integrations (if any)
```

---

## API Endpoint Mapping (NO CHANGES - Backward Compatible)

### Study Design Domain

#### Study Setup
- `POST /api/studies` - Create study
- `GET /api/studies` - List studies
- `GET /api/studies/{id}` - Get study
- `PUT /api/studies/{id}` - Update study
- `DELETE /api/studies/{id}` - Delete study

#### Protocol Management
- `POST /api/protocol-versions` - Create protocol version
- `GET /api/protocol-versions` - List versions
- `GET /api/protocol-versions/{id}` - Get version
- `PUT /api/protocol-versions/{id}` - Update version
- `GET /api/study-versions/**` - Legacy alias (bridge)

#### Form Design
- `GET /api/form-templates` - List form templates
- `POST /api/form-templates` - Create template
- `GET /api/form-definitions` - List form definitions
- `POST /api/form-definitions` - Create definition
- `GET /api/form-bindings` - List form bindings
- `POST /api/form-bindings` - Create binding

#### Visit Design
- `GET /api/clinops/study-design` - Study design queries
- `POST /api/clinops/study-design` - Study design commands
- `GET /api/clinops/unscheduled-visit-config` - Unscheduled visit config

#### Arms
- `POST /api/arms` - Create study arm
- `GET /api/arms` - List arms
- `PUT /api/arms/{id}` - Update arm
- `DELETE /api/arms/{id}` - Delete arm

#### Study Build
- `POST /api/v1/study-database-builds` - Trigger build
- `GET /api/v1/study-database-builds/{id}` - Get build status
- `GET /api/v1/study-database-builds/study/{studyId}` - List builds

#### Reference Data
- `GET /api/admin/codelists` - Manage code lists
- `GET /api/v1/documents` - Study documents

### Study Operations Domain

#### Patient Enrollment
- `POST /api/v1/patients` - Enroll patient
- `GET /api/v1/patients` - List patients
- `GET /api/v1/patients/{id}` - Get patient
- `PUT /api/v1/patients/{id}/status` - Change status
- `GET /api/v1/studies/status/automated` - Status computation config

#### Visit Management
- `POST /api/v1/visits/unscheduled` - Create unscheduled visit
- `GET /api/v1/visits/study/{studyId}/unscheduled-types` - Get visit types
- `GET /api/v1/visits/patient/{patientId}` - Patient visits
- `GET /api/v1/visits/{visitId}` - Get visit
- `GET /api/v1/visits/{visitId}/forms` - Visit forms
- `GET /api/v1/visits/{visitId}/completion` - Visit completion

#### Data Capture
- `POST /api/v1/form-data` - Submit form data
- `GET /api/v1/form-data/visit/{visitId}` - Get visit form data
- `PUT /api/v1/form-data/{id}` - Update form data

---

## Migration Strategy

### Phase 1: Create New Structure (No Breaking Changes)
1. Create new package structure alongside existing
2. Move DTOs first (least dependencies)
3. Move entities and repositories
4. Move services
5. Move controllers LAST (keep old paths)

### Phase 2: Update Internal References
1. Update service injections
2. Update repository references
3. Update entity relationships
4. Run full test suite

### Phase 3: Deprecate Old Packages
1. Mark old classes as `@Deprecated`
2. Add redirect/alias if needed
3. Update documentation
4. Monitor for usage

### Phase 4: Cleanup (Optional)
1. Remove deprecated classes
2. Clean up unused imports
3. Update documentation

---

## Key Benefits

### 1. **Clear Domain Separation**
- **Study Design**: Everything about designing a study (forms, visits, arms)
- **Study Operations**: Running the study (patients, visits, data capture)

### 2. **Logical Grouping**
- All form-related code in `studydesign/design/form/`
- All patient-related code in `studyoperation/enrollment/`
- All visit design in `studydesign/design/visit/`
- All visit operations in `studyoperation/visit/`

### 3. **Easier Navigation**
- New developers can find code intuitively
- Clear separation of concerns
- CQRS pattern evident (command/query controllers)

### 4. **Better Scalability**
- Each domain can evolve independently
- Easy to split into microservices later
- Clear bounded contexts

---

## CQRS Pattern Applied

### Study Design (Event Sourcing)
```
Command → Aggregate → Event → Projector → ReadModel
```
- Commands: `BuildStudyDatabaseCommand`
- Aggregates: `StudyDesignAggregate`
- Events: `StudyDesignCreatedEvent`, `FormAddedEvent`
- Projectors: `StudyBuildProjector`
- ReadModels: `VisitDefinitionEntity`, `FormDefinitionEntity`

### Study Operations (Event Sourcing)
```
Command → Aggregate → Event → Projector → ReadModel
```
- Commands: `EnrollPatientCommand`, `CreateVisitCommand`
- Aggregates: `PatientAggregate`, `VisitAggregate`
- Events: `PatientEnrolledEvent`, `VisitCreatedEvent`
- Projectors: `PatientProjector`, `VisitProjector`
- ReadModels: `PatientEntity`, `StudyVisitInstanceEntity`

---

## File Movement Checklist

### From Root `controller/` → New Locations

| Old Location | New Location | API Path |
|-------------|--------------|----------|
| `controller/FormTemplateController` | `studydesign/design/form/controller/` | `/api/form-templates` |
| `controller/FormDefinitionController` | `studydesign/design/form/controller/` | `/api/form-definitions` |
| `controller/CodeListController` | `studydesign/reference/controller/` | `/api/admin/codelists` |
| `controller/AutomatedStatusComputationController` | `studyoperation/enrollment/controller/` | `/api/v1/studies/status/automated` |

### From `study/` → New Locations

| Old Location | New Location |
|-------------|--------------|
| `study/controller/StudyCommandController` | `studydesign/study/controller/` |
| `study/controller/StudyQueryController` | `studydesign/study/controller/` |
| `study/controller/StudyArmsCommandController` | `studydesign/design/arm/controller/` |
| `study/controller/FormBindingCommandController` | `studydesign/design/form/controller/` |

### From `studydatabase/` → New Location

| Old Location | New Location |
|-------------|--------------|
| `studydatabase/controller/StudyDatabaseBuildController` | `studydesign/build/controller/` |
| `studydatabase/service/StudyDatabaseBuildService` | `studydesign/build/service/` |
| `studydatabase/service/StudyDatabaseBuildWorkerService` | `studydesign/build/service/` |

### From `studydesign/` → New Location

| Old Location | New Location |
|-------------|--------------|
| `studydesign/controller/StudyDesignCommandController` | `studydesign/design/controller/` |
| `studydesign/controller/StudyDesignQueryController` | `studydesign/design/controller/` |

### From `patientenrollment/` → New Location

| Old Location | New Location |
|-------------|--------------|
| `patientenrollment/controller/PatientEnrollmentController` | `studyoperation/enrollment/controller/` |
| `patientenrollment/controller/PatientStatusController` | `studyoperation/enrollment/controller/` |
| `patientenrollment/service/*` | `studyoperation/enrollment/service/` |
| `patientenrollment/projection/PatientProjector` | `studyoperation/enrollment/projection/` |

### From `visit/` → New Locations (Split!)

| Old Location | New Location | Reason |
|-------------|--------------|--------|
| `visit/controller/VisitController` | `studyoperation/visit/controller/` | Operational (creating visits) |
| `visit/controller/UnscheduledVisitConfigController` | `studydesign/design/visit/controller/` | Design (configuring visit types) |
| `visit/service/UnscheduledVisitService` | `studyoperation/visit/service/` | Operational |
| Entity: `VisitDefinitionEntity` | `studydesign/design/visit/entity/` | Design (visit schedule) |
| Entity: `StudyVisitInstanceEntity` | `studyoperation/visit/entity/` | Operational (actual visits) |

### From `formdata/` → New Location

| Old Location | New Location |
|-------------|--------------|
| `formdata/controller/StudyFormDataController` | `studyoperation/datacapture/controller/` |
| `formdata/service/*` | `studyoperation/datacapture/service/` |

### From `document/` → New Location

| Old Location | New Location |
|-------------|--------------|
| `document/controller/StudyDocumentController` | `studydesign/reference/controller/` |
| `document/service/*` | `studydesign/reference/service/` |

### From `protocolversion/` → New Location

| Old Location | New Location |
|-------------|--------------|
| `protocolversion/controller/*` | `studydesign/protocol/controller/` |
| `protocolversion/service/*` | `studydesign/protocol/service/` |

---

## Shared/Common Components

Move to `common/` package:
- `config/*` → `common/config/`
- `security/*` → `common/security/`
- `exception/*` → `common/exception/`
- `mapper/*` → `common/mapper/`
- Base entities (AuditEntity, etc.) → `common/entity/`

Repository layer:
- Keep repositories with their entities
- Or create `common/repository/` for shared base repositories

---

## Next Steps

1. **Review & Approve** this plan
2. **Create migration scripts** (automated refactoring)
3. **Execute Phase 1** (create structure, copy files)
4. **Update imports** (IDE automated refactoring)
5. **Test thoroughly** (all APIs must work)
6. **Document new structure** (update README)

---

## Questions to Clarify

1. Should we split `visit` into design vs operations now, or later?
2. Do you want to keep `entity/` at root or move to domains?
3. Should `repository/` stay at root or move to domains?
4. Any specific naming preferences (e.g., `studydesign` vs `study-design`)?

---

## Estimated Effort

- **Phase 1 (Structure + Copy)**: 2-3 hours
- **Phase 2 (Update References)**: 4-6 hours
- **Phase 3 (Testing)**: 2-3 hours
- **Phase 4 (Cleanup)**: 1-2 hours

**Total**: 1-2 days of focused work

---

## Risk Mitigation

1. **Keep old code intact** during migration
2. **Run tests after each step**
3. **Use IDE refactoring tools** (IntelliJ/Eclipse)
4. **Git branch for refactoring** (`feature/clean-architecture`)
5. **Incremental commits** (rollback if needed)

---

**Ready to proceed?** Let me know if you want me to:
- Adjust the structure
- Start with automated migration scripts
- Create the new package structure first
