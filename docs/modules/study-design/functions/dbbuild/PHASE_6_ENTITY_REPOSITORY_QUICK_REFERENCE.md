# Phase 6 Quick Reference - Entity & Repository API

## Entities Quick Reference

### 1. StudyFieldMetadataEntity
**Table**: `study_field_metadata`  
**Purpose**: Track clinical and regulatory metadata per field

```java
// Clinical flags
boolean sdvRequired
boolean medicalReviewRequired
boolean criticalDataPoint
boolean safetyDataPoint
boolean efficacyDataPoint

// Regulatory flags
boolean fdaRequired
boolean emaRequired
boolean cfr21Part11
boolean gcpRequired
boolean hipaaProtected

// Audit config
AuditTrailLevel auditTrailLevel  // NONE, BASIC, FULL, DETAILED
boolean electronicSignatureRequired
boolean reasonForChangeRequired

// Validation
String validationRules  // JSON

// Data quality
boolean isDerivedField
String derivationFormula
boolean isQueryEnabled
boolean isEditableAfterLock
```

### 2. StudyCdashMappingEntity
**Table**: `study_cdash_mappings`  
**Purpose**: CDISC CDASH/SDTM mappings for regulatory submissions

```java
// CDASH (data collection)
String cdashDomain      // VS, AE, LB, CM, etc.
String cdashVariable    // SYSBP, DIABP, TEMP, etc.
String cdashLabel

// SDTM (submission format)
String sdtmDomain
String sdtmVariable     // VSORRES, LBORRES, etc.
String sdtmDatatype     // Char, Num, Date
Integer sdtmLength

// Controlled terminology
String cdiscTerminologyCode
String codelistName
String codelistVersion

// Transformation
String dataOrigin       // COLLECTED, DERIVED, ASSIGNED, PROTOCOL
String transformationRule
String unitConversionRule
```

### 3. StudyMedicalCodingConfigEntity
**Table**: `study_medical_coding_config`  
**Purpose**: Medical dictionary configuration

```java
// Dictionary
String dictionaryType    // MedDRA, WHO_DD, SNOMED, ICD10, ICD11, LOINC
String dictionaryVersion

// Coding requirements
boolean codingRequired
boolean autoCodingEnabled
Integer autoCodingThreshold  // 0-100
boolean manualReviewRequired

// Verbatim capture
String verbatimFieldLabel
Integer verbatimMaxLength
boolean verbatimRequired

// MedDRA hierarchy
String codeToLevel      // PT, LLT, HLT, HLGT, SOC
boolean capturePrimarySoc

// Workflow
String workflowType     // SINGLE_CODER, DUAL_CODER, AUTO_WITH_REVIEW
String primaryCoderRole
String secondaryCoderRole
boolean adjudicationRequired
String adjudicatorRole
```

### 4. StudyFormDataReviewEntity
**Table**: `study_form_data_reviews`  
**Purpose**: SDV and data review workflow

```java
// Review identification
Long studyId, formId, subjectId, visitId
String fieldName

// Review type and status
String reviewType       // SDV, MEDICAL_REVIEW, DATA_REVIEW, SAFETY_REVIEW
String reviewStatus     // PENDING, IN_PROGRESS, COMPLETED, QUERY_RAISED

// Reviewer info
Long reviewerId
String reviewerName
String reviewerRole
LocalDateTime reviewDate

// Outcome
String reviewOutcome    // PASS, FAIL, QUERY, NOT_APPLICABLE
boolean discrepancyFound
String discrepancyDescription
String correctiveAction

// Query management
Long queryId
String queryStatus      // OPEN, ANSWERED, CLOSED
String queryPriority    // LOW, MEDIUM, HIGH, CRITICAL

// Source verification
boolean verifiedAgainstSource
String sourceDocumentType
String sourceDocumentReference

// FDA 21 CFR Part 11
String electronicSignature
String signatureMeaning
LocalDateTime signatureDate

// Follow-up
boolean followUpRequired
LocalDateTime followUpDueDate
```

---

## Repository Quick Reference

### StudyFieldMetadataRepository

```java
// Basic queries
findByStudyId(studyId)
findByStudyIdAndFormId(studyId, formId)
findByStudyIdAndFormIdAndFieldName(studyId, formId, fieldName)

// Clinical flags
findByStudyIdAndSdvRequiredTrue(studyId)
findByStudyIdAndMedicalReviewRequiredTrue(studyId)
findByStudyIdAndCriticalDataPointTrue(studyId)
findByStudyIdAndSafetyDataPointTrue(studyId)

// Regulatory
findByStudyIdAndFdaRequiredTrue(studyId)
findByStudyIdAndElectronicSignatureRequiredTrue(studyId)

// Custom
findAllFieldsRequiringReview(studyId)  // SDV OR medical OR data review
findAllRegulatoryRequiredFields(studyId)  // FDA OR EMA
getMetadataSummary(studyId)  // Statistics

// Utility
countByStudyId(studyId)
existsByStudyIdAndFormIdAndFieldName(studyId, formId, fieldName)
deleteByStudyId(studyId)
```

