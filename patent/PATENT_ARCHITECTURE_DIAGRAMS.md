# PATENT FIGURES AND ARCHITECTURE DIAGRAMS

## FIG. 1: Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MULTI-LEVEL AUTOMATED STATUS MANAGEMENT SYSTEM              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────┐    ┌────────────────────┐    ┌──────────────────────┐   │
│  │   STUDY ENTITY    │    │ PROTOCOL VERSION   │    │    SITE ENTITY       │   │
│  │                   │    │      ENTITY        │    │                      │   │
│  │ Status: ACTIVE    │◄──►│ Status: APPROVED   │◄──►│ Status: ACTIVE       │   │
│  │ Dependencies: 3   │    │ Dependencies: 2    │    │ Dependencies: 4      │   │
│  └───────────────────┘    └────────────────────┘    └──────────────────────┘   │
│           │                         │                         │                │
│           └─────────────────────────┼─────────────────────────┘                │
│                                     ▼                                          │
│           ┌─────────────────────────────────────────────────────────┐          │
│           │         HIERARCHICAL STATUS COMPUTATION ENGINE          │          │
│           │                                                         │          │
│           │  ┌─────────────────┐  ┌──────────────────────────────┐  │          │
│           │  │ DEPENDENCY      │  │ PRIORITY-BASED RULE ENGINE  │  │          │
│           │  │ RESOLVER        │  │                              │  │          │
│           │  │ • Entity Graph  │  │ • Regulatory Rules (FDA/ICH) │  │          │
│           │  │ • Real-time     │  │ • Safety Priority           │  │          │
│           │  │   State Query   │  │ • Business Logic            │  │          │
│           │  └─────────────────┘  └──────────────────────────────┘  │          │
│           └─────────────────────────────────────────────────────────┘          │
│                                     │                                          │
│                                     ▼                                          │
│           ┌─────────────────────────────────────────────────────────┐          │
│           │         CROSS-ENTITY VALIDATION FRAMEWORK               │          │
│           │                                                         │          │
│           │  ┌─────────────────┐  ┌──────────────────────────────┐  │          │
│           │  │ DEPENDENCY      │  │ REGULATORY COMPLIANCE        │  │          │
│           │  │ GRAPH BUILDER   │  │ CHECKER                      │  │          │
│           │  │ • Node Creation │  │ • FDA Guidelines Validation  │  │          │
│           │  │ • Edge Mapping  │  │ • ICH Standard Compliance    │  │          │
│           │  │ • Graph Update  │  │ • Business Rule Enforcement  │  │          │
│           │  └─────────────────┘  └──────────────────────────────┘  │          │
│           └─────────────────────────────────────────────────────────┘          │
│                                     │                                          │
│                                     ▼                                          │
│           ┌─────────────────────────────────────────────────────────┐          │
│           │         EVENT-DRIVEN STATE SYNCHRONIZATION             │          │
│           │                                                         │          │
│           │  ┌─────────────────┐  ┌──────────────────────────────┐  │          │
│           │  │ EVENT DETECTOR  │  │ SYNCHRONIZATION ORCHESTRATOR │  │          │
│           │  │ • Status Change │  │ • Multi-Entity Updates       │  │          │
│           │  │   Monitoring    │  │ • Transaction Management     │  │          │
│           │  │ • Impact        │  │ • Rollback Capability       │  │          │
│           │  │   Analysis      │  │ • Audit Trail Generation    │  │          │
│           │  └─────────────────┘  └──────────────────────────────┘  │          │
│           └─────────────────────────────────────────────────────────┘          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## FIG. 2: Hierarchical Status Computation Engine Components

