# Patent Drawings - Event Sourcing Architecture for Clinical Trials
## USPTO-Compliant Technical Drawings

**Patent Application**: Event Sourcing Architecture for Clinical Trial Management  
**Date**: October 17, 2025  
**Drawing Standards**: USPTO 37 CFR 1.84

---

## DRAWING INSTRUCTIONS

### USPTO Requirements
1. **Format**: Black ink on white paper
2. **Size**: 8.5" x 11" (letter size)
3. **Margins**: 1" top, 1" left/right, 1" bottom
4. **Line width**: Minimum 0.3mm
5. **Text size**: Minimum 0.32cm (1/8 inch) high
6. **Reference numerals**: Numbers pointing to components
7. **Figure numbering**: FIG. 1, FIG. 2, etc.
8. **Shading**: Use reference numerals, avoid gray shading if possible

### Tools for Creating Drawings
- **Draw.io**: https://app.diagrams.net (Free, recommended)
- **Lucidchart**: https://www.lucidchart.com
- **Microsoft Visio**: Professional diagrams
- **Patent Drawing Software**: PatentDrawing.com

---

## FIGURE 1: System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                   │
│                   CLINICAL TRIAL MANAGEMENT SYSTEM (100)                         │
│                                                                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│                                                                                   │
│   USER INTERFACE (110)                                                           │
│   ┌─────────────────────────────────────────────────────────────┐               │
│   │  Study Setup (111)  │  Patient Enrollment (112)              │               │
│   │  Data Capture (113) │  Reporting (114)                       │               │
│   └───────────────────────────┬─────────────────────────────────┘               │
│                               │                                                   │
│                               │ Commands (120)                                    │
│                               ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────┐               │
│   │            COMMAND GATEWAY (130)                             │               │
│   │         (Routes commands to aggregates)                      │               │
│   └───────────────────────────┬─────────────────────────────────┘               │
│                               │                                                   │
│                               ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────┐               │
│   │           EVENT-SOURCED AGGREGATES (140)                     │               │
│   │                                                               │               │
│   │   Study Aggregate (141)  │  Patient Aggregate (142)          │               │
│   │   Visit Aggregate (143)  │  Form Data Aggregate (144)        │               │
│   │                                                               │               │
│   │   [Business Logic & Validation]                              │               │
│   └───────────────────────────┬─────────────────────────────────┘               │
│                               │                                                   │
│                               │ Events (150)                                      │
│                               ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────┐               │
│   │              EVENT STORE (160)                               │               │
│   │            (Append-Only Database)                            │               │
│   │                                                               │               │
│   │  [event_id | aggregate_id | event_type | event_data |       │               │
│   │   metadata | timestamp | sequence_number]                    │               │
│   │                                                               │               │
│   │  ► No UPDATE or DELETE operations                            │               │
│   │  ► Immutable event history                                   │               │
│   │  ► Complete audit trail                                      │               │
│   └───────────────────────────┬─────────────────────────────────┘               │
│                               │                                                   │
│                               │ Event Stream (170)                                │
│                ┌──────────────┴───────────────┐                                  │
│                │                               │                                  │
│                ▼                               ▼                                  │
│   ┌──────────────────────┐       ┌──────────────────────┐                       │
│   │  EVENT HANDLERS (180)│       │  PROJECTORS (190)    │                       │
│   │  (Side Effects)      │       │  (Read Models)       │                       │
│   │                      │       │                      │                       │
│   │  • Notifications     │       │  • Study Overview    │                       │
│   │  • Integrations      │       │  • Patient List      │                       │
│   │  • Workflows         │       │  • Visit Schedule    │                       │
│   └──────────────────────┘       │  • Audit Reports     │                       │
│                                   └───────────┬──────────┘                       │
│                                               │                                   │
│                                               ▼                                   │
│                                   ┌──────────────────────┐                       │
│                                   │  READ DATABASE (200) │                       │
│                                   │  (Optimized Queries) │                       │
│                                   └──────────────────────┘                       │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

