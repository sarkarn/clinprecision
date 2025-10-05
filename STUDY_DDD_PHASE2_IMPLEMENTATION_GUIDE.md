# Study DDD Migration - Phase 2: Write Path Implementation
## Date: October 4, 2025
## Status: 🚀 **STARTING PHASE 2**

---

## Phase 1 Recap ✅

**Completed**:
- [x] Domain Model (Commands, Events, Aggregate, Projection)
- [x] Database Migration Script
- [x] Entity/Repository UUID Enhancements
- [x] Compilation Success
- [x] Bean Name Conflict Resolved

**Phase 1 Achievement**: Complete DDD infrastructure with zero breaking changes!

---

## Phase 2 Overview: Write Path Migration

**Goal**: Route all study write operations (create, update, status changes) through the DDD aggregate instead of direct JPA

**Duration**: 1-2 days

**Approach**: Blue-Green deployment pattern
- Keep legacy methods working
- Add new DDD methods alongside
- Gradually migrate callers
- Remove legacy when safe

---

## Phase 2 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     WRITE PATH (Phase 2)                      │
└──────────────────────────────────────────────────────────────┘

   HTTP Request (POST /api/studies)
          │
          ▼
   ┌─────────────────┐
   │ StudyController │  ← Frontend entry point
   └─────────────────┘
          │
          ├──── Legacy Path (Phase 1) ──────────────┐
          │                                          │
          │         ┌─────────────────┐            │
          │         │  StudyService   │            │
          │         │  (CRUD logic)   │            │
          │         └─────────────────┘            │
          │                 │                       │
          │                 ▼                       │
          │         ┌─────────────────┐            │
          │         │ StudyRepository │            │
          │         │  (JPA save)     │            │
          │         └─────────────────┘            │
          │                 │                       │
          │                 ▼                       │
          │         ┌─────────────────┐            │
          │         │    Database     │            │
          │         └─────────────────┘            │
          │                                          │
          └──── NEW DDD Path (Phase 2) ─────────────┤
                                                     │
                  ┌─────────────────────┐           │
                  │ StudyCommandService │  ← NEW!   │
                  │  (DDD orchestration) │           │
                  └─────────────────────┘           │
                           │                         │
                           ▼                         │
                  ┌─────────────────┐               │
                  │  CommandGateway │  ← Axon       │
                  └─────────────────┘               │
                           │                         │
                           ▼                         │
                  ┌─────────────────┐               │
                  │ StudyAggregate  │  ← DDD        │
                  │  @CommandHandler │               │
                  └─────────────────┘               │
                           │                         │
                           ▼                         │
                  ┌─────────────────┐               │
                  │   Apply Event   │               │
                  └─────────────────┘               │
                           │                         │
                           ▼                         │
                  ┌─────────────────┐               │
                  │  Axon EventStore│               │
                  └─────────────────┘               │
                           │                         │
                           ▼                         │
                  ┌─────────────────┐               │
                  │ StudyProjection │  ← Updates    │
                  │  @EventHandler  │     Read Model│
                  └─────────────────┘               │
                           │                         │
                           ▼                         │
                  ┌─────────────────┐               │
                  │  StudyEntity    │               │
                  │   (Database)    │               │
                  └─────────────────┘               │
                                                     │
                    Both paths lead to ──────────────┘
                    database, but DDD path
                    adds event sourcing!
