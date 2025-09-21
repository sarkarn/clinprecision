
-- Insert sample data for testing (optional - remove in production)
-- Study arms for study ID 3 (matching the frontend call)
INSERT INTO study_arms (name, description, type, sequence_number, planned_subjects, study_id, created_by, updated_by)
VALUES 
    ('Treatment Arm A', 'Primary treatment group receiving experimental drug', 'TREATMENT', 1, 150, 3, 'system', 'system'),
    ('Control Arm', 'Control group receiving standard care', 'CONTROL', 2, 75, 3, 'system', 'system'),
    ('Placebo Arm', 'Placebo group for comparison', 'PLACEBO', 3, 75, 3, 'system', 'system'),
	('Treatment Arm A', 'Primary treatment group receiving experimental drug', 'TREATMENT', 1, 150, 1, 'system', 'system'),
    ('Control Arm', 'Control group receiving standard care', 'CONTROL', 2, 75, 1, 'system', 'system'),
    ('Placebo Arm', 'Placebo group for comparison', 'PLACEBO', 3, 75, 1, 'system', 'system'),
	('Treatment Arm A', 'Primary treatment group receiving experimental drug', 'TREATMENT', 1, 150, 2, 'system', 'system'),
    ('Control Arm', 'Control group receiving standard care', 'CONTROL', 2, 75, 2, 'system', 'system'),
    ('Placebo Arm', 'Placebo group for comparison', 'PLACEBO', 3, 75, 2, 'system', 'system');


-- Insert sample interventions
INSERT INTO study_interventions (name, description, type, dosage, frequency, route, study_arm_id, created_by, updated_by)
SELECT 
    'Experimental Drug XYZ', 
    'Novel compound targeting specific pathway',
    'DRUG',
    '10mg',
    'Once daily',
    'Oral',
    sa.id,
    'system',
    'system'
FROM study_arms sa 
WHERE sa.study_id = 3 AND sa.sequence_number = 1;

INSERT INTO study_interventions (name, description, type, dosage, frequency, route, study_arm_id, created_by, updated_by)
SELECT 
    'Standard Care Protocol', 
    'Current standard of care treatment',
    'PROCEDURE',
    NULL,
    'As needed',
    NULL,
    sa.id,
    'system',
    'system'
FROM study_arms sa 
WHERE sa.study_id = 3 AND sa.sequence_number = 2;

INSERT INTO study_interventions (name, description, type, dosage, frequency, route, study_arm_id, created_by, updated_by)
SELECT 
    'Placebo Capsule', 
    'Inactive placebo matching active treatment',
    'DRUG',
    '1 capsule',
    'Once daily',
    'Oral',
    sa.id,
    'system',
    'system'
FROM study_arms sa 
WHERE sa.study_id = 3 AND sa.sequence_number = 3;


-- Insert initial data for existing studies (optional)
-- This will create basic-info progress entries for all existing studies
INSERT INTO study_design_progress (study_id, phase, completed, percentage, created_at, updated_at)
SELECT 
    id as study_id,
    'basic-info' as phase,
    TRUE as completed,
    100 as percentage,
    NOW() as created_at,
    NOW() as updated_at
FROM studies
WHERE NOT EXISTS (
    SELECT 1 FROM study_design_progress 
    WHERE study_design_progress.study_id = studies.id 
    AND study_design_progress.phase = 'basic-info'
);

-- Create default progress entries for other phases for existing studies
INSERT INTO study_design_progress (study_id, phase, completed, percentage, created_at, updated_at)
SELECT 
    studies.id as study_id,
    phases.phase_name as phase,
    FALSE as completed,
    0 as percentage,
    NOW() as created_at,
    NOW() as updated_at
FROM studies
CROSS JOIN (
    SELECT 'arms' as phase_name
    UNION SELECT 'visits'
    UNION SELECT 'forms' 
    UNION SELECT 'review'
    UNION SELECT 'publish'
    UNION SELECT 'revisions'
) phases
WHERE NOT EXISTS (
    SELECT 1 FROM study_design_progress 
    WHERE study_design_progress.study_id = studies.id 
    AND study_design_progress.phase = phases.phase_name
);


