-- Clinical Study Lookup Tables Data Setup
-- Populates reference tables with standard values for clinical trial management
-- Last updated: September 12, 2025

USE clinprecisiondb;

-- =====================================================
-- 1. STUDY STATUS REFERENCE DATA
-- =====================================================
INSERT INTO study_status (code, name, description, display_order, is_active, allows_modification, is_final_status) VALUES 
('DRAFT', 'Draft', 'Study is in initial planning phase and can be freely modified', 1, TRUE, TRUE, FALSE),
('PLANNING', 'Planning', 'Study design is being finalized, protocol development in progress', 2, TRUE, TRUE, FALSE),
('PROTOCOL_REVIEW', 'Protocol Review', 'Protocol is under internal review and approval', 3, TRUE, TRUE, FALSE),
('REGULATORY_SUBMISSION', 'Regulatory Submission', 'Study has been submitted to regulatory authorities', 4, TRUE, FALSE, FALSE),
('APPROVED', 'Approved', 'Study has received all necessary approvals and is ready to start', 5, TRUE, FALSE, FALSE),
('ACTIVE', 'Active', 'Study is actively enrolling participants and collecting data', 6, TRUE, FALSE, FALSE),
('ENROLLMENT_COMPLETE', 'Enrollment Complete', 'Patient enrollment is complete, study ongoing', 7, TRUE, FALSE, FALSE),
('DATA_COLLECTION_COMPLETE', 'Data Collection Complete', 'All data collection activities are finished', 8, TRUE, FALSE, FALSE),
('DATA_ANALYSIS', 'Data Analysis', 'Study data is being analyzed and reports prepared', 9, TRUE, FALSE, FALSE),
('COMPLETED', 'Completed', 'Study has been successfully completed with all deliverables', 10, TRUE, FALSE, TRUE),
('TERMINATED', 'Terminated', 'Study was terminated before completion', 11, TRUE, FALSE, TRUE),
('SUSPENDED', 'Suspended', 'Study is temporarily halted but may resume', 12, TRUE, FALSE, FALSE),
('WITHDRAWN', 'Withdrawn', 'Study was withdrawn before starting', 13, TRUE, FALSE, TRUE),
('CANCELLED', 'Cancelled', 'Study was cancelled during planning phase', 14, TRUE, FALSE, TRUE);

-- =====================================================
-- 2. REGULATORY STATUS REFERENCE DATA  
-- =====================================================
INSERT INTO regulatory_status (code, name, description, display_order, regulatory_category, is_active, requires_documentation, allows_enrollment) VALUES 
-- Pre-Submission Phase
('NOT_APPLICABLE', 'Not Applicable', 'No regulatory approval required for this study type', 1, 'PRE_SUBMISSION', TRUE, FALSE, FALSE),
('PREPARING_SUBMISSION', 'Preparing Submission', 'Preparing regulatory submission documents', 2, 'PRE_SUBMISSION', TRUE, TRUE, FALSE),
('PRE_SUBMISSION_MEETING', 'Pre-Submission Meeting', 'Scheduled or completed pre-submission meeting with regulators', 3, 'PRE_SUBMISSION', TRUE, TRUE, FALSE),

-- Submission Phase
('IND_SUBMITTED', 'IND Submitted', 'Investigational New Drug application submitted to FDA', 4, 'SUBMITTED', TRUE, TRUE, FALSE),
('IDE_SUBMITTED', 'IDE Submitted', 'Investigational Device Exemption submitted to FDA', 5, 'SUBMITTED', TRUE, TRUE, FALSE),
('IRB_SUBMITTED', 'IRB Submitted', 'Study submitted to Institutional Review Board', 6, 'SUBMITTED', TRUE, TRUE, FALSE),
('ETHICS_SUBMITTED', 'Ethics Committee Submitted', 'Study submitted to Ethics Committee', 7, 'SUBMITTED', TRUE, TRUE, FALSE),

-- Under Review Phase
('FDA_UNDER_REVIEW', 'FDA Under Review', 'FDA is reviewing the submission', 8, 'UNDER_REVIEW', TRUE, TRUE, FALSE),
('IRB_UNDER_REVIEW', 'IRB Under Review', 'Institutional Review Board is reviewing the study', 9, 'UNDER_REVIEW', TRUE, TRUE, FALSE),
('ETHICS_UNDER_REVIEW', 'Ethics Under Review', 'Ethics Committee is reviewing the study', 10, 'UNDER_REVIEW', TRUE, TRUE, FALSE),
('REGULATORY_QUERY', 'Regulatory Query', 'Regulatory authority has issued queries requiring response', 11, 'UNDER_REVIEW', TRUE, TRUE, FALSE),

