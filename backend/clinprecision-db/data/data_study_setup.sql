
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
    1, '550e8400-e29b-41d4-a716-446655440001', 'COVID-19 Vaccine Trial', 'A randomized, double-blind, placebo-controlled trial to evaluate the efficacy and safety of a novel mRNA COVID-19 vaccine in healthy adults.',
    (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'BPI-COVID-001', '2.1', TRUE,
    'COVID-19 Prevention', 'INTERVENTIONAL', 'Dr. Sarah Johnson', 25, 2000, 1547, 2000,
    'To evaluate the efficacy of the vaccine in preventing COVID-19 infection', 2, 2, 3, 3,
    'Infectious Diseases', 'Maria Rodriguez', 23, 25, 1820, 1547, 892, 78, 85.5, 85.0,
    '2024-01-15', '2024-10-30', '2025-01-15',
    'Incidence of laboratory-confirmed COVID-19 occurring at least 14 days after the second dose',
    '["Incidence of severe COVID-19", "Immunogenicity endpoints", "Safety endpoints"]',
    '["Adults aged 18-65 years", "Healthy volunteers", "Negative COVID-19 test at baseline"]',
    '["History of COVID-19 infection", "Immunocompromised individuals", "Pregnancy"]',
    '[{"date": "2024-11-01", "activity": "Site monitoring visit completed"}, {"date": "2024-10-28", "activity": "Interim safety analysis reviewed"}]',
    '{"phases": [{"name": "Screening", "duration": 4}, {"name": "Vaccination", "duration": 8}, {"name": "Follow-up", "duration": 40}]}',
    52, 'open', 18, 23, 5, 12, 8, 95.2, 'recruiting',
    '2024-01-15', '2025-01-15', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Study 2: Diabetes Management Study (Phase II, Completed Enrollment)
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
    2, '550e8400-e29b-41d4-a716-446655440002', 'Diabetes Management Study', 'A randomized controlled trial evaluating a novel continuous glucose monitoring system with AI-driven insulin dosing recommendations.',
    (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'MRG-DM-101', '1.5', TRUE,
    'Type 2 Diabetes Mellitus', 'INTERVENTIONAL', 'Dr. Michael Chen', 15, 300, 300, 300,
    'To evaluate the efficacy of AI-driven insulin dosing in improving glycemic control', 1, 2, 2, 2,
    'Endocrinology', 'Jennifer Kim', 15, 15, 342, 300, 267, 15, 100.0, 87.7,
    '2024-02-01', '2024-08-15', '2024-12-31',
    'Change in HbA1c from baseline to 24 weeks',
    '["Time in target glucose range", "Hypoglycemic episodes", "Quality of life scores"]',
    '["Type 2 diabetes for ≥6 months", "HbA1c 7.0-10.0%", "On stable insulin therapy"]',
    '["Type 1 diabetes", "Severe diabetic complications", "Recent cardiovascular events"]',
    '[{"date": "2024-11-02", "activity": "Database review completed"}, {"date": "2024-10-25", "activity": "Final patient visit completed"}]',
    '{"phases": [{"name": "Screening", "duration": 2}, {"name": "Treatment", "duration": 24}, {"name": "Follow-up", "duration": 4}]}',
    30, 'soft_lock', 22, 8, 3, 2, 0, 98.5, 'completed',
    '2024-02-01', '2024-12-31', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Study 3: Alzheimer's Disease Intervention Study (Phase II, Active)
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
    3, '550e8400-e29b-41d4-a716-446655440003', 'Alzheimer''s Disease Intervention Study', 'A double-blind, placebo-controlled study evaluating a novel amyloid-targeting therapeutic in early-stage Alzheimer''s disease.',
    (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'NCF-ALZ-202', '1.0', TRUE,
    'Early-stage Alzheimer''s Disease', 'INTERVENTIONAL', 'Dr. Patricia Williams', 35, 480, 412, 480,
    'To evaluate the efficacy in slowing cognitive decline in early Alzheimer''s disease', 0, 2, 2, 2,
    'Neurology', 'Robert Thompson', 32, 35, 523, 412, 156, 24, 85.8, 78.8,
    '2024-03-10', '2024-11-05', '2025-09-30',
    'Change in Clinical Dementia Rating Sum of Boxes (CDR-SB) from baseline to 78 weeks',
    '["ADAS-Cog scores", "Amyloid PET imaging changes", "Safety and tolerability"]',
    '["Age 50-85 years", "Mild cognitive impairment due to AD", "Positive amyloid PET scan"]',
    '["Severe dementia", "Other neurodegenerative diseases", "Recent use of AD medications"]',
    '[{"date": "2024-11-03", "activity": "Central lab results reviewed"}, {"date": "2024-10-30", "activity": "DSMB meeting held"}]',
    '{"phases": [{"name": "Screening", "duration": 6}, {"name": "Treatment", "duration": 78}, {"name": "Safety Follow-up", "duration": 12}]}',
    96, 'open', 28, 15, 7, 18, 12, 92.3, 'recruiting',
    '2024-03-10', '2025-09-30', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Study 4: Rheumatoid Arthritis Comparative Therapy Trial (Phase III, Active)
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
    4, '550e8400-e29b-41d4-a716-446655440004', 'Rheumatoid Arthritis Comparative Therapy Trial', 'A three-arm randomized study comparing the efficacy and safety of three different biological therapies for moderate to severe rheumatoid arthritis.',
    (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'ACP-RA-301', '2.0', TRUE,
    'Rheumatoid Arthritis', 'INTERVENTIONAL', 'Dr. Amanda Davis', 28, 750, 623, 750,
    'To compare the efficacy of three biological therapies in achieving ACR20 response', 3, 2, 2, 3,
    'Rheumatology', 'Lisa Park', 26, 28, 756, 623, 387, 45, 83.1, 82.4,
    '2024-05-01', '2024-10-22', '2026-04-30',
    'Proportion of patients achieving ACR20 response at 24 weeks',
    '["ACR50 and ACR70 response rates", "DAS28-CRP scores", "Radiographic progression"]',
    '["Active RA for ≥6 months", "Inadequate response to MTX", "DAS28-CRP >3.2"]',
    '["Previous biological therapy", "Active infections", "Pregnancy or nursing"]',
    '[{"date": "2024-11-01", "activity": "Interim efficacy analysis completed"}, {"date": "2024-10-28", "activity": "Site initiation visit - Site 29"}]',
    '{"phases": [{"name": "Screening", "duration": 4}, {"name": "Treatment", "duration": 52}, {"name": "Follow-up", "duration": 8}]}',
    64, 'open', 35, 28, 12, 22, 18, 88.9, 'recruiting',
    '2024-05-01', '2026-04-30', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Study 5: Hypertension Management in Elderly Patients (Phase IV, Completed)
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
    5, '550e8400-e29b-41d4-a716-446655440005', 'Hypertension Management in Elderly Patients', 'A post-marketing surveillance study examining optimal blood pressure targets and treatment strategies in patients over 65 years of age.',
    (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'CHI-HTN-401', '1.3', TRUE,
    'Hypertension in Elderly', 'OBSERVATIONAL', 'Dr. James Martinez', 45, 1200, 1200, 1200,
    'To evaluate optimal BP targets for reducing cardiovascular events in elderly patients', 2, 4, 1, 4,
    'Cardiology', 'Nancy Wilson', 0, 45, 1289, 1200, 1187, 13, 100.0, 93.1,
    '2023-11-15', '2024-02-28', '2024-11-14',
    'Composite of cardiovascular death, MI, and stroke at 12 months',
    '["Individual cardiovascular endpoints", "Quality of life", "Medication adherence"]',
    '["Age ≥65 years", "Hypertension diagnosis", "On antihypertensive therapy"]',
    '["Life expectancy <1 year", "Severe cognitive impairment", "Unable to provide consent"]',
    '[{"date": "2024-11-15", "activity": "Final study report submitted"}, {"date": "2024-11-01", "activity": "Database locked"}]',
    '{"phases": [{"name": "Screening", "duration": 2}, {"name": "Observation", "duration": 52}, {"name": "Final Analysis", "duration": 4}]}',
    58, 'hard_lock', 52, 19, 8, 0, 0, 100.0, 'completed',
    '2023-11-15', '2024-11-14', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Study 6: Pediatric Asthma Treatment Optimization (Phase II, Completed)
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
    6, '550e8400-e29b-41d4-a716-446655440006', 'Pediatric Asthma Treatment Optimization', 'A randomized controlled trial evaluating the efficacy of a step-down therapeutic approach in well-controlled pediatric asthma patients aged 5-12 years.',
    (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'RCF-AST-201', '1.1', TRUE,
    'Pediatric Asthma', 'INTERVENTIONAL', 'Dr. Emily Roberts', 20, 180, 180, 180,
    'To evaluate the safety and efficacy of step-down therapy in well-controlled pediatric asthma', 1, 4, 1, 2,
    'Pediatric Pulmonology', 'David Lee', 0, 20, 198, 180, 173, 7, 100.0, 90.9,
    '2023-01-10', '2023-06-30', '2023-12-20',
    'Proportion of patients maintaining asthma control at 24 weeks',
    '["Lung function parameters", "Asthma exacerbations", "Quality of life scores"]',
    '["Age 5-12 years", "Well-controlled asthma ≥3 months", "On ICS/LABA therapy"]',
    '["Severe asthma exacerbation in past 6 months", "Other respiratory conditions", "Unable to perform spirometry"]',
    '[{"date": "2024-01-15", "activity": "Final study report approved"}, {"date": "2023-12-20", "activity": "Last patient completed"}]',
    '{"phases": [{"name": "Screening", "duration": 2}, {"name": "Treatment", "duration": 24}, {"name": "Safety Follow-up", "duration": 4}]}',
    30, 'hard_lock', 28, 12, 4, 0, 0, 100.0, 'completed',
    '2023-01-10', '2023-12-20', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Study 7: Oncology Immunotherapy Combination Study (Phase I/II, Active)
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
    7, '550e8400-e29b-41d4-a716-446655440007', 'Oncology Immunotherapy Combination Study', 'A dose-escalation study evaluating the safety and preliminary efficacy of a novel PD-1 inhibitor in combination with standard chemotherapy for advanced solid tumors.',
    (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'ONC-IMM-101', '1.0', TRUE,
    'Advanced Solid Tumors', 'INTERVENTIONAL', 'Dr. Catherine Brown', 12, 72, 45, 72,
    'To determine the maximum tolerated dose and dose-limiting toxicities', 0, 2, 2, 1,
    'Oncology', 'Michael Chang', 10, 12, 67, 45, 18, 8, 62.5, 67.2,
    '2024-06-01', '2024-10-15', '2025-12-30',
    'Incidence of dose-limiting toxicities during cycle 1',
    '["Overall response rate", "Progression-free survival", "Pharmacokinetic parameters"]',
    '["Advanced solid tumor", "ECOG performance status 0-1", "Adequate organ function"]',
    '["Previous PD-1 inhibitor therapy", "Active autoimmune disease", "Brain metastases"]',
    '[{"date": "2024-11-02", "activity": "Dose escalation to cohort 4 approved"}, {"date": "2024-10-29", "activity": "Safety review committee meeting"}]',
    '{"phases": [{"name": "Screening", "duration": 3}, {"name": "Dose Escalation", "duration": 32}, {"name": "Expansion", "duration": 48}]}',
    83, 'open', 15, 32, 8, 25, 18, 91.2, 'recruiting',
    '2024-06-01', '2025-12-30', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Study 8: Cardiovascular Prevention Study (Phase III, Recruiting)
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
    8, '550e8400-e29b-41d4-a716-446655440008', 'Cardiovascular Prevention Study', 'A large-scale randomized controlled trial evaluating the cardiovascular benefits of a novel PCSK9 inhibitor in high-risk patients.',
    (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'CVD-PREV-301', '1.2', TRUE,
    'Cardiovascular Disease Prevention', 'INTERVENTIONAL', 'Dr. Robert Anderson', 85, 5000, 3245, 5000,
    'To evaluate the reduction in major adverse cardiovascular events', 1, 2, 2, 3,
    'Cardiology', 'Sarah Johnson', 78, 85, 3876, 3245, 892, 156, 64.9, 83.7,
    '2024-01-01', '2024-09-30', '2027-06-30',
    'Composite of cardiovascular death, MI, stroke, and coronary revascularization',
    '["Individual MACE components", "All-cause mortality", "LDL cholesterol reduction"]',
    '["High cardiovascular risk", "LDL cholesterol ≥70 mg/dL", "On maximum tolerated statin"]',
    '["Previous PCSK9 inhibitor use", "Severe heart failure", "Recent cardiovascular event"]',
    '[{"date": "2024-11-01", "activity": "Monthly enrollment report generated"}, {"date": "2024-10-25", "activity": "Site monitoring visits completed"}]',
    '{"phases": [{"name": "Screening", "duration": 4}, {"name": "Treatment", "duration": 156}, {"name": "Follow-up", "duration": 12}]}',
    172, 'open', 68, 45, 23, 35, 28, 89.5, 'recruiting',
    '2024-01-01', '2027-06-30', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Study 9: Mental Health Digital Intervention Study (Phase II, Active)
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
    9, '550e8400-e29b-41d4-a716-446655440009', 'Mental Health Digital Intervention Study', 'A randomized controlled trial evaluating the efficacy of a digital cognitive behavioral therapy platform for moderate depression.',
    (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'MH-DCBT-201', '1.0', TRUE,
    'Major Depressive Disorder', 'INTERVENTIONAL', 'Dr. Lisa Thompson', 8, 240, 187, 240,
    'To evaluate the efficacy of digital CBT in reducing depression symptoms', 0, 2, 2, 2,
    'Psychiatry', 'Karen White', 7, 8, 223, 187, 124, 18, 77.9, 83.9,
    '2024-04-15', '2024-10-08', '2025-02-28',
    'Change in PHQ-9 score from baseline to 12 weeks',
    '["Response and remission rates", "Quality of life", "Treatment adherence"]',
    '["Age 18-65 years", "PHQ-9 score 10-19", "Access to smartphone/computer"]',
    '["Severe depression (PHQ-9 ≥20)", "Suicidal ideation", "Current psychotherapy"]',
    '[{"date": "2024-11-03", "activity": "Platform usage analytics reviewed"}, {"date": "2024-10-30", "activity": "Patient engagement survey completed"}]',
    '{"phases": [{"name": "Screening", "duration": 2}, {"name": "Intervention", "duration": 12}, {"name": "Follow-up", "duration": 4}]}',
    18, 'open', 12, 8, 3, 8, 5, 94.1, 'recruiting',
    '2024-04-15', '2025-02-28', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Study 10: Rare Disease Gene Therapy Study (Phase I, Early Stage)
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
    10, '550e8400-e29b-41d4-a716-446655440010', 'Rare Disease Gene Therapy Study', 'A first-in-human dose-escalation study of AAV-mediated gene therapy for patients with X-linked myotubular myopathy.',
    (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'GT-XLMTM-101', '1.0', TRUE,
    'X-linked Myotubular Myopathy', 'INTERVENTIONAL', 'Dr. Mark Wilson', 5, 24, 8, 24,
    'To evaluate the safety and tolerability of gene therapy', 0, 2, 4, 1,
    'Rare Diseases/Neuromuscular', 'Anna Garcia', 4, 5, 12, 8, 3, 1, 33.3, 66.7,
    '2024-08-01', NULL, '2026-08-01',
    'Incidence and severity of adverse events through 52 weeks',
    '["Muscle strength assessments", "Motor function scores", "Biomarker levels"]',
    '["Confirmed XLMTM diagnosis", "Age 6 months-5 years", "Adequate pulmonary function"]',
    '["Previous gene therapy", "Severe immunodeficiency", "Active viral infections"]',
    '[{"date": "2024-11-01", "activity": "Patient 8 enrolled and dosed"}, {"date": "2024-10-22", "activity": "DSMB safety review completed"}]',
    '{"phases": [{"name": "Screening", "duration": 8}, {"name": "Dose Escalation", "duration": 72}, {"name": "Long-term Follow-up", "duration": 260}]}',
    340, 'open', 3, 5, 1, 1, 0, 85.7, 'recruiting',
    '2024-08-01', '2026-08-01', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);





-- Create organization relationships with studies
INSERT INTO organization_studies (organization_id, study_id, role, start_date, end_date, created_at, updated_at)
VALUES
-- Sponsor organizations
((SELECT id FROM organizations WHERE external_id = 'PG12345'), 1, 'sponsor', '2024-01-15', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'BAC7890'), 2, 'sponsor', '2024-02-01', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'PG12345'), 3, 'sponsor', '2024-03-10', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'BAC7890'), 4, 'sponsor', '2024-05-01', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'PG12345'), 5, 'sponsor', '2023-11-15', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'BAC7890'), 6, 'sponsor', '2023-01-10', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- CRO organizations
((SELECT id FROM organizations WHERE external_id = 'CRP4567'), 1, 'cro', '2024-01-15', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'GTS2345'), 3, 'cro', '2024-03-10', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'CRP4567'), 4, 'cro', '2024-05-01', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Site organizations
((SELECT id FROM organizations WHERE external_id = 'CMC8901'), 1, 'site', '2024-01-20', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'URH3456'), 3, 'site', '2024-03-15', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'CMC8901'), 4, 'site', '2024-05-10', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);



-- Assign study roles to users
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
VALUES
((SELECT id FROM users WHERE email = 'nsarkar@clinprecision.com'), 1, (SELECT id FROM roles WHERE name = 'SYSTEM_ADMIN'), '2024-01-15'),
((SELECT id FROM users WHERE email = 'rjohnson@medicalresearch.org'), 2, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2024-02-01'),
((SELECT id FROM users WHERE email = 'echen@neurocare.org'), 3, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2024-03-10'),
((SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com'), 4, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2024-05-01'),
((SELECT id FROM users WHERE email = 'swilliams@cardiohealth.org'), 5, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2023-11-15'),
((SELECT id FROM users WHERE email = 'dlee@respicare.org'), 6, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2023-01-10');

-- Update the studies to set created_by to the corresponding sponsor admin
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'nsarkar@clinprecision.com') WHERE id = 1;
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'rjohnson@medicalresearch.org') WHERE id = 2;
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'echen@neurocare.org') WHERE id = 3;
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com') WHERE id = 4;
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'swilliams@cardiohealth.org') WHERE id = 5;
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'dlee@respicare.org') WHERE id = 6;



-- Insert initial version for existing studies (assuming study ID 1 exists)
INSERT INTO study_versions (
    study_id, version_number, status, created_by, created_date,
    description, effective_date
) VALUES (
    1, 'v1.0', 'ACTIVE', 1, NOW(),
    'Initial protocol version', CURDATE()
) ON DUPLICATE KEY UPDATE version_number = version_number;