Reference Numerals:
100 - Clinical Trial Management System
110 - User Interface Layer
111 - Study Setup Module
112 - Patient Enrollment Module
113 - Data Capture Module
114 - Reporting Module
120 - Commands (User Actions)
130 - Command Gateway
140 - Event-Sourced Aggregates
141 - Study Aggregate
142 - Patient Aggregate
143 - Visit Aggregate
144 - Form Data Aggregate
150 - Events
160 - Event Store (Append-Only)
170 - Event Stream
180 - Event Handlers
190 - Projectors
200 - Read Database
```

**Figure 1 Description**: System architecture showing event flow from user interface through command gateway to event-sourced aggregates, which generate events stored in append-only event store. Events are consumed by handlers and projectors to create read models.

---

## FIGURE 2: Event Store Structure and Audit Trail

```
┌─────────────────────────────────────────────────────────────────────┐
│                      EVENT STORE TABLE (160)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  event_id (210)     │ UUID                │ Primary Key              │
│  aggregate_type (211) │ VARCHAR(50)       │ "Study", "Patient"       │
│  aggregate_id (212)   │ UUID              │ Links to entity          │
│  event_type (213)     │ VARCHAR(100)      │ "StudyCreated"           │
│  event_version (214)  │ INT               │ Event schema version     │
│  event_data (215)     │ JSON              │ Event payload            │
│  metadata (216)       │ JSON              │ Audit information        │
│  occurred_at (217)    │ TIMESTAMP         │ When event happened      │
│  sequence_number (218)│ BIGINT            │ Global ordering          │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                     METADATA STRUCTURE (216)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  {                                                                    │
│    "user_id": "12345"              (220) ◄── WHO                     │
│    "user_name": "Dr. Jane Smith"   (221)                             │
│    "reason": "Protocol amendment"  (222) ◄── WHY                     │
│    "ip_address": "192.168.1.100"   (223) ◄── WHERE                   │
│    "user_agent": "Chrome 118.0"    (224)                             │
│    "session_id": "abc-123"         (225)                             │
│  }                                                                    │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                    EXAMPLE EVENT RECORD                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  event_id:       "550e8400-e29b-41d4-a716-446655440000"             │
│  aggregate_type: "Study"                                             │
│  aggregate_id:   "650e8400-e29b-41d4-a716-446655440001"             │
│  event_type:     "StudyCreatedEvent"                                 │
│  event_version:  1                                                   │
│  event_data: {                                                       │
│    "protocol_number": "PROTO-2025-001",                              │
│    "organization_id": 123,                                           │
│    "study_phase": "PHASE_III"                                        │
│  }                                                                   │
│  metadata: {                                                         │
│    "user_id": "12345",                                               │
│    "user_name": "Dr. Jane Smith",                                    │
│    "reason": "New hypertension trial",                               │
│    "ip_address": "192.168.1.100"                                     │
│  }                                                                   │
│  occurred_at:    "2025-10-17T14:30:00Z"                              │
│  sequence_number: 1001                                               │
│                                                                       │
│  ► IMMUTABLE - Never updated or deleted                              │
│  ► Complete audit trail by design                                    │
│  ► FDA 21 CFR Part 11 compliant                                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

