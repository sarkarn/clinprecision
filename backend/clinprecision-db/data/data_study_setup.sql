-- ============================================================================
-- ClinPrecision Demo Data - 10 Complete Studies
-- ============================================================================
-- Purpose: Generate comprehensive demo data for DDD/CQRS testing
-- Created: October 4, 2025
-- Version: 1.0
-- Description: Creates 10 diverse studies with proper UUID support for
--              Phase 2 DDD migration testing and demonstration
-- ============================================================================

-- Set variables for users (assumes users exist from data_admin_setup.sql)
SET @admin_user_id = (SELECT id FROM users WHERE email = 'nsarkar@clinprecision.com');
SET @sponsor_user_1 = (SELECT id FROM users WHERE email = 'rjohnson@medicalresearch.org');
SET @sponsor_user_2 = (SELECT id FROM users WHERE email = 'echen@neurocare.org');
SET @sponsor_user_3 = (SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com');

-- Set organization IDs
SET @org_pharma_global = (SELECT id FROM organizations WHERE external_id = 'PG12345');
SET @org_biotech_advances = (SELECT id FROM organizations WHERE external_id = 'BAC7890');

-- ============================================================================
-- STUDY 1: Phase III COVID-19 Vaccine Trial (Active, Large-scale)
-- ============================================================================
INSERT INTO studies (
    id, aggregate_uuid, name, description, sponsor, protocol_number, version, is_latest_version,
    indication, study_type, principal_investigator, sites, planned_subjects, enrolled_subjects, target_enrollment,
    primary_objective, amendments, study_status_id, regulatory_status_id, study_phase_id,
    therapeutic_area, study_coordinator, active_sites, total_sites, screened_subjects, randomized_subjects,
    completed_subjects, withdrawn_subjects, enrollment_rate, screening_success_rate,
    first_patient_in_date, last_patient_in_date, estimated_completion_date,
    primary_endpoint, secondary_endpoints, inclusion_criteria, exclusion_criteria,
    recent_activities, timeline, study_duration_weeks, database_lock_status,
    monitoring_visits_completed, adverse_events_reported, protocol_deviations,
    queries_open, queries_resolved, sdv_percentage, recruitment_status,
    start_date, end_date, created_by, created_at, updated_at
) VALUES (
    1, 
    '550e8400-e29b-41d4-a716-446655440001', 
    'COVID-19 Vaccine Efficacy Trial', 
    'A randomized, double-blind, placebo-controlled, multicenter Phase III trial to evaluate the efficacy, safety, and immunogenicity of a novel mRNA-based COVID-19 vaccine in healthy adults aged 18-85 years.',
    'Pharma Global Inc.', 
    'PGI-COVID-2024-001', 
    '2.1', 
    TRUE,
    'COVID-19 Prevention', 
    'INTERVENTIONAL', 
    'Dr. Sarah M. Johnson', 
    25, 
    2000, 
    1547, 
    2000,
    'To evaluate the efficacy of the vaccine in preventing symptomatic COVID-19 infection confirmed by RT-PCR at least 14 days after the second dose',
    2, 
    2, 
    3, 
    3,
    'Infectious Diseases', 
    'Maria Rodriguez, MPH', 
    23, 
    25, 
    1820, 
    1547, 
    892, 
    78, 
    85.5, 
    85.0,
    '2024-01-15', 
    '2024-10-30', 
    '2025-06-15',
    'Incidence of laboratory-confirmed symptomatic COVID-19 occurring at least 14 days after the second dose',
    '["Incidence of severe COVID-19", "Immunogenicity endpoints (neutralizing antibody titers)", "Safety endpoints (local and systemic reactions)", "Duration of protection"]',
    '["Adults aged 18-85 years", "Healthy volunteers or stable chronic conditions", "Negative COVID-19 test at baseline", "Willingness to comply with contraceptive requirements"]',
    '["History of confirmed COVID-19 infection within 3 months", "Immunocompromised individuals or on immunosuppressive therapy", "Pregnancy or breastfeeding", "History of severe allergic reactions to vaccines", "Receipt of another COVID-19 vaccine"]',
    '[{"date": "2024-11-01", "activity": "Site monitoring visit completed at Site 12", "user": "Maria Rodriguez"}, {"date": "2024-10-28", "activity": "Interim safety analysis reviewed by DSMB - no safety concerns", "user": "Dr. Johnson"}, {"date": "2024-10-25", "activity": "1500th subject reached milestone", "user": "System"}]',
    '{"phases": [{"name": "Screening", "duration": 4, "color": "#FFA500"}, {"name": "Vaccination Phase", "duration": 8, "color": "#4169E1"}, {"name": "Follow-up Phase", "duration": 40, "color": "#32CD32"}], "milestones": [{"name": "First Patient In", "date": "2024-01-15"}, {"name": "50% Enrollment", "date": "2024-06-15"}, {"name": "Last Patient In", "date": "2024-10-30"}, {"name": "Interim Analysis", "date": "2024-11-15"}, {"name": "Study Completion", "date": "2025-06-15"}]}',
    52, 
    'open', 
    18, 
    23, 
    5, 
    12, 
    8, 
    95.2, 
    'recruiting',
    '2024-01-15', 
    '2025-06-15', 
    @admin_user_id, 
    '2024-01-15 08:00:00', 
    '2024-11-04 10:30:00'
);

-- ============================================================================
-- STUDY 2: Phase II Diabetes AI Management (Enrollment Complete)
-- ============================================================================
INSERT INTO studies (
    id, aggregate_uuid, name, description, sponsor, protocol_number, version, is_latest_version,
    indication, study_type, principal_investigator, sites, planned_subjects, enrolled_subjects, target_enrollment,
    primary_objective, amendments, study_status_id, regulatory_status_id, study_phase_id,
    therapeutic_area, study_coordinator, active_sites, total_sites, screened_subjects, randomized_subjects,
    completed_subjects, withdrawn_subjects, enrollment_rate, screening_success_rate,
    first_patient_in_date, last_patient_in_date, estimated_completion_date,
    primary_endpoint, secondary_endpoints, inclusion_criteria, exclusion_criteria,
    recent_activities, timeline, study_duration_weeks, database_lock_status,
    monitoring_visits_completed, adverse_events_reported, protocol_deviations,
    queries_open, queries_resolved, sdv_percentage, recruitment_status,
    start_date, end_date, created_by, created_at, updated_at
) VALUES (
    2,
    '550e8400-e29b-41d4-a716-446655440002',
    'AI-Driven Diabetes Management Study',
    'A randomized, open-label, multicenter Phase II trial evaluating the efficacy and safety of an artificial intelligence-driven continuous glucose monitoring system with automated insulin dosing recommendations in adults with Type 2 diabetes.',
    'BioTech Advances Corp.',
    'BAC-DM-2024-101',
    '1.5',
    TRUE,
    'Type 2 Diabetes Mellitus',
    'INTERVENTIONAL',
    'Dr. Michael T. Chen',
    15,
    300,
    300,
    300,
    'To evaluate the efficacy of AI-driven insulin dosing recommendations in improving glycemic control as measured by HbA1c reduction',
    1,
    2,
    2,
    2,
    'Endocrinology',
    'Jennifer Kim, RN, CDE',
    15,
    15,
    342,
    300,
    267,
    15,
    100.0,
    87.7,
    '2024-02-01',
    '2024-08-15',
    '2025-02-28',
    'Change in HbA1c from baseline to 24 weeks',
    '["Time in target glucose range (70-180 mg/dL)", "Number of hypoglycemic episodes", "Number of hyperglycemic episodes", "Quality of life scores", "Device usability and satisfaction"]',
    '["Type 2 diabetes mellitus for ≥6 months", "HbA1c between 7.0% and 10.0%", "On stable insulin therapy for ≥3 months", "Able to use smartphone application"]',
    '["Type 1 diabetes", "Severe diabetic complications (retinopathy, nephropathy stage 4+)", "Recent cardiovascular events (<3 months)", "History of severe hypoglycemia (<1 month)", "Pregnancy or planning pregnancy"]',
    '[{"date": "2024-11-02", "activity": "Database review completed - 98.5% data completeness", "user": "Jennifer Kim"}, {"date": "2024-10-25", "activity": "Final patient visit completed", "user": "Study Coordinator"}, {"date": "2024-10-20", "activity": "Statistical analysis plan finalized", "user": "Biostatistician"}]',
    '{"phases": [{"name": "Screening", "duration": 2, "color": "#FFA500"}, {"name": "Treatment Phase", "duration": 24, "color": "#4169E1"}, {"name": "Follow-up", "duration": 4, "color": "#32CD32"}], "milestones": [{"name": "First Patient In", "date": "2024-02-01"}, {"name": "Enrollment Complete", "date": "2024-08-15"}, {"name": "Last Patient Last Visit", "date": "2024-10-25"}, {"name": "Database Lock", "date": "2024-11-15"}, {"name": "Top-line Results", "date": "2025-01-15"}]}',
    30,
    'soft_lock',
    22,
    8,
    3,
    2,
    0,
    98.5,
    'completed',
    '2024-02-01',
    '2025-02-28',
    @sponsor_user_1,
    '2024-02-01 09:30:00',
    '2024-11-02 14:20:00'
);

-- ============================================================================
-- STUDY 3: Phase II Alzheimer's Disease Study (Active Recruitment)
-- ============================================================================
INSERT INTO studies (
    id, aggregate_uuid, name, description, sponsor, protocol_number, version, is_latest_version,
    indication, study_type, principal_investigator, sites, planned_subjects, enrolled_subjects, target_enrollment,
    primary_objective, amendments, study_status_id, regulatory_status_id, study_phase_id,
    therapeutic_area, study_coordinator, active_sites, total_sites, screened_subjects, randomized_subjects,
    completed_subjects, withdrawn_subjects, enrollment_rate, screening_success_rate,
    first_patient_in_date, last_patient_in_date, estimated_completion_date,
    primary_endpoint, secondary_endpoints, inclusion_criteria, exclusion_criteria,
    recent_activities, timeline, study_duration_weeks, database_lock_status,
    monitoring_visits_completed, adverse_events_reported, protocol_deviations,
    queries_open, queries_resolved, sdv_percentage, recruitment_status,
    start_date, end_date, created_by, created_at, updated_at
) VALUES (
    3,
    '550e8400-e29b-41d4-a716-446655440003',
    'Early Alzheimer\'s Amyloid-Targeting Therapy Trial',
    'A randomized, double-blind, placebo-controlled, multicenter Phase II study evaluating the efficacy and safety of a novel monoclonal antibody targeting beta-amyloid in patients with early-stage Alzheimer\'s disease.',
    'Pharma Global Inc.',
    'PGI-ALZ-2024-202',
    '1.0',
    TRUE,
    'Early-stage Alzheimer\'s Disease',
    'INTERVENTIONAL',
    'Dr. Patricia A. Williams',
    35,
    480,
    412,
    480,
    'To evaluate the efficacy of the investigational agent in slowing cognitive decline as measured by the Clinical Dementia Rating Sum of Boxes (CDR-SB)',
    0,
    2,
    2,
    2,
    'Neurology',
    'Robert Thompson, PhD',
    32,
    35,
    523,
    412,
    156,
    24,
    85.8,
    78.8,
    '2024-03-10',
    '2024-11-05',
    '2026-03-30',
    'Change in Clinical Dementia Rating Sum of Boxes (CDR-SB) from baseline to 78 weeks',
    '["ADAS-Cog14 scores", "Amyloid PET imaging changes", "Plasma p-tau levels", "Functional Assessment Questionnaire (FAQ)", "Safety and tolerability", "Quality of life measures"]',
    '["Age 50-85 years", "Mild cognitive impairment due to AD or mild AD dementia", "Positive amyloid PET scan or CSF biomarkers", "MMSE score 20-28", "CDR global score of 0.5 or 1", "Study partner available"]',
    '["Moderate or severe dementia", "Other neurodegenerative diseases", "Recent use of AD medications (<3 months)", "Significant unstable medical conditions", "MRI contraindications", "Recent stroke or TIA"]',
    '[{"date": "2024-11-03", "activity": "Central imaging lab results reviewed for cohort 8", "user": "Dr. Williams"}, {"date": "2024-10-30", "activity": "Data Safety Monitoring Board meeting - study continuation recommended", "user": "DSMB Chair"}, {"date": "2024-10-28", "activity": "Site 33 activated and initiated", "user": "Clinical Operations"}]',
    '{"phases": [{"name": "Screening", "duration": 6, "color": "#FFA500"}, {"name": "Treatment Phase", "duration": 78, "color": "#4169E1"}, {"name": "Safety Follow-up", "duration": 12, "color": "#32CD32"}], "milestones": [{"name": "First Patient In", "date": "2024-03-10"}, {"name": "300th Patient", "date": "2024-08-20"}, {"name": "Target Enrollment", "date": "2025-01-15"}, {"name": "Last Patient Last Dose", "date": "2026-01-30"}, {"name": "Study Completion", "date": "2026-03-30"}]}',
    96,
    'open',
    28,
    15,
    7,
    18,
    12,
    92.3,
    'recruiting',
    '2024-03-10',
    '2026-03-30',
    @admin_user_id,
    '2024-03-10 11:00:00',
    '2024-11-03 16:45:00'
);

-- ============================================================================
-- STUDY 4: Phase III Rheumatoid Arthritis Comparative Study (Active)
-- ============================================================================
INSERT INTO studies (
    id, aggregate_uuid, name, description, sponsor, protocol_number, version, is_latest_version,
    indication, study_type, principal_investigator, sites, planned_subjects, enrolled_subjects, target_enrollment,
    primary_objective, amendments, study_status_id, regulatory_status_id, study_phase_id,
    therapeutic_area, study_coordinator, active_sites, total_sites, screened_subjects, randomized_subjects,
    completed_subjects, withdrawn_subjects, enrollment_rate, screening_success_rate,
    first_patient_in_date, last_patient_in_date, estimated_completion_date,
    primary_endpoint, secondary_endpoints, inclusion_criteria, exclusion_criteria,
    recent_activities, timeline, study_duration_weeks, database_lock_status,
    monitoring_visits_completed, adverse_events_reported, protocol_deviations,
    queries_open, queries_resolved, sdv_percentage, recruitment_status,
    start_date, end_date, created_by, created_at, updated_at
) VALUES (
    4,
    '550e8400-e29b-41d4-a716-446655440004',
    'Comparative Biologic Therapy for Rheumatoid Arthritis',
    'A randomized, double-blind, active-controlled, three-arm study comparing the efficacy and safety of three different biological DMARDs in patients with moderate to severe rheumatoid arthritis who have had an inadequate response to methotrexate.',
    'BioTech Advances Corp.',
    'BAC-RA-2024-301',
    '2.0',
    TRUE,
    'Rheumatoid Arthritis',
    'INTERVENTIONAL',
    'Dr. Amanda L. Davis',
    28,
    750,
    623,
    750,
    'To compare the efficacy of three biological therapies in achieving American College of Rheumatology 20% improvement (ACR20) response at 24 weeks',
    3,
    2,
    2,
    3,
    'Rheumatology',
    'Lisa Park, RN, BSN',
    26,
    28,
    756,
    623,
    387,
    45,
    83.1,
    82.4,
    '2024-05-01',
    '2024-10-22',
    '2026-10-30',
    'Proportion of patients achieving ACR20 response at 24 weeks',
    '["ACR50 and ACR70 response rates", "DAS28-CRP scores", "HAQ-DI functional scores", "Radiographic progression (modified Sharp score)", "Safety and tolerability", "Health-related quality of life"]',
    '["Active RA for ≥6 months per ACR criteria", "Inadequate response to MTX (≥12 weeks at ≥15mg/week)", "DAS28-CRP >3.2", "≥6 tender and ≥6 swollen joints", "CRP ≥1.0 mg/dL or ESR ≥28 mm/hr"]',
    '["Previous biological DMARD therapy", "Active or latent tuberculosis", "Active infections requiring treatment", "Pregnancy or breastfeeding", "Significant hepatic or renal impairment", "Malignancy within 5 years"]',
    '[{"date": "2024-11-01", "activity": "Interim efficacy analysis completed - all arms showing benefit", "user": "Biostatistics Team"}, {"date": "2024-10-28", "activity": "Site initiation visit completed at Site 29", "user": "Clinical Monitor"}, {"date": "2024-10-25", "activity": "Protocol amendment 3 approved by IRB/EC", "user": "Regulatory Affairs"}]',
    '{"phases": [{"name": "Screening", "duration": 4, "color": "#FFA500"}, {"name": "Treatment Phase", "duration": 52, "color": "#4169E1"}, {"name": "Extension Phase", "duration": 52, "color": "#9370DB"}, {"name": "Follow-up", "duration": 8, "color": "#32CD32"}], "milestones": [{"name": "First Patient In", "date": "2024-05-01"}, {"name": "500th Patient", "date": "2024-09-15"}, {"name": "Target Enrollment", "date": "2025-02-28"}, {"name": "Primary Analysis", "date": "2025-09-30"}, {"name": "Study Completion", "date": "2026-10-30"}]}',
    116,
    'open',
    35,
    28,
    12,
    22,
    18,
    88.9,
    'recruiting',
    '2024-05-01',
    '2026-10-30',
    @sponsor_user_3,
    '2024-05-01 08:15:00',
    '2024-11-01 13:30:00'
);

-- ============================================================================
-- STUDY 5: Phase IV Post-Marketing Hypertension Study (Completed)
-- ============================================================================
INSERT INTO studies (
    id, aggregate_uuid, name, description, sponsor, protocol_number, version, is_latest_version,
    indication, study_type, principal_investigator, sites, planned_subjects, enrolled_subjects, target_enrollment,
    primary_objective, amendments, study_status_id, regulatory_status_id, study_phase_id,
    therapeutic_area, study_coordinator, active_sites, total_sites, screened_subjects, randomized_subjects,
    completed_subjects, withdrawn_subjects, enrollment_rate, screening_success_rate,
    first_patient_in_date, last_patient_in_date, estimated_completion_date,
    primary_endpoint, secondary_endpoints, inclusion_criteria, exclusion_criteria,
    recent_activities, timeline, study_duration_weeks, database_lock_status,
    monitoring_visits_completed, adverse_events_reported, protocol_deviations,
    queries_open, queries_resolved, sdv_percentage, recruitment_status,
    start_date, end_date, created_by, created_at, updated_at
) VALUES (
    5,
    '550e8400-e29b-41d4-a716-446655440005',
    'Optimal BP Targets in Elderly Hypertension Patients',
    'A large-scale, multicenter, observational post-marketing surveillance study examining optimal blood pressure targets and treatment strategies in hypertensive patients over 65 years of age.',
    'Pharma Global Inc.',
    'PGI-HTN-2023-401',
    '1.3',
    TRUE,
    'Hypertension in Elderly',
    'OBSERVATIONAL',
    'Dr. James R. Martinez',
    45,
    1200,
    1200,
    1200,
    'To evaluate optimal systolic blood pressure targets for reducing major adverse cardiovascular events in elderly patients with hypertension',
    2,
    4,
    1,
    4,
    'Cardiology',
    'Nancy Wilson, MPH',
    0,
    45,
    1289,
    1200,
    1187,
    13,
    100.0,
    93.1,
    '2023-11-15',
    '2024-02-28',
    '2024-11-14',
    'Composite of cardiovascular death, non-fatal myocardial infarction, and non-fatal stroke at 12 months',
    '["Individual cardiovascular endpoints", "All-cause mortality", "Hospitalization for heart failure", "Cognitive function", "Quality of life measures", "Medication adherence rates"]',
    '["Age ≥65 years", "Documented hypertension diagnosis", "Currently on antihypertensive therapy", "Able to attend follow-up visits", "Willing to provide informed consent"]',
    '["Life expectancy <1 year", "Severe cognitive impairment preventing informed consent", "Unable to measure blood pressure reliably", "Terminal illness", "Institutionalized patients"]',
    '[{"date": "2024-11-15", "activity": "Final study report submitted to regulatory authorities", "user": "Medical Writing"}, {"date": "2024-11-01", "activity": "Database locked and verified", "user": "Data Management"}, {"date": "2024-10-15", "activity": "Statistical analysis completed", "user": "Biostatistics"}]',
    '{"phases": [{"name": "Screening", "duration": 2, "color": "#FFA500"}, {"name": "Observation Period", "duration": 52, "color": "#4169E1"}, {"name": "Final Analysis", "duration": 4, "color": "#32CD32"}], "milestones": [{"name": "First Patient In", "date": "2023-11-15"}, {"name": "Enrollment Complete", "date": "2024-02-28"}, {"name": "Last Patient Last Visit", "date": "2024-10-31"}, {"name": "Database Lock", "date": "2024-11-01"}, {"name": "Study Completion", "date": "2024-11-14"}]}',
    58,
    'hard_lock',
    52,
    19,
    8,
    0,
    0,
    100.0,
    'completed',
    '2023-11-15',
    '2024-11-14',
    @admin_user_id,
    '2023-11-15 10:00:00',
    '2024-11-15 09:00:00'
);

-- ============================================================================
-- STUDY 6: Phase II Pediatric Asthma Study (Completed)
-- ============================================================================
INSERT INTO studies (
    id, aggregate_uuid, name, description, sponsor, protocol_number, version, is_latest_version,
    indication, study_type, principal_investigator, sites, planned_subjects, enrolled_subjects, target_enrollment,
    primary_objective, amendments, study_status_id, regulatory_status_id, study_phase_id,
    therapeutic_area, study_coordinator, active_sites, total_sites, screened_subjects, randomized_subjects,
    completed_subjects, withdrawn_subjects, enrollment_rate, screening_success_rate,
    first_patient_in_date, last_patient_in_date, estimated_completion_date,
    primary_endpoint, secondary_endpoints, inclusion_criteria, exclusion_criteria,
    recent_activities, timeline, study_duration_weeks, database_lock_status,
    monitoring_visits_completed, adverse_events_reported, protocol_deviations,
    queries_open, queries_resolved, sdv_percentage, recruitment_status,
    start_date, end_date, created_by, created_at, updated_at
) VALUES (
    6,
    '550e8400-e29b-41d4-a716-446655440006',
    'Step-Down Therapy in Pediatric Asthma',
    'A randomized, double-blind, placebo-controlled trial evaluating the safety and efficacy of a step-down therapeutic approach in well-controlled pediatric asthma patients aged 5-12 years.',
    'BioTech Advances Corp.',
    'BAC-AST-2023-201',
    '1.1',
    TRUE,
    'Pediatric Asthma',
    'INTERVENTIONAL',
    'Dr. Emily J. Roberts',
    20,
    180,
    180,
    180,
    'To evaluate the safety and efficacy of step-down therapy from ICS/LABA to ICS monotherapy in maintaining asthma control in well-controlled pediatric patients',
    1,
    4,
    1,
    2,
    'Pediatric Pulmonology',
    'David Lee, RRT',
    0,
    20,
    198,
    180,
    173,
    7,
    100.0,
    90.9,
    '2023-01-10',
    '2023-06-30',
    '2023-12-20',
    'Proportion of patients maintaining asthma control (ACQ-7 score <0.75) at 24 weeks',
    '["FEV1 and other lung function parameters", "Number of asthma exacerbations", "Childhood Asthma Control Test (c-ACT) scores", "Pediatric Asthma Quality of Life Questionnaire scores", "Rescue medication use", "Safety and tolerability"]',
    '["Age 5-12 years", "Physician-diagnosed asthma ≥6 months", "Well-controlled asthma ≥3 months (ACQ-7 <0.75)", "On stable ICS/LABA therapy ≥12 weeks", "Able to perform reproducible spirometry"]',
    '["Severe asthma exacerbation requiring systemic steroids in past 6 months", "Other chronic respiratory conditions", "Significant cardiovascular or systemic disease", "Unable to perform spirometry reliably", "Recent respiratory infection (<4 weeks)"]',
    '[{"date": "2024-01-15", "activity": "Final study report approved and published", "user": "Medical Writing"}, {"date": "2023-12-20", "activity": "Last patient completed final visit", "user": "Site Coordinator"}, {"date": "2023-12-10", "activity": "Database locked", "user": "Data Management"}]',
    '{"phases": [{"name": "Screening", "duration": 2, "color": "#FFA500"}, {"name": "Treatment Phase", "duration": 24, "color": "#4169E1"}, {"name": "Safety Follow-up", "duration": 4, "color": "#32CD32"}], "milestones": [{"name": "First Patient In", "date": "2023-01-10"}, {"name": "Enrollment Complete", "date": "2023-06-30"}, {"name": "Primary Endpoint Analysis", "date": "2023-11-15"}, {"name": "Database Lock", "date": "2023-12-10"}, {"name": "Study Completion", "date": "2023-12-20"}]}',
    30,
    'hard_lock',
    28,
    12,
    4,
    0,
    0,
    100.0,
    'completed',
    '2023-01-10',
    '2023-12-20',
    @sponsor_user_1,
    '2023-01-10 09:00:00',
    '2024-01-15 15:30:00'
);

-- ============================================================================
-- STUDY 7: Phase I/II Oncology Immunotherapy Study (Active)
-- ============================================================================
INSERT INTO studies (
    id, aggregate_uuid, name, description, sponsor, protocol_number, version, is_latest_version,
    indication, study_type, principal_investigator, sites, planned_subjects, enrolled_subjects, target_enrollment,
    primary_objective, amendments, study_status_id, regulatory_status_id, study_phase_id,
    therapeutic_area, study_coordinator, active_sites, total_sites, screened_subjects, randomized_subjects,
    completed_subjects, withdrawn_subjects, enrollment_rate, screening_success_rate,
    first_patient_in_date, last_patient_in_date, estimated_completion_date,
    primary_endpoint, secondary_endpoints, inclusion_criteria, exclusion_criteria,
    recent_activities, timeline, study_duration_weeks, database_lock_status,
    monitoring_visits_completed, adverse_events_reported, protocol_deviations,
    queries_open, queries_resolved, sdv_percentage, recruitment_status,
    start_date, end_date, created_by, created_at, updated_at
) VALUES (
    7,
    '550e8400-e29b-41d4-a716-446655440007',
    'Novel PD-1 Inhibitor Combination in Advanced Solid Tumors',
    'A Phase I/II, open-label, dose-escalation and dose-expansion study evaluating the safety, tolerability, pharmacokinetics, and preliminary efficacy of a novel PD-1 inhibitor in combination with standard chemotherapy in patients with advanced solid tumors.',
    'Pharma Global Inc.',
    'PGI-ONC-2024-101',
    '1.0',
    TRUE,
    'Advanced Solid Tumors',
    'INTERVENTIONAL',
    'Dr. Catherine M. Brown',
    12,
    72,
    45,
    72,
    'Phase I: To determine the maximum tolerated dose (MTD) and recommended Phase II dose (RP2D); Phase II: To evaluate preliminary anti-tumor activity',
    0,
    2,
    2,
    1,
    'Oncology',
    'Michael Chang, PharmD',
    10,
    12,
    67,
    45,
    18,
    8,
    62.5,
    67.2,
    '2024-06-01',
    '2024-10-15',
    '2026-06-30',
    'Phase I: Incidence of dose-limiting toxicities (DLTs) during cycle 1; Phase II: Overall response rate (ORR) per RECIST v1.1',
    '["Safety and tolerability", "Pharmacokinetic parameters", "Pharmacodynamic biomarkers", "Duration of response", "Progression-free survival", "Overall survival", "Immunogenicity"]',
    '["Advanced solid tumor with no standard treatment option", "Measurable disease per RECIST v1.1", "ECOG performance status 0-1", "Adequate organ function", "Life expectancy ≥12 weeks"]',
    '["Previous treatment with PD-1/PD-L1 inhibitor", "Active or history of autoimmune disease", "Symptomatic brain metastases", "Active infection requiring systemic therapy", "Significant cardiovascular disease"]',
    '[{"date": "2024-11-02", "activity": "Dose Escalation Committee approved escalation to cohort 4 (400mg)", "user": "DEC Chair"}, {"date": "2024-10-29", "activity": "Safety Review Committee meeting - no dose-limiting toxicities in cohort 3", "user": "Medical Monitor"}, {"date": "2024-10-25", "activity": "Patient 45 enrolled in dose expansion cohort", "user": "Site Coordinator"}]',
    '{"phases": [{"name": "Screening", "duration": 3, "color": "#FFA500"}, {"name": "Dose Escalation", "duration": 32, "color": "#4169E1"}, {"name": "Dose Expansion", "duration": 48, "color": "#9370DB"}, {"name": "Survival Follow-up", "duration": 52, "color": "#32CD32"}], "milestones": [{"name": "First Patient In", "date": "2024-06-01"}, {"name": "MTD Determination", "date": "2025-03-31"}, {"name": "Expansion Complete", "date": "2026-01-31"}, {"name": "Primary Analysis", "date": "2026-04-30"}, {"name": "Study Completion", "date": "2026-06-30"}]}',
    135,
    'open',
    15,
    32,
    8,
    25,
    18,
    91.2,
    'recruiting',
    '2024-06-01',
    '2026-06-30',
    @admin_user_id,
    '2024-06-01 10:30:00',
    '2024-11-02 14:15:00'
);

-- ============================================================================
-- STUDY 8: Phase III Cardiovascular Prevention Study (Large Scale)
-- ============================================================================
INSERT INTO studies (
    id, aggregate_uuid, name, description, sponsor, protocol_number, version, is_latest_version,
    indication, study_type, principal_investigator, sites, planned_subjects, enrolled_subjects, target_enrollment,
    primary_objective, amendments, study_status_id, regulatory_status_id, study_phase_id,
    therapeutic_area, study_coordinator, active_sites, total_sites, screened_subjects, randomized_subjects,
    completed_subjects, withdrawn_subjects, enrollment_rate, screening_success_rate,
    first_patient_in_date, last_patient_in_date, estimated_completion_date,
    primary_endpoint, secondary_endpoints, inclusion_criteria, exclusion_criteria,
    recent_activities, timeline, study_duration_weeks, database_lock_status,
    monitoring_visits_completed, adverse_events_reported, protocol_deviations,
    queries_open, queries_resolved, sdv_percentage, recruitment_status,
    start_date, end_date, created_by, created_at, updated_at
) VALUES (
    8,
    '550e8400-e29b-41d4-a716-446655440008',
    'PCSK9 Inhibitor Cardiovascular Outcomes Trial',
    'A randomized, double-blind, placebo-controlled, event-driven, multicenter Phase III trial evaluating the effect of a novel PCSK9 inhibitor on major adverse cardiovascular events in high-risk patients with atherosclerotic cardiovascular disease.',
    'BioTech Advances Corp.',
    'BAC-CVD-2024-301',
    '1.2',
    TRUE,
    'Cardiovascular Disease Prevention',
    'INTERVENTIONAL',
    'Dr. Robert P. Anderson',
    85,
    5000,
    3245,
    5000,
    'To evaluate whether the PCSK9 inhibitor reduces the risk of major adverse cardiovascular events (MACE) compared to placebo in high-risk patients',
    1,
    2,
    2,
    3,
    'Cardiology',
    'Sarah Johnson, MS, RN',
    78,
    85,
    3876,
    3245,
    892,
    156,
    64.9,
    83.7,
    '2024-01-01',
    '2024-09-30',
    '2028-12-31',
    'Time to first occurrence of MACE (composite of cardiovascular death, non-fatal MI, non-fatal stroke, and coronary revascularization)',
    '["Individual MACE components", "All-cause mortality", "Heart failure hospitalization", "Percent change in LDL cholesterol", "Achievement of LDL-C <55 mg/dL", "Safety and tolerability"]',
    '["History of atherosclerotic cardiovascular disease", "LDL cholesterol ≥70 mg/dL despite maximum tolerated statin", "Age 40-85 years", "High cardiovascular risk"]',
    '["Previous treatment with PCSK9 inhibitor within 12 months", "NYHA Class IV heart failure", "Recent cardiovascular event (<4 weeks)", "Severe hepatic impairment", "Active malignancy"]',
    '[{"date": "2024-11-01", "activity": "Monthly enrollment and events report generated - 735 events accrued", "user": "Data Monitoring"}, {"date": "2024-10-25", "activity": "Central lab monitoring completed - excellent compliance", "user": "Central Lab"}, {"date": "2024-10-20", "activity": "Site 82 initiated and first patient enrolled", "user": "Clinical Operations"}]',
    '{"phases": [{"name": "Screening", "duration": 4, "color": "#FFA500"}, {"name": "Treatment Phase", "duration": 156, "color": "#4169E1"}, {"name": "Follow-up", "duration": 12, "color": "#32CD32"}], "milestones": [{"name": "First Patient In", "date": "2024-01-01"}, {"name": "1000th Patient", "date": "2024-04-15"}, {"name": "2500th Patient", "date": "2024-07-31"}, {"name": "Target Enrollment", "date": "2025-06-30"}, {"name": "Target Events", "date": "2027-12-31"}, {"name": "Study Completion", "date": "2028-12-31"}]}',
    172,
    'open',
    68,
    45,
    23,
    35,
    28,
    89.5,
    'recruiting',
    '2024-01-01',
    '2028-12-31',
    @sponsor_user_1,
    '2024-01-01 08:00:00',
    '2024-11-01 16:00:00'
);

-- ============================================================================
-- STUDY 9: Phase II Digital Mental Health Intervention Study (Active)
-- ============================================================================
INSERT INTO studies (
    id, aggregate_uuid, name, description, sponsor, protocol_number, version, is_latest_version,
    indication, study_type, principal_investigator, sites, planned_subjects, enrolled_subjects, target_enrollment,
    primary_objective, amendments, study_status_id, regulatory_status_id, study_phase_id,
    therapeutic_area, study_coordinator, active_sites, total_sites, screened_subjects, randomized_subjects,
    completed_subjects, withdrawn_subjects, enrollment_rate, screening_success_rate,
    first_patient_in_date, last_patient_in_date, estimated_completion_date,
    primary_endpoint, secondary_endpoints, inclusion_criteria, exclusion_criteria,
    recent_activities, timeline, study_duration_weeks, database_lock_status,
    monitoring_visits_completed, adverse_events_reported, protocol_deviations,
    queries_open, queries_resolved, sdv_percentage, recruitment_status,
    start_date, end_date, created_by, created_at, updated_at
) VALUES (
    9,
    '550e8400-e29b-41d4-a716-446655440009',
    'Digital CBT Platform for Major Depressive Disorder',
    'A randomized, waitlist-controlled, multi-site Phase II trial evaluating the efficacy and usability of a smartphone-based cognitive behavioral therapy platform for adults with moderate major depressive disorder.',
    'Pharma Global Inc.',
    'PGI-MH-2024-201',
    '1.0',
    TRUE,
    'Major Depressive Disorder',
    'INTERVENTIONAL',
    'Dr. Lisa M. Thompson',
    8,
    240,
    187,
    240,
    'To evaluate the efficacy of the digital CBT platform in reducing depression symptoms as measured by change in PHQ-9 score from baseline to 12 weeks',
    0,
    2,
    2,
    2,
    'Psychiatry',
    'Karen White, LCSW',
    7,
    8,
    223,
    187,
    124,
    18,
    77.9,
    83.9,
    '2024-04-15',
    '2024-10-08',
    '2025-04-30',
    'Change in Patient Health Questionnaire-9 (PHQ-9) score from baseline to 12 weeks',
    '["Response rate (≥50% reduction in PHQ-9)", "Remission rate (PHQ-9 <5)", "Generalized Anxiety Disorder-7 (GAD-7) scores", "WHO-5 Well-Being Index", "Treatment adherence and engagement metrics", "Usability and satisfaction scores"]',
    '["Age 18-65 years", "Diagnosis of Major Depressive Disorder (DSM-5)", "PHQ-9 score 10-19 (moderate depression)", "Access to smartphone or computer with internet", "English language proficiency"]',
    '["Severe depression (PHQ-9 ≥20)", "Active suicidal ideation or plan", "Current psychotherapy or counseling", "Substance use disorder requiring treatment", "Bipolar disorder or psychotic disorder", "Major change in antidepressant medication <4 weeks"]',
    '[{"date": "2024-11-03", "activity": "Platform usage analytics reviewed - 85% weekly active users", "user": "Study Team"}, {"date": "2024-10-30", "activity": "Patient engagement survey completed - high satisfaction scores", "user": "Karen White"}, {"date": "2024-10-28", "activity": "Interim safety review completed - no safety concerns", "user": "Medical Monitor"}]',
    '{"phases": [{"name": "Screening", "duration": 2, "color": "#FFA500"}, {"name": "Intervention Phase", "duration": 12, "color": "#4169E1"}, {"name": "Follow-up", "duration": 4, "color": "#32CD32"}], "milestones": [{"name": "First Patient In", "date": "2024-04-15"}, {"name": "150th Patient", "date": "2024-08-31"}, {"name": "Target Enrollment", "date": "2024-12-15"}, {"name": "Primary Analysis", "date": "2025-03-15"}, {"name": "Study Completion", "date": "2025-04-30"}]}',
    18,
    'open',
    12,
    8,
    3,
    8,
    5,
    94.1,
    'recruiting',
    '2024-04-15',
    '2025-04-30',
    @admin_user_id,
    '2024-04-15 11:45:00',
    '2024-11-03 10:20:00'
);

-- ============================================================================
-- STUDY 10: Phase I Gene Therapy for Rare Disease (Early Stage)
-- ============================================================================
INSERT INTO studies (
    id, aggregate_uuid, name, description, sponsor, protocol_number, version, is_latest_version,
    indication, study_type, principal_investigator, sites, planned_subjects, enrolled_subjects, target_enrollment,
    primary_objective, amendments, study_status_id, regulatory_status_id, study_phase_id,
    therapeutic_area, study_coordinator, active_sites, total_sites, screened_subjects, randomized_subjects,
    completed_subjects, withdrawn_subjects, enrollment_rate, screening_success_rate,
    first_patient_in_date, last_patient_in_date, estimated_completion_date,
    primary_endpoint, secondary_endpoints, inclusion_criteria, exclusion_criteria,
    recent_activities, timeline, study_duration_weeks, database_lock_status,
    monitoring_visits_completed, adverse_events_reported, protocol_deviations,
    queries_open, queries_resolved, sdv_percentage, recruitment_status,
    start_date, end_date, created_by, created_at, updated_at
) VALUES (
    10,
    '550e8400-e29b-41d4-a716-446655440010',
    'AAV Gene Therapy for X-linked Myotubular Myopathy',
    'A first-in-human, open-label, single-arm, multi-center Phase I dose-escalation study of adeno-associated virus (AAV)-mediated gene therapy in pediatric patients with X-linked myotubular myopathy (XLMTM).',
    'BioTech Advances Corp.',
    'BAC-GT-2024-101',
    '1.0',
    TRUE,
    'X-linked Myotubular Myopathy',
    'INTERVENTIONAL',
    'Dr. Mark D. Wilson',
    5,
    24,
    8,
    24,
    'To evaluate the safety and tolerability of AAV8-MTM1 gene therapy administered as a single intravenous infusion in pediatric patients with XLMTM',
    0,
    2,
    4,
    1,
    'Rare Diseases/Neuromuscular',
    'Anna Garcia, MS, CGC',
    4,
    5,
    12,
    8,
    3,
    1,
    33.3,
    66.7,
    '2024-08-01',
    NULL,
    '2029-08-01',
    'Incidence and severity of adverse events and serious adverse events through 52 weeks post-gene therapy',
    '["Change in maximal inspiratory pressure (MIP)", "Change in motor function (CHOP-INTEND)", "Ventilator independence", "MTM1 protein expression in muscle biopsy", "Vector shedding and biodistribution", "Immunological responses"]',
    '["Confirmed genetic diagnosis of XLMTM", "Age 6 months to 5 years", "Adequate pulmonary function (able to tolerate procedure)", "No neutralizing antibodies to AAV8", "Life expectancy >6 months"]',
    '["Previous gene therapy of any kind", "Severe immunodeficiency or ongoing immunosuppression", "Active viral infections (HBV, HCV, HIV)", "Anti-AAV8 neutralizing antibodies", "Severe cardiac dysfunction"]',
    '[{"date": "2024-11-01", "activity": "Patient 8 successfully dosed in cohort 2 - no acute adverse events", "user": "Dr. Wilson"}, {"date": "2024-10-22", "activity": "Data Safety Monitoring Board safety review completed - study continuation approved", "user": "DSMB"}, {"date": "2024-10-15", "activity": "6-month follow-up completed for Patient 3 - showing motor improvement", "user": "Site Coordinator"}]',
    '{"phases": [{"name": "Screening", "duration": 8, "color": "#FFA500"}, {"name": "Dose Escalation", "duration": 72, "color": "#4169E1"}, {"name": "Long-term Follow-up", "duration": 260, "color": "#32CD32"}], "milestones": [{"name": "First Patient Dosed", "date": "2024-08-01"}, {"name": "Cohort 1 Safety Review", "date": "2025-02-01"}, {"name": "Cohort 2 Completion", "date": "2025-08-01"}, {"name": "Cohort 3 Completion", "date": "2026-02-01"}, {"name": "Primary Endpoint Analysis", "date": "2026-08-01"}, {"name": "5-Year Follow-up Complete", "date": "2029-08-01"}]}',
    260,
    'open',
    3,
    5,
    1,
    1,
    0,
    85.7,
    'recruiting',
    '2024-08-01',
    '2029-08-01',
    @sponsor_user_3,
    '2024-08-01 09:00:00',
    '2024-11-01 15:45:00'
);

-- ============================================================================
-- Create Organization-Study Relationships
-- ============================================================================

INSERT INTO organization_studies (organization_id, study_id, role, start_date, end_date, created_at, updated_at)
VALUES
-- Study 1: COVID-19 Vaccine
(@org_pharma_global, 1, 'sponsor', '2024-01-15', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Study 2: Diabetes AI
(@org_biotech_advances, 2, 'sponsor', '2024-02-01', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Study 3: Alzheimer's
(@org_pharma_global, 3, 'sponsor', '2024-03-10', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Study 4: Rheumatoid Arthritis
(@org_biotech_advances, 4, 'sponsor', '2024-05-01', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Study 5: Hypertension
(@org_pharma_global, 5, 'sponsor', '2023-11-15', '2024-11-14', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Study 6: Pediatric Asthma
(@org_biotech_advances, 6, 'sponsor', '2023-01-10', '2023-12-20', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Study 7: Oncology Immunotherapy
(@org_pharma_global, 7, 'sponsor', '2024-06-01', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Study 8: Cardiovascular Prevention
(@org_biotech_advances, 8, 'sponsor', '2024-01-01', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Study 9: Mental Health Digital
(@org_pharma_global, 9, 'sponsor', '2024-04-15', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Study 10: Gene Therapy
(@org_biotech_advances, 10, 'sponsor', '2024-08-01', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================================
-- Assign Study Roles to Users
-- ============================================================================

-- Study 1 - Admin user
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
SELECT @admin_user_id, 1, id, '2024-01-15'
FROM roles WHERE name = 'SYSTEM_ADMIN'
LIMIT 1;

-- Study 2 - Sponsor user 1
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
SELECT @sponsor_user_1, 2, id, '2024-02-01'
FROM roles WHERE name = 'SPONSOR_ADMIN'
LIMIT 1;

-- Study 3 - Admin user
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
SELECT @admin_user_id, 3, id, '2024-03-10'
FROM roles WHERE name = 'SYSTEM_ADMIN'
LIMIT 1;

-- Study 4 - Sponsor user 3
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
SELECT @sponsor_user_3, 4, id, '2024-05-01'
FROM roles WHERE name = 'SPONSOR_ADMIN'
LIMIT 1;

-- Study 5 - Admin user
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
SELECT @admin_user_id, 5, id, '2023-11-15'
FROM roles WHERE name = 'SYSTEM_ADMIN'
LIMIT 1;

-- Study 6 - Sponsor user 1
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
SELECT @sponsor_user_1, 6, id, '2023-01-10'
FROM roles WHERE name = 'SPONSOR_ADMIN'
LIMIT 1;

-- Study 7 - Admin user
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
SELECT @admin_user_id, 7, id, '2024-06-01'
FROM roles WHERE name = 'SYSTEM_ADMIN'
LIMIT 1;

-- Study 8 - Sponsor user 1
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
SELECT @sponsor_user_1, 8, id, '2024-01-01'
FROM roles WHERE name = 'SPONSOR_ADMIN'
LIMIT 1;

-- Study 9 - Admin user
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
SELECT @admin_user_id, 9, id, '2024-04-15'
FROM roles WHERE name = 'SYSTEM_ADMIN'
LIMIT 1;

-- Study 10 - Sponsor user 3
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
SELECT @sponsor_user_3, 10, id, '2024-08-01'
FROM roles WHERE name = 'SPONSOR_ADMIN'
LIMIT 1;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify all 10 studies created with proper UUIDs
SELECT 
    id,
    aggregate_uuid,
    name,
    protocol_number,
    study_type,
    study_phase_id,
    enrolled_subjects,
    target_enrollment,
    recruitment_status,
    created_at
FROM studies
ORDER BY id;

-- Verify UUIDs are unique and properly formatted
SELECT 
    COUNT(*) as total_studies,
    COUNT(DISTINCT aggregate_uuid) as unique_uuids,
    MIN(LENGTH(aggregate_uuid)) as min_uuid_length,
    MAX(LENGTH(aggregate_uuid)) as max_uuid_length
FROM studies;

-- Expected output:
-- total_studies = 10
-- unique_uuids = 10
-- min_uuid_length = 36
-- max_uuid_length = 36

-- ============================================================================
-- END OF DEMO DATA SCRIPT
-- ============================================================================
