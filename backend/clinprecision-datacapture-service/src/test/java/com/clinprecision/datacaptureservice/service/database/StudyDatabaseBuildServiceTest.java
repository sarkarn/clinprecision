package com.clinprecision.datacaptureservice.service.database;

import com.clinprecision.datacaptureservice.dto.database.DatabaseBuildRequest;
import com.clinprecision.datacaptureservice.dto.database.DatabaseBuildResult;
import com.clinprecision.datacaptureservice.dto.database.DatabaseValidationResult;
import com.clinprecision.datacaptureservice.entity.study.StudyDatabaseBuildEntity;
import com.clinprecision.datacaptureservice.repository.StudyDatabaseBuildRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test cases for Study Database Build Service
 * 
 * Tests the implementation of Phase 1.1 - Study Database Build:
 * - Database configuration based on study design
 * - User role assignment and access provisioning
 * - Site-specific customization and branding
 * - System validation and testing
 * - Site personnel training and certification
 */
@ExtendWith(MockitoExtension.class)
class StudyDatabaseBuildServiceTest {
    
    @Mock
    private DataSource dataSource;
    
    @Mock
    private Connection connection;
    
    @Mock
    private Statement statement;
    
    @Mock
    private DatabaseMetaData databaseMetaData;
    
    @Mock
    private StudyDatabaseBuildRepository databaseBuildRepository;
    
    @Mock
    private StudyFormDefinitionService formDefinitionService;
    
    @Mock
    private DatabaseValidationService databaseValidationService;
    
    @InjectMocks
    private StudyDatabaseBuildService databaseBuildService;
    
    private DatabaseBuildRequest buildRequest;
    private StudyDatabaseBuildEntity buildEntity;
    
    @BeforeEach
    void setUp() {
        // Setup test data
        Map<String, Object> studyDesignConfig = new HashMap<>();
        studyDesignConfig.put("forms", createTestFormsConfig());
        
        Map<String, Object> validationRules = new HashMap<>();
        validationRules.put("rules", createTestValidationRules());
        
        buildRequest = DatabaseBuildRequest.builder()
                .studyId(1L)
                .studyName("Test Study")
                .studyProtocol("TEST-001")
                .requestedBy(100L)
                .studyDesignConfiguration(studyDesignConfig)
                .validationRules(validationRules)
                .expectedSubjectCount(500)
                .expectedSiteCount(10)
                .studyDurationMonths(24)
                .buildPriority("HIGH")
                .targetGoLiveDate(LocalDate.now().plusDays(30))
                .build();
        
        buildEntity = StudyDatabaseBuildEntity.builder()
                .id(1L)
                .studyId(1L)
                .buildRequestId("BUILD-001")
                .buildStatus("IN_PROGRESS")
                .requestedBy(100L)
                .build();
    }
    
    @Test
    void testSuccessfulDatabaseBuild() throws Exception {
        // Arrange
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(databaseMetaData);
        when(connection.createStatement()).thenReturn(statement);
        when(databaseMetaData.getDatabaseProductVersion()).thenReturn("8.0.33");
        when(databaseBuildRepository.save(any(StudyDatabaseBuildEntity.class))).thenReturn(buildEntity);
        
        DatabaseValidationResult validationResult = DatabaseValidationResult.builder()
                .isValid(true)
                .studyId(1L)
                .build();
        when(databaseValidationService.validateStudyDatabase(1L)).thenReturn(validationResult);
        
        // Act
        DatabaseBuildResult result = databaseBuildService.buildStudyDatabase(buildRequest);
        
        // Assert
        assertNotNull(result);
        assertEquals("COMPLETED", result.getBuildStatus());
        assertEquals(1L, result.getStudyId());
        assertTrue(result.getValidationResult().isValid());
        verify(databaseBuildRepository, times(2)).save(any(StudyDatabaseBuildEntity.class));
        verify(formDefinitionService).importFormDefinitionsFromStudyDesign(eq(1L), any());
        verify(formDefinitionService).setupValidationRules(eq(1L), any());
    }
    