Reference Numerals:
160 - Event Store Table
210 - Event ID
211 - Aggregate Type
212 - Aggregate ID
213 - Event Type
214 - Event Version
215 - Event Data (Payload)
216 - Metadata (Audit Information)
217 - Occurred At (Timestamp)
218 - Sequence Number
220 - User ID (WHO)
221 - User Name
222 - Reason (WHY)
223 - IP Address (WHERE)
224 - User Agent
225 - Session ID
```

**Figure 2 Description**: Event store structure showing append-only table with immutable events. Each event contains complete audit information (who, what, when, why) enabling automatic audit trail generation without separate audit tables.

---

## FIGURE 3: Protocol Version Management with Build ID

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    PROTOCOL VERSION MANAGEMENT (300)                       │
└───────────────────────────────────────────────────────────────────────────┘

TIME: January 2025                        TIME: June 2025
┌──────────────────────────────┐         ┌──────────────────────────────┐
│  PROTOCOL VERSION 1.0 (310)  │         │  PROTOCOL VERSION 2.0 (320)  │
│  build_id: 1001              │         │  build_id: 1002              │
│  Amendment: INITIAL          │         │  Amendment: MAJOR            │
└──────────────┬───────────────┘         └──────────────┬───────────────┘
               │                                         │
               │                                         │
               ▼                                         ▼
┌──────────────────────────────┐         ┌──────────────────────────────┐
│   VISIT DEFINITIONS (330)    │         │   VISIT DEFINITIONS (330)    │
│   (Master Templates)         │         │   (Master Templates)         │
│                              │         │                              │
│   • Screening Visit          │         │   • Screening Visit          │
│   • Baseline Visit           │         │   • Baseline Visit           │
│   • Week 4 Visit             │         │   • Week 4 Visit             │
│   • Week 8 Visit             │         │   • Week 8 Visit ◄── NEW     │
│                              │         │   • Week 12 Visit ◄── NEW    │
│   [NO build_id column]       │         │   [NO build_id column]       │
└──────────────┬───────────────┘         └──────────────┬───────────────┘
               │                                         │
               │ Tagged with build_id                    │ Tagged with build_id
               ▼                                         ▼
┌──────────────────────────────┐         ┌──────────────────────────────┐
│   VISIT_FORMS TABLE (340)    │         │   VISIT_FORMS TABLE (340)    │
│   (Mappings)                 │         │   (Mappings)                 │
│                              │         │                              │
│   visit_id | form_id | build_id       │   visit_id | form_id | build_id
│   1        | 101     | 1001           │   1        | 101     | 1002
│   2        | 102     | 1001           │   2        | 102     | 1002
│   3        | 103     | 1001           │   3        | 103     | 1002
│                                        │   4        | 104     | 1002 ◄── NEW
│                                        │   5        | 105     | 1002 ◄── NEW
└──────────────┬───────────────┘         └──────────────┬───────────────┘
               │                                         │
               │                                         │
               ▼                                         ▼
┌──────────────────────────────┐         ┌──────────────────────────────┐
│  PATIENT ENROLLMENT (350)    │         │  PATIENT ENROLLMENT (350)    │
│                              │         │                              │
│  Patient 001                 │         │  Patient 003                 │
│  build_id: 1001 ◄────────────┤         │  build_id: 1002 ◄────────────┤
│  (Uses Version 1.0)          │         │  (Uses Version 2.0)          │
│                              │         │                              │
│  Patient 002                 │         │  Patient 004                 │
│  build_id: 1001 ◄────────────┤         │  build_id: 1002 ◄────────────┤
│  (Uses Version 1.0)          │         │  (Uses Version 2.0)          │
└──────────────┬───────────────┘         └──────────────┬───────────────┘
               │                                         │
               │                                         │
               ▼                                         ▼
┌──────────────────────────────┐         ┌──────────────────────────────┐
│  VISIT INSTANCES (360)       │         │  VISIT INSTANCES (360)       │
│                              │         │                              │
│  Patient 001: 3 visits       │         │  Patient 003: 5 visits       │
│  build_id: 1001 (each)       │         │  build_id: 1002 (each)       │
│                              │         │                              │
│  Patient 002: 3 visits       │         │  Patient 004: 5 visits       │
│  build_id: 1001 (each)       │         │  build_id: 1002 (each)       │
└──────────────┬───────────────┘         └──────────────┬───────────────┘
               │                                         │
               │                                         │
               ▼                                         ▼
┌──────────────────────────────┐         ┌──────────────────────────────┐
│  FORM DATA (370)             │         │  FORM DATA (370)             │
│                              │         │                              │
│  Patient 001: Data collected │         │  Patient 003: Data collected │
│  build_id: 1001 (all forms)  │         │  build_id: 1002 (all forms)  │
│                              │         │                              │
│  Patient 002: Data collected │         │  Patient 004: Data collected │
│  build_id: 1001 (all forms)  │         │  build_id: 1002 (all forms)  │
└──────────────────────────────┘         └──────────────────────────────┘

KEY INSIGHTS:
► Patients 001 & 002: Remain on Version 1.0 (3 visits)
► Patients 003 & 004: Use Version 2.0 (5 visits)
► NO DATA MIGRATION REQUIRED
► Each patient's data linked to their protocol version via build_id

Reference Numerals:
300 - Protocol Version Management System
310 - Protocol Version 1.0
320 - Protocol Version 2.0
330 - Visit Definitions (Master Templates)
340 - Visit Forms Mapping Table
350 - Patient Enrollment
360 - Visit Instances
370 - Form Data
```