-- Approved Phase
('IND_APPROVED', 'IND Approved', 'Investigational New Drug application approved by FDA', 12, 'APPROVED', TRUE, TRUE, TRUE),
('IDE_APPROVED', 'IDE Approved', 'Investigational Device Exemption approved by FDA', 13, 'APPROVED', TRUE, TRUE, TRUE),
('IRB_APPROVED', 'IRB Approved', 'Study approved by Institutional Review Board', 14, 'APPROVED', TRUE, TRUE, TRUE),
('ETHICS_APPROVED', 'Ethics Approved', 'Study approved by Ethics Committee', 15, 'APPROVED', TRUE, TRUE, TRUE),
('FULL_REGULATORY_APPROVAL', 'Full Regulatory Approval', 'All required regulatory approvals obtained', 16, 'APPROVED', TRUE, TRUE, TRUE),

-- Rejected Phase
('IND_REJECTED', 'IND Rejected', 'Investigational New Drug application rejected by FDA', 17, 'REJECTED', TRUE, TRUE, FALSE),
('IDE_REJECTED', 'IDE Rejected', 'Investigational Device Exemption rejected by FDA', 18, 'REJECTED', TRUE, TRUE, FALSE),
('IRB_REJECTED', 'IRB Rejected', 'Study rejected by Institutional Review Board', 19, 'REJECTED', TRUE, TRUE, FALSE),
('ETHICS_REJECTED', 'Ethics Rejected', 'Study rejected by Ethics Committee', 20, 'REJECTED', TRUE, TRUE, FALSE),

-- Withdrawn Phase
('IND_WITHDRAWN', 'IND Withdrawn', 'Investigational New Drug application withdrawn by sponsor', 21, 'WITHDRAWN', TRUE, TRUE, FALSE),
('IDE_WITHDRAWN', 'IDE Withdrawn', 'Investigational Device Exemption withdrawn by sponsor', 22, 'WITHDRAWN', TRUE, TRUE, FALSE),
('IRB_WITHDRAWN', 'IRB Withdrawn', 'Study withdrawn from Institutional Review Board review', 23, 'WITHDRAWN', TRUE, TRUE, FALSE),
('ETHICS_WITHDRAWN', 'Ethics Withdrawn', 'Study withdrawn from Ethics Committee review', 24, 'WITHDRAWN', TRUE, TRUE, FALSE);

-- =====================================================
-- 3. STUDY PHASE REFERENCE DATA
-- =====================================================
INSERT INTO study_phase (code, name, description, display_order, phase_category, is_active, typical_duration_months, typical_patient_count_min, typical_patient_count_max, requires_ide, requires_ind) VALUES 
-- Preclinical
('PRECLINICAL', 'Preclinical', 'Laboratory and animal studies conducted before human testing', 1, 'PRECLINICAL', TRUE, 24, NULL, NULL, FALSE, FALSE),
('IND_ENABLING', 'IND-Enabling Studies', 'Studies required to support IND application', 2, 'PRECLINICAL', TRUE, 12, NULL, NULL, FALSE, FALSE),

-- Early Phase Studies
('PHASE_0', 'Phase 0', 'Exploratory studies with very limited human exposure', 3, 'EARLY_PHASE', TRUE, 6, 10, 15, FALSE, TRUE),
('PHASE_I', 'Phase I', 'First-in-human studies focusing on safety and dosing', 4, 'EARLY_PHASE', TRUE, 12, 20, 100, FALSE, TRUE),
('PHASE_I_II', 'Phase I/II', 'Combined Phase I and II study design', 5, 'EARLY_PHASE', TRUE, 18, 50, 200, FALSE, TRUE),

-- Efficacy Studies
('PHASE_II', 'Phase II', 'Studies focusing on efficacy while continuing safety monitoring', 6, 'EFFICACY', TRUE, 18, 100, 400, FALSE, TRUE),
('PHASE_IIA', 'Phase IIa', 'Early Phase II studies with smaller patient populations', 7, 'EFFICACY', TRUE, 12, 100, 200, FALSE, TRUE),
('PHASE_IIB', 'Phase IIb', 'Later Phase II studies with larger patient populations', 8, 'EFFICACY', TRUE, 18, 200, 400, FALSE, TRUE),
('PHASE_II_III', 'Phase II/III', 'Combined Phase II and III study design', 9, 'EFFICACY', TRUE, 24, 300, 800, FALSE, TRUE),

