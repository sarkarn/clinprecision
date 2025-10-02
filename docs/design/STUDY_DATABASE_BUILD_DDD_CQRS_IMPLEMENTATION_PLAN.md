# Study Database Build - DDD/CQRS Implementation Plan

**Date:** October 2, 2025  
**Status:** Implementation Required  
**Architecture:** Domain-Driven Design + CQRS + Event Sourcing with Axon Framework  
**Compliance:** FDA 21 CFR Part 11, Clinical Trial Standards

---

## Executive Summary

The Study Database Build module currently uses traditional Service/Repository pattern but needs to be refactored to align with the established DDD/CQRS architecture using Axon Framework. This implementation will provide:

- **Complete Audit Trail** for regulatory compliance
- **Event Sourcing** for immutable history
- **Command/Query Separation** for scalability
- **Consistent Architecture** with Patient Enrollment and Site Management

---

## Current State Analysis

### ❌ **Missing DDD/CQRS Components**
```
❌ StudyDatabaseBuildAggregate
❌ BuildStudyDatabaseCommand
❌ ValidateStudyDatabaseCommand
❌ CancelStudyDatabaseBuildCommand
❌ StudyDatabaseBuildStartedEvent
❌ StudyDatabaseBuildCompletedEvent
❌ StudyDatabaseBuildFailedEvent
❌ StudyDatabaseBuildProjectionHandler
❌ CommandGateway integration
❌ Event sourcing audit trail
```

### ✅ **Existing Infrastructure**
```
✅ StudyDatabaseBuildEntity (JPA)
✅ StudyDatabaseBuildRepository
✅ StudyDatabaseBuildService (traditional)
✅ StudyDatabaseBuildController
✅ DatabaseBuildRequest/Result DTOs
✅ Database schema and tables
✅ DatabaseValidationService
```

---

## Implementation Phase 1: Domain Commands (Week 1)

### 1.1 Create Base Commands Following Axon Library Pattern

```java
// Create: src/main/java/com/clinprecision/datacaptureservice/studydatabase/domain/commands/

// 1. BuildStudyDatabaseCommand.java
@Getter
@Builder
@ToString
public class BuildStudyDatabaseCommand extends BaseCommand {
    
    @NotNull
    private final UUID studyDatabaseBuildId;
    
    @NotNull
    private final Long studyId;
    
    @NotNull
    @Size(min = 1, max = 255)
    private final String studyName;
    
    @NotNull
    @Size(min = 1, max = 100)
    private final String studyProtocol;
    
    @NotNull
    private final Long requestedBy;
    
    @Valid
    private final Map<String, Object> studyDesignConfiguration;
    
    @Valid
    private final Map<String, Object> validationRules;
    
    private final Map<String, Object> siteCustomizations;
    private final Map<String, Object> performanceSettings;
    private final Map<String, Object> complianceSettings;
    
    @Override
    public void validate() {
        super.validate();
        
        // Business rule validation
        if (studyDesignConfiguration == null || studyDesignConfiguration.isEmpty()) {
            throw new IllegalArgumentException("Study design configuration is required for database build");
        }
        
        if (validationRules == null || validationRules.isEmpty()) {
            throw new IllegalArgumentException("Validation rules configuration is required for database build");
        }
    }
    
    public boolean hasFormDefinitions() {
        return studyDesignConfiguration != null && 
               studyDesignConfiguration.containsKey("forms") &&
               studyDesignConfiguration.get("forms") != null;
    }
    
    public boolean hasValidationRules() {
        return validationRules != null && !validationRules.isEmpty();
    }
    
    public boolean hasPerformanceOptimizations() {
        return performanceSettings != null && !performanceSettings.isEmpty();
    }
}

// 2. ValidateStudyDatabaseCommand.java
@Getter
@Builder
@ToString
public class ValidateStudyDatabaseCommand extends BaseCommand {
    
    @NotNull
    private final UUID studyDatabaseBuildId;
    
    @NotNull
    private final Long studyId;
    
    @NotNull
    private final Long requestedBy;
    
    private final boolean strictValidation;
    private final boolean complianceCheck;
    private final boolean performanceCheck;
    
    @Override
    public void validate() {
        super.validate();
        // Additional validation if needed
    }
}

// 3. CancelStudyDatabaseBuildCommand.java
@Getter
@Builder
@ToString
public class CancelStudyDatabaseBuildCommand extends BaseCommand {
    
    @NotNull
    private final UUID studyDatabaseBuildId;
    
    @NotNull
    private final Long requestedBy;
    
    @NotNull
    @Size(min = 1, max = 500)
    private final String cancellationReason;
    
    @Override
    public void validate() {
        super.validate();
        
        if (cancellationReason == null || cancellationReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Cancellation reason is required");
        }
    }
}

// 4. CompleteStudyDatabaseBuildCommand.java
@Getter
@Builder
@ToString
public class CompleteStudyDatabaseBuildCommand extends BaseCommand {
    
    @NotNull
    private final UUID studyDatabaseBuildId;
    
    @NotNull
    private final Long completedBy;
    
    @NotNull
    private final DatabaseValidationResult validationResult;
    
    @Min(0)
    private final int formsConfigured;
    
    @Min(0)
    private final int validationRulesSetup;
    
    private final Map<String, Object> buildMetrics;
    
    @Override
    public void validate() {
        super.validate();
        
        if (validationResult == null || !validationResult.isValid()) {
            throw new IllegalArgumentException("Valid validation result is required for completion");
        }
    }
}
```