**Figure 3 Description**: Protocol version management showing how build_id propagates from protocol versions through mappings to patient data. Existing patients remain on their enrolled version while new patients use the latest version. No data migration required for protocol amendments.

---

## FIGURE 4: Time-Travel Query Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│              TIME-TRAVEL QUERY SYSTEM (400)                              │
└─────────────────────────────────────────────────────────────────────────┘

USER QUERY (410): "What was patient enrollment count on June 1, 2024?"

                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Query Event Store (420)                                        │
│                                                                          │
│  SELECT * FROM event_store                                              │
│  WHERE aggregate_id = '650e8400-...'  -- Study ID                       │
│    AND occurred_at <= '2024-06-01T23:59:59Z'                            │
│  ORDER BY sequence_number ASC;                                          │
│                                                                          │
│  ► Filters events up to target date                                     │
│  ► Orders by sequence for correct replay                                │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Event Stream (430)                                             │
│                                                                          │
│  Event 1 (Jan 15): StudyCreatedEvent                                    │
│  Event 2 (Feb 10): PatientEnrolledEvent (Patient 001)                   │
│  Event 3 (Mar 20): PatientEnrolledEvent (Patient 002)                   │
│  Event 4 (Apr 15): VisitCompletedEvent (Patient 001, Visit 1)           │
│  Event 5 (May 30): PatientEnrolledEvent (Patient 003)                   │
│  Event 6 (Jun 01): PatientEnrolledEvent (Patient 004) ◄── INCLUDED     │
│  Event 7 (Jun 15): PatientEnrolledEvent (Patient 005) ◄── EXCLUDED     │
│                                                                          │
│  ► Only events before/on June 1, 2024 included                          │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Aggregate Reconstruction (440)                                 │
│                                                                          │
│  StudyAggregate study = new StudyAggregate();                           │
│                                                                          │
│  for (Event event : events) {                                           │
│      study.applyEvent(event);  // Replay event                          │
│  }                                                                       │
│                                                                          │
│  ► State rebuilt by replaying historical events                         │
│  ► Exact state as of June 1, 2024                                       │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: State at Point in Time (450)                                   │
│                                                                          │
│  StudyAggregate state {                                                 │
│    studyId: "650e8400-...",                                             │
│    protocolNumber: "PROTO-2025-001",                                    │
│    status: ACTIVE,                                                      │
│    enrolledPatients: [001, 002, 003, 004],  ◄── 4 patients             │
│    totalVisitsCompleted: 1                                              │
│  }                                                                      │
│                                                                          │
│  ► Historical state reconstructed                                       │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Query Result (460)                                             │
│                                                                          │
│  ANSWER: 4 patients enrolled as of June 1, 2024                         │
│                                                                          │
│  Details:                                                                │
│  • Patient 001: Enrolled Feb 10, 2024                                   │
│  • Patient 002: Enrolled Mar 20, 2024                                   │
│  • Patient 003: Enrolled May 30, 2024                                   │
│  • Patient 004: Enrolled Jun 01, 2024                                   │
│  • Patient 005: NOT INCLUDED (enrolled after target date)               │
│                                                                          │
│  ► Definitive answer for regulatory audit                               │
│  ► No guessing or approximate data                                      │
└─────────────────────────────────────────────────────────────────────────┘

USE CASES (470):
• FDA Inspections: Prove exact state during audit period
• Debugging: Reproduce issues by replaying to problem point
• Compliance: Verify no data tampering or backdating
• Historical Reporting: Generate reports for any time period
• Root Cause Analysis: Understand how state evolved over time

