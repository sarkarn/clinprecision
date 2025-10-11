package com.clinprecision.clinopsservice.studydatabase.controller;

import com.clinprecision.clinopsservice.studydatabase.dto.CdashMappingDTO;
import com.clinprecision.clinopsservice.studydatabase.dto.FieldMetadataDTO;
import com.clinprecision.clinopsservice.studydatabase.dto.MedicalCodingConfigDTO;
import com.clinprecision.clinopsservice.studydatabase.service.StudyFieldMetadataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API Controller for Study Database Metadata (Phase 6D/6E)
 * 
 * Provides endpoints for:
 * - Field-level metadata (clinical & regulatory flags)
 * - CDASH/SDTM mappings for regulatory submissions
 * - Medical coding configuration
 * - Data review and SDV requirements
 * - Compliance reporting
 * 
 * Updated in Phase 6E to use service layer with caching
 * 
 * @author ClinPrecision Development Team
 * @since Phase 6: Item-Level Metadata
 */
@Slf4j
@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
public class StudyMetadataQueryController {
    
    private final StudyFieldMetadataService metadataService;
    
    /**
     * GET /api/studies/{studyId}/forms/{formId}/metadata
     * 
     * Get all field metadata for a specific form
     * Returns clinical flags, regulatory flags, audit trail config, etc.
     * 
     * @param studyId Study ID
     * @param formId Form ID
     * @return List of field metadata
     */
    @GetMapping("/{studyId}/forms/{formId}/metadata")
    public ResponseEntity<List<FieldMetadataDTO>> getFormFieldMetadata(
            @PathVariable Long studyId,
            @PathVariable Long formId) {
        
        log.info("Fetching field metadata for study {} form {}", studyId, formId);
        List<FieldMetadataDTO> dtos = metadataService.getFormFieldMetadata(studyId, formId);
        log.info("Found {} field metadata records for study {} form {}", dtos.size(), studyId, formId);
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * GET /api/studies/{studyId}/metadata/sdv-required
     * 
     * Get all fields requiring Source Data Verification (SDV)
     * Used by monitors to plan SDV activities
     * 
     * @param studyId Study ID
     * @return List of fields requiring SDV
     */
    @GetMapping("/{studyId}/metadata/sdv-required")
    public ResponseEntity<List<FieldMetadataDTO>> getSdvRequiredFields(
            @PathVariable Long studyId) {
        
        log.info("Fetching SDV-required fields for study {}", studyId);
        List<FieldMetadataDTO> dtos = metadataService.getSdvRequiredFields(studyId);
        log.info("Found {} SDV-required fields for study {}", dtos.size(), studyId);
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * GET /api/studies/{studyId}/metadata/medical-review-required
     * 
     * Get all fields requiring medical review
     * Used by medical monitors to plan review activities
     * 
     * @param studyId Study ID
     * @return List of fields requiring medical review
     */
    @GetMapping("/{studyId}/metadata/medical-review-required")
    public ResponseEntity<List<FieldMetadataDTO>> getMedicalReviewRequiredFields(
            @PathVariable Long studyId) {
        
        log.info("Fetching medical-review-required fields for study {}", studyId);
        List<FieldMetadataDTO> dtos = metadataService.getMedicalReviewRequiredFields(studyId);
        log.info("Found {} medical-review-required fields for study {}", dtos.size(), studyId);
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * GET /api/studies/{studyId}/metadata/critical-data-points
     * 
     * Get all critical data points for the study
     * Used for risk-based monitoring and data quality management
     * 
     * @param studyId Study ID
     * @return List of critical data points
     */
    @GetMapping("/{studyId}/metadata/critical-data-points")
    public ResponseEntity<List<FieldMetadataDTO>> getCriticalDataPoints(
            @PathVariable Long studyId) {
        
        log.info("Fetching critical data points for study {}", studyId);
        List<FieldMetadataDTO> dtos = metadataService.getCriticalDataPoints(studyId);
        log.info("Found {} critical data points for study {}", dtos.size(), studyId);
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * GET /api/studies/{studyId}/metadata/fda-required
     * 
     * Get all FDA-required fields
     * Used for regulatory compliance planning
     * 
     * @param studyId Study ID
     * @return List of FDA-required fields
     */
    @GetMapping("/{studyId}/metadata/fda-required")
    public ResponseEntity<List<FieldMetadataDTO>> getFdaRequiredFields(
            @PathVariable Long studyId) {
        
        log.info("Fetching FDA-required fields for study {}", studyId);
        List<FieldMetadataDTO> dtos = metadataService.getFdaRequiredFields(studyId);
        log.info("Found {} FDA-required fields for study {}", dtos.size(), studyId);
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * GET /api/studies/{studyId}/cdash/mappings
     * 
     * Get all CDASH/SDTM mappings for regulatory submissions
     * Used for define.xml generation and SDTM dataset creation
     * 
     * @param studyId Study ID
     * @return List of CDASH mappings
     */
    @GetMapping("/{studyId}/cdash/mappings")
    public ResponseEntity<List<CdashMappingDTO>> getCdashMappings(
            @PathVariable Long studyId) {
        
        log.info("Fetching CDASH mappings for study {}", studyId);
        List<CdashMappingDTO> dtos = metadataService.getCdashMappings(studyId);
        log.info("Found {} CDASH mappings for study {}", dtos.size(), studyId);
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * GET /api/studies/{studyId}/cdash/mappings/domain/{domain}
     * 
     * Get CDASH mappings for a specific CDISC domain
     * 
     * @param studyId Study ID
     * @param domain CDISC domain (e.g., "VS", "AE", "LB")
     * @return List of CDASH mappings for domain
     */
    @GetMapping("/{studyId}/cdash/mappings/domain/{domain}")
    public ResponseEntity<List<CdashMappingDTO>> getCdashMappingsByDomain(
            @PathVariable Long studyId,
            @PathVariable String domain) {
        
        log.info("Fetching CDASH mappings for study {} domain {}", studyId, domain);
        List<CdashMappingDTO> dtos = metadataService.getCdashMappingsByDomain(studyId, domain);
        log.info("Found {} CDASH mappings for study {} domain {}", dtos.size(), studyId, domain);
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * GET /api/studies/{studyId}/cdash/mappings/grouped
     * 
     * Get CDASH mappings grouped by domain
     * 
     * @param studyId Study ID
     * @return Map of domain to CDASH mappings
     */
    @GetMapping("/{studyId}/cdash/mappings/grouped")
    public ResponseEntity<Map<String, List<CdashMappingDTO>>> getCdashMappingsGrouped(
            @PathVariable Long studyId) {
        
        log.info("Fetching CDASH mappings grouped by domain for study {}", studyId);
        Map<String, List<CdashMappingDTO>> groupedMappings = metadataService.getCdashMappingsGroupedByDomain(studyId);
        log.info("Found {} domains with mappings for study {}", groupedMappings.size(), studyId);
        return ResponseEntity.ok(groupedMappings);
    }
    
    /**
     * GET /api/studies/{studyId}/coding/config
     * 
     * Get all medical coding configurations
     * Used to configure medical coding workflows (MedDRA, WHO-DD, etc.)
     * 
     * @param studyId Study ID
     * @return List of medical coding configurations
     */
    @GetMapping("/{studyId}/coding/config")
    public ResponseEntity<List<MedicalCodingConfigDTO>> getMedicalCodingConfig(
            @PathVariable Long studyId) {
        
        log.info("Fetching medical coding config for study {}", studyId);
        List<MedicalCodingConfigDTO> dtos = metadataService.getMedicalCodingConfigs(studyId);
        log.info("Found {} medical coding configs for study {}", dtos.size(), studyId);
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * GET /api/studies/{studyId}/coding/config/dictionary/{dictionaryType}
     * 
     * Get medical coding configurations for a specific dictionary
     * 
     * @param studyId Study ID
     * @param dictionaryType Dictionary type (e.g., "MedDRA", "WHO_DD")
     * @return List of medical coding configurations for dictionary
     */
    @GetMapping("/{studyId}/coding/config/dictionary/{dictionaryType}")
    public ResponseEntity<List<MedicalCodingConfigDTO>> getMedicalCodingConfigByDictionary(
            @PathVariable Long studyId,
            @PathVariable String dictionaryType) {
        
        log.info("Fetching medical coding config for study {} dictionary {}", studyId, dictionaryType);
        List<MedicalCodingConfigDTO> dtos = metadataService.getMedicalCodingConfigsByDictionary(studyId, dictionaryType);
        log.info("Found {} medical coding configs for study {} dictionary {}", 
                dtos.size(), studyId, dictionaryType);
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * GET /api/studies/{studyId}/metadata/summary
     * 
     * Get metadata summary statistics for a study
     * 
     * @param studyId Study ID
     * @return Metadata summary
     */
    @GetMapping("/{studyId}/metadata/summary")
    public ResponseEntity<StudyFieldMetadataService.MetadataSummary> getMetadataSummary(
            @PathVariable Long studyId) {
        
        log.info("Fetching metadata summary for study {}", studyId);
        StudyFieldMetadataService.MetadataSummary summary = metadataService.getMetadataSummary(studyId);
        log.info("Metadata summary for study {}: {} total fields, {} SDV required, {} CDASH mappings", 
                studyId, summary.getTotalFields(), summary.getSdvRequiredCount(), summary.getTotalCdashMappings());
        return ResponseEntity.ok(summary);
    }
    
    /**
     * GET /api/studies/{studyId}/metadata/compliance
     * 
     * Get compliance report for a study
     * 
     * @param studyId Study ID
     * @return Compliance report
     */
    @GetMapping("/{studyId}/metadata/compliance")
    public ResponseEntity<StudyFieldMetadataService.ComplianceReport> getComplianceReport(
            @PathVariable Long studyId) {
        
        log.info("Fetching compliance report for study {}", studyId);
        StudyFieldMetadataService.ComplianceReport report = metadataService.generateComplianceReport(studyId);
        log.info("Compliance report for study {}: level={}, SDV coverage={}", 
                studyId, report.getComplianceLevel(), report.getSdvCoveragePercent());
        return ResponseEntity.ok(report);
    }
}