### StudyCdashMappingRepository

```java
// Basic queries
findByStudyId(studyId)
findByStudyIdAndFormId(studyId, formId)
findByStudyIdAndFormIdAndFieldName(studyId, formId, fieldName)

// Domain queries
findByStudyIdAndCdashDomain(studyId, "VS")  // Vital Signs
findByStudyIdAndSdtmDomain(studyId, "VS")

// Data origin
findByStudyIdAndDataOrigin(studyId, "DERIVED")
findDerivedFields(studyId)

// Features
findFieldsWithControlledTerminology(studyId)
findFieldsWithUnitConversion(studyId)

// Summary
findDistinctCdashDomains(studyId)  // ["VS", "AE", "LB", ...]
findDistinctSdtmDomains(studyId)
getMappingSummary(studyId)  // Statistics

// Utility
countByStudyId(studyId)
existsByStudyIdAndFormIdAndFieldName(studyId, formId, fieldName)
deleteByStudyId(studyId)
```

### StudyMedicalCodingConfigRepository

```java
// Basic queries
findByStudyId(studyId)
findByStudyIdAndFormId(studyId, formId)
findByStudyIdAndFormIdAndFieldName(studyId, formId, fieldName)

// Dictionary
findByStudyIdAndDictionaryType(studyId, "MedDRA")

// Coding requirements
findByStudyIdAndCodingRequiredTrue(studyId)
findByStudyIdAndAutoCodingEnabledTrue(studyId)
findByStudyIdAndManualReviewRequiredTrue(studyId)
findByStudyIdAndAdjudicationRequiredTrue(studyId)

// Workflow
findByStudyIdAndWorkflowType(studyId, "DUAL_CODER")
findDualCodingFields(studyId)

// MedDRA specific
findMedDraConfigsByLevel(studyId, "PT")  // Preferred Term level

// Summary
findDistinctDictionaryTypes(studyId)  // ["MedDRA", "SNOMED", ...]
getCodingConfigSummary(studyId)  // Statistics

// Utility
countByStudyId(studyId)
countByStudyIdAndDictionaryType(studyId, "MedDRA")
deleteByStudyId(studyId)
```

### StudyFormDataReviewRepository

```java
// Basic queries
findByStudyId(studyId)
findByStudyIdAndReviewStatus(studyId, "PENDING")
findByStudyIdAndReviewType(studyId, "SDV")
findByStudyIdAndReviewTypeAndReviewStatus(studyId, "SDV", "PENDING")

// Pending work
findPendingReviews(studyId)
findPendingReviewsByReviewer(reviewerId)

// Reviewer queries
findByReviewerId(reviewerId)

// Subject/Form queries
findByStudyIdAndSubjectId(studyId, subjectId)
findReviewsForFormInstance(studyId, formId, subjectId, visitId)

// Issues
findByStudyIdAndDiscrepancyFoundTrue(studyId)
findReviewsWithOpenQueries(studyId)
findByStudyIdAndFollowUpRequiredTrue(studyId)
findOverdueFollowUps(studyId, LocalDateTime.now())

// Verification
findByStudyIdAndVerifiedAgainstSourceTrue(studyId)

// Statistics
getReviewStatistics(studyId)  // Overall stats
getReviewStatisticsByType(studyId, "SDV")  // SDV-specific stats
findDistinctReviewTypes(studyId)  // ["SDV", "MEDICAL_REVIEW", ...]

// Utility
countByStudyId(studyId)
countByStudyIdAndReviewStatus(studyId, "PENDING")
countPendingReviews(studyId)
countOpenQueries(studyId)
existsByStudyIdAndFormIdAndSubjectIdAndFieldNameAndReviewType(...)
deleteByStudyId(studyId)
deleteByStudyIdAndSubjectId(studyId, subjectId)
```

---

## Common Usage Patterns

### Pattern 1: Get Field Metadata for Data Entry
```java
// Get metadata for a specific field
Optional<StudyFieldMetadataEntity> metadata = 
    fieldMetadataRepo.findByStudyIdAndFormIdAndFieldName(
        studyId, formId, "systolic_bp"
    );

if (metadata.isPresent()) {
    StudyFieldMetadataEntity meta = metadata.get();
    
    // Check if SDV required
    if (meta.getSdvRequired()) {
        // Mark field for source verification
    }
    
    // Apply validation rules
    String rules = meta.getValidationRules();
    // Parse JSON and apply
}
```