```

---

## Phase 2 Components to Build

### 1. StudyCommandService ✨ NEW

**Purpose**: Orchestrates DDD commands for study write operations

**Responsibilities**:
- Receive DTOs from controller
- Convert to domain commands
- Send commands via CommandGateway
- Handle responses and map to DTOs
- Transaction management

**File**: `StudyCommandService.java`

**Methods**:
```java
UUID createStudy(StudyCreateRequestDto request);
void updateStudy(UUID studyUuid, StudyUpdateRequestDto request);
void changeStudyStatus(UUID studyUuid, StatusChangeRequestDto request);
void suspendStudy(UUID studyUuid, String reason);
void resumeStudy(UUID studyUuid);
void completeStudy(UUID studyUuid);
void terminateStudy(UUID studyUuid, String reason);
void withdrawStudy(UUID studyUuid, String reason);
```

---

### 2. StudyQueryService ✨ NEW

**Purpose**: Handles all read operations for studies

**Responsibilities**:
- Query StudyRepository by UUID
- Convert entities to DTOs
- Handle not found scenarios
- Support complex queries

**File**: `StudyQueryService.java`

**Methods**:
```java
StudyResponseDto getStudyByUuid(UUID studyUuid);
StudyResponseDto getStudyById(Long id);  // Bridge method
List<StudyResponseDto> getAllStudies();
List<StudyResponseDto> getStudiesByStatus(StudyStatusCode status);
List<StudyResponseDto> getStudiesByOrganization(Long orgId);
boolean existsByUuid(UUID studyUuid);
```

---

### 3. StudyController Updates 🔧 MODIFY

**Purpose**: Update controller to use new services

**Changes**:
- Inject StudyCommandService and StudyQueryService
- Keep existing StudyService for legacy callers (bridge)
- Add UUID-based endpoints
- Deprecate Long ID endpoints gradually

**File**: `StudyController.java`

**New Endpoints**:
```java
// Write operations (use CommandService)
POST   /api/studies                          → createStudy()
PUT    /api/studies/{uuid}                   → updateStudy()
POST   /api/studies/{uuid}/status            → changeStatus()
POST   /api/studies/{uuid}/suspend           → suspendStudy()
POST   /api/studies/{uuid}/resume            → resumeStudy()
POST   /api/studies/{uuid}/complete          → completeStudy()
POST   /api/studies/{uuid}/terminate         → terminateStudy()
POST   /api/studies/{uuid}/withdraw          → withdrawStudy()

// Read operations (use QueryService)
GET    /api/studies                          → getAllStudies()
GET    /api/studies/{uuid}                   → getStudyByUuid()
GET    /api/studies/by-status/{status}       → getByStatus()
```

---

### 4. DTOs (Request/Response) ✨ NEW

**Purpose**: Clean API contract separate from domain model

**Files to Create**:

#### Request DTOs
- `StudyCreateRequestDto.java` - Create study payload
- `StudyUpdateRequestDto.java` - Update study payload
- `StatusChangeRequestDto.java` - Status change payload
- `SuspendStudyRequestDto.java` - Suspend payload
- `TerminateStudyRequestDto.java` - Terminate payload
- `WithdrawStudyRequestDto.java` - Withdraw payload

#### Response DTOs
- `StudyResponseDto.java` - Study details response
- `StudyListResponseDto.java` - Study list item
- `StudyStatusResponseDto.java` - Status info

---

### 5. Mapper Classes ✨ NEW

**Purpose**: Convert between entities, commands, DTOs

**Files**:
- `StudyCommandMapper.java` - DTO → Command
- `StudyResponseMapper.java` - Entity → DTO

---

## Phase 2 Implementation Steps

### Step 1: Create DTOs (30 minutes)

Create request/response DTOs with validation annotations:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyCreateRequestDto {
    @NotBlank(message = "Study name is required")
    private String name;
    
    private String protocolNumber;
    private String sponsor;
    private String description;
    
    @NotNull(message = "Organization is required")
    private Long organizationId;
    
    private Long studyStatusId;
    private Long regulatoryStatusId;
    private Long studyPhaseId;
    
    private LocalDate startDate;
    private LocalDate endDate;
    // ... all other fields
}
```

### Step 2: Create Mapper Classes (20 minutes)

Convert DTOs to commands and entities to DTOs:

```java
@Component
public class StudyCommandMapper {
    
    public CreateStudyCommand toCreateCommand(StudyCreateRequestDto dto, String userId, String userName) {
        return CreateStudyCommand.builder()
            .studyAggregateUuid(UUID.randomUUID())
            .name(dto.getName())
            .protocolNumber(dto.getProtocolNumber())
            .sponsor(dto.getSponsor())
            .userId(userId)
            .userName(userName)
            .build();
    }
    
    public UpdateStudyCommand toUpdateCommand(UUID studyUuid, StudyUpdateRequestDto dto, String userId) {
        return UpdateStudyCommand.builder()
            .studyAggregateUuid(studyUuid)
            .name(dto.getName())
            .userId(userId)
            .build();
    }
}
```

### Step 3: Create StudyCommandService (45 minutes)