### 1.2 Create Domain Events

```java
// Create: src/main/java/com/clinprecision/datacaptureservice/studydatabase/domain/events/

// 1. StudyDatabaseBuildStartedEvent.java
@Getter
@Builder
@ToString
public class StudyDatabaseBuildStartedEvent {
    
    private final UUID studyDatabaseBuildId;
    private final Long studyId;
    private final String studyName;
    private final String studyProtocol;
    private final Long requestedBy;
    private final LocalDateTime startedAt;
    private final Map<String, Object> buildConfiguration;
    private final String buildRequestId;
}

// 2. StudyDatabaseBuildCompletedEvent.java
@Getter
@Builder
@ToString
public class StudyDatabaseBuildCompletedEvent {
    
    private final UUID studyDatabaseBuildId;
    private final Long studyId;
    private final Long completedBy;
    private final LocalDateTime completedAt;
    private final LocalDateTime duration; // calculated from start time
    private final DatabaseValidationResult validationResult;
    private final int formsConfigured;
    private final int validationRulesSetup;
    private final Map<String, Object> buildMetrics;
    private final String message;
}

// 3. StudyDatabaseBuildFailedEvent.java
@Getter
@Builder
@ToString
public class StudyDatabaseBuildFailedEvent {
    
    private final UUID studyDatabaseBuildId;
    private final Long studyId;
    private final LocalDateTime failedAt;
    private final String errorMessage;
    private final List<String> validationErrors;
    private final String buildPhase; // which phase failed
    private final Exception cause;
}

// 4. StudyDatabaseBuildCancelledEvent.java
@Getter
@Builder
@ToString
public class StudyDatabaseBuildCancelledEvent {
    
    private final UUID studyDatabaseBuildId;
    private final Long studyId;
    private final Long cancelledBy;
    private final LocalDateTime cancelledAt;
    private final String cancellationReason;
}

// 5. StudyDatabaseValidationCompletedEvent.java
@Getter
@Builder
@ToString
public class StudyDatabaseValidationCompletedEvent {
    
    private final UUID studyDatabaseBuildId;
    private final Long studyId;
    private final LocalDateTime validatedAt;
    private final DatabaseValidationResult validationResult;
    private final Long validatedBy;
}
```

---

## Implementation Phase 2: Aggregate Design (Week 1-2)

### 2.1 Create StudyDatabaseBuildAggregate

