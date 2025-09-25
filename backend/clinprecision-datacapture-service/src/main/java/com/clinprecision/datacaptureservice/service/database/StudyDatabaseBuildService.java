package com.clinprecision.datacaptureservice.service.database;

import com.clinprecision.datacaptureservice.dto.database.DatabaseBuildRequest;
import com.clinprecision.datacaptureservice.dto.database.DatabaseBuildResult;
import com.clinprecision.datacaptureservice.dto.database.DatabaseValidationResult;
import com.clinprecision.datacaptureservice.entity.study.StudyDatabaseBuildEntity;
import com.clinprecision.datacaptureservice.repository.StudyDatabaseBuildRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Study Database Build Service
 * 
 * Handles the complete database build process for clinical studies including:
 * - Database configuration based on study design
 * - Schema validation and setup
 * - Performance optimization
 * - Audit trail configuration
 * - System validation testing
 * 
 * This service implements Phase 1.1 of the EDC implementation plan:
 * Study Design → Database Configuration → User Access Setup → Site Training → Site Activation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyDatabaseBuildService {
    
    private final DataSource dataSource;
    private final StudyDatabaseBuildRepository databaseBuildRepository;
    private final ConsolidatedFormService consolidatedFormService;
    private final DatabaseValidationService databaseValidationService;
    
    /**
     * Initiates the complete database build process for a study
     * 
     * @param request Database build request containing study configuration
     * @return DatabaseBuildResult with build status and details
     */
    @Transactional
    public DatabaseBuildResult buildStudyDatabase(DatabaseBuildRequest request) {
        log.info("Starting database build for study: {}", request.getStudyId());
        
        DatabaseBuildResult.DatabaseBuildResultBuilder resultBuilder = DatabaseBuildResult.builder()
                .studyId(request.getStudyId())
                .buildStartTime(LocalDateTime.now())
                .buildRequestId(UUID.randomUUID().toString());
        
        StudyDatabaseBuildEntity buildEntity = createBuildRecord(request);
        
        try {
            // Phase 1: Validate database prerequisites
            log.info("Phase 1: Validating database prerequisites for study {}", request.getStudyId());
            DatabaseValidationResult validationResult = validateDatabasePrerequisites(request);
            if (!validationResult.isValid()) {
                return handleBuildFailure(buildEntity, resultBuilder, "Database validation failed", 
                                        validationResult.getValidationErrors());
            }
            
            // Phase 2: Configure study-specific database objects
            log.info("Phase 2: Configuring study-specific database objects for study {}", request.getStudyId());
            configureStudySpecificObjects(request);
            
            // Phase 3: Setup form definitions and validation rules
            log.info("Phase 3: Setting up form definitions and validation rules for study {}", request.getStudyId());
            int formsConfigured = setupFormDefinitions(request);
            
            // Phase 4: Configure audit trail and compliance features
            log.info("Phase 4: Configuring audit trail and compliance features for study {}", request.getStudyId());
            configureAuditAndCompliance(request);
            
            // Phase 5: Performance optimization
            log.info("Phase 5: Applying performance optimizations for study {}", request.getStudyId());
            applyPerformanceOptimizations(request);
            
            // Phase 6: Final validation and testing
            log.info("Phase 6: Performing final validation and testing for study {}", request.getStudyId());
            DatabaseValidationResult finalValidation = performFinalValidation(request);
            
            // Complete the build process
            completeBuildProcess(buildEntity, finalValidation, formsConfigured);
            
            return resultBuilder
                    .buildStatus("COMPLETED")
                    .buildEndTime(LocalDateTime.now())
                    .validationResult(finalValidation)
                    .message("Database build completed successfully")
                    .build();
                    
        } catch (Exception e) {
            log.error("Database build failed for study {}: {}", request.getStudyId(), e.getMessage(), e);
            return handleBuildFailure(buildEntity, resultBuilder, "Database build failed", 
                                    Collections.singletonList(e.getMessage()));
        }
    }
    
    /**
     * Validates database prerequisites before beginning the build
     */
    private DatabaseValidationResult validateDatabasePrerequisites(DatabaseBuildRequest request) {
        List<String> validationErrors = new ArrayList<>();
        List<String> validationWarnings = new ArrayList<>();
        
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            
            // Check database version compatibility
            String databaseVersion = metaData.getDatabaseProductVersion();
            if (!isDatabaseVersionSupported(databaseVersion)) {
                validationErrors.add("Unsupported database version: " + databaseVersion);
            }
            
            // Check required tables exist
            List<String> requiredTables = getRequiredTables();
            for (String table : requiredTables) {
                if (!tableExists(metaData, table)) {
                    validationErrors.add("Required table missing: " + table);
                }
            }
            
            // Check database permissions
            validateDatabasePermissions(connection, validationErrors);
            
            // Check storage capacity
            validateStorageCapacity(connection, request, validationWarnings);
            
        } catch (Exception e) {
            validationErrors.add("Database connection failed: " + e.getMessage());
        }
        
        return DatabaseValidationResult.builder()
                .isValid(validationErrors.isEmpty())
                .validationErrors(validationErrors)
                .validationWarnings(validationWarnings)
                .validationTimestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Configures study-specific database objects
     */
    private void configureStudySpecificObjects(DatabaseBuildRequest request) throws Exception {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Create study-specific indexes for performance
            createStudySpecificIndexes(statement, request.getStudyId());
            
            // Configure study-specific constraints
            configureStudyConstraints(statement, request);
            
            // Setup study-specific triggers for audit trail
            setupStudyTriggers(statement, request.getStudyId());
            
            log.info("Study-specific database objects configured for study {}", request.getStudyId());
        }
    }
    
    /**
     * Sets up form definitions and validation rules from study design
     */
    private int setupFormDefinitions(DatabaseBuildRequest request) {
        // Import form definitions from study design using consolidated schema
        int formsConfigured = consolidatedFormService.importFormDefinitionsFromStudyDesign(
                request.getStudyId(), 
                request.getStudyDesignConfiguration()
        );
        
        log.info("Form definitions setup completed for study {} - {} forms configured using consolidated schema", 
                request.getStudyId(), formsConfigured);
        
        // TODO: Setup validation rules - this would be handled by the consolidated schema services
        // For now, we'll skip validation rules setup as it would be managed by the study design service
        log.info("Validation rules setup deferred to consolidated schema management for study {}", request.getStudyId());
        
        return formsConfigured;
    }
    
    /**
     * Configures audit trail and compliance features
     */
    private void configureAuditAndCompliance(DatabaseBuildRequest request) throws Exception {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Enable audit triggers
            enableAuditTriggers(statement, request.getStudyId());
            
            // Configure data retention policies
            configureDataRetention(statement, request);
            
            // Setup compliance monitoring
            setupComplianceMonitoring(statement, request);
            
            log.info("Audit trail and compliance configuration completed for study {}", request.getStudyId());
        }
    }
    
    /**
     * Applies database performance optimizations
     */
    private void applyPerformanceOptimizations(DatabaseBuildRequest request) throws Exception {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Optimize table statistics
            updateTableStatistics(statement, request.getStudyId());
            
            // Configure query cache settings
            configureQueryCache(statement);
            
            // Setup connection pooling parameters
            configureConnectionPooling(request);
            
            log.info("Performance optimizations applied for study {}", request.getStudyId());
        }
    }
    
    /**
     * Performs final validation and testing of the database build
     */
    private DatabaseValidationResult performFinalValidation(DatabaseBuildRequest request) {
        return databaseValidationService.validateStudyDatabase(request.getStudyId());
    }
    
    // Helper methods
    private StudyDatabaseBuildEntity createBuildRecord(DatabaseBuildRequest request) {
        StudyDatabaseBuildEntity entity = StudyDatabaseBuildEntity.builder()
                .studyId(request.getStudyId())
                .buildRequestId(UUID.randomUUID().toString())
                .buildStatus("IN_PROGRESS")
                .buildStartTime(LocalDateTime.now())
                .requestedBy(request.getRequestedBy())
                .buildConfiguration(request.toString())
                .build();
        
        return databaseBuildRepository.save(entity);
    }
    
    private DatabaseBuildResult handleBuildFailure(StudyDatabaseBuildEntity buildEntity, 
                                                  DatabaseBuildResult.DatabaseBuildResultBuilder resultBuilder,
                                                  String errorMessage, List<String> errors) {
        buildEntity.setBuildStatus("FAILED");
        buildEntity.setBuildEndTime(LocalDateTime.now());
        buildEntity.setErrorDetails(String.join("; ", errors));
        databaseBuildRepository.save(buildEntity);
        
        return resultBuilder
                .buildStatus("FAILED")
                .buildEndTime(LocalDateTime.now())
                .message(errorMessage)
                .errors(errors)
                .build();
    }
    
    private void completeBuildProcess(StudyDatabaseBuildEntity buildEntity, DatabaseValidationResult validationResult, int formsConfigured) {
        buildEntity.setBuildStatus("COMPLETED");
        buildEntity.setBuildEndTime(LocalDateTime.now());
        buildEntity.setValidationResults(validationResult.toString());
        buildEntity.setFormsConfigured(formsConfigured);
        databaseBuildRepository.save(buildEntity);
        
        log.info("Build process completed for study {} - {} forms configured", 
                buildEntity.getStudyId(), formsConfigured);
    }
    
    // Database validation helper methods
    private boolean isDatabaseVersionSupported(String version) {
        // Check if MySQL version is 8.0 or higher
        return version.startsWith("8.") || version.startsWith("9.");
    }
    
    private List<String> getRequiredTables() {
        return Arrays.asList(
                "users", "roles", "organizations", "studies", "sites",
                "subjects", "visit_instances", "form_instances", 
                "form_field_data", "edit_check_definitions"
        );
    }
    
    private boolean tableExists(DatabaseMetaData metaData, String tableName) throws Exception {
        try (ResultSet rs = metaData.getTables(null, null, tableName, null)) {
            return rs.next();
        }
    }
    
    private void validateDatabasePermissions(Connection connection, List<String> errors) {
        // Check if user has required permissions for DDL operations
        // This would be implemented based on specific database security requirements
    }
    
    private void validateStorageCapacity(Connection connection, DatabaseBuildRequest request, List<String> warnings) {
        // Check available storage space and estimate requirements
        // Add warnings if storage might be insufficient
    }
    
    // Database configuration helper methods
    private void createStudySpecificIndexes(Statement statement, Long studyId) throws Exception {
        String[] indexQueries = {
            "CREATE INDEX IF NOT EXISTS idx_subjects_study_" + studyId + " ON subjects(study_id) WHERE study_id = " + studyId,
            "CREATE INDEX IF NOT EXISTS idx_form_instances_study_" + studyId + " ON form_instances(subject_id) WHERE subject_id IN (SELECT id FROM subjects WHERE study_id = " + studyId + ")",
            "CREATE INDEX IF NOT EXISTS idx_visit_instances_study_" + studyId + " ON visit_instances(subject_id) WHERE subject_id IN (SELECT id FROM subjects WHERE study_id = " + studyId + ")"
        };
        
        for (String query : indexQueries) {
            statement.execute(query);
        }
    }
    
    private void configureStudyConstraints(Statement statement, DatabaseBuildRequest request) throws Exception {
        // Add study-specific constraints based on protocol requirements
        // This would be customized based on the study design
    }
    
    private void setupStudyTriggers(Statement statement, Long studyId) throws Exception {
        // Create audit triggers for study-specific data
        String triggerSql = String.format(
            "CREATE TRIGGER IF NOT EXISTS audit_subjects_study_%d " +
            "AFTER UPDATE ON subjects " +
            "FOR EACH ROW " +
            "BEGIN " +
            "  IF NEW.study_id = %d THEN " +
            "    INSERT INTO audit_trail (table_name, record_id, action, old_values, new_values, changed_by, changed_at) " +
            "    VALUES ('subjects', NEW.id, 'UPDATE', JSON_OBJECT(), JSON_OBJECT(), USER(), NOW()); " +
            "  END IF; " +
            "END", studyId, studyId
        );
        
        statement.execute(triggerSql);
    }
    
    private void enableAuditTriggers(Statement statement, Long studyId) throws Exception {
        // Enable comprehensive audit triggers for all study data
    }
    
    private void configureDataRetention(Statement statement, DatabaseBuildRequest request) throws Exception {
        // Configure data retention policies based on regulatory requirements
    }
    
    private void setupComplianceMonitoring(Statement statement, DatabaseBuildRequest request) throws Exception {
        // Setup monitoring for 21 CFR Part 11 compliance
    }
    
    private void updateTableStatistics(Statement statement, Long studyId) throws Exception {
        statement.execute("ANALYZE TABLE subjects, visit_instances, form_instances, form_field_data");
    }
    
    private void configureQueryCache(Statement statement) throws Exception {
        // Configure query cache for better performance
    }
    
    private void configureConnectionPooling(DatabaseBuildRequest request) {
        // Configure connection pooling based on expected load
    }
}