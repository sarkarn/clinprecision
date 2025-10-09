# Protocol Version Controller Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐ │
│  │  Submit for Review   │  │  Create Version      │  │  List Versions   │ │
│  │  Button              │  │  Button              │  │  Table           │ │
│  └──────────┬───────────┘  └──────────┬───────────┘  └──────────┬───────┘ │
└─────────────┼──────────────────────────┼──────────────────────────┼─────────┘
              │                          │                          │
              │ PUT /api/study-          │ POST /api/studies/       │ GET /api/studies/
              │ versions/1/status        │ 11/versions              │ 11/versions
              │ (Long ID)                │ (Study scope)            │ (Study scope)
              ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND CONTROLLERS                                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ProtocolVersionBridgeController                                     │  │
│  │  /api/study-versions                                                 │  │
│  │                                                                       │  │
│  │  • PUT /{versionId}/status  ←─────────────── Individual operations   │  │
│  │    - Accepts Long ID                         with legacy IDs         │  │
│  │    - Resolves to UUID                                                │  │
│  │    - Delegates to command service                                    │  │
│  └──────────────────────────────┬───────────────────────────────────────┘  │
│                                 │                                           │
│                                 ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  StudyCommandController              StudyQueryController            │  │
│  │  /api/studies                        /api/studies                    │  │
│  │                                                                       │  │
│  │  • POST /{studyId}/versions  ←──── Study-scoped operations ───────▶ │  │
│  │    - Create version FOR study        with bridge pattern            │  │
│  │    - Resolves study aggregate                                        │  │
│  │    - Delegates to PV service         • GET /{studyId}/versions      │  │
│  │                                        - List versions FOR study     │  │
│  │                                        - Delegates to PV service     │  │
│  └──────────────────────────────┬──────────────────────┬────────────────┘  │
│                                 │                      │                    │
│                                 ▼                      ▼                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ProtocolVersionCommandService      ProtocolVersionQueryService      │  │
│  │                                                                       │  │
│  │  • createVersionSync()              • findByStudyUuidOrderedByDate() │  │
│  │  • changeStatusSync()               • findById()                     │  │
│  │  • approveVersionSync()             • findByAggregateUuid()          │  │
│  │  • activateVersionSync()                                             │  │
│  └──────────────────────────────┬──────────────────────┬────────────────┘  │
│                                 │                      │                    │
│                                 ▼                      ▼                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ProtocolVersionAggregate (DDD)      ProtocolVersionEntity (Read)   │  │
│  │                                                                       │  │
│  │  • Commands → Events                 • JPA Entity                    │  │
│  │  • Business logic                    • Query optimized               │  │
│  │  • State transitions                 • Legacy ID + UUID              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       PURE DDD ENDPOINTS (Optional)                          │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ProtocolVersionCommandController                                    │  │
│  │  /api/protocol-versions                                              │  │
│  │                                                                       │  │
│  │  • POST /                           - Direct UUID-based operations   │  │
│  │  • PUT /{uuid}/status                (No bridge needed)              │  │
│  │  • PUT /{uuid}/approve                                               │  │
│  │  • PUT /{uuid}/activate                                              │  │
│  │  • PUT /{uuid}                                                       │  │
│  │  • DELETE /{uuid}                                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ProtocolVersionQueryController                                      │  │
│  │  /api/protocol-versions                                              │  │
│  │                                                                       │  │
│  │  • GET /{uuid}                      - Direct UUID-based queries      │  │
│  │  • GET /study/{studyUuid}            (No bridge needed)              │  │
│  │  • GET /study/{studyUuid}/active                                     │  │
│  │  • GET /status/{status}                                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

ROUTING RULES:
═══════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend Call                        →  Backend Controller                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  PUT /api/study-versions/1/status     →  ProtocolVersionBridgeController   │
│  (Individual version operation)           (Long ID → UUID → Command)        │
│                                                                              │
│  POST /api/studies/11/versions        →  StudyCommandController             │
│  (Create version FOR study 11)            (Study scope → PV service)        │
│                                                                              │
│  GET /api/studies/11/versions         →  StudyQueryController               │
│  (List versions FOR study 11)             (Study scope → PV service)        │
│                                                                              │
│  PUT /api/protocol-versions/{uuid}/status → ProtocolVersionCommandController│
│  (Direct DDD operation)                   (Pure UUID, no bridge)            │
└─────────────────────────────────────────────────────────────────────────────┘

KEY PRINCIPLES:
═══════════════

✅ Individual version operations   → ProtocolVersion controllers
✅ Study-scoped operations         → Study controllers (delegate to PV services)
✅ Legacy Long IDs                 → Bridge controllers (convert to UUID)
✅ Pure UUID operations            → Pure DDD controllers (no conversion)
✅ Business logic                  → Services and Aggregates (NOT controllers)

❌ DON'T: Implement protocol version logic in Study controllers
❌ DON'T: Create duplicate endpoints in multiple controllers
❌ DON'T: Mix legacy ID and UUID operations in same controller
```