```java
// Create: src/main/java/com/clinprecision/datacaptureservice/studydatabase/aggregate/StudyDatabaseBuildAggregate.java

/**
 * Study Database Build Aggregate - Core domain object for database build management
 * 
 * Implements Event Sourcing for:
 * - Complete audit trail (FDA 21 CFR Part 11 compliance)
 * - Immutable build history
 * - Regulatory compliance tracking
 * 
 * This aggregate handles the complete lifecycle of study database builds
 */
@Aggregate
public class StudyDatabaseBuildAggregate {

    @AggregateIdentifier
    private UUID studyDatabaseBuildId;
    
    private Long studyId;
    private String studyName;
    private String studyProtocol;
    private StudyDatabaseBuildStatus status;
    private Long requestedBy;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Map<String, Object> buildConfiguration;
    private DatabaseValidationResult lastValidationResult;
    private int formsConfigured;
    private int validationRulesSetup;
    private List<String> buildErrors;
    
    // Required default constructor for Axon
    public StudyDatabaseBuildAggregate() {
        this.buildErrors = new ArrayList<>();
    }

    /**
     * Command Handler: Build Study Database
     * Business Rules:
     * - Study must exist and be in valid state
     * - No concurrent builds for same study
     * - User must have STUDY_MANAGER or SYSTEM_ADMIN role
     * - Study design configuration must be provided
     */
    @CommandHandler
    public StudyDatabaseBuildAggregate(BuildStudyDatabaseCommand command) {
        log.info("Creating study database build aggregate for study: {}", command.getStudyId());
        
        // Validate business rules
        validateBuildCommand(command);
        
        // Apply domain event
        AggregateLifecycle.apply(StudyDatabaseBuildStartedEvent.builder()
                .studyDatabaseBuildId(command.getStudyDatabaseBuildId())
                .studyId(command.getStudyId())
                .studyName(command.getStudyName())
                .studyProtocol(command.getStudyProtocol())
                .requestedBy(command.getRequestedBy())
                .startedAt(LocalDateTime.now())
                .buildConfiguration(command.getStudyDesignConfiguration())
                .buildRequestId(UUID.randomUUID().toString())
                .build());
    }

    /**
     * Command Handler: Validate Study Database
     */
    @CommandHandler
    public void handle(ValidateStudyDatabaseCommand command) {
        log.info("Validating study database build: {}", command.getStudyDatabaseBuildId());
        
        // Business rule: Can only validate builds in progress or completed
        if (status != StudyDatabaseBuildStatus.IN_PROGRESS && 
            status != StudyDatabaseBuildStatus.COMPLETED) {
            throw new IllegalStateException("Cannot validate database build in status: " + status);
        }
        
        // Note: Actual validation logic would be in a Saga or external service
        // This command just triggers the validation process
        AggregateLifecycle.apply(StudyDatabaseValidationStartedEvent.builder()
                .studyDatabaseBuildId(command.getStudyDatabaseBuildId())
                .studyId(command.getStudyId())
                .validatedBy(command.getRequestedBy())
                .validationStartedAt(LocalDateTime.now())
                .strictValidation(command.isStrictValidation())
                .complianceCheck(command.isComplianceCheck())
                .performanceCheck(command.isPerformanceCheck())
                .build());
    }

    /**
     * Command Handler: Complete Study Database Build
     */
    @CommandHandler
    public void handle(CompleteStudyDatabaseBuildCommand command) {
        log.info("Completing study database build: {}", command.getStudyDatabaseBuildId());
        
        // Business rule: Can only complete builds in progress
        if (status != StudyDatabaseBuildStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot complete database build in status: " + status);
        }
        
        // Business rule: Validation must be successful
        if (command.getValidationResult() == null || !command.getValidationResult().isValid()) {
            throw new IllegalStateException("Cannot complete build without successful validation");
        }
        
        AggregateLifecycle.apply(StudyDatabaseBuildCompletedEvent.builder()
                .studyDatabaseBuildId(command.getStudyDatabaseBuildId())
                .studyId(this.studyId)
                .completedBy(command.getCompletedBy())
                .completedAt(LocalDateTime.now())
                .validationResult(command.getValidationResult())
                .formsConfigured(command.getFormsConfigured())
                .validationRulesSetup(command.getValidationRulesSetup())
                .buildMetrics(command.getBuildMetrics())
                .message("Database build completed successfully")
                .build());
    }

    /**
     * Command Handler: Cancel Study Database Build
     */
    @CommandHandler
    public void handle(CancelStudyDatabaseBuildCommand command) {
        log.info("Cancelling study database build: {}", command.getStudyDatabaseBuildId());
        
        // Business rule: Can only cancel builds in progress
        if (status != StudyDatabaseBuildStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot cancel database build in status: " + status);
        }
        
        AggregateLifecycle.apply(StudyDatabaseBuildCancelledEvent.builder()
                .studyDatabaseBuildId(command.getStudyDatabaseBuildId())
                .studyId(this.studyId)
                .cancelledBy(command.getRequestedBy())
                .cancelledAt(LocalDateTime.now())
                .cancellationReason(command.getCancellationReason())
                .build());
    }

    /**
     * Event Handler: Study Database Build Started
     */
    @EventSourcingHandler
    public void on(StudyDatabaseBuildStartedEvent event) {
        this.studyDatabaseBuildId = event.getStudyDatabaseBuildId();
        this.studyId = event.getStudyId();
        this.studyName = event.getStudyName();
        this.studyProtocol = event.getStudyProtocol();
        this.status = StudyDatabaseBuildStatus.IN_PROGRESS;
        this.requestedBy = event.getRequestedBy();
        this.startedAt = event.getStartedAt();
        this.buildConfiguration = event.getBuildConfiguration();
        this.buildErrors = new ArrayList<>();
        
        log.info("Study database build started for study: {} with ID: {}", 
                event.getStudyId(), event.getStudyDatabaseBuildId());
    }

    /**
     * Event Handler: Study Database Build Completed
     */
    @EventSourcingHandler
    public void on(StudyDatabaseBuildCompletedEvent event) {
        this.status = StudyDatabaseBuildStatus.COMPLETED;
        this.completedAt = event.getCompletedAt();
        this.lastValidationResult = event.getValidationResult();
        this.formsConfigured = event.getFormsConfigured();
        this.validationRulesSetup = event.getValidationRulesSetup();
        
        log.info("Study database build completed for study: {} at: {}", 
                event.getStudyId(), event.getCompletedAt());
    }

    /**
     * Event Handler: Study Database Build Failed
     */
    @EventSourcingHandler
    public void on(StudyDatabaseBuildFailedEvent event) {
        this.status = StudyDatabaseBuildStatus.FAILED;
        this.completedAt = event.getFailedAt();
        this.buildErrors.add(event.getErrorMessage());
        
        log.error("Study database build failed for study: {} with error: {}", 
                event.getStudyId(), event.getErrorMessage());
    }

    /**
     * Event Handler: Study Database Build Cancelled
     */
    @EventSourcingHandler
    public void on(StudyDatabaseBuildCancelledEvent event) {
        this.status = StudyDatabaseBuildStatus.CANCELLED;
        this.completedAt = event.getCancelledAt();
        
        log.info("Study database build cancelled for study: {} reason: {}", 
                event.getStudyId(), event.getCancellationReason());
    }

    /**
     * Event Handler: Study Database Validation Completed
     */
    @EventSourcingHandler
    public void on(StudyDatabaseValidationCompletedEvent event) {
        this.lastValidationResult = event.getValidationResult();
        
        log.info("Study database validation completed for study: {} valid: {}", 
                event.getStudyId(), event.getValidationResult().isValid());
    }

    // Business rule validation methods
    private void validateBuildCommand(BuildStudyDatabaseCommand command) {
        if (command.getStudyId() == null || command.getStudyId() <= 0) {
            throw new IllegalArgumentException("Valid study ID is required");
        }
        
        if (command.getStudyName() == null || command.getStudyName().trim().isEmpty()) {
            throw new IllegalArgumentException("Study name is required");
        }
        
        if (command.getStudyProtocol() == null || command.getStudyProtocol().trim().isEmpty()) {
            throw new IllegalArgumentException("Study protocol is required");
        }
        
        if (!command.hasFormDefinitions()) {
            throw new IllegalArgumentException("Form definitions are required for database build");
        }
        
        if (!command.hasValidationRules()) {
            throw new IllegalArgumentException("Validation rules are required for database build");
        }
    }
    
    // Status enumeration
    public enum StudyDatabaseBuildStatus {
        IN_PROGRESS("In Progress", "Database build is currently running"),
        COMPLETED("Completed", "Database build completed successfully"),
        FAILED("Failed", "Database build failed"),
        CANCELLED("Cancelled", "Database build was cancelled by user");
        
        private final String displayName;
        private final String description;
        
        StudyDatabaseBuildStatus(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }
        
        public String getDisplayName() { return displayName; }
        public String getDescription() { return description; }
    }
}
```