-- Create visit definitions
-- Study 1 visits
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES (1, 1, 1, 'Screening Visit', 'Initial screening', 0, 'SCREENING');

-- Study 3 visits - High Dose Arm
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(2, 3, 2, 'Screening', 'Initial patient assessment and eligibility screening', -14, 'SCREENING'),
(3, 3, 2, 'Baseline Visit', 'First treatment administration and baseline assessments', 0, 'BASELINE'),
(4, 3, 2, 'Follow-up Visit 1', '30-day follow-up assessment', 30, 'FOLLOW_UP');

-- Study 3 visits - Low Dose Arm
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(5, 3, 3, 'Screening', 'Initial patient assessment and eligibility screening', -14, 'SCREENING'),
(6, 3, 3, 'Baseline Visit', 'First treatment administration and baseline assessments', 0, 'BASELINE'),
(7, 3, 3, 'Follow-up Visit 1', '30-day follow-up assessment', 30, 'FOLLOW_UP');

-- Study 4 visits - Standard of Care
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(8, 4, 4, 'Enrollment', 'Patient enrollment and initial assessment', -7, 'SCREENING'),
(9, 4, 4, 'Baseline', 'Baseline assessments before treatment starts', 0, 'BASELINE');

-- Study 4 visits - Experimental Therapy A
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(10, 4, 5, 'Enrollment', 'Patient enrollment and initial assessment', -7, 'SCREENING'),
(11, 4, 5, 'Baseline', 'Baseline assessments before treatment starts', 0, 'BASELINE');

-- Study 4 visits - Experimental Therapy B
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(12, 4, 6, 'Enrollment', 'Patient enrollment and initial assessment', -7, 'SCREENING'),
(13, 4, 6, 'Baseline', 'Baseline assessments before treatment starts', 0, 'BASELINE');

-- Study 5 visits
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(14, 5, 7, 'Initial Assessment', 'Baseline evaluation', 0, 'BASELINE');

-- Study 6 visits - Standard Protocol
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(15, 6, 8, 'Screening', 'Initial eligibility assessment', -14, 'SCREENING'),
(16, 6, 8, 'Month 1 Follow-up', 'First follow-up visit', 30, 'FOLLOW_UP'),
(17, 6, 8, 'Final Visit', 'End of study assessment', 90, 'FOLLOW_UP');

-- Study 6 visits - Modified Protocol
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(18, 6, 9, 'Screening', 'Initial eligibility assessment', -14, 'SCREENING'),
(19, 6, 9, 'Month 1 Follow-up', 'First follow-up visit', 30, 'FOLLOW_UP'),
(20, 6, 9, 'Final Visit', 'End of study assessment', 90, 'FOLLOW_UP');


