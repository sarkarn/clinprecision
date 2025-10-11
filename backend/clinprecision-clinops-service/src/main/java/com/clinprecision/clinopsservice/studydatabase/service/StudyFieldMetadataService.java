package com.clinprecision.clinopsservice.studydatabase.service;

import com.clinprecision.clinopsservice.studydatabase.dto.CdashMappingDTO;
import com.clinprecision.clinopsservice.studydatabase.dto.FieldMetadataDTO;
import com.clinprecision.clinopsservice.studydatabase.dto.MedicalCodingConfigDTO;
import com.clinprecision.clinopsservice.studydatabase.entity.StudyCdashMappingEntity;
import com.clinprecision.clinopsservice.studydatabase.entity.StudyFieldMetadataEntity;
import com.clinprecision.clinopsservice.studydatabase.entity.StudyMedicalCodingConfigEntity;
import com.clinprecision.clinopsservice.studydatabase.repository.StudyCdashMappingRepository;
import com.clinprecision.clinopsservice.studydatabase.repository.StudyFieldMetadataRepository;
import com.clinprecision.clinopsservice.studydatabase.repository.StudyMedicalCodingConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for Study Field Metadata Operations (Phase 6E)
 * 
 * Provides business logic for:
 * - Field-level metadata queries
 * - Clinical and regulatory flag management
 * - SDV and review planning
 * - Compliance reporting
 * 
 * Features:
 * - Caching for performance
 * - DTO conversion logic
 * - Business rule validation
 * - Summary statistics
 * 
 * @author ClinPrecision Development Team
 * @since Phase 6E: Service Layer
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyFieldMetadataService {
    
    private final StudyFieldMetadataRepository fieldMetadataRepository;
    private final StudyCdashMappingRepository cdashMappingRepository;
    private final StudyMedicalCodingConfigRepository medicalCodingConfigRepository;
    
    /**
     * Get all field metadata for a specific form
     * Cached by study ID and form ID
     */
    @Cacheable(value = "formMetadata", key = "#studyId + '-' + #formId")
    public List<FieldMetadataDTO> getFormFieldMetadata(Long studyId, Long formId) {
        log.debug("Fetching field metadata for study {} form {}", studyId, formId);
        
        List<StudyFieldMetadataEntity> entities = 
            fieldMetadataRepository.findByStudyIdAndFormId(studyId, formId);
        
        return entities.stream()
            .map(this::convertToFieldMetadataDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get metadata for a specific field
     */
    @Cacheable(value = "fieldMetadata", key = "#studyId + '-' + #formId + '-' + #fieldName")
    public Optional<FieldMetadataDTO> getFieldMetadata(Long studyId, Long formId, String fieldName) {
        log.debug("Fetching metadata for study {} form {} field {}", studyId, formId, fieldName);
        
        return fieldMetadataRepository.findByStudyIdAndFormIdAndFieldName(studyId, formId, fieldName)
            .map(this::convertToFieldMetadataDTO);
    }
    
    /**
     * Get all fields requiring Source Data Verification (SDV)
     * Used by clinical monitors for planning SDV activities
     */
    @Cacheable(value = "sdvFields", key = "#studyId")
    public List<FieldMetadataDTO> getSdvRequiredFields(Long studyId) {
        log.debug("Fetching SDV-required fields for study {}", studyId);
        
        List<StudyFieldMetadataEntity> entities = 
            fieldMetadataRepository.findByStudyIdAndSdvRequiredTrue(studyId);
        
        return entities.stream()
            .map(this::convertToFieldMetadataDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all fields requiring medical review
     * Used by medical monitors for planning review activities
     */
    @Cacheable(value = "medicalReviewFields", key = "#studyId")
    public List<FieldMetadataDTO> getMedicalReviewRequiredFields(Long studyId) {
        log.debug("Fetching medical-review-required fields for study {}", studyId);
        
        List<StudyFieldMetadataEntity> entities = 
            fieldMetadataRepository.findByStudyIdAndMedicalReviewRequiredTrue(studyId);
        
        return entities.stream()
            .map(this::convertToFieldMetadataDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all critical data points for a study
     * Used for risk-based monitoring
     */
    @Cacheable(value = "criticalFields", key = "#studyId")
    public List<FieldMetadataDTO> getCriticalDataPoints(Long studyId) {
        log.debug("Fetching critical data points for study {}", studyId);
        
        List<StudyFieldMetadataEntity> entities = 
            fieldMetadataRepository.findByStudyIdAndCriticalDataPointTrue(studyId);
        
        return entities.stream()
            .map(this::convertToFieldMetadataDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all FDA-required fields
     * Used for regulatory compliance planning
     */
    @Cacheable(value = "fdaFields", key = "#studyId")
    public List<FieldMetadataDTO> getFdaRequiredFields(Long studyId) {
        log.debug("Fetching FDA-required fields for study {}", studyId);
        
        List<StudyFieldMetadataEntity> entities = 
            fieldMetadataRepository.findByStudyIdAndFdaRequiredTrue(studyId);
        
        return entities.stream()
            .map(this::convertToFieldMetadataDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all safety data points
     * Used for safety reporting
     */
    @Cacheable(value = "safetyFields", key = "#studyId")
    public List<FieldMetadataDTO> getSafetyDataPoints(Long studyId) {
        log.debug("Fetching safety data points for study {}", studyId);
        
        List<StudyFieldMetadataEntity> entities = 
            fieldMetadataRepository.findByStudyIdAndSafetyDataPointTrue(studyId);
        
        return entities.stream()
            .map(this::convertToFieldMetadataDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all fields requiring any type of review
     * (SDV, medical review, or data review)
     */
    @Cacheable(value = "reviewFields", key = "#studyId")
    public List<FieldMetadataDTO> getAllReviewRequiredFields(Long studyId) {
        log.debug("Fetching all review-required fields for study {}", studyId);
        
        List<StudyFieldMetadataEntity> entities = 
            fieldMetadataRepository.findAllFieldsRequiringReview(studyId);
        
        return entities.stream()
            .map(this::convertToFieldMetadataDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get metadata summary statistics for a study
     */
    @Cacheable(value = "metadataSummary", key = "#studyId")
    public MetadataSummary getMetadataSummary(Long studyId) {
        log.debug("Fetching metadata summary for study {}", studyId);
        
        Object[] summaryData = fieldMetadataRepository.getMetadataSummary(studyId);
        
        return MetadataSummary.builder()
            .studyId(studyId)
            .totalFields(summaryData != null && summaryData.length > 0 ? ((Number) summaryData[0]).longValue() : 0L)
            .sdvRequiredCount(summaryData != null && summaryData.length > 1 ? ((Number) summaryData[1]).longValue() : 0L)
            .medicalReviewCount(summaryData != null && summaryData.length > 2 ? ((Number) summaryData[2]).longValue() : 0L)
            .criticalFieldsCount(summaryData != null && summaryData.length > 3 ? ((Number) summaryData[3]).longValue() : 0L)
            .fdaRequiredCount(summaryData != null && summaryData.length > 4 ? ((Number) summaryData[4]).longValue() : 0L)
            .totalCdashMappings(cdashMappingRepository.countByStudyId(studyId))
            .totalCodingConfigs(medicalCodingConfigRepository.countByStudyId(studyId))
            .build();
    }
    
    /**
     * Get CDASH/SDTM mappings for a study
     */
    @Cacheable(value = "cdashMappings", key = "#studyId")
    public List<CdashMappingDTO> getCdashMappings(Long studyId) {
        log.debug("Fetching CDASH mappings for study {}", studyId);
        
        List<StudyCdashMappingEntity> entities = 
            cdashMappingRepository.findByStudyId(studyId);
        
        return entities.stream()
            .map(this::convertToCdashMappingDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get CDASH mappings for a specific CDISC domain
     */
    @Cacheable(value = "cdashMappingsByDomain", key = "#studyId + '-' + #domain")
    public List<CdashMappingDTO> getCdashMappingsByDomain(Long studyId, String domain) {
        log.debug("Fetching CDASH mappings for study {} domain {}", studyId, domain);
        
        List<StudyCdashMappingEntity> entities = 
            cdashMappingRepository.findByStudyIdAndCdashDomain(studyId, domain);
        
        return entities.stream()
            .map(this::convertToCdashMappingDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get CDASH mappings grouped by domain
     * Useful for define.xml generation
     */
    @Cacheable(value = "cdashMappingsByDomainGrouped", key = "#studyId")
    public Map<String, List<CdashMappingDTO>> getCdashMappingsGroupedByDomain(Long studyId) {
        log.debug("Fetching CDASH mappings grouped by domain for study {}", studyId);
        
        List<CdashMappingDTO> allMappings = getCdashMappings(studyId);
        
        return allMappings.stream()
            .collect(Collectors.groupingBy(CdashMappingDTO::getCdashDomain));
    }
    
    /**
     * Get medical coding configurations for a study
     */
    @Cacheable(value = "codingConfigs", key = "#studyId")
    public List<MedicalCodingConfigDTO> getMedicalCodingConfigs(Long studyId) {
        log.debug("Fetching medical coding configs for study {}", studyId);
        
        List<StudyMedicalCodingConfigEntity> entities = 
            medicalCodingConfigRepository.findByStudyId(studyId);
        
        return entities.stream()
            .map(this::convertToMedicalCodingConfigDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get medical coding configurations for a specific dictionary
     */
    @Cacheable(value = "codingConfigsByDictionary", key = "#studyId + '-' + #dictionaryType")
    public List<MedicalCodingConfigDTO> getMedicalCodingConfigsByDictionary(
            Long studyId, String dictionaryType) {
        log.debug("Fetching medical coding configs for study {} dictionary {}", studyId, dictionaryType);
        
        List<StudyMedicalCodingConfigEntity> entities = 
            medicalCodingConfigRepository.findByStudyIdAndDictionaryType(studyId, dictionaryType);
        
        return entities.stream()
            .map(this::convertToMedicalCodingConfigDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Validate field metadata for compliance
     * Returns validation messages if any rules are violated
     */
    public List<String> validateFieldMetadata(FieldMetadataDTO metadata) {
        List<String> validationMessages = new java.util.ArrayList<>();
        
        // Rule 1: FDA/EMA required fields must have audit trail
        if (Boolean.TRUE.equals(metadata.getRegulatory().getFdaRequired()) || 
            Boolean.TRUE.equals(metadata.getRegulatory().getEmaRequired())) {
            if ("NONE".equals(metadata.getAuditTrail().getLevel())) {
                validationMessages.add("FDA/EMA required fields must have audit trail (BASIC or FULL)");
            }
        }
        
        // Rule 2: Electronic signature requires FULL audit trail
        if (Boolean.TRUE.equals(metadata.getAuditTrail().getElectronicSignatureRequired())) {
            if (!"FULL".equals(metadata.getAuditTrail().getLevel())) {
                validationMessages.add("Electronic signature requires FULL audit trail");
            }
        }
        
        // Rule 3: Derived fields must have formula
        if (Boolean.TRUE.equals(metadata.getDataEntry().getIsDerivedField())) {
            if (metadata.getDataEntry().getDerivationFormula() == null || 
                metadata.getDataEntry().getDerivationFormula().trim().isEmpty()) {
                validationMessages.add("Derived fields must have derivation formula");
            }
        }
        
        // Rule 4: Safety data points should have SDV or medical review
        if (Boolean.TRUE.equals(metadata.getClinical().getSafetyDataPoint())) {
            if (!Boolean.TRUE.equals(metadata.getClinical().getSdvRequired()) && 
                !Boolean.TRUE.equals(metadata.getClinical().getMedicalReviewRequired())) {
                validationMessages.add("Safety data points should have SDV or medical review");
            }
        }
        
        return validationMessages;
    }
    
    /**
     * Generate compliance report for a study
     */
    public ComplianceReport generateComplianceReport(Long studyId) {
        log.info("Generating compliance report for study {}", studyId);
        
        MetadataSummary summary = getMetadataSummary(studyId);
        List<FieldMetadataDTO> allFields = fieldMetadataRepository.findByStudyId(studyId)
            .stream()
            .map(this::convertToFieldMetadataDTO)
            .collect(Collectors.toList());
        
        // Calculate compliance percentages
        long totalFields = allFields.size();
        long sdvCoverage = allFields.stream()
            .filter(f -> Boolean.TRUE.equals(f.getClinical().getSdvRequired()))
            .count();
        long criticalWithSDV = allFields.stream()
            .filter(f -> Boolean.TRUE.equals(f.getClinical().getCriticalDataPoint()))
            .filter(f -> Boolean.TRUE.equals(f.getClinical().getSdvRequired()))
            .count();
        long criticalFields = allFields.stream()
            .filter(f -> Boolean.TRUE.equals(f.getClinical().getCriticalDataPoint()))
            .count();
        
        double sdvCoveragePercent = totalFields > 0 ? (sdvCoverage * 100.0 / totalFields) : 0.0;
        double criticalSDVPercent = criticalFields > 0 ? (criticalWithSDV * 100.0 / criticalFields) : 0.0;
        
        return ComplianceReport.builder()
            .studyId(studyId)
            .totalFields(totalFields)
            .sdvCoveragePercent(sdvCoveragePercent)
            .criticalDataPointSDVPercent(criticalSDVPercent)
            .fdaRequiredFieldsCount(summary.getFdaRequiredCount())
            .cdashMappingsCount(summary.getTotalCdashMappings())
            .medicalCodingConfigCount(summary.getTotalCodingConfigs())
            .complianceLevel(calculateComplianceLevel(sdvCoveragePercent, criticalSDVPercent))
            .build();
    }
    
    private String calculateComplianceLevel(double sdvCoverage, double criticalSDV) {
        if (criticalSDV >= 95.0 && sdvCoverage >= 75.0) {
            return "EXCELLENT";
        } else if (criticalSDV >= 85.0 && sdvCoverage >= 60.0) {
            return "GOOD";
        } else if (criticalSDV >= 70.0 && sdvCoverage >= 50.0) {
            return "ACCEPTABLE";
        } else {
            return "NEEDS_IMPROVEMENT";
        }
    }
    
    // ========== DTO Conversion Methods ==========
    
    private FieldMetadataDTO convertToFieldMetadataDTO(StudyFieldMetadataEntity entity) {
        return FieldMetadataDTO.builder()
            .id(entity.getId())
            .studyId(entity.getStudyId())
            .formId(entity.getFormId())
            .fieldName(entity.getFieldName())
            .fieldLabel(entity.getFieldLabel())
            .clinical(FieldMetadataDTO.ClinicalFlags.builder()
                .sdvRequired(entity.getSdvRequired())
                .medicalReviewRequired(entity.getMedicalReviewRequired())
                .criticalDataPoint(entity.getCriticalDataPoint())
                .safetyDataPoint(entity.getSafetyDataPoint())
                .efficacyDataPoint(entity.getEfficacyDataPoint())
                .dataReviewRequired(entity.getDataReviewRequired())
                .build())
            .regulatory(FieldMetadataDTO.RegulatoryFlags.builder()
                .fdaRequired(entity.getFdaRequired())
                .emaRequired(entity.getEmaRequired())
                .cfr21Part11(entity.getCfr21Part11())
                .gcpRequired(entity.getGcpRequired())
                .hipaaProtected(entity.getHipaaProtected())
                .build())
            .auditTrail(FieldMetadataDTO.AuditTrailConfig.builder()
                .level(entity.getAuditTrailLevel() != null ? entity.getAuditTrailLevel().name() : "NONE")
                .electronicSignatureRequired(entity.getElectronicSignatureRequired())
                .reasonForChangeRequired(entity.getReasonForChangeRequired())
                .build())
            .dataEntry(FieldMetadataDTO.DataEntryConfig.builder()
                .isDerivedField(entity.getIsDerivedField())
                .derivationFormula(entity.getDerivationFormula())
                .isQueryEnabled(entity.getIsQueryEnabled())
                .isEditableAfterLock(entity.getIsEditableAfterLock())
                .build())
            .build();
    }
    
    private CdashMappingDTO convertToCdashMappingDTO(StudyCdashMappingEntity entity) {
        return CdashMappingDTO.builder()
            .id(entity.getId())
            .studyId(entity.getStudyId())
            .formId(entity.getFormId())
            .fieldName(entity.getFieldName())
            .cdashDomain(entity.getCdashDomain())
            .cdashVariable(entity.getCdashVariable())
            .cdashLabel(entity.getCdashLabel())
            .sdtmDomain(entity.getSdtmDomain())
            .sdtmVariable(entity.getSdtmVariable())
            .sdtmLabel(entity.getSdtmLabel())
            .sdtmDatatype(entity.getSdtmDatatype())
            .sdtmLength(entity.getSdtmLength())
            .cdiscTerminologyCode(entity.getCdiscTerminologyCode())
            .dataOrigin(entity.getDataOrigin())
            .unitConversionRule(entity.getUnitConversionRule())
            .mappingNotes(entity.getMappingNotes())
            .isActive(entity.getIsActive())
            .build();
    }
    
    private MedicalCodingConfigDTO convertToMedicalCodingConfigDTO(StudyMedicalCodingConfigEntity entity) {
        return MedicalCodingConfigDTO.builder()
            .id(entity.getId())
            .studyId(entity.getStudyId())
            .formId(entity.getFormId())
            .fieldName(entity.getFieldName())
            .dictionaryType(entity.getDictionaryType())
            .dictionaryVersion(entity.getDictionaryVersion())
            .codingRequired(entity.getCodingRequired())
            .autoCodingEnabled(entity.getAutoCodingEnabled())
            .autoCodingThreshold(entity.getAutoCodingThreshold())
            .manualReviewRequired(entity.getManualReviewRequired())
            .verbatimFieldLabel(entity.getVerbatimFieldLabel())
            .verbatimMaxLength(entity.getVerbatimMaxLength())
            .verbatimRequired(entity.getVerbatimRequired())
            .codeToLevel(entity.getCodeToLevel())
            .capturePrimarySoc(entity.getCapturePrimarySoc())
            .showAllMatches(entity.getShowAllMatches())
            .maxMatchesDisplayed(entity.getMaxMatchesDisplayed())
            .primaryCoderRole(entity.getPrimaryCoderRole())
            .secondaryCoderRole(entity.getSecondaryCoderRole())
            .adjudicationRequired(entity.getAdjudicationRequired())
            .adjudicatorRole(entity.getAdjudicatorRole())
            .workflowType(entity.getWorkflowType())
            .codingInstructions(entity.getCodingInstructions())
            .isActive(entity.getIsActive())
            .build();
    }
    
    // ========== Inner Classes ==========
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MetadataSummary {
        private Long studyId;
        private Long totalFields;
        private Long sdvRequiredCount;
        private Long medicalReviewCount;
        private Long criticalFieldsCount;
        private Long fdaRequiredCount;
        private Long totalCdashMappings;
        private Long totalCodingConfigs;
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ComplianceReport {
        private Long studyId;
        private Long totalFields;
        private Double sdvCoveragePercent;
        private Double criticalDataPointSDVPercent;
        private Long fdaRequiredFieldsCount;
        private Long cdashMappingsCount;
        private Long medicalCodingConfigCount;
        private String complianceLevel;  // EXCELLENT, GOOD, ACCEPTABLE, NEEDS_IMPROVEMENT
    }
}