Reference Numerals:
400 - Time-Travel Query System
410 - User Query
420 - Event Store Query
430 - Filtered Event Stream
440 - Aggregate Reconstruction
450 - Historical State
460 - Query Result
470 - Use Cases
```

**Figure 4 Description**: Time-travel query process showing how historical aggregate state is reconstructed by filtering events up to target date and replaying them. Enables answering regulatory questions about past states definitively without approximations.

---

## FIGURE 5: CQRS Architecture - Read/Write Separation

```
┌─────────────────────────────────────────────────────────────────────────┐
│              CQRS ARCHITECTURE (500)                                     │
│         (Command Query Responsibility Segregation)                       │
└─────────────────────────────────────────────────────────────────────────┘

WRITE SIDE (Command Path)                   READ SIDE (Query Path)
═══════════════════════════                 ══════════════════════

┌──────────────────────┐                    ┌──────────────────────┐
│   USER ACTIONS (510) │                    │   USER QUERIES (560) │
│                      │                    │                      │
│  • Enroll Patient    │                    │  • List Patients     │
│  • Complete Visit    │                    │  • View Study        │
│  • Submit Form       │                    │  • Generate Report   │
│  • Amend Protocol    │                    │  • Search Data       │
└──────────┬───────────┘                    └──────────┬───────────┘
           │                                            │
           │ Commands (520)                             │ Queries (570)
           ▼                                            ▼
┌──────────────────────┐                    ┌──────────────────────┐
│  COMMAND HANDLERS    │                    │  QUERY HANDLERS      │
│       (530)          │                    │       (580)          │
│                      │                    │                      │
│  • Validate rules    │                    │  • Execute query     │
│  • Check constraints │                    │  • Return results    │
│  • Generate events   │                    │  • No side effects   │
└──────────┬───────────┘                    └──────────┬───────────┘
           │                                            │
           │ Events (540)                               │ Results (590)
           ▼                                            │
┌──────────────────────┐                               │
│   EVENT STORE (550)  │                               │
│   (Append-Only)      │                               │
│                      │                               │
│  • Immutable events  │                               │
│  • Complete history  │                               │
│  • Audit trail       │                               │
└──────────┬───────────┘                               │
           │                                            │
           │ Event Stream (555)                         │
           ▼                                            │
┌──────────────────────┐                               │
│   PROJECTORS (600)   │                               │
│   (Event Handlers)   │                               │
│                      │                               │
│  • Study Projector   │───────────────────────────────┤
│  • Patient Projector │                               │
│  • Report Projector  │                               │
└──────────┬───────────┘                               │
           │                                            │
           │ Update (610)                               │
           ▼                                            │
┌──────────────────────┐                               │
│  READ MODELS (620)   │◄──────────────────────────────┘
│  (Denormalized)      │
│                      │
│  • patient_list      │
│  • study_overview    │
│  • visit_schedule    │
│  • audit_reports     │
└──────────────────────┘

KEY PRINCIPLES:
┌─────────────────────────────────────────────────────────────┐
│ WRITE SIDE (Commands)          │  READ SIDE (Queries)       │
├────────────────────────────────┼────────────────────────────┤
│ • Validates business rules     │  • No validation           │
│ • Generates events             │  • Direct database reads   │
│ • Slow (validation overhead)   │  • Fast (optimized views)  │
│ • Event-sourced aggregates     │  • Denormalized tables     │
│ • Consistency first            │  • Performance first       │
│ • Single responsibility        │  • Multiple views          │
└────────────────────────────────┴────────────────────────────┘

BENEFITS (630):
► Independent scaling of reads and writes
► Optimized read models for specific queries
► Event-driven microservices architecture
► Multiple projections from same event stream
► Eventual consistency acceptable for read models