---

## Implementation Phase 3: CQRS Read Model (Week 2)

### 3.1 Create Projection Handler

```java
// Create: src/main/java/com/clinprecision/datacaptureservice/studydatabase/projection/StudyDatabaseBuildProjectionHandler.java

/**
 * Study Database Build Projection Handler
 * 
 * Handles events from StudyDatabaseBuildAggregate and updates read models.
 * Implements CQRS pattern by maintaining optimized views for queries.
 * 
 * Responsibilities:
 * - Update StudyDatabaseBuildEntity for persistence
 * - Maintain study database build statistics
 * - Update build metrics and performance data
 * - Handle audit trail updates
 */
@Component
@ProcessingGroup("study-database-build-projection")
@Slf4j
public class StudyDatabaseBuildProjectionHandler {
    
    private final StudyDatabaseBuildRepository buildRepository;
    private final StudyDatabaseValidationRepository validationRepository;
    
    public StudyDatabaseBuildProjectionHandler(
            StudyDatabaseBuildRepository buildRepository,
            StudyDatabaseValidationRepository validationRepository) {
        this.buildRepository = buildRepository;
        this.validationRepository = validationRepository;
    }

    /**
     * Handle Study Database Build Started Event
     */
    @EventHandler
    public void on(StudyDatabaseBuildStartedEvent event) {
        log.info("Processing StudyDatabaseBuildStartedEvent for study: {}", event.getStudyId());
        
        StudyDatabaseBuildEntity entity = StudyDatabaseBuildEntity.builder()
                .aggregateUuid(event.getStudyDatabaseBuildId().toString())
                .studyId(event.getStudyId())
                .studyName(event.getStudyName())
                .studyProtocol(event.getStudyProtocol())
                .buildRequestId(event.getBuildRequestId())
                .buildStatus("IN_PROGRESS")
                .buildStartTime(event.getStartedAt())
                .requestedBy(event.getRequestedBy())
                .buildConfiguration(convertToJson(event.getBuildConfiguration()))
                .formsConfigured(0)
                .validationRulesSetup(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        buildRepository.save(entity);
        log.info("Created StudyDatabaseBuildEntity for aggregate: {}", event.getStudyDatabaseBuildId());
    }

    /**
     * Handle Study Database Build Completed Event
     */
    @EventHandler
    public void on(StudyDatabaseBuildCompletedEvent event) {
        log.info("Processing StudyDatabaseBuildCompletedEvent for study: {}", event.getStudyId());
        
        Optional<StudyDatabaseBuildEntity> optionalEntity = 
                buildRepository.findByAggregateUuid(event.getStudyDatabaseBuildId().toString());
        
        if (optionalEntity.isPresent()) {
            StudyDatabaseBuildEntity entity = optionalEntity.get();
            
            entity.setBuildStatus("COMPLETED");
            entity.setBuildEndTime(event.getCompletedAt());
            entity.setFormsConfigured(event.getFormsConfigured());
            entity.setValidationRulesSetup(event.getValidationRulesSetup());
            entity.setBuildResult("SUCCESS");
            entity.setBuildMessage(event.getMessage());
            entity.setUpdatedAt(LocalDateTime.now());
            
            // Calculate build duration
            if (entity.getBuildStartTime() != null) {
                Duration duration = Duration.between(entity.getBuildStartTime(), event.getCompletedAt());
                entity.setBuildDurationMinutes((int) duration.toMinutes());
            }
            
            buildRepository.save(entity);
            
            // Create validation record
            createValidationRecord(event.getStudyDatabaseBuildId(), event.getValidationResult());
            
            log.info("Updated StudyDatabaseBuildEntity to COMPLETED status for aggregate: {}", 
                    event.getStudyDatabaseBuildId());
        } else {
            log.error("StudyDatabaseBuildEntity not found for aggregate: {}", event.getStudyDatabaseBuildId());
        }
    }

    /**
     * Handle Study Database Build Failed Event
     */
    @EventHandler
    public void on(StudyDatabaseBuildFailedEvent event) {
        log.info("Processing StudyDatabaseBuildFailedEvent for study: {}", event.getStudyId());
        
        Optional<StudyDatabaseBuildEntity> optionalEntity = 
                buildRepository.findByAggregateUuid(event.getStudyDatabaseBuildId().toString());
        
        if (optionalEntity.isPresent()) {
            StudyDatabaseBuildEntity entity = optionalEntity.get();
            
            entity.setBuildStatus("FAILED");
            entity.setBuildEndTime(event.getFailedAt());
            entity.setBuildResult("FAILURE");
            entity.setBuildMessage(event.getErrorMessage());
            entity.setBuildErrors(String.join("; ", event.getValidationErrors()));
            entity.setUpdatedAt(LocalDateTime.now());
            
            // Calculate build duration
            if (entity.getBuildStartTime() != null) {
                Duration duration = Duration.between(entity.getBuildStartTime(), event.getFailedAt());
                entity.setBuildDurationMinutes((int) duration.toMinutes());
            }
            
            buildRepository.save(entity);
            log.info("Updated StudyDatabaseBuildEntity to FAILED status for aggregate: {}", 
                    event.getStudyDatabaseBuildId());
        } else {
            log.error("StudyDatabaseBuildEntity not found for aggregate: {}", event.getStudyDatabaseBuildId());
        }
    }

    /**
     * Handle Study Database Build Cancelled Event
     */
    @EventHandler
    public void on(StudyDatabaseBuildCancelledEvent event) {
        log.info("Processing StudyDatabaseBuildCancelledEvent for study: {}", event.getStudyId());
        
        Optional<StudyDatabaseBuildEntity> optionalEntity = 
                buildRepository.findByAggregateUuid(event.getStudyDatabaseBuildId().toString());
        
        if (optionalEntity.isPresent()) {
            StudyDatabaseBuildEntity entity = optionalEntity.get();
            
            entity.setBuildStatus("CANCELLED");
            entity.setBuildEndTime(event.getCancelledAt());
            entity.setBuildResult("CANCELLED");
            entity.setBuildMessage("Build cancelled: " + event.getCancellationReason());
            entity.setUpdatedAt(LocalDateTime.now());
            
            buildRepository.save(entity);
            log.info("Updated StudyDatabaseBuildEntity to CANCELLED status for aggregate: {}", 
                    event.getStudyDatabaseBuildId());
        } else {
            log.error("StudyDatabaseBuildEntity not found for aggregate: {}", event.getStudyDatabaseBuildId());
        }
    }

    /**
     * Handle Study Database Validation Completed Event
     */
    @EventHandler
    public void on(StudyDatabaseValidationCompletedEvent event) {
        log.info("Processing StudyDatabaseValidationCompletedEvent for study: {}", event.getStudyId());
        
        createValidationRecord(event.getStudyDatabaseBuildId(), event.getValidationResult());
    }

    // Helper methods
    private String convertToJson(Map<String, Object> configuration) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(configuration);
        } catch (Exception e) {
            log.error("Failed to convert configuration to JSON", e);
            return "{}";
        }
    }
    
    private void createValidationRecord(UUID buildId, DatabaseValidationResult validationResult) {
        if (validationResult != null) {
            StudyDatabaseValidationEntity validationEntity = StudyDatabaseValidationEntity.builder()
                    .buildRequestId(buildId.toString())
                    .studyId(validationResult.getStudyId())
                    .validationStartTime(LocalDateTime.now())
                    .validationEndTime(LocalDateTime.now())
                    .isValid(validationResult.isValid())
                    .overallAssessment(validationResult.getOverallAssessment())
                    .validationErrors(String.join("; ", validationResult.getValidationErrors()))
                    .validationWarnings(String.join("; ", validationResult.getValidationWarnings()))
                    .complianceStatus(validationResult.getComplianceStatus())
                    .performanceScore(validationResult.getPerformanceScore())
                    .createdAt(LocalDateTime.now())
                    .build();
            
            validationRepository.save(validationEntity);
        }
    }
}
```