### Pattern 2: Generate SDTM Dataset
```java
// Get all CDASH mappings for a domain
List<StudyCdashMappingEntity> vsMappings = 
    cdashRepo.findByStudyIdAndCdashDomain(studyId, "VS");

// Transform each field according to mapping
for (StudyCdashMappingEntity mapping : vsMappings) {
    String sdtmVariable = mapping.getSdtmVariable();
    String transformation = mapping.getTransformationRule();
    String unitConversion = mapping.getUnitConversionRule();
    
    // Apply transformation and unit conversion
    // Write to SDTM dataset
}
```

### Pattern 3: Create SDV Review Task
```java
// Find all fields requiring SDV for a form
List<StudyFieldMetadataEntity> sdvFields = 
    fieldMetadataRepo.findByStudyIdAndSdvRequiredTrue(studyId);

// Create review tasks for each SDV field
for (StudyFieldMetadataEntity field : sdvFields) {
    StudyFormDataReviewEntity review = StudyFormDataReviewEntity.builder()
        .studyId(studyId)
        .formId(field.getFormId())
        .subjectId(subjectId)
        .visitId(visitId)
        .fieldName(field.getFieldName())
        .reviewType("SDV")
        .reviewStatus("PENDING")
        .build();
    
    reviewRepo.save(review);
}
```

### Pattern 4: Get Reviewer Work Queue
```java
// Get all pending reviews for a reviewer
List<StudyFormDataReviewEntity> pendingWork = 
    reviewRepo.findPendingReviewsByReviewer(reviewerId);

// Group by review type
Map<String, List<StudyFormDataReviewEntity>> byType = 
    pendingWork.stream()
        .collect(Collectors.groupingBy(
            StudyFormDataReviewEntity::getReviewType
        ));

// Display: 5 SDV reviews, 3 Medical reviews, etc.
```

### Pattern 5: Auto-Coding Configuration
```java
// Get coding config for adverse event field
Optional<StudyMedicalCodingConfigEntity> config = 
    codingRepo.findByStudyIdAndFormIdAndFieldName(
        studyId, formId, "adverse_event_term"
    );

if (config.isPresent()) {
    StudyMedicalCodingConfigEntity coding = config.get();
    
    if (coding.getAutoCodingEnabled()) {
        // Call auto-coding service
        int threshold = coding.getAutoCodingThreshold();
        String dictionary = coding.getDictionaryType();
        
        // Only auto-code if confidence > threshold
    }
}
```

### Pattern 6: Dashboard Statistics
```java
// Get comprehensive metadata summary
Object[] metadataStats = fieldMetadataRepo.getMetadataSummary(studyId);
// Returns: [totalFields, sdvCount, medicalReviewCount, criticalCount, fdaRequiredCount]

// Get review workflow statistics
Object[] reviewStats = reviewRepo.getReviewStatistics(studyId);
// Returns: [totalReviews, pendingCount, inProgressCount, completedCount, queryRaisedCount, discrepancyCount]

// Get coding statistics
Object[] codingStats = codingRepo.getCodingConfigSummary(studyId);
// Returns: [totalConfigs, codingRequiredCount, autoCodingEnabledCount, manualReviewCount, adjudicationCount]

// Display in dashboard
```

---

## Testing Queries

```sql
-- Test field metadata
SELECT COUNT(*) FROM study_field_metadata WHERE study_id = 11;
SELECT * FROM study_field_metadata WHERE sdv_required = true AND study_id = 11;

-- Test CDASH mappings
SELECT COUNT(*) FROM study_cdash_mappings WHERE study_id = 11;
SELECT * FROM study_cdash_mappings WHERE cdash_domain = 'VS' AND study_id = 11;

-- Test medical coding
SELECT COUNT(*) FROM study_medical_coding_config WHERE study_id = 11;
SELECT * FROM study_medical_coding_config WHERE dictionary_type = 'MedDRA' AND study_id = 11;

-- Test reviews
SELECT COUNT(*) FROM study_form_data_reviews WHERE study_id = 11;
SELECT * FROM study_form_data_reviews WHERE review_status = 'PENDING' AND study_id = 11;
```

---

## Performance Tips

1. **Always include studyId** - Enables partition pruning
2. **Use composite indexes** - study_id + form_id + field_name
3. **Batch saves** - Use saveAll() for multiple records
4. **Lazy loading** - Don't fetch all fields if you only need metadata
5. **Caching** - Metadata rarely changes, cache at service layer

---

**Reference Document**  
**Version**: 1.0  
**Date**: October 10, 2025