Orchestrate commands through Axon CommandGateway:

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyCommandService {
    
    private final CommandGateway commandGateway;
    private final StudyCommandMapper commandMapper;
    private final SecurityService securityService;  // Get current user
    
    @Transactional
    public UUID createStudy(StudyCreateRequestDto request) {
        log.info("Creating study: {}", request.getName());
        
        // Get current user from security context
        String userId = securityService.getCurrentUserId();
        String userName = securityService.getCurrentUserName();
        
        // Convert DTO to command
        CreateStudyCommand command = commandMapper.toCreateCommand(request, userId, userName);
        
        // Send command and wait for result
        try {
            commandGateway.sendAndWait(command);
            log.info("Study created successfully with UUID: {}", command.getStudyAggregateUuid());
            return command.getStudyAggregateUuid();
        } catch (Exception e) {
            log.error("Failed to create study: {}", e.getMessage(), e);
            throw new StudyCreationException("Failed to create study", e);
        }
    }
    
    @Transactional
    public void updateStudy(UUID studyUuid, StudyUpdateRequestDto request) {
        log.info("Updating study: {}", studyUuid);
        
        String userId = securityService.getCurrentUserId();
        UpdateStudyCommand command = commandMapper.toUpdateCommand(studyUuid, request, userId);
        
        commandGateway.sendAndWait(command);
    }
    
    @Transactional
    public void suspendStudy(UUID studyUuid, String reason) {
        log.info("Suspending study: {}", studyUuid);
        
        SuspendStudyCommand command = SuspendStudyCommand.builder()
            .studyAggregateUuid(studyUuid)
            .reason(reason)
            .userId(securityService.getCurrentUserId())
            .userName(securityService.getCurrentUserName())
            .build();
        
        commandGateway.sendAndWait(command);
    }
    
    // ... other methods
}
```

### Step 4: Create StudyQueryService (30 minutes)

Handle all read operations:

```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StudyQueryService {
    
    private final StudyRepository studyRepository;
    private final StudyResponseMapper responseMapper;
    
    public StudyResponseDto getStudyByUuid(UUID studyUuid) {
        log.debug("Fetching study by UUID: {}", studyUuid);
        
        StudyEntity entity = studyRepository.findByAggregateUuid(studyUuid)
            .orElseThrow(() -> new StudyNotFoundException(studyUuid));
        
        return responseMapper.toResponseDto(entity);
    }
    
    public StudyResponseDto getStudyById(Long id) {
        log.debug("Fetching study by ID: {} (bridge method)", id);
        
        StudyEntity entity = studyRepository.findById(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        return responseMapper.toResponseDto(entity);
    }
    
    public List<StudyResponseDto> getAllStudies() {
        return studyRepository.findAll().stream()
            .map(responseMapper::toResponseDto)
            .collect(Collectors.toList());
    }
    
    public boolean existsByUuid(UUID studyUuid) {
        return studyRepository.existsByAggregateUuid(studyUuid);
    }
}
```

### Step 5: Update StudyController (40 minutes)

Add new DDD endpoints alongside legacy ones:

```java
@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
@Slf4j
public class StudyController {
    
    // NEW DDD services
    private final StudyCommandService commandService;
    private final StudyQueryService queryService;
    
    // LEGACY service (keep for backward compatibility)
    private final StudyService legacyStudyService;
    
    // ==================== NEW DDD ENDPOINTS ====================
    
    /**
     * Create new study via DDD aggregate
     * POST /api/studies
     */
    @PostMapping
    public ResponseEntity<StudyResponseDto> createStudy(@Valid @RequestBody StudyCreateRequestDto request) {
        log.info("Creating study via DDD: {}", request.getName());
        
        // Create via aggregate (returns UUID)
        UUID studyUuid = commandService.createStudy(request);
        
        // Query the projection to get complete data
        StudyResponseDto response = queryService.getStudyByUuid(studyUuid);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Update study via DDD aggregate
     * PUT /api/studies/{uuid}
     */
    @PutMapping("/{uuid}")
    public ResponseEntity<StudyResponseDto> updateStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody StudyUpdateRequestDto request) {
        log.info("Updating study via DDD: {}", uuid);
        
        commandService.updateStudy(uuid, request);
        StudyResponseDto response = queryService.getStudyByUuid(uuid);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get study by UUID (DDD path)
     * GET /api/studies/{uuid}
     */
    @GetMapping("/{uuid}")
    public ResponseEntity<StudyResponseDto> getStudyByUuid(@PathVariable UUID uuid) {
        StudyResponseDto study = queryService.getStudyByUuid(uuid);
        return ResponseEntity.ok(study);
    }
    
    /**
     * Suspend study
     * POST /api/studies/{uuid}/suspend
     */
    @PostMapping("/{uuid}/suspend")
    public ResponseEntity<Void> suspendStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody SuspendStudyRequestDto request) {
        commandService.suspendStudy(uuid, request.getReason());
        return ResponseEntity.noContent().build();
    }
    
    // ==================== LEGACY ENDPOINTS (Bridge) ====================
    
    /**
     * Get study by Long ID (legacy - for backward compatibility)
     * GET /api/studies/by-id/{id}
     * @deprecated Use UUID-based endpoint instead
     */
    @Deprecated
    @GetMapping("/by-id/{id}")
    public ResponseEntity<StudyResponseDto> getStudyById(@PathVariable Long id) {
        StudyResponseDto study = queryService.getStudyById(id);
        return ResponseEntity.ok(study);
    }
}
```

### Step 6: Integration Testing (1 hour)

Create comprehensive tests:

```java
@SpringBootTest
@AutoConfigureAxonFramework
@Transactional
class StudyDDDIntegrationTest {
    
    @Autowired
    private StudyCommandService commandService;
    
    @Autowired
    private StudyQueryService queryService;
    
    @Autowired
    private EventStore eventStore;
    
    @Test
    void testCreateStudy_EndToEnd() {
        // Given
        StudyCreateRequestDto request = StudyCreateRequestDto.builder()
            .name("DDD Test Study")
            .sponsor("Test Sponsor")
            .protocolNumber("DDD-001")
            .build();
        
        // When
        UUID studyUuid = commandService.createStudy(request);
        
        // Then
        // 1. Verify study created in database
        StudyResponseDto study = queryService.getStudyByUuid(studyUuid);
        assertThat(study.getName()).isEqualTo("DDD Test Study");
        
        // 2. Verify event stored in Axon event store
        List<DomainEventMessage<?>> events = eventStore.readEvents(studyUuid.toString())
            .asStream()
            .collect(Collectors.toList());
        assertThat(events).hasSize(1);
        assertThat(events.get(0).getPayload()).isInstanceOf(StudyCreatedEvent.class);
    }
}
```

---

## Phase 2 Success Criteria

- [ ] StudyCommandService created and working
- [ ] StudyQueryService created and working
- [ ] All DTOs created with validation
- [ ] Mapper classes implemented
- [ ] StudyController updated with DDD endpoints
- [ ] Legacy endpoints still working (bridge maintained)
- [ ] Study creation via aggregate successful
- [ ] Events stored in Axon event store
- [ ] Projection updates read model correctly
- [ ] Integration tests passing
- [ ] Manual testing successful

---

## Testing Checklist

### Unit Tests
- [ ] StudyCommandService - all methods
- [ ] StudyQueryService - all methods
- [ ] StudyCommandMapper - DTO to Command conversion
- [ ] StudyResponseMapper - Entity to DTO conversion

### Integration Tests
- [ ] Create study end-to-end
- [ ] Update study end-to-end
- [ ] Status transitions end-to-end
- [ ] Suspend/Resume/Complete operations
- [ ] Event store verification
- [ ] Projection verification

### Manual API Tests
```bash
# Create study
curl -X POST http://localhost:8080/api/studies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manual Test Study",
    "sponsor": "Test Sponsor",
    "protocolNumber": "MAN-001"
  }'

# Get study by UUID
curl http://localhost:8080/api/studies/{uuid}

# Update study
curl -X PUT http://localhost:8080/api/studies/{uuid} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Study Name"
  }'

# Suspend study
curl -X POST http://localhost:8080/api/studies/{uuid}/suspend \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Temporary hold for protocol amendment"
  }'
```

---

## Rollback Plan

If Phase 2 fails, rollback is easy:
1. Remove new DDD endpoints from controller
2. Remove CommandService and QueryService
3. Keep legacy StudyService active
4. Phase 1 infrastructure remains (no harm done)

**Impact**: Zero - legacy path still works!

---

## Next: Phase 3 (After Phase 2 Complete)

**Phase 3: Read Path Migration**
- Update frontend to use UUIDs
- Remove ProtocolVersion bridge methods
- Migrate all callers to DDD endpoints
- Deprecate Long ID usage

**Estimated Duration**: 1 week

---

**Phase 2 Status**: 🚀 **READY TO START**  
**Estimated Time**: 1-2 days  
**Risk Level**: Low (legacy path maintained as fallback)