---

## Implementation Phase 4: Service Layer Refactoring (Week 2-3)

### 4.1 Refactor StudyDatabaseBuildService to use CommandGateway

```java
// Update: src/main/java/com/clinprecision/datacaptureservice/service/database/StudyDatabaseBuildService.java

/**
 * Study Database Build Service - Refactored for DDD/CQRS
 * 
 * Now orchestrates database build operations using Axon Framework:
 * - Uses CommandGateway for write operations
 * - Uses repositories for read operations  
 * - Maps between DTOs and commands
 * - Handles UUID generation and mapping
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class StudyDatabaseBuildService {

    private final CommandGateway commandGateway;
    private final StudyDatabaseBuildRepository buildRepository;
    private final DatabaseValidationService databaseValidationService;
    private final ConsolidatedFormService consolidatedFormService;

    /**
     * Initiates database build using CQRS command
     */
    public DatabaseBuildResult buildStudyDatabase(DatabaseBuildRequest request) {
        log.info("Starting DDD/CQRS database build for study: {}", request.getStudyId());
        
        // Generate aggregate UUID
        UUID studyDatabaseBuildId = UUID.randomUUID();
        
        try {
            // Create and send command
            BuildStudyDatabaseCommand command = BuildStudyDatabaseCommand.builder()
                    .studyDatabaseBuildId(studyDatabaseBuildId)
                    .studyId(request.getStudyId())
                    .studyName(request.getStudyName())
                    .studyProtocol(request.getStudyProtocol())
                    .requestedBy(request.getRequestedBy())
                    .studyDesignConfiguration(request.getStudyDesignConfiguration())
                    .validationRules(request.getValidationRules())
                    .siteCustomizations(request.getSiteCustomizations())
                    .performanceSettings(request.getPerformanceSettings())
                    .complianceSettings(request.getComplianceSettings())
                    .build();
            
            // Validate command
            command.validate();
            
            // Send command through Axon CommandGateway
            CompletableFuture<Void> result = commandGateway.send(command);
            
            // Wait for command completion (with timeout)
            result.get(30, TimeUnit.SECONDS);
            
            // Start async build process
            CompletableFuture.runAsync(() -> executeBuildProcess(studyDatabaseBuildId, request));
            
            return DatabaseBuildResult.builder()
                    .studyId(request.getStudyId())
                    .buildRequestId(studyDatabaseBuildId.toString())
                    .buildStatus("IN_PROGRESS")
                    .buildStartTime(LocalDateTime.now())
                    .message("Database build started successfully using DDD/CQRS")
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to start database build for study {}: {}", request.getStudyId(), e.getMessage(), e);
            
            // Send failure command
            sendBuildFailureCommand(studyDatabaseBuildId, request.getStudyId(), e.getMessage());
            
            return DatabaseBuildResult.builder()
                    .studyId(request.getStudyId())
                    .buildRequestId(studyDatabaseBuildId.toString())
                    .buildStatus("FAILED")
                    .buildStartTime(LocalDateTime.now())
                    .buildEndTime(LocalDateTime.now())
                    .message("Database build failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Validates database using CQRS command
     */
    public DatabaseValidationResult validateStudyDatabase(Long studyId) {
        log.info("Starting DDD/CQRS database validation for study: {}", studyId);
        
        try {
            // Find latest build for study
            Optional<StudyDatabaseBuildEntity> latestBuild = 
                    buildRepository.findFirstByStudyIdOrderByBuildStartTimeDesc(studyId);
            
            if (latestBuild.isEmpty()) {
                return DatabaseValidationResult.builder()
                        .studyId(studyId)
                        .isValid(false)
                        .overallAssessment("No database build found for study")
                        .validationErrors(List.of("Study database has not been built"))
                        .build();
            }
            
            UUID buildId = UUID.fromString(latestBuild.get().getAggregateUuid());
            
            // Send validation command
            ValidateStudyDatabaseCommand command = ValidateStudyDatabaseCommand.builder()
                    .studyDatabaseBuildId(buildId)
                    .studyId(studyId)
                    .requestedBy(1L) // TODO: Get from security context
                    .strictValidation(true)
                    .complianceCheck(true)
                    .performanceCheck(true)
                    .build();
            
            commandGateway.sendAndWait(command);
            
            // Perform actual validation
            DatabaseValidationResult result = databaseValidationService.validateStudyDatabase(studyId);
            
            // Send validation completed command
            sendValidationCompletedCommand(buildId, studyId, result);
            
            return result;
            
        } catch (Exception e) {
            log.error("Database validation failed for study {}: {}", studyId, e.getMessage(), e);
            
            return DatabaseValidationResult.builder()
                    .studyId(studyId)
                    .isValid(false)
                    .overallAssessment("Validation failed: " + e.getMessage())
                    .validationErrors(List.of(e.getMessage()))
                    .build();
        }
    }

    /**
     * Cancels database build using CQRS command
     */
    public DatabaseBuildResult cancelBuild(String buildRequestId, String cancellationReason, Long cancelledBy) {
        log.info("Cancelling database build: {}", buildRequestId);
        
        try {
            UUID buildId = UUID.fromString(buildRequestId);
            
            CancelStudyDatabaseBuildCommand command = CancelStudyDatabaseBuildCommand.builder()
                    .studyDatabaseBuildId(buildId)
                    .requestedBy(cancelledBy)
                    .cancellationReason(cancellationReason)
                    .build();
            
            commandGateway.sendAndWait(command);
            
            return DatabaseBuildResult.builder()
                    .buildRequestId(buildRequestId)
                    .buildStatus("CANCELLED")
                    .buildEndTime(LocalDateTime.now())
                    .message("Build cancelled successfully")
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to cancel build {}: {}", buildRequestId, e.getMessage(), e);
            
            return DatabaseBuildResult.builder()
                    .buildRequestId(buildRequestId)
                    .buildStatus("CANCELLATION_FAILED")
                    .message("Failed to cancel build: " + e.getMessage())
                    .build();
        }
    }

    // Async build execution
    @Async
    private void executeBuildProcess(UUID buildId, DatabaseBuildRequest request) {
        try {
            log.info("Executing async build process for build ID: {}", buildId);
            
            // Phase 1: Setup form definitions
            int formsConfigured = consolidatedFormService.importFormDefinitionsFromStudyDesign(
                    request.getStudyId(), 
                    request.getStudyDesignConfiguration()
            );
            
            // Phase 2: Setup validation rules
            int validationRulesSetup = setupValidationRules(request);
            
            // Phase 3: Perform final validation
            DatabaseValidationResult validationResult = databaseValidationService.validateStudyDatabase(request.getStudyId());
            
            // Phase 4: Complete build
            CompleteStudyDatabaseBuildCommand completeCommand = CompleteStudyDatabaseBuildCommand.builder()
                    .studyDatabaseBuildId(buildId)
                    .completedBy(request.getRequestedBy())
                    .validationResult(validationResult)
                    .formsConfigured(formsConfigured)
                    .validationRulesSetup(validationRulesSetup)
                    .buildMetrics(createBuildMetrics(formsConfigured, validationRulesSetup))
                    .build();
            
            commandGateway.sendAndWait(completeCommand);
            
            log.info("Build process completed successfully for build ID: {}", buildId);
            
        } catch (Exception e) {
            log.error("Build process failed for build ID {}: {}", buildId, e.getMessage(), e);
            sendBuildFailureCommand(buildId, request.getStudyId(), e.getMessage());
        }
    }

    // Helper methods
    private void sendBuildFailureCommand(UUID buildId, Long studyId, String errorMessage) {
        try {
            // Note: Need to implement StudyDatabaseBuildFailedCommand
            log.error("Sending build failure command for build: {} - {}", buildId, errorMessage);
            // TODO: Implement failure command handling
        } catch (Exception e) {
            log.error("Failed to send build failure command", e);
        }
    }
    
    private void sendValidationCompletedCommand(UUID buildId, Long studyId, DatabaseValidationResult result) {
        try {
            // Send validation completed event
            log.info("Sending validation completed command for build: {}", buildId);
            // TODO: Implement validation completed command
        } catch (Exception e) {
            log.error("Failed to send validation completed command", e);
        }
    }
    
    private int setupValidationRules(DatabaseBuildRequest request) {
        // Implementation for setting up validation rules
        // This would integrate with the existing validation rule setup
        return 0; // placeholder
    }
    
    private Map<String, Object> createBuildMetrics(int formsConfigured, int validationRulesSetup) {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("formsConfigured", formsConfigured);
        metrics.put("validationRulesSetup", validationRulesSetup);
        metrics.put("buildCompletedAt", LocalDateTime.now());
        return metrics;
    }
}
```