Reference Numerals:
500 - CQRS Architecture
510 - User Actions (Commands)
520 - Commands
530 - Command Handlers
540 - Events Generated
550 - Event Store
555 - Event Stream
560 - User Queries
570 - Queries
580 - Query Handlers
590 - Query Results
600 - Projectors (Event Handlers)
610 - Read Model Updates
620 - Read Models (Denormalized)
630 - CQRS Benefits
```

**Figure 5 Description**: CQRS architecture separating write path (commands creating events) from read path (queries from optimized models). Events from write side trigger projectors that update denormalized read models for fast queries. Enables independent scaling and optimization of reads vs writes.

---

## FIGURE 6: Audit Trail Generation Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│           AUTOMATED AUDIT TRAIL GENERATION (700)                         │
└─────────────────────────────────────────────────────────────────────────┘

REGULATORY REQUEST (710): "Generate audit trail for Study PROTO-2025-001"

                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Query Event Store (720)                                        │
│                                                                          │
│  SELECT * FROM event_store                                              │
│  WHERE aggregate_type = 'Study'                                         │
│    AND aggregate_id = '650e8400-...'                                    │
│  ORDER BY occurred_at ASC;                                              │
│                                                                          │
│  ► No separate audit tables needed                                      │
│  ► Events ARE the audit trail                                           │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Event Records with Metadata (730)                              │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Event 1: StudyCreatedEvent                                       │   │
│  │ ─────────────────────────────────────────────────────────────────│   │
│  │ Timestamp:  2025-01-15 09:00:00                                  │   │
│  │ User:       Dr. Jane Smith (ID: 12345)                           │   │
│  │ Action:     Created study PROTO-2025-001                         │   │
│  │ Reason:     "New Phase III hypertension trial"                   │   │
│  │ IP Address: 192.168.1.100                                        │   │
│  │ Changes:    protocol_number: null → "PROTO-2025-001"             │   │
│  │             status: null → "PLANNING"                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Event 2: ProtocolVersionCreatedEvent                             │   │
│  │ ─────────────────────────────────────────────────────────────────│   │
│  │ Timestamp:  2025-02-01 14:30:00                                  │   │
│  │ User:       Dr. Jane Smith (ID: 12345)                           │   │
│  │ Action:     Created protocol version 1.0                         │   │
│  │ Reason:     "Initial protocol approval"                          │   │
│  │ IP Address: 192.168.1.100                                        │   │
│  │ Changes:    version: null → "1.0"                                │   │
│  │             amendment_type: "INITIAL"                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Event 3: PatientEnrolledEvent                                    │   │
│  │ ─────────────────────────────────────────────────────────────────│   │
│  │ Timestamp:  2025-03-10 11:15:00                                  │   │
│  │ User:       Dr. Bob Wilson (ID: 54321)                           │   │
│  │ Action:     Enrolled patient 001                                 │   │
│  │ Reason:     "Patient met eligibility criteria"                   │   │
│  │ IP Address: 192.168.2.50                                         │   │
│  │ Changes:    patient_id: null → 001                               │   │
│  │             enrollment_date: "2025-03-10"                        │   │
│  │             build_id: 1001 (Version 1.0)                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Generate Audit Report (740)                                    │
│                                                                          │
│  ╔═══════════════════════════════════════════════════════════════════╗ │
│  ║             AUDIT TRAIL REPORT                                    ║ │
│  ║          Study: PROTO-2025-001                                    ║ │
│  ║          Period: Jan 1, 2025 - Oct 17, 2025                      ║ │
│  ╚═══════════════════════════════════════════════════════════════════╝ │
│                                                                          │
│  SUMMARY:                                                                │
│  • Total Events: 147                                                     │
│  • Users Involved: 8 (Dr. Smith, Dr. Wilson, ...)                       │
│  • Critical Changes: 12 (protocol amendments, patient enrollments)       │
│  • Data Integrity: ✓ VERIFIED (hash: abc123...)                         │
│                                                                          │
│  TIMELINE:                                                               │
│  Jan 15 09:00  │ Dr. Smith    │ Study Created                           │
│  Feb 01 14:30  │ Dr. Smith    │ Protocol v1.0 Created                   │
│  Mar 10 11:15  │ Dr. Wilson   │ Patient 001 Enrolled                    │
│  Apr 05 10:00  │ Dr. Wilson   │ Patient 001 Visit 1 Completed           │
│  ...           │ ...          │ ...                                     │
│                                                                          │
│  CRITICAL CHANGES (FDA 21 CFR Part 11):                                 │
│  1. Protocol Created (Jan 15) - Dr. Smith                               │
│  2. Protocol v1.0 Approved (Feb 01) - Dr. Smith                         │
│  3. First Patient Enrolled (Mar 10) - Dr. Wilson                        │
│  4. Protocol v2.0 Amendment (Jun 15) - Dr. Smith                        │
│     Reason: "Added 2 new study visits for safety monitoring"            │
│                                                                          │
│  DATA INTEGRITY VERIFICATION:                                            │
│  • Event sequence: VALID (no gaps in sequence numbers)                  │
│  • Timestamps: MONOTONIC (events in chronological order)                │
│  • Hash chain: VERIFIED (no tampering detected)                         │
│  • User authentication: ALL VALID                                       │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Compliance Certification (750)                                 │
│                                                                          │
│  ✓ FDA 21 CFR Part 11 COMPLIANT                                         │
│    • Complete audit trail                                               │
│    • Immutable records                                                  │
│    • User authentication                                                │
│    • Reason for change documented                                       │
│    • Timestamp integrity verified                                       │
│                                                                          │
│  ✓ ICH-GCP COMPLIANT                                                    │
│    • All protocol changes documented                                    │
│    • Patient enrollment tracked                                         │
│    • Data collection audit trail                                        │
│                                                                          │
│  Report Generated: 2025-10-17 15:30:00                                  │
│  Report Hash: abc123def456...                                           │
│  Certification: VALID                                                   │
└─────────────────────────────────────────────────────────────────────────┘

KEY ADVANTAGES (760):
► No separate audit tables to maintain
► Audit trail generated from event store automatically
► Complete traceability (who, what, when, why)
► Tamper-proof (immutable events)
► Real-time availability (no batch processing)
► Cryptographic verification of data integrity

Reference Numerals:
700 - Automated Audit Trail Generation System
710 - Regulatory Request
720 - Event Store Query
730 - Event Records with Metadata
740 - Generated Audit Report
750 - Compliance Certification
760 - Key Advantages
```