-- Registration Studies
('PHASE_III', 'Phase III', 'Large-scale studies to confirm efficacy and monitor safety', 10, 'REGISTRATION', TRUE, 36, 1000, 5000, FALSE, TRUE),
('PHASE_IIIA', 'Phase IIIa', 'Phase III studies conducted before regulatory submission', 11, 'REGISTRATION', TRUE, 24, 1000, 3000, FALSE, TRUE),
('PHASE_IIIB', 'Phase IIIb', 'Phase III studies conducted after regulatory submission', 12, 'REGISTRATION', TRUE, 18, 500, 2000, FALSE, TRUE),

-- Post-Market Studies
('PHASE_IV', 'Phase IV', 'Post-marketing surveillance studies', 13, 'POST_MARKET', TRUE, 60, 1000, 10000, FALSE, FALSE),
('POST_MARKET_SAFETY', 'Post-Market Safety Study', 'Studies specifically designed to monitor long-term safety', 14, 'POST_MARKET', TRUE, 36, 500, 5000, FALSE, FALSE),
('COMPARATIVE_EFFECTIVENESS', 'Comparative Effectiveness Study', 'Studies comparing approved treatments', 15, 'POST_MARKET', TRUE, 24, 500, 2000, FALSE, FALSE),

-- Device-Specific Phases
('FEASIBILITY', 'Feasibility Study', 'Early studies to assess device feasibility and initial safety', 16, 'EARLY_PHASE', TRUE, 12, 10, 50, TRUE, FALSE),
('PILOT', 'Pilot Study', 'Small-scale preliminary studies to test methods and procedures', 17, 'EARLY_PHASE', TRUE, 6, 20, 100, TRUE, FALSE),
('PIVOTAL', 'Pivotal Study', 'Definitive studies designed to provide primary evidence of effectiveness', 18, 'REGISTRATION', TRUE, 24, 200, 1000, TRUE, FALSE),

-- Special Study Types
('EXPANDED_ACCESS', 'Expanded Access', 'Compassionate use studies for serious conditions', 19, 'EARLY_PHASE', TRUE, 12, 1, 100, FALSE, TRUE),
('INVESTIGATOR_INITIATED', 'Investigator Initiated', 'Studies initiated by investigators rather than sponsors', 20, 'EFFICACY', TRUE, 18, 50, 500, FALSE, TRUE),
('REGISTRY_STUDY', 'Registry Study', 'Observational studies using patient registries', 21, 'POST_MARKET', TRUE, 36, 100, 5000, FALSE, FALSE),
('REAL_WORLD_EVIDENCE', 'Real-World Evidence', 'Studies using real-world data sources', 22, 'POST_MARKET', TRUE, 24, 1000, 10000, FALSE, FALSE);

-- =====================================================
-- 4. DATA VALIDATION QUERIES
-- =====================================================
-- Uncomment these queries to verify data was inserted correctly

-- SELECT 'Study Status Count' as validation_type, COUNT(*) as record_count FROM study_status;
-- SELECT 'Regulatory Status Count' as validation_type, COUNT(*) as record_count FROM regulatory_status;  
-- SELECT 'Study Phase Count' as validation_type, COUNT(*) as record_count FROM study_phase;

-- SELECT 'Study Status Active' as validation_type, COUNT(*) as record_count FROM study_status WHERE is_active = TRUE;
-- SELECT 'Regulatory Status Active' as validation_type, COUNT(*) as record_count FROM regulatory_status WHERE is_active = TRUE;
-- SELECT 'Study Phase Active' as validation_type, COUNT(*) as record_count FROM study_phase WHERE is_active = TRUE;

-- =====================================================
-- 5. SAMPLE LOOKUP QUERIES FOR FRONTEND USE
-- =====================================================
-- These are example queries your frontend services can use:

-- Get all active study statuses for dropdown:
-- SELECT id, code, name, description FROM study_status WHERE is_active = TRUE ORDER BY display_order;

-- Get regulatory statuses by category:  
-- SELECT id, code, name, description FROM regulatory_status 
-- WHERE is_active = TRUE AND regulatory_category = 'APPROVED' ORDER BY display_order;

-- Get study phases for specific category:
-- SELECT id, code, name, description, typical_patient_count_min, typical_patient_count_max 
-- FROM study_phase WHERE is_active = TRUE AND phase_category = 'EFFICACY' ORDER BY display_order;

-- Get phases that allow enrollment:
-- SELECT sp.id, sp.code, sp.name FROM study_phase sp
-- JOIN regulatory_status rs ON rs.allows_enrollment = TRUE
-- WHERE sp.is_active = TRUE ORDER BY sp.display_order;