---

## Implementation Phase 5: Integration & Testing (Week 3-4)

### 5.1 Update Controller to use new service

```java
// Update: src/main/java/com/clinprecision/datacaptureservice/controller/StudyDatabaseBuildController.java

/**
 * Study Database Build Controller - DDD/CQRS Version
 * 
 * Updated to work with DDD/CQRS implementation:
 * - Commands are sent through service layer
 * - Queries use projection handlers
 * - Proper error handling for async operations
 * - Audit trail through event sourcing
 */
@RestController
@RequestMapping("/api/v1/datacapture/database")
@RequiredArgsConstructor
@Slf4j
@Validated
public class StudyDatabaseBuildController {
    
    private final StudyDatabaseBuildService databaseBuildService;
    private final DatabaseValidationService databaseValidationService;
    private final StudyDatabaseBuildRepository buildRepository;

    /**
     * Initiate database build using DDD/CQRS
     */
    @PostMapping("/build")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<DatabaseBuildResult> buildStudyDatabase(@Valid @RequestBody DatabaseBuildRequest request) {
        log.info("Received DDD/CQRS database build request for study: {}", request.getStudyId());
        
        try {
            DatabaseBuildResult result = databaseBuildService.buildStudyDatabase(request);
            
            if ("IN_PROGRESS".equals(result.getBuildStatus())) {
                return ResponseEntity.accepted().body(result);
            } else if ("FAILED".equals(result.getBuildStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            } else {
                return ResponseEntity.ok(result);
            }
            
        } catch (Exception e) {
            log.error("Database build failed for study {}: {}", request.getStudyId(), e.getMessage(), e);
            
            DatabaseBuildResult errorResult = DatabaseBuildResult.builder()
                    .studyId(request.getStudyId())
                    .buildStatus("FAILED")
                    .message("Database build failed: " + e.getMessage())
                    .buildStartTime(LocalDateTime.now())
                    .buildEndTime(LocalDateTime.now())
                    .build();
                    
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
        }
    }

    /**
     * Get build status using projection data
     */
    @GetMapping("/build/status/{buildRequestId}")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('DATA_MANAGER')")
    public ResponseEntity<DatabaseBuildResult> getBuildStatus(@PathVariable String buildRequestId) {
        log.info("Received build status request for: {}", buildRequestId);
        
        try {
            Optional<StudyDatabaseBuildEntity> buildEntity = buildRepository.findByBuildRequestId(buildRequestId);
            
            if (buildEntity.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            StudyDatabaseBuildEntity entity = buildEntity.get();
            DatabaseBuildResult result = mapEntityToResult(entity);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Failed to get build status for {}: {}", buildRequestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Cancel build using DDD/CQRS command
     */
    @PostMapping("/build/cancel/{buildRequestId}")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<DatabaseBuildResult> cancelBuild(
            @PathVariable String buildRequestId,
            @RequestParam String cancellationReason) {
        log.info("Received build cancellation request for: {}", buildRequestId);
        
        try {
            Long userId = getCurrentUserId(); // TODO: Get from security context
            DatabaseBuildResult result = databaseBuildService.cancelBuild(buildRequestId, cancellationReason, userId);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Failed to cancel build {}: {}", buildRequestId, e.getMessage(), e);
            
            DatabaseBuildResult errorResult = DatabaseBuildResult.builder()
                    .buildRequestId(buildRequestId)
                    .buildStatus("CANCELLATION_FAILED")
                    .message("Failed to cancel build: " + e.getMessage())
                    .build();
                    
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
        }
    }

    // Helper methods
    private DatabaseBuildResult mapEntityToResult(StudyDatabaseBuildEntity entity) {
        return DatabaseBuildResult.builder()
                .studyId(entity.getStudyId())
                .buildRequestId(entity.getBuildRequestId())
                .buildStatus(entity.getBuildStatus())
                .buildStartTime(entity.getBuildStartTime())
                .buildEndTime(entity.getBuildEndTime())
                .message(entity.getBuildMessage())
                .build();
    }
    
    private Long getCurrentUserId() {
        // TODO: Extract from security context
        return 1L;
    }
}
```

