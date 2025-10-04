package com.clinprecision.clinopsservice.controller;

import com.clinprecision.clinopsservice.service.AdminServiceProxy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Reference Data Operations  
 * Centralized endpoint for all dropdown/reference data
 * 
 * This controller demonstrates Phase 2: Service Integration
 * by replacing individual service calls with centralized CodeList access
 * 
 * BEFORE: Multiple services (RegulatoryStatusService, StudyPhaseService, etc.)
 * AFTER: Single CodeListClientService with Feign calls to Admin Service
 */
@RestController
@RequestMapping("/api/v2/reference-data")
public class ReferenceDataController {

    private static final Logger logger = LoggerFactory.getLogger(ReferenceDataController.class);

    private final AdminServiceProxy codeListService;

    public ReferenceDataController(AdminServiceProxy codeListService) {
        this.codeListService = codeListService;
    }

    /**
     * Get all regulatory statuses for dropdowns
     * 
     * INTEGRATION EXAMPLE: 
     * This endpoint now calls Admin Service via Feign Client
     * instead of querying local regulatory_status tables
     * 
     * GET /api/v2/reference-data/regulatory-statuses
     */
    @GetMapping("/regulatory-statuses")
    public ResponseEntity<List<Map<String, Object>>> getRegulatoryStatuses() {
        logger.info("Phase 2 Integration: Fetching regulatory statuses via CodeList Service");
        
        List<Map<String, Object>> statuses = codeListService.getAllRegulatoryStatuses();
        
        logger.info("✅ Successfully retrieved {} regulatory statuses from Admin Service", 
                   statuses.size());
        return ResponseEntity.ok(statuses);
    }

    /**
     * Get all study phases for dropdowns
     * 
     * INTEGRATION EXAMPLE:
     * Centralized access replaces StudyPhaseService.getAllActivePhases()
     * 
     * GET /api/v2/reference-data/study-phases
     */
    @GetMapping("/study-phases")
    public ResponseEntity<List<Map<String, Object>>> getStudyPhases() {
        logger.info("Phase 2 Integration: Fetching study phases via CodeList Service");
        
        List<Map<String, Object>> phases = codeListService.getAllStudyPhases();
        
        logger.info("✅ Successfully retrieved {} study phases from Admin Service", 
                   phases.size());
        return ResponseEntity.ok(phases);
    }

    /**
     * Get all study statuses for dropdowns
     * 
     * GET /api/v2/reference-data/study-statuses
     */
    @GetMapping("/study-statuses")
    public ResponseEntity<List<Map<String, Object>>> getStudyStatuses() {
        logger.info("Phase 2 Integration: Fetching study statuses via CodeList Service");
        
        List<Map<String, Object>> statuses = codeListService.getAllStudyStatuses();
        
        logger.info("✅ Successfully retrieved {} study statuses from Admin Service", 
                   statuses.size());
        return ResponseEntity.ok(statuses);
    }

    /**
     * Get all amendment types for study amendments
     * 
     * GET /api/v2/reference-data/amendment-types
     */
    @GetMapping("/amendment-types")
    public ResponseEntity<List<Map<String, Object>>> getAmendmentTypes() {
        logger.info("Phase 2 Integration: Fetching amendment types via CodeList Service");
        
        List<Map<String, Object>> types = codeListService.getAllAmendmentTypes();
        
        logger.info("✅ Successfully retrieved {} amendment types from Admin Service", 
                   types.size());
        return ResponseEntity.ok(types);
    }

    /**
     * Get all visit types for visit definitions
     * 
     * GET /api/v2/reference-data/visit-types
     */
    @GetMapping("/visit-types")
    public ResponseEntity<List<Map<String, Object>>> getVisitTypes() {
        logger.info("Phase 2 Integration: Fetching visit types via CodeList Service");
        
        List<Map<String, Object>> types = codeListService.getAllVisitTypes();
        
        logger.info("✅ Successfully retrieved {} visit types from Admin Service", 
                   types.size());
        return ResponseEntity.ok(types);
    }

    /**
     * Get regulatory statuses that allow enrollment
     * 
     * ADVANCED EXAMPLE:
     * Uses metadata filtering capabilities from Admin Service
     * Replaces complex repository queries with simple API calls
     * 
     * GET /api/v2/reference-data/regulatory-statuses/enrollment-allowed
     */
    @GetMapping("/regulatory-statuses/enrollment-allowed")
    public ResponseEntity<List<Map<String, Object>>> getRegulatoryStatusesAllowingEnrollment() {
        logger.info("Phase 2 Integration: Fetching enrollment-allowing regulatory statuses");
        
        List<Map<String, Object>> statuses = codeListService.getRegulatoryStatusesAllowingEnrollment();
        
        logger.info("✅ Successfully retrieved {} enrollment-allowing statuses", 
                   statuses.size());
        return ResponseEntity.ok(statuses);
    }

    /**
     * Get study phases that require IND
     * 
     * ADVANCED EXAMPLE:
     * Demonstrates metadata-based filtering
     * 
     * GET /api/v2/reference-data/study-phases/ind-required
     */
    @GetMapping("/study-phases/ind-required")
    public ResponseEntity<List<Map<String, Object>>> getStudyPhasesRequiringInd() {
        logger.info("Phase 2 Integration: Fetching IND-requiring study phases");
        
        List<Map<String, Object>> phases = codeListService.getStudyPhasesRequiringInd();
        
        logger.info("✅ Successfully retrieved {} IND-requiring phases", 
                   phases.size());
        return ResponseEntity.ok(phases);
    }

    /**
     * Get all available code list categories
     * 
     * SYSTEM DISCOVERY:
     * Shows all reference data categories available from Admin Service
     * 
     * GET /api/v2/reference-data/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAvailableCategories() {
        logger.info("Phase 2 Integration: Fetching available categories");
        
        List<String> categories = codeListService.getAvailableCategories();
        
        logger.info("✅ Successfully retrieved {} categories from Admin Service", 
                   categories.size());
        return ResponseEntity.ok(categories);
    }

    /**
     * Health check endpoint for integration testing
     * 
     * GET /api/v2/reference-data/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        logger.info("Phase 2 Integration: Health check");
        
        try {
            List<String> categories = codeListService.getAvailableCategories();
            
            Map<String, Object> health = Map.of(
                "status", "UP",
                "integration", "CodeList Admin Service",
                "phase", "Phase 2: Service Integration",
                "categoriesAvailable", categories.size(),
                "message", "✅ Successfully integrated with centralized CodeList service"
            );
            
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            logger.error("Health check failed", e);
            
            Map<String, Object> health = Map.of(
                "status", "DOWN",
                "integration", "CodeList Admin Service",
                "phase", "Phase 2: Service Integration",
                "error", e.getMessage(),
                "message", "❌ Integration with CodeList service failed - using fallback"
            );
            
            return ResponseEntity.status(503).body(health);
        }
    }
}