**Figure 6 Description**: Automated audit trail generation showing how regulatory compliance reports are created directly from event store without separate audit tables. Each event contains complete audit metadata (who, what, when, why) enabling FDA 21 CFR Part 11 and ICH-GCP compliance by architectural design.

---

## INSTRUCTIONS FOR PATENT ATTORNEY

### Creating Final USPTO Drawings

1. **Use Professional Drawing Software**
   - Draw.io, Lucidchart, or Visio
   - Export as high-resolution black & white images
   - Ensure clean lines (minimum 0.3mm width)

2. **Follow USPTO Standards**
   - Paper size: 8.5" x 11" (letter)
   - Margins: 1" all sides
   - Reference numerals: Use numbers from descriptions above
   - Figure labels: "FIG. 1", "FIG. 2", etc.
   - No gray shading (use hatching/patterns if needed)

3. **Include All Figures**
   - Figure 1: System Architecture Overview
   - Figure 2: Event Store Structure
   - Figure 3: Protocol Version Management
   - Figure 4: Time-Travel Query Process
   - Figure 5: CQRS Architecture
   - Figure 6: Audit Trail Generation

4. **Reference Numeral List**
   Create a separate sheet listing all reference numerals and their meanings for USPTO filing.

---

## ADDITIONAL DOCUMENTATION

### Supporting Materials to Provide Attorney

1. **Code Samples** (Sanitized)
   - Event store implementation
   - Aggregate examples
   - Command handlers
   - Projector implementations

2. **Database Schemas**
   - Event store table structure
   - Read model tables
   - Migration scripts

3. **Performance Benchmarks**
   - Event replay speed
   - Query performance
   - Scalability metrics

4. **Compliance Documentation**
   - FDA 21 CFR Part 11 compliance checklist
   - ICH-GCP compliance mapping
   - Audit trail examples

---

**These drawing descriptions and ASCII diagrams should be converted to professional USPTO-compliant drawings by your patent attorney or a professional patent illustrator.**

**Cost for professional patent drawings**: $100-$300 per figure (6 figures = $600-$1,800)

---

**END OF DRAWING SPECIFICATIONS**