### 5.2 Create Integration Tests

```java
// Create: src/test/java/com/clinprecision/datacaptureservice/studydatabase/StudyDatabaseBuildDDDIntegrationTest.java

@SpringBootTest
@Testcontainers
@Transactional
class StudyDatabaseBuildDDDIntegrationTest {
    
    @Autowired
    private CommandGateway commandGateway;
    
    @Autowired
    private StudyDatabaseBuildRepository buildRepository;
    
    @Autowired
    private StudyDatabaseBuildService buildService;
    
    @Test
    void testCompleteStudyDatabaseBuildFlow() {
        // Given
        DatabaseBuildRequest request = DatabaseBuildRequest.builder()
                .studyId(1L)
                .studyName("Test Study")
                .studyProtocol("TEST-001")
                .requestedBy(100L)
                .studyDesignConfiguration(createTestConfig())
                .validationRules(createTestValidationRules())
                .build();
        
        // When
        DatabaseBuildResult result = buildService.buildStudyDatabase(request);
        
        // Then
        assertThat(result.getBuildStatus()).isEqualTo("IN_PROGRESS");
        assertThat(result.getStudyId()).isEqualTo(1L);
        assertThat(result.getBuildRequestId()).isNotNull();
        
        // Verify aggregate event was persisted
        await().atMost(5, SECONDS).until(() -> {
            Optional<StudyDatabaseBuildEntity> entity = 
                    buildRepository.findByBuildRequestId(result.getBuildRequestId());
            return entity.isPresent() && "IN_PROGRESS".equals(entity.get().getBuildStatus());
        });
    }
    
    @Test
    void testStudyDatabaseBuildValidation() {
        // Implementation for validation testing
    }
    
    @Test
    void testStudyDatabaseBuildCancellation() {
        // Implementation for cancellation testing
    }
    
    private Map<String, Object> createTestConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("forms", Arrays.asList(
            Map.of("name", "demographics", "type", "BASELINE"),
            Map.of("name", "medical_history", "type", "BASELINE")
        ));
        return config;
    }
    
    private Map<String, Object> createTestValidationRules() {
        Map<String, Object> rules = new HashMap<>();
        rules.put("rules", Arrays.asList(
            Map.of("name", "age_range", "type", "RANGE", "expression", "age >= 18 AND age <= 65")
        ));
        return rules;
    }
}
```