```
┌───────────────────────────────────────────────────────────────────┐
│              HIERARCHICAL STATUS COMPUTATION ENGINE               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  INPUT: Entity Status Computation Request                         │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ EntityType: STUDY                                       │     │
│  │ EntityId: 12345                                         │     │
│  │ RequestedStatus: ACTIVE                                 │     │
│  └─────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              DEPENDENCY RESOLVER                        │     │
│  │                                                         │     │
│  │ Step 1: Query Database for Dependent Entities          │     │
│  │ • Protocol Versions for Study 12345                    │     │
│  │ • Sites associated with Study 12345                    │     │
│  │ • Regulatory approvals for Study 12345                 │     │
│  │                                                         │     │
│  │ Step 2: Build Dependency Context                        │     │
│  │ • Current States of All Dependencies                    │     │
│  │ • Relationship Types and Constraints                    │     │
│  │ • Business Rule Applicability                          │     │
│  └─────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │           PRIORITY-BASED RULE ENGINE                    │     │
│  │                                                         │     │
│  │ Priority Level 1: REGULATORY COMPLIANCE                 │     │
│  │ ├─ FDA Approval Status                                  │     │
│  │ ├─ ICH Guideline Compliance                             │     │
│  │ └─ Regulatory Submission Status                         │     │
│  │                                                         │     │
│  │ Priority Level 2: SAFETY CONSIDERATIONS                 │     │
│  │ ├─ Safety Review Status                                 │     │
│  │ ├─ Adverse Event Monitoring                             │     │
│  │ └─ Risk Assessment Completion                           │     │
│  │                                                         │     │
│  │ Priority Level 3: OPERATIONAL READINESS                 │     │
│  │ ├─ Site Activation Status                               │     │
│  │ ├─ Staff Training Completion                            │     │
│  │ └─ Equipment Qualification                              │     │
│  │                                                         │     │
│  │ Priority Level 4: ADMINISTRATIVE COMPLETENESS           │     │
│  │ ├─ Documentation Status                                 │     │
│  │ ├─ Contract Execution                                   │     │
│  │ └─ Budget Approval                                      │     │
│  └─────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              STATUS CALCULATOR                          │     │
│  │                                                         │     │
│  │ Algorithm: Hierarchical Status Determination            │     │
│  │                                                         │     │
│  │ IF (All Priority 1 Rules Satisfied) THEN               │     │
│  │   IF (All Priority 2 Rules Satisfied) THEN             │     │
│  │     IF (All Priority 3 Rules Satisfied) THEN           │     │
│  │       Status = ACTIVE                                   │     │
│  │     ELSE Status = APPROVED                              │     │
│  │   ELSE Status = UNDER_REVIEW                            │     │
│  │ ELSE Status = DRAFT                                     │     │
│  └─────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│  OUTPUT: Computed Entity Status with Justification               │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ ComputedStatus: ACTIVE                                  │     │
│  │ Justification: All dependencies satisfied               │     │
│  │ DependencyDetails: [...detailed breakdown...]          │     │
│  │ NextReviewDate: 2025-10-28                             │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## FIG. 3: Cross-Entity Validation Framework Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CROSS-ENTITY VALIDATION FRAMEWORK                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  VALIDATION REQUEST                                                         │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ EntityType: PROTOCOL_VERSION                                │           │
│  │ EntityId: PV-456                                            │           │
│  │ FromStatus: UNDER_REVIEW                                    │           │
│  │ ToStatus: APPROVED                                          │           │
│  │ InitiatedBy: regulatory.reviewer@clinprecision.com         │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │            DEPENDENCY GRAPH BUILDER                         │           │
│  │                                                             │           │
│  │ Step 1: Identify Related Entities                          │           │
│  │ ┌─────────────────────────────────────────────────────────┐ │           │
│  │ │ PROTOCOL_VERSION: PV-456                                │ │           │
│  │ │ ├─ STUDY: ST-123 (Status: UNDER_REVIEW)                │ │           │
│  │ │ ├─ SITES: [SI-789, SI-790, SI-791]                     │ │           │
│  │ │ │  └─ SI-789 (Status: READY_FOR_ACTIVATION)            │ │           │
│  │ │ │  └─ SI-790 (Status: READY_FOR_ACTIVATION)            │ │           │
│  │ │ │  └─ SI-791 (Status: UNDER_SETUP)                     │ │           │
│  │ │ └─ REGULATORY: REG-555 (Status: PENDING_APPROVAL)      │ │           │
│  │ └─────────────────────────────────────────────────────────┘ │           │
│  │                                                             │           │
│  │ Step 2: Build Real-time Dependency Graph                   │           │
│  │ ┌─────────────────────────────────────────────────────────┐ │           │
│  │ │        ST-123           REG-555                         │ │           │
│  │ │          │                 │                           │ │           │
│  │ │          └───── PV-456 ────┘                           │ │           │
│  │ │                  │                                     │ │           │
│  │ │            ┌─────┼─────┐                               │ │           │
│  │ │         SI-789  SI-790  SI-791                        │ │           │
│  │ └─────────────────────────────────────────────────────────┘ │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │           CONSTRAINT VALIDATOR                              │           │
│  │                                                             │           │
│  │ Business Rule Validation:                                   │           │
│  │                                                             │           │
│  │ ✓ Rule BR-001: Protocol Version can only be APPROVED       │           │
│  │   if parent Study is not in TERMINATED status              │           │
│  │   Current: Study ST-123 = UNDER_REVIEW ✓                  │           │
│  │                                                             │           │
│  │ ✓ Rule BR-002: Protocol Version approval requires          │           │
│  │   at least one Site in READY_FOR_ACTIVATION status         │           │
│  │   Current: SI-789, SI-790 = READY_FOR_ACTIVATION ✓        │           │
│  │                                                             │           │
│  │ ⚠ Rule BR-003: All Sites should be ready before            │           │
│  │   Protocol Version approval                                 │           │
│  │   Current: SI-791 = UNDER_SETUP ⚠ WARNING                 │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │        REGULATORY COMPLIANCE CHECKER                        │           │
│  │                                                             │           │
│  │ FDA Guidelines Validation:                                  │           │
│  │ ✓ CFR 21.312.1: Protocol amendments properly documented    │           │
│  │ ✓ CFR 21.312.2: Regulatory submission requirements met     │           │
│  │ ✓ CFR 21.312.3: IRB/IEC approval status verified          │           │
│  │                                                             │           │
│  │ ICH Guidelines Validation:                                  │           │
│  │ ✓ ICH-GCP 2.9: Protocol version control maintained         │           │
│  │ ✓ ICH-GCP 4.5: Investigator qualifications verified       │           │
│  │ ✓ ICH-GCP 8.2: Quality assurance requirements met         │           │
│  │                                                             │           │
│  │ Compliance Status: COMPLIANT                               │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  VALIDATION RESULT                                                          │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ ValidationStatus: APPROVED_WITH_WARNINGS                   │           │
│  │ CriticalIssues: 0                                          │           │
│  │ Warnings: 1                                                │           │
│  │ WarningDetails: "Site SI-791 not ready for activation"     │           │
│  │ RegulatoryCompliance: COMPLIANT                            │           │
│  │ RecommendedAction: "Proceed with approval, monitor SI-791" │           │
│  │ AuditTrailId: AT-789123                                    │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## FIG. 4: Event-Driven State Synchronization Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 EVENT-DRIVEN STATE SYNCHRONIZATION                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TRIGGER EVENT                                                              │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ EventType: STATUS_CHANGED                                   │           │
│  │ SourceEntity: PROTOCOL_VERSION                              │           │
│  │ EntityId: PV-456                                            │           │
│  │ FromStatus: UNDER_REVIEW                                    │           │
│  │ ToStatus: APPROVED                                          │           │
│  │ Timestamp: 2025-09-28T10:30:00Z                            │           │
│  │ UserId: regulatory.reviewer@clinprecision.com              │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │              EVENT DETECTOR                                 │           │
│  │                                                             │           │
│  │ 1. Event Reception and Validation                          │           │
│  │    ├─ Event schema validation                              │           │
│  │    ├─ Source entity existence check                       │           │
│  │    └─ User authorization verification                      │           │
│  │                                                             │           │
│  │ 2. Event Classification                                    │           │
│  │    ├─ Event Priority: HIGH (Protocol Version Approval)    │           │
│  │    ├─ Impact Scope: MULTI_ENTITY                          │           │
│  │    └─ Processing Mode: SYNCHRONOUS                        │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │              IMPACT ANALYZER                                │           │
│  │                                                             │           │
│  │ Dependency Impact Analysis:                                 │           │
│  │                                                             │           │
│  │ Primary Impacts:                                           │           │
│  │ ┌─────────────────────────────────────────────────────────┐ │           │
│  │ │ STUDY: ST-123                                           │ │           │
│  │ │ Current Status: UNDER_REVIEW                            │ │           │
│  │ │ Recommended Action: RECOMPUTE_STATUS                    │ │           │
│  │ │ Reason: Active Protocol Version now available          │ │           │
│  │ └─────────────────────────────────────────────────────────┘ │           │
│  │                                                             │           │
│  │ Secondary Impacts:                                         │           │
│  │ ┌─────────────────────────────────────────────────────────┐ │           │
│  │ │ SITES: [SI-789, SI-790, SI-791]                        │ │           │
│  │ │ Current Status: READY_FOR_ACTIVATION                    │ │           │
│  │ │ Recommended Action: ENABLE_ACTIVATION                   │ │           │
│  │ │ Reason: Approved Protocol Version available            │ │           │
│  │ └─────────────────────────────────────────────────────────┘ │           │
│  │                                                             │           │
│  │ Tertiary Impacts:                                          │           │
│  │ ┌─────────────────────────────────────────────────────────┐ │           │
│  │ │ PARTICIPANTS: All enrolled participants                 │ │           │
│  │ │ Current Status: Various                                 │ │           │
│  │ │ Recommended Action: UPDATE_PROTOCOL_REFERENCE           │ │           │
│  │ │ Reason: Protocol Version reference update required     │ │           │
│  │ └─────────────────────────────────────────────────────────┘ │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │         SYNCHRONIZATION ORCHESTRATOR                       │           │
│  │                                                             │           │
│  │ Transaction Management:                                     │           │
│  │                                                             │           │
│  │ Phase 1: Preparation                                       │           │
│  │ ├─ Create distributed transaction context                  │           │
│  │ ├─ Acquire locks on all affected entities                  │           │
│  │ └─ Validate all proposed status changes                    │           │
│  │                                                             │           │
│  │ Phase 2: Execution                                         │           │
│  │ ├─ Execute status updates in dependency order              │           │
│  │ ├─ Update STUDY ST-123: UNDER_REVIEW → APPROVED           │           │
│  │ ├─ Update SITES [SI-789, SI-790]: → READY_TO_ACTIVATE     │           │
│  │ └─ Update PARTICIPANTS: Protocol references               │           │
│  │                                                             │           │
│  │ Phase 3: Confirmation                                      │           │
│  │ ├─ Verify all updates completed successfully               │           │
│  │ ├─ Generate audit trail entries                           │           │
│  │ ├─ Release entity locks                                    │           │
│  │ └─ Commit distributed transaction                          │           │
│  │                                                             │           │
│  │ Rollback Capability:                                       │           │
│  │ ├─ Automatic rollback on any failure                       │           │
│  │ ├─ Entity state restoration to pre-event status           │           │
│  │ └─ Error notification and logging                          │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  SYNCHRONIZATION RESULT                                                     │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ SynchronizationStatus: SUCCESS                             │           │
│  │ EntitiesUpdated: 4 (1 Study, 3 Sites)                     │           │
│  │ ParticipantsAffected: 25                                   │           │
│  │ TransactionId: TX-789456123                                │           │
│  │ ProcessingTime: 245ms                                      │           │
│  │ AuditTrailIds: [AT-789124, AT-789125, AT-789126]          │           │
│  │ NotificationsSent: 8                                       │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## FIG. 5: Compliance Rule Engine Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLIANCE RULE ENGINE ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │            REGULATORY RULE REPOSITORY                       │           │
│  │                                                             │           │
│  │ FDA Rules (21 CFR):                                        │           │
│  │ ┌─────────────────────────────────────────────────────────┐ │           │
│  │ │ CFR 312.60: General responsibilities of investigators   │ │           │
│  │ │ CFR 312.62: Investigator record keeping requirements    │ │           │
│  │ │ CFR 312.64: Investigator reports                       │ │           │
│  │ │ CFR 312.66: Assurance of IRB review                    │ │           │
│  │ │ CFR 312.70: Sponsor responsibilities                    │ │           │
│  │ └─────────────────────────────────────────────────────────┘ │           │
│  │                                                             │           │
│  │ ICH Guidelines:                                            │           │
│  │ ┌─────────────────────────────────────────────────────────┐ │           │
│  │ │ ICH-GCP 1.1: Good Clinical Practice principles         │ │           │
│  │ │ ICH-GCP 2.9: Protocol compliance requirements          │ │           │
│  │ │ ICH-GCP 4.1: Investigator qualifications              │ │           │
│  │ │ ICH-GCP 4.5: Protocol deviations reporting            │ │           │
│  │ │ ICH-GCP 8.2: Quality assurance procedures             │ │           │
│  │ └─────────────────────────────────────────────────────────┘ │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │          BUSINESS RULE REPOSITORY                           │           │
│  │                                                             │           │
│  │ Clinical Trial Workflow Rules:                             │           │
│  │ ┌─────────────────────────────────────────────────────────┐ │           │
│  │ │ BR-001: Study cannot be ACTIVE without approved protocol│ │           │
│  │ │ BR-002: Sites require activated protocol for enrollment │ │           │
│  │ │ BR-003: Participants require active site for enrollment │ │           │
│  │ │ BR-004: Protocol versions follow sequential approval    │ │           │
│  │ │ BR-005: Status changes require authorized user actions  │ │           │
│  │ └─────────────────────────────────────────────────────────┘ │           │
│  │                                                             │           │
│  │ Entity Relationship Rules:                                 │           │
│  │ ┌─────────────────────────────────────────────────────────┐ │           │
│  │ │ ER-001: One-to-many: Study to Protocol Versions        │ │           │
│  │ │ ER-002: Many-to-many: Studies to Sites                 │ │           │
│  │ │ ER-003: Many-to-one: Participants to Sites             │ │           │
│  │ │ ER-004: Many-to-one: Sites to Protocol Versions       │ │           │
│  │ │ ER-005: Hierarchical: Study → Protocol → Site → Participant│ │       │
│  │ └─────────────────────────────────────────────────────────┘ │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │              RULE EXECUTION ENGINE                          │           │
│  │                                                             │           │
│  │ Rule Processing Pipeline:                                   │           │
│  │                                                             │           │
│  │ 1. Rule Selection                                          │           │
│  │    ├─ Context Analysis (Entity Type, Status Transition)    │           │
│  │    ├─ Applicable Rule Identification                       │           │
│  │    └─ Rule Priority Ordering                               │           │
│  │                                                             │           │
│  │ 2. Rule Evaluation                                         │           │
│  │    ├─ Entity State Retrieval                              │           │
│  │    ├─ Rule Condition Assessment                            │           │
│  │    └─ Compliance Status Determination                      │           │
│  │                                                             │           │
│  │ 3. Rule Enforcement                                        │           │
│  │    ├─ Violation Prevention (Block invalid transitions)     │           │
│  │    ├─ Warning Generation (Flag potential issues)          │           │
│  │    └─ Corrective Action Recommendation                     │           │
│  │                                                             │           │
│  │ 4. Audit Trail Generation                                  │           │
│  │    ├─ Rule Execution Logging                               │           │
│  │    ├─ Compliance Decision Recording                        │           │
│  │    └─ Regulatory Reporting Preparation                     │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                   │                                         │
│                                   ▼                                         │
│  COMPLIANCE ASSESSMENT RESULT                                               │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ ComplianceStatus: COMPLIANT                                │           │
│  │ RulesEvaluated: 12                                         │           │
│  │ RulesPassed: 11                                            │           │
│  │ RulesFailed: 0                                             │           │
│  │ WarningsGenerated: 1                                       │           │
│  │ WarningDetails: "Site readiness optimization recommended"   │           │
│  │ RegulatoryReporting: AUTO_GENERATED                       │           │
│  │ AuditTrailId: AT-COMP-789123                              │           │
│  │ NextReviewDate: 2025-10-28                                │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```