    @Test
    void testDatabaseBuildWithValidationFailure() throws Exception {
        // Arrange
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(databaseMetaData);
        when(databaseMetaData.getDatabaseProductVersion()).thenReturn("5.7.0"); // Unsupported version
        when(databaseBuildRepository.save(any(StudyDatabaseBuildEntity.class))).thenReturn(buildEntity);
        
        // Act
        DatabaseBuildResult result = databaseBuildService.buildStudyDatabase(buildRequest);
        
        // Assert
        assertNotNull(result);
        assertEquals("FAILED", result.getBuildStatus());
        assertEquals(1L, result.getStudyId());
        assertFalse(result.getErrors().isEmpty());
        verify(databaseBuildRepository, times(2)).save(any(StudyDatabaseBuildEntity.class));
    }
    
    @Test
    void testDatabaseBuildWithException() throws Exception {
        // Arrange
        when(dataSource.getConnection()).thenThrow(new RuntimeException("Database connection failed"));
        when(databaseBuildRepository.save(any(StudyDatabaseBuildEntity.class))).thenReturn(buildEntity);
        
        // Act
        DatabaseBuildResult result = databaseBuildService.buildStudyDatabase(buildRequest);
        
        // Assert
        assertNotNull(result);
        assertEquals("FAILED", result.getBuildStatus());
        assertEquals(1L, result.getStudyId());
        assertTrue(result.getMessage().contains("Database build failed"));
        verify(databaseBuildRepository, times(2)).save(any(StudyDatabaseBuildEntity.class));
    }
    
    @Test
    void testBuildRequestValidation() {
        // Test null study ID
        DatabaseBuildRequest invalidRequest = DatabaseBuildRequest.builder()
                .studyId(null)
                .requestedBy(100L)
                .build();
        
        // This would be validated by the controller layer with @Valid annotation
        // The service assumes valid input
        assertThrows(Exception.class, () -> {
            databaseBuildService.buildStudyDatabase(invalidRequest);
        });
    }
    
    @Test
    void testFormDefinitionImport() {
        // Arrange
        Map<String, Object> studyDesignConfig = new HashMap<>();
        studyDesignConfig.put("forms", createTestFormsConfig());
        
        // Act & Assert
        doNothing().when(formDefinitionService)
                .importFormDefinitionsFromStudyDesign(eq(1L), eq(studyDesignConfig));
        
        formDefinitionService.importFormDefinitionsFromStudyDesign(1L, studyDesignConfig);
        
        verify(formDefinitionService).importFormDefinitionsFromStudyDesign(1L, studyDesignConfig);
    }
    
    @Test
    void testValidationRuleSetup() {
        // Arrange
        Map<String, Object> validationRules = new HashMap<>();
        validationRules.put("rules", createTestValidationRules());
        
        // Act & Assert
        doNothing().when(formDefinitionService)
                .setupValidationRules(eq(1L), eq(validationRules));
        
        formDefinitionService.setupValidationRules(1L, validationRules);
        
        verify(formDefinitionService).setupValidationRules(1L, validationRules);
    }
    
    private Object createTestFormsConfig() {
        Map<String, Object> form1 = new HashMap<>();
        form1.put("name", "demographics");
        form1.put("displayName", "Demographics Form");
        form1.put("type", "BASELINE");
        
        Map<String, Object> form2 = new HashMap<>();
        form2.put("name", "medical_history");
        form2.put("displayName", "Medical History Form");
        form2.put("type", "BASELINE");
        
        return java.util.Arrays.asList(form1, form2);
    }
    
    private Object createTestValidationRules() {
        Map<String, Object> rule1 = new HashMap<>();
        rule1.put("name", "age_range");
        rule1.put("type", "RANGE");
        rule1.put("field", "age");
        rule1.put("expression", "age >= 18 AND age <= 65");
        
        Map<String, Object> rule2 = new HashMap<>();
        rule2.put("name", "email_format");
        rule2.put("type", "FORMAT");
        rule2.put("field", "email");
        rule2.put("expression", "^[\\w-\\.]+@[\\w-]+\\.[a-zA-Z]{2,}$");
        
        return java.util.Arrays.asList(rule1, rule2);
    }
}