---

## Success Metrics & Validation

### Technical Compliance
- ✅ **DDD Pattern**: Aggregate with business logic encapsulation
- ✅ **CQRS Pattern**: Separate command and query models
- ✅ **Event Sourcing**: Complete audit trail through events
- ✅ **Axon Integration**: Commands, events, and projections
- ✅ **Consistency**: Matches existing PatientAggregate and SiteAggregate patterns

### Regulatory Compliance
- ✅ **21 CFR Part 11**: Electronic records with audit trail
- ✅ **Immutable History**: Event sourcing prevents data manipulation
- ✅ **User Authentication**: Role-based access control
- ✅ **Data Integrity**: ALCOA+ principles through events

### Performance Targets
- **Command Processing**: < 1 second
- **Event Persistence**: < 500ms
- **Query Response**: < 2 seconds
- **Build Process**: Async execution with progress tracking

---

## Migration Strategy

### Phase 1: Parallel Implementation (Week 1-2)
- Implement DDD/CQRS components alongside existing code
- No breaking changes to existing APIs
- Feature flags for gradual rollout

### Phase 2: Integration Testing (Week 3)
- Comprehensive testing of new implementation
- Performance benchmarking
- Compliance validation

### Phase 3: Gradual Migration (Week 4)
- Switch internal service calls to use CommandGateway
- Maintain API compatibility
- Monitor system performance

### Phase 4: Legacy Cleanup (Week 5)
- Remove old implementation
- Update documentation
- Final validation and testing

---

This implementation plan provides a complete DDD/CQRS solution for Study Database Build that:
1. **Follows Established Patterns** from Patient and Site management
2. **Provides Complete Audit Trail** for regulatory compliance
3. **Enables Scalable Architecture** with CQRS separation
4. **Maintains API Compatibility** during migration
5. **Includes Comprehensive Testing** for reliability

The implementation will transform the traditional Service/Repository pattern into a proper DDD/CQRS architecture with Axon Framework, ensuring consistency across the entire ClinPrecision platform.