-- Study 1 - Demographics form based on DEMO-001 template
INSERT INTO form_definitions (
    study_id, name, description, form_type, version, fields, structure, 
    template_id, template_version, tags, created_by, created_at
) VALUES (
    1, 
    'Study-Specific Demographics', 
    'COVID-19 vaccine trial demographics form adapted from global template with study-specific modifications',
    'Demographics',
    '1.0',
    '[
        {
            "id": "subject_initials",
            "type": "text",
            "label": "Subject Initials",
            "required": true,
            "maxLength": 3,
            "pattern": "[A-Z]{2,3}",
            "validation": "Must be 2-3 uppercase letters",
            "helpText": "Enter participant initials (first, middle, last). Use XX for unknown middle initial.",
            "section": "identification"
        },
        {
            "id": "gender",
            "type": "select",
            "label": "Gender",
            "required": true,
            "options": [
                {"value": "M", "label": "Male"},
                {"value": "F", "label": "Female"},
                {"value": "O", "label": "Other"},
                {"value": "U", "label": "Prefer not to answer"}
            ],
            "helpText": "Biological gender as determined by the investigator",
            "section": "demographics"
        },
        {
            "id": "date_of_birth",
            "type": "date",
            "label": "Date of Birth",
            "required": true,
            "validation": "Must be valid date, minimum age 18",
            "helpText": "Complete date of birth (DD-MMM-YYYY format preferred)",
            "section": "demographics"
        },
        {
            "id": "age_at_consent",
            "type": "number",
            "label": "Age at Informed Consent",
            "required": true,
            "min": 18,
            "max": 120,
            "unit": "years",
            "helpText": "Age in completed years at time of informed consent signing",
            "section": "demographics"
        },
        {
            "id": "covid_vaccination_history",
            "type": "select",
            "label": "Previous COVID-19 Vaccination",
            "required": true,
            "options": [
                {"value": "none", "label": "No previous COVID-19 vaccines"},
                {"value": "partial", "label": "Incomplete vaccination series"},
                {"value": "complete", "label": "Complete vaccination series"},
                {"value": "boosted", "label": "Complete series + booster(s)"}
            ],
            "helpText": "COVID-19 vaccination history specific to this study",
            "section": "study_specific"
        },
        {
            "id": "covid_infection_history",
            "type": "select",
            "label": "Previous COVID-19 Infection",
            "required": true,
            "options": [
                {"value": "none", "label": "No known COVID-19 infection"},
                {"value": "confirmed", "label": "Laboratory-confirmed COVID-19"},
                {"value": "suspected", "label": "Suspected COVID-19 (not confirmed)"},
                {"value": "unknown", "label": "Unknown/uncertain"}
            ],
            "helpText": "History of COVID-19 infection prior to study enrollment",
            "section": "study_specific"
        }
    ]',
    '{
        "sections": [
            {
                "id": "identification",
                "title": "Subject Identification",
                "description": "Basic identification information",
                "fields": ["subject_initials"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "demographics", 
                "title": "Demographics",
                "description": "Basic demographic information",
                "fields": ["gender", "date_of_birth", "age_at_consent"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "study_specific",
                "title": "COVID-19 Study Specific",
                "description": "COVID-19 vaccination and infection history",
                "fields": ["covid_vaccination_history", "covid_infection_history"],
                "layout": {"columns": 2, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    (SELECT id FROM form_templates WHERE template_id = 'DEMO-001'),
    '1.0',
    'demographics,covid-19,baseline,study-specific',
    (SELECT created_by FROM studies WHERE id = 1),
    NOW()
);

-- Study 1 - Adverse Events form based on SAF-001 template
INSERT INTO form_definitions (
    study_id, name, description, form_type, version, fields, structure,
    template_id, template_version, tags, created_by, created_at
) VALUES (
    1,
    'COVID-19 Vaccine Adverse Events',
    'Adverse event reporting form specific to COVID-19 vaccine trial with vaccine-specific fields',
    'Safety',
    '1.0',
    '[
        {
            "id": "ae_term",
            "type": "text",
            "label": "Adverse Event Term",
            "required": true,
            "maxLength": 200,
            "helpText": "Brief descriptive term for the adverse event (use MedDRA preferred terms when possible)",
            "section": "event_details"
        },
        {
            "id": "ae_description",
            "type": "textarea",
            "label": "Detailed Description",
            "required": true,
            "maxLength": 2000,
            "rows": 4,
            "helpText": "Detailed narrative description of the adverse event including symptoms, timeline, and relevant clinical details",
            "section": "event_details"
        },
        {
            "id": "onset_after_vaccination",
            "type": "number",
            "label": "Hours After Vaccination",
            "required": true,
            "min": 0,
            "max": 720,
            "unit": "hours",
            "helpText": "Number of hours between vaccination and AE onset",
            "section": "vaccine_specific"
        },
        {
            "id": "injection_site_reaction",
            "type": "checkbox",
            "label": "Injection Site Reaction",
            "helpText": "Check if this AE is related to injection site",
            "section": "vaccine_specific"
        },
        {
            "id": "severity",
            "type": "select",
            "label": "Severity",
            "required": true,
            "options": [
                {"value": "mild", "label": "Mild - Awareness of signs/symptoms, easily tolerated"},
                {"value": "moderate", "label": "Moderate - Discomfort sufficient to cause interference with normal activities"},
                {"value": "severe", "label": "Severe - Incapacitating, inability to work or perform normal activities"}
            ],
            "helpText": "Clinical severity assessment based on impact on patient functioning",
            "section": "assessment"
        },
        {
            "id": "causality",
            "type": "select",
            "label": "Relationship to Study Vaccine",
            "required": true,
            "options": [
                {"value": "unrelated", "label": "Not Related - Clearly not related to study vaccine"},
                {"value": "unlikely", "label": "Unlikely Related - Doubtful relationship"},
                {"value": "possible", "label": "Possibly Related - May be related"},
                {"value": "probable", "label": "Probably Related - Likely related"},
                {"value": "definite", "label": "Definitely Related - Clear causal relationship"}
            ],
            "helpText": "Investigator assessment of causal relationship to study vaccine",
            "section": "assessment"
        }
    ]',
    '{
        "sections": [
            {
                "id": "event_details",
                "title": "Event Details",
                "description": "Basic adverse event information", 
                "fields": ["ae_term", "ae_description"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "vaccine_specific",
                "title": "Vaccine-Specific Information",
                "description": "COVID-19 vaccine specific details",
                "fields": ["onset_after_vaccination", "injection_site_reaction"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "assessment",
                "title": "Clinical Assessment",
                "description": "Severity and causality assessment",
                "fields": ["severity", "causality"],
                "layout": {"columns": 2, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    (SELECT id FROM form_templates WHERE template_id = 'SAF-001'),
    '1.0',
    'safety,adverse events,covid-19,vaccine-specific',
    (SELECT created_by FROM studies WHERE id = 1),
    NOW()
);

-- ========================================
-- Study 3: Alzheimer's Disease Intervention Forms
-- ========================================

-- Study 3 - Cognitive Assessment form (custom for Alzheimer's study)
INSERT INTO form_definitions (
    study_id, name, description, form_type, version, fields, structure,
    template_id, template_version, tags, created_by, created_at
) VALUES (
    3,
    'Alzheimer''s Cognitive Assessment Battery',
    'Comprehensive cognitive assessment battery specifically designed for Alzheimer''s disease intervention study',
    'Efficacy',
    '1.0',
    '[
        {
            "id": "mmse_score",
            "type": "number",
            "label": "MMSE Total Score",
            "required": true,
            "min": 0,
            "max": 30,
            "helpText": "Mini-Mental State Examination total score (0-30)",
            "section": "cognitive_tests"
        },
        {
            "id": "adas_cog_score",
            "type": "number",
            "label": "ADAS-Cog Score",
            "required": true,
            "min": 0,
            "max": 70,
            "step": 0.5,
            "helpText": "Alzheimer Disease Assessment Scale - Cognitive subscale score",
            "section": "cognitive_tests"
        },
        {
            "id": "clock_drawing_test",
            "type": "select",
            "label": "Clock Drawing Test",
            "required": true,
            "options": [
                {"value": "normal", "label": "Normal (4 points)"},
                {"value": "mild_impairment", "label": "Mild Impairment (3 points)"},
                {"value": "moderate_impairment", "label": "Moderate Impairment (2 points)"},
                {"value": "severe_impairment", "label": "Severe Impairment (0-1 points)"}
            ],
            "helpText": "Clock drawing test assessment",
            "section": "cognitive_tests"
        },
        {
            "id": "verbal_fluency_score",
            "type": "number",
            "label": "Verbal Fluency Score",
            "required": true,
            "min": 0,
            "max": 50,
            "helpText": "Number of words generated in verbal fluency test",
            "section": "cognitive_tests"
        },
        {
            "id": "functional_assessment",
            "type": "select",
            "label": "Functional Assessment (FAQ)",
            "required": true,
            "options": [
                {"value": "independent", "label": "Independent (0-8)"},
                {"value": "mild_dependence", "label": "Mild Dependence (9-15)"},
                {"value": "moderate_dependence", "label": "Moderate Dependence (16-23)"},
                {"value": "severe_dependence", "label": "Severe Dependence (24-30)"}
            ],
            "helpText": "Functional Activities Questionnaire assessment",
            "section": "functional_assessment"
        },
        {
            "id": "caregiver_burden",
            "type": "number",
            "label": "Caregiver Burden Score",
            "required": false,
            "min": 0,
            "max": 88,
            "helpText": "Zarit Burden Interview score (if applicable)",
            "section": "caregiver_assessment"
        }
    ]',
    '{
        "sections": [
            {
                "id": "cognitive_tests",
                "title": "Cognitive Test Battery",
                "description": "Standardized cognitive assessments",
                "fields": ["mmse_score", "adas_cog_score", "clock_drawing_test", "verbal_fluency_score"],
                "layout": {"columns": 2, "style": "grid"}
            },
            {
                "id": "functional_assessment",
                "title": "Functional Assessment",
                "description": "Activities of daily living evaluation",
                "fields": ["functional_assessment"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "caregiver_assessment",
                "title": "Caregiver Assessment",
                "description": "Caregiver burden evaluation",
                "fields": ["caregiver_burden"],
                "layout": {"columns": 1, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    NULL,
    NULL,
    'cognitive assessment,alzheimers,efficacy,neuropsychological',
    (SELECT created_by FROM studies WHERE id = 3),
    NOW()
);

-- Study 3 - Drug Administration Log
INSERT INTO form_definitions (
    study_id, name, description, form_type, version, fields, structure,
    template_id, template_version, tags, created_by, created_at
) VALUES (
    3,
    'Alzheimer''s Study Drug Administration Log',
    'Detailed drug administration tracking for Alzheimer''s disease intervention study',
    'Drug Administration',
    '1.0',
    '[
        {
            "id": "administration_date",
            "type": "datetime",
            "label": "Administration Date/Time",
            "required": true,
            "helpText": "Date and time when study drug was administered",
            "section": "administration_details"
        },
        {
            "id": "dose_level",
            "type": "select",
            "label": "Dose Level",
            "required": true,
            "options": [
                {"value": "low_dose", "label": "Low Dose (5mg)"},
                {"value": "high_dose", "label": "High Dose (10mg)"}
            ],
            "helpText": "Study drug dose level as per randomization",
            "section": "administration_details"
        },
        {
            "id": "drug_lot_number",
            "type": "text",
            "label": "Drug Lot Number",
            "required": true,
            "maxLength": 50,
            "helpText": "Lot number of study drug administered",
            "section": "drug_accountability"
        },
        {
            "id": "expiry_date",
            "type": "date",
            "label": "Drug Expiry Date",
            "required": true,
            "helpText": "Expiry date of the drug lot used",
            "section": "drug_accountability"
        },
        {
            "id": "administration_method",
            "type": "select",
            "label": "Route of Administration",
            "required": true,
            "options": [
                {"value": "oral", "label": "Oral"},
                {"value": "iv", "label": "Intravenous"},
                {"value": "im", "label": "Intramuscular"}
            ],
            "helpText": "Method of drug administration",
            "section": "administration_details"
        },
        {
            "id": "administered_by",
            "type": "text",
            "label": "Administered By",
            "required": true,
            "maxLength": 100,
            "helpText": "Name and title of person who administered the drug",
            "section": "administration_details"
        },
        {
            "id": "compliance_assessment",
            "type": "select",
            "label": "Patient Compliance",
            "required": true,
            "options": [
                {"value": "full_dose", "label": "Full Dose Taken"},
                {"value": "partial_dose", "label": "Partial Dose Taken"},
                {"value": "refused", "label": "Dose Refused"},
                {"value": "vomited", "label": "Vomited Within 30 Minutes"}
            ],
            "helpText": "Assessment of patient compliance with drug administration",
            "section": "compliance"
        }
    ]',
    '{
        "sections": [
            {
                "id": "administration_details",
                "title": "Administration Details",
                "description": "Drug administration information",
                "fields": ["administration_date", "dose_level", "administration_method", "administered_by"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "drug_accountability",
                "title": "Drug Accountability",
                "description": "Drug lot and accountability information",
                "fields": ["drug_lot_number", "expiry_date"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "compliance",
                "title": "Compliance Assessment",
                "description": "Patient compliance evaluation",
                "fields": ["compliance_assessment"],
                "layout": {"columns": 1, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    NULL,
    NULL,
    'drug administration,compliance,alzheimers,accountability',
    (SELECT created_by FROM studies WHERE id = 3),
    NOW()
);

-- ========================================
-- Study 4: Rheumatoid Arthritis Comparative Therapy Forms
-- ========================================

-- Study 4 - Joint Assessment form based on efficacy template
INSERT INTO form_definitions (
    study_id, name, description, form_type, version, fields, structure,
    template_id, template_version, tags, created_by, created_at
) VALUES (
    4,
    'Rheumatoid Arthritis Joint Assessment',
    'Comprehensive joint assessment for rheumatoid arthritis comparative therapy trial',
    'Efficacy',
    '1.0',
    '[
        {
            "id": "assessment_date",
            "type": "datetime",
            "label": "Assessment Date/Time",
            "required": true,
            "helpText": "Date and time when joint assessment was performed",
            "section": "timing"
        },
        {
            "id": "tender_joint_count",
            "type": "number",
            "label": "Tender Joint Count (0-28)",
            "required": true,
            "min": 0,
            "max": 28,
            "helpText": "Number of tender joints out of 28 assessed joints",
            "section": "joint_counts"
        },
        {
            "id": "swollen_joint_count",
            "type": "number",
            "label": "Swollen Joint Count (0-28)",
            "required": true,
            "min": 0,
            "max": 28,
            "helpText": "Number of swollen joints out of 28 assessed joints",
            "section": "joint_counts"
        },
        {
            "id": "das28_esr",
            "type": "number",
            "label": "DAS28-ESR Score",
            "required": true,
            "min": 0,
            "max": 10,
            "step": 0.01,
            "helpText": "Disease Activity Score 28 with ESR calculation",
            "section": "composite_scores"
        },
        {
            "id": "cdai_score",
            "type": "number",
            "label": "CDAI Score",
            "required": true,
            "min": 0,
            "max": 76,
            "step": 0.1,
            "helpText": "Clinical Disease Activity Index score",
            "section": "composite_scores"
        },
        {
            "id": "patient_pain_vas",
            "type": "number",
            "label": "Patient Pain VAS (0-100)",
            "required": true,
            "min": 0,
            "max": 100,
            "helpText": "Patient assessment of pain on 100mm visual analog scale",
            "section": "patient_assessments"
        },
        {
            "id": "patient_global_vas",
            "type": "number",
            "label": "Patient Global Assessment VAS (0-100)",
            "required": true,
            "min": 0,
            "max": 100,
            "helpText": "Patient global assessment of disease activity on 100mm VAS",
            "section": "patient_assessments"
        },
        {
            "id": "physician_global_vas",
            "type": "number",
            "label": "Physician Global Assessment VAS (0-100)",
            "required": true,
            "min": 0,
            "max": 100,
            "helpText": "Physician global assessment of disease activity on 100mm VAS",
            "section": "physician_assessment"
        },
        {
            "id": "morning_stiffness_duration",
            "type": "number",
            "label": "Morning Stiffness Duration (minutes)",
            "required": false,
            "min": 0,
            "max": 1440,
            "unit": "minutes",
            "helpText": "Duration of morning stiffness in minutes",
            "section": "symptoms"
        }
    ]',
    '{
        "sections": [
            {
                "id": "timing",
                "title": "Assessment Timing",
                "description": "When assessment was performed",
                "fields": ["assessment_date"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "joint_counts",
                "title": "Joint Counts",
                "description": "Tender and swollen joint assessments",
                "fields": ["tender_joint_count", "swollen_joint_count"],
                "layout": {"columns": 2, "style": "inline"}
            },
            {
                "id": "composite_scores",
                "title": "Disease Activity Scores",
                "description": "Composite disease activity measures",
                "fields": ["das28_esr", "cdai_score"],
                "layout": {"columns": 2, "style": "inline"}
            },
            {
                "id": "patient_assessments",
                "title": "Patient Assessments",
                "description": "Patient-reported measures",
                "fields": ["patient_pain_vas", "patient_global_vas"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "physician_assessment",
                "title": "Physician Assessment",
                "description": "Physician global assessment",
                "fields": ["physician_global_vas"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "symptoms",
                "title": "Additional Symptoms",
                "description": "Other RA-related symptoms",
                "fields": ["morning_stiffness_duration"],
                "layout": {"columns": 1, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    (SELECT id FROM form_templates WHERE template_id = 'EFF-001'),
    '1.0',
    'efficacy,rheumatoid arthritis,joint assessment,disease activity',
    (SELECT created_by FROM studies WHERE id = 4),
    NOW()
);

-- ========================================
-- Study 6: Pediatric Asthma Treatment Forms
-- ========================================

-- Study 6 - Pediatric Asthma Control Assessment
INSERT INTO form_definitions (
    study_id, name, description, form_type, version, fields, structure,
    template_id, template_version, tags, created_by, created_at
) VALUES (
    6,
    'Pediatric Asthma Control Test (ACT)',
    'Age-appropriate asthma control assessment for pediatric patients (ages 5-12)',
    'Efficacy',
    '1.0',
    '[
        {
            "id": "assessment_date",
            "type": "date",
            "label": "Assessment Date",
            "required": true,
            "helpText": "Date when asthma control assessment was performed",
            "section": "timing"
        },
        {
            "id": "completed_by",
            "type": "select",
            "label": "Assessment Completed By",
            "required": true,
            "options": [
                {"value": "parent_guardian", "label": "Parent/Guardian"},
                {"value": "child_with_help", "label": "Child with Parent/Guardian Help"},
                {"value": "child_alone", "label": "Child Independently (age ≥7)"}
            ],
            "helpText": "Who completed the assessment",
            "section": "timing"
        },
        {
            "id": "asthma_symptoms_frequency",
            "type": "select",
            "label": "How often did your child have asthma symptoms during the day?",
            "required": true,
            "options": [
                {"value": "never", "label": "Never", "score": 5},
                {"value": "once_or_less", "label": "Once a month or less", "score": 4},
                {"value": "few_times_month", "label": "A few times a month", "score": 3},
                {"value": "few_times_week", "label": "A few times a week", "score": 2},
                {"value": "every_day", "label": "Every day", "score": 1}
            ],
            "helpText": "Frequency of daytime asthma symptoms",
            "section": "symptom_control"
        },
        {
            "id": "activity_limitation",
            "type": "select",
            "label": "How often did asthma keep your child from playing, sports, or other activities?",
            "required": true,
            "options": [
                {"value": "never", "label": "Never", "score": 5},
                {"value": "once_or_less", "label": "Once a month or less", "score": 4},
                {"value": "few_times_month", "label": "A few times a month", "score": 3},
                {"value": "few_times_week", "label": "A few times a week", "score": 2},
                {"value": "every_day", "label": "Every day", "score": 1}
            ],
            "helpText": "Impact on physical activities and play",
            "section": "functional_impact"
        },
        {
            "id": "nighttime_symptoms",
            "type": "select",
            "label": "How often did your child cough or have trouble sleeping due to asthma?",
            "required": true,
            "options": [
                {"value": "never", "label": "Never", "score": 5},
                {"value": "once_or_less", "label": "Once a month or less", "score": 4},
                {"value": "few_times_month", "label": "A few times a month", "score": 3},
                {"value": "few_times_week", "label": "A few times a week", "score": 2},
                {"value": "every_day", "label": "Every day", "score": 1}
            ],
            "helpText": "Frequency of nighttime symptoms",
            "section": "symptom_control"
        },
        {
            "id": "rescue_medication_use",
            "type": "select",
            "label": "How often did your child use rescue inhaler or take breathing treatments?",
            "required": true,
            "options": [
                {"value": "never", "label": "Never", "score": 5},
                {"value": "once_or_less", "label": "Once a month or less", "score": 4},
                {"value": "few_times_month", "label": "A few times a month", "score": 3},
                {"value": "few_times_week", "label": "A few times a week", "score": 2},
                {"value": "every_day", "label": "Every day", "score": 1}
            ],
            "helpText": "Frequency of rescue medication use",
            "section": "medication_use"
        },
        {
            "id": "asthma_control_rating",
            "type": "select",
            "label": "How would you rate your child''s asthma control?",
            "required": true,
            "options": [
                {"value": "very_well_controlled", "label": "Very well controlled", "score": 5},
                {"value": "well_controlled", "label": "Well controlled", "score": 4},
                {"value": "somewhat_controlled", "label": "Somewhat controlled", "score": 3},
                {"value": "poorly_controlled", "label": "Poorly controlled", "score": 2},
                {"value": "not_controlled", "label": "Not controlled at all", "score": 1}
            ],
            "helpText": "Overall assessment of asthma control",
            "section": "overall_assessment"
        },
        {
            "id": "total_act_score",
            "type": "calculated",
            "label": "Total ACT Score",
            "formula": "Sum of all scored responses (5-25)",
            "helpText": "Total ACT score: ≥20 = well controlled, <20 = poorly controlled",
            "section": "scoring"
        }
    ]',
    '{
        "sections": [
            {
                "id": "timing",
                "title": "Assessment Information",
                "description": "When and by whom assessment was completed",
                "fields": ["assessment_date", "completed_by"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "symptom_control",
                "title": "Symptom Control",
                "description": "Frequency of asthma symptoms",
                "fields": ["asthma_symptoms_frequency", "nighttime_symptoms"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "functional_impact",
                "title": "Functional Impact",
                "description": "Impact on activities and daily life",
                "fields": ["activity_limitation"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "medication_use",
                "title": "Rescue Medication Use",
                "description": "Frequency of rescue inhaler use",
                "fields": ["rescue_medication_use"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "overall_assessment",
                "title": "Overall Control Assessment",
                "description": "Global asthma control rating",
                "fields": ["asthma_control_rating"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "scoring",
                "title": "ACT Score",
                "description": "Calculated total score",
                "fields": ["total_act_score"],
                "layout": {"columns": 1, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    (SELECT id FROM form_templates WHERE template_id = 'EFF-001'),
    '1.0',
    'efficacy,pediatric,asthma,control assessment,ACT',
    (SELECT created_by FROM studies WHERE id = 6),
    NOW()
);

-- ========================================
-- Create Form Versions for All Study Forms
-- ========================================

-- Create initial version records for all newly created study-specific forms
INSERT INTO form_versions (form_id, version, version_notes, created_by, created_at)
SELECT 
    fd.id,
    fd.version,
    'Initial study-specific form version with structure support',
    fd.created_by,
    fd.created_at
FROM form_definitions fd
WHERE fd.created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)  -- Only for forms just created
AND fd.structure IS NOT NULL;


-- Associate forms with visits
-- Study 1
INSERT INTO visit_forms (visit_definition_id, form_definition_id, display_order, is_required)
VALUES (1, 1, 1, true);

-- Study 3 - High Dose Arm
INSERT INTO visit_forms (visit_definition_id, form_definition_id, display_order, is_required)
VALUES 
-- Screening visit forms
(2, 2, 1, true),
(2, 3, 2, true),
(2, 4, 3, true),
-- Baseline visit forms
(3, 5, 1, true),
(3, 6, 2, true);

-- Study 3 - Low Dose Arm (uses same form definitions as High Dose Arm)
INSERT INTO visit_forms (visit_definition_id, form_definition_id, display_order, is_required)
VALUES 
-- Screening visit forms
(5, 2, 1, true),
(5, 3, 2, true),
(5, 4, 3, true),
-- Baseline visit forms
(6, 5, 1, true),
(6, 6, 2, true);


