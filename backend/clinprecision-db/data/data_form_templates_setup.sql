-- Form Library Data Setup Script v3.0
-- Creates standardized, reusable form templates for clinical trials
-- Uses proper form_templates table structure separate from study-specific forms
-- Updated to include structure column for organized form layout
-- Last updated: September 14, 2025


-- 1. Demographics & Baseline Forms Template
INSERT INTO form_templates (
    template_id, name, description, category, version, status, 
    fields, structure, tags, usage_count, created_by, created_at
) VALUES (
    'DEMO-001',
    'Subject Demographics',
    'Comprehensive demographic data collection form capturing baseline participant information including identification, physical characteristics, and background history essential for clinical trial analysis and regulatory submissions.',
    'Demographics',
    '1.0',
    'PUBLISHED',
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
            "id": "ethnicity",
            "type": "select",
            "label": "Ethnicity",
            "required": true,
            "options": [
                {"value": "hispanic", "label": "Hispanic or Latino"},
                {"value": "not_hispanic", "label": "Not Hispanic or Latino"},
                {"value": "unknown", "label": "Unknown"},
                {"value": "not_reported", "label": "Not Reported"}
            ],
            "helpText": "FDA ethnic categories for regulatory reporting",
            "section": "demographics"
        },
        {
            "id": "race",
            "type": "multiselect",
            "label": "Race",
            "required": true,
            "options": [
                {"value": "white", "label": "White"},
                {"value": "black", "label": "Black or African American"},
                {"value": "asian", "label": "Asian"},
                {"value": "native_american", "label": "American Indian or Alaska Native"},
                {"value": "pacific_islander", "label": "Native Hawaiian or Other Pacific Islander"},
                {"value": "other", "label": "Other"},
                {"value": "unknown", "label": "Unknown"},
                {"value": "not_reported", "label": "Not Reported"}
            ],
            "helpText": "Select all applicable race categories. Multiple selections allowed.",
            "section": "demographics"
        },
        {
            "id": "height",
            "type": "number",
            "label": "Height",
            "required": true,
            "min": 100,
            "max": 250,
            "step": 0.1,
            "unit": "cm",
            "referenceRange": "Adult: 140-200 cm typical range",
            "helpText": "Height in centimeters (measured without shoes)",
            "section": "physical"
        },
        {
            "id": "weight",
            "type": "number",
            "label": "Weight",
            "required": true,
            "min": 30,
            "max": 300,
            "step": 0.1,
            "unit": "kg",
            "referenceRange": "Adult: 40-150 kg typical range",
            "helpText": "Weight in kilograms (measured with minimal clothing)",
            "section": "physical"
        },
        {
            "id": "bmi",
            "type": "calculated",
            "label": "BMI",
            "formula": "weight / (height/100)^2",
            "unit": "kg/m²",
            "referenceRange": "Normal: 18.5-24.9, Overweight: 25-29.9, Obese: ≥30",
            "helpText": "Automatically calculated from height and weight",
            "section": "physical"
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
                "fields": ["gender", "date_of_birth", "age_at_consent", "ethnicity", "race"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "physical",
                "title": "Physical Measurements", 
                "description": "Height, weight, and calculated BMI",
                "fields": ["height", "weight", "bmi"],
                "layout": {"columns": 3, "style": "inline"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    'demographics,baseline,mandatory,ICH-GCP',
    0,
    1,
    NOW()
);

-- 2. Adverse Events Template
INSERT INTO form_templates (
    template_id, name, description, category, version, status, 
    fields, structure, tags, usage_count, created_by, created_at
) VALUES (
    'SAF-001',
    'Adverse Event Report',
    'Standardized adverse event reporting form compliant with ICH-GCP guidelines and regulatory requirements for comprehensive safety data collection and analysis.',
    'Safety',
    '1.0',
    'PUBLISHED',
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
            "id": "start_date",
            "type": "datetime",
            "label": "AE Start Date/Time",
            "required": true,
            "helpText": "Date and time when adverse event first occurred or was noticed",
            "section": "timeline"
        },
        {
            "id": "end_date",
            "type": "datetime",
            "label": "AE End Date/Time",
            "required": false,
            "helpText": "Date and time when adverse event resolved or ended (leave blank if ongoing)",
            "section": "timeline"
        },
        {
            "id": "ongoing",
            "type": "checkbox",
            "label": "Event Ongoing",
            "helpText": "Check if adverse event is still ongoing at time of report",
            "section": "timeline"
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
            "id": "seriousness",
            "type": "select",
            "label": "Serious Adverse Event",
            "required": true,
            "options": [
                {"value": "no", "label": "No - Non-serious AE"},
                {"value": "yes", "label": "Yes - Serious Adverse Event (SAE)"}
            ],
            "helpText": "ICH-GCP criteria: death, life-threatening, hospitalization, disability, congenital anomaly, other medically important",
            "section": "assessment"
        },
        {
            "id": "sae_criteria",
            "type": "multiselect",
            "label": "SAE Criteria (if applicable)",
            "required": false,
            "dependsOn": {"field": "seriousness", "value": "yes"},
            "options": [
                {"value": "death", "label": "Results in death"},
                {"value": "life_threatening", "label": "Life-threatening"},
                {"value": "hospitalization", "label": "Requires/prolongs hospitalization"},
                {"value": "disability", "label": "Results in persistent/significant disability"},
                {"value": "congenital_anomaly", "label": "Congenital anomaly/birth defect"},
                {"value": "medically_important", "label": "Other medically important serious event"}
            ],
            "helpText": "Select all applicable SAE criteria",
            "section": "assessment"
        },
        {
            "id": "causality",
            "type": "select",
            "label": "Relationship to Study Treatment",
            "required": true,
            "options": [
                {"value": "unrelated", "label": "Not Related - Clearly not related to study treatment"},
                {"value": "unlikely", "label": "Unlikely Related - Doubtful relationship"},
                {"value": "possible", "label": "Possibly Related - May be related"},
                {"value": "probable", "label": "Probably Related - Likely related"},
                {"value": "definite", "label": "Definitely Related - Clear causal relationship"}
            ],
            "helpText": "Investigator assessment of causal relationship to study medication",
            "section": "assessment"
        },
        {
            "id": "action_taken",
            "type": "select",
            "label": "Action Taken with Study Treatment",
            "required": true,
            "options": [
                {"value": "none", "label": "No action taken"},
                {"value": "dose_reduced", "label": "Study treatment dose reduced"},
                {"value": "temporarily_stopped", "label": "Study treatment temporarily stopped"},
                {"value": "permanently_stopped", "label": "Study treatment permanently discontinued"},
                {"value": "not_applicable", "label": "Not applicable"}
            ],
            "helpText": "Action taken regarding study medication as result of this adverse event",
            "section": "actions"
        },
        {
            "id": "outcome",
            "type": "select",
            "label": "Outcome",
            "required": true,
            "options": [
                {"value": "recovered", "label": "Recovered/Resolved"},
                {"value": "recovering", "label": "Recovering/Resolving"},
                {"value": "not_recovered", "label": "Not Recovered"},
                {"value": "recovered_sequelae", "label": "Recovered with sequelae"},
                {"value": "fatal", "label": "Fatal"},
                {"value": "unknown", "label": "Unknown"}
            ],
            "helpText": "Current outcome status of the adverse event",
            "section": "outcome"
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
                "id": "timeline",
                "title": "Timeline",
                "description": "Event timing information",
                "fields": ["start_date", "end_date", "ongoing"],
                "layout": {"columns": 3, "style": "inline"}
            },
            {
                "id": "assessment",
                "title": "Clinical Assessment",
                "description": "Severity and seriousness assessment",
                "fields": ["severity", "seriousness", "sae_criteria", "causality"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "actions",
                "title": "Actions & Outcome",
                "description": "Treatment actions and final outcome",
                "fields": ["action_taken", "outcome"],
                "layout": {"columns": 2, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    'safety,adverse events,SAE,ICH-GCP,regulatory',
    0,
    1,
    NOW()
);

-- 3. Laboratory Results Template
INSERT INTO form_templates (
    template_id, name, description, category, version, status, 
    fields, structure, tags, usage_count, created_by, created_at
) VALUES (
    'LAB-001',
    'Laboratory Results - Hematology & Chemistry',
    'Comprehensive laboratory data collection form for hematology, clinical chemistry, and basic metabolic panels commonly required in clinical trials for safety monitoring and efficacy assessment.',
    'Laboratory',
    '1.0',
    'PUBLISHED',
    '[
        {
            "id": "collection_date",
            "type": "datetime",
            "label": "Sample Collection Date/Time",
            "required": true,
            "helpText": "Date and time when blood sample was collected",
            "section": "sample_info"
        },
        {
            "id": "fasting_status",
            "type": "select",
            "label": "Fasting Status",
            "required": true,
            "options": [
                {"value": "fasting", "label": "Fasting (≥8 hours)"},
                {"value": "non_fasting", "label": "Non-fasting"},
                {"value": "unknown", "label": "Unknown"}
            ],
            "helpText": "Patient fasting status at time of sample collection",
            "section": "sample_info"
        },
        {
            "id": "hemoglobin",
            "type": "number",
            "label": "Hemoglobin",
            "required": true,
            "min": 5,
            "max": 25,
            "step": 0.1,
            "unit": "g/dL",
            "referenceRange": "Male: 14.0-17.5 g/dL, Female: 12.3-15.3 g/dL",
            "helpText": "Hemoglobin concentration in grams per deciliter",
            "section": "hematology"
        },
        {
            "id": "hematocrit",
            "type": "number",
            "label": "Hematocrit",
            "required": true,
            "min": 15,
            "max": 65,
            "step": 0.1,
            "unit": "%",
            "referenceRange": "Male: 41.0-50.0%, Female: 36.0-44.0%",
            "helpText": "Hematocrit percentage",
            "section": "hematology"
        },
        {
            "id": "wbc_count",
            "type": "number",
            "label": "White Blood Cell Count",
            "required": true,
            "min": 0.1,
            "max": 50,
            "step": 0.01,
            "unit": "×10³/μL",
            "referenceRange": "4.5-11.0 ×10³/μL",
            "helpText": "Total white blood cell count",
            "section": "hematology"
        },
        {
            "id": "platelet_count",
            "type": "number",
            "label": "Platelet Count",
            "required": true,
            "min": 10,
            "max": 2000,
            "step": 1,
            "unit": "×10³/μL",
            "referenceRange": "150-450 ×10³/μL",
            "helpText": "Platelet count",
            "section": "hematology"
        },
        {
            "id": "glucose",
            "type": "number",
            "label": "Glucose",
            "required": true,
            "min": 20,
            "max": 800,
            "step": 1,
            "unit": "mg/dL",
            "referenceRange": "Fasting: 70-100 mg/dL, Random: <200 mg/dL",
            "helpText": "Serum or plasma glucose level",
            "section": "chemistry"
        },
        {
            "id": "creatinine",
            "type": "number",
            "label": "Serum Creatinine",
            "required": true,
            "min": 0.1,
            "max": 15,
            "step": 0.01,
            "unit": "mg/dL",
            "referenceRange": "Male: 0.74-1.35 mg/dL, Female: 0.59-1.04 mg/dL",
            "helpText": "Serum creatinine concentration",
            "section": "chemistry"
        },
        {
            "id": "bun",
            "type": "number",
            "label": "Blood Urea Nitrogen (BUN)",
            "required": true,
            "min": 1,
            "max": 200,
            "step": 1,
            "unit": "mg/dL",
            "referenceRange": "6-24 mg/dL",
            "helpText": "Blood urea nitrogen level",
            "section": "chemistry"
        },
        {
            "id": "alt",
            "type": "number",
            "label": "ALT (SGPT)",
            "required": true,
            "min": 1,
            "max": 2000,
            "step": 1,
            "unit": "U/L",
            "referenceRange": "Male: 10-40 U/L, Female: 7-35 U/L",
            "helpText": "Alanine aminotransferase level",
            "section": "chemistry"
        },
        {
            "id": "ast",
            "type": "number",
            "label": "AST (SGOT)",
            "required": true,
            "min": 1,
            "max": 2000,
            "step": 1,
            "unit": "U/L",
            "referenceRange": "Male: 10-40 U/L, Female: 9-32 U/L",
            "helpText": "Aspartate aminotransferase level",
            "section": "chemistry"
        },
        {
            "id": "total_bilirubin",
            "type": "number",
            "label": "Total Bilirubin",
            "required": true,
            "min": 0.1,
            "max": 50,
            "step": 0.1,
            "unit": "mg/dL",
            "referenceRange": "0.3-1.2 mg/dL",
            "helpText": "Total bilirubin concentration",
            "section": "chemistry"
        }
    ]',
    '{
        "sections": [
            {
                "id": "sample_info",
                "title": "Sample Information",
                "description": "Collection details and conditions",
                "fields": ["collection_date", "fasting_status"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "hematology",
                "title": "Hematology",
                "description": "Complete blood count parameters",
                "fields": ["hemoglobin", "hematocrit", "wbc_count", "platelet_count"],
                "layout": {"columns": 2, "style": "grid"}
            },
            {
                "id": "chemistry",
                "title": "Clinical Chemistry",
                "description": "Basic metabolic panel and liver function",
                "fields": ["glucose", "creatinine", "bun", "alt", "ast", "total_bilirubin"],
                "layout": {"columns": 3, "style": "grid"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    'laboratory,hematology,chemistry,safety,monitoring',
    0,
    1,
    NOW()
);

-- 4. Vital Signs Template
INSERT INTO form_templates (
    template_id, name, description, category, version, status, 
    fields, structure, tags, usage_count, created_by, created_at
) VALUES (
    'VIT-001',
    'Vital Signs Assessment',
    'Standard vital signs measurement form for comprehensive cardiovascular and physiological monitoring in clinical trials, including blood pressure, heart rate, temperature, and respiratory rate assessments.',
    'Vital Signs',
    '1.0',
    'PUBLISHED',
    '[
        {
            "id": "assessment_date",
            "type": "datetime",
            "label": "Assessment Date/Time",
            "required": true,
            "helpText": "Date and time when vital signs were measured",
            "section": "timing"
        },
        {
            "id": "position",
            "type": "select",
            "label": "Patient Position",
            "required": true,
            "options": [
                {"value": "supine", "label": "Supine"},
                {"value": "sitting", "label": "Sitting"},
                {"value": "standing", "label": "Standing"},
                {"value": "semi_fowler", "label": "Semi-Fowler"}
            ],
            "helpText": "Patient position during vital signs measurement",
            "section": "conditions"
        },
        {
            "id": "rest_period",
            "type": "number",
            "label": "Rest Period (minutes)",
            "required": true,
            "min": 0,
            "max": 60,
            "unit": "minutes",
            "helpText": "Number of minutes patient rested in position before measurement",
            "section": "conditions"
        },
        {
            "id": "systolic_bp",
            "type": "number",
            "label": "Systolic Blood Pressure",
            "required": true,
            "min": 50,
            "max": 300,
            "unit": "mmHg",
            "referenceRange": "Normal: <120 mmHg",
            "helpText": "Systolic blood pressure in mmHg",
            "section": "blood_pressure"
        },
        {
            "id": "diastolic_bp",
            "type": "number",
            "label": "Diastolic Blood Pressure",
            "required": true,
            "min": 30,
            "max": 200,
            "unit": "mmHg",
            "referenceRange": "Normal: <80 mmHg",
            "helpText": "Diastolic blood pressure in mmHg",
            "section": "blood_pressure"
        },
        {
            "id": "heart_rate",
            "type": "number",
            "label": "Heart Rate",
            "required": true,
            "min": 30,
            "max": 250,
            "unit": "bpm",
            "referenceRange": "Adult: 60-100 bpm",
            "helpText": "Heart rate in beats per minute",
            "section": "cardiac"
        },
        {
            "id": "temperature",
            "type": "number",
            "label": "Body Temperature",
            "required": true,
            "min": 32,
            "max": 45,
            "step": 0.1,
            "unit": "°C",
            "referenceRange": "Normal: 36.1-37.2°C (97-99°F)",
            "helpText": "Core body temperature in Celsius",
            "section": "general"
        },
        {
            "id": "temperature_route",
            "type": "select",
            "label": "Temperature Route",
            "required": true,
            "options": [
                {"value": "oral", "label": "Oral"},
                {"value": "axillary", "label": "Axillary"},
                {"value": "tympanic", "label": "Tympanic"},
                {"value": "temporal", "label": "Temporal"},
                {"value": "rectal", "label": "Rectal"}
            ],
            "helpText": "Method used to measure body temperature",
            "section": "general"
        },
        {
            "id": "respiratory_rate",
            "type": "number",
            "label": "Respiratory Rate",
            "required": true,
            "min": 8,
            "max": 60,
            "unit": "breaths/min",
            "referenceRange": "Adult: 12-20 breaths/min",
            "helpText": "Respiratory rate in breaths per minute",
            "section": "respiratory"
        },
        {
            "id": "oxygen_saturation",
            "type": "number",
            "label": "Oxygen Saturation",
            "required": false,
            "min": 70,
            "max": 100,
            "unit": "%",
            "referenceRange": "Normal: ≥95%",
            "helpText": "Pulse oximetry oxygen saturation percentage",
            "section": "respiratory"
        }
    ]',
    '{
        "sections": [
            {
                "id": "timing",
                "title": "Assessment Details",
                "description": "When and how measurements were taken",
                "fields": ["assessment_date"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "conditions",
                "title": "Measurement Conditions",
                "description": "Patient position and preparation",
                "fields": ["position", "rest_period"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "blood_pressure",
                "title": "Blood Pressure",
                "description": "Systolic and diastolic measurements",
                "fields": ["systolic_bp", "diastolic_bp"],
                "layout": {"columns": 2, "style": "inline"}
            },
            {
                "id": "cardiac",
                "title": "Heart Rate",
                "description": "Cardiac measurements",
                "fields": ["heart_rate"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "general",
                "title": "Temperature",
                "description": "Body temperature and measurement method",
                "fields": ["temperature", "temperature_route"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "respiratory",
                "title": "Respiratory",
                "description": "Breathing rate and oxygen saturation",
                "fields": ["respiratory_rate", "oxygen_saturation"],
                "layout": {"columns": 2, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    'vital signs,blood pressure,cardiovascular,monitoring',
    0,
    1,
    NOW()
);

-- 5. Medical History Template
INSERT INTO form_templates (
    template_id, name, description, category, version, status, 
    fields, structure, tags, usage_count, created_by, created_at
) VALUES (
    'MED-001',
    'Medical History & Background',
    'Comprehensive medical history collection form capturing relevant past medical history, surgical procedures, family history, and social history information critical for clinical trial participant assessment.',
    'Medical History',
    '1.0',
    'PUBLISHED',
    '[
        {
            "id": "primary_indication",
            "type": "text",
            "label": "Primary Medical Condition",
            "required": true,
            "maxLength": 200,
            "helpText": "Primary medical condition or indication for study participation",
            "section": "primary_condition"
        },
        {
            "id": "diagnosis_date",
            "type": "date",
            "label": "Date of Initial Diagnosis",
            "required": true,
            "helpText": "Date when primary condition was first diagnosed",
            "section": "primary_condition"
        },
        {
            "id": "previous_treatments",
            "type": "textarea",
            "label": "Previous Treatments",
            "required": false,
            "maxLength": 1000,
            "rows": 4,
            "helpText": "List all previous treatments for the primary condition including medications, procedures, and therapies",
            "section": "primary_condition"
        },
        {
            "id": "significant_medical_history",
            "type": "multiselect",
            "label": "Significant Medical History",
            "required": false,
            "options": [
                {"value": "cardiovascular", "label": "Cardiovascular Disease"},
                {"value": "diabetes", "label": "Diabetes Mellitus"},
                {"value": "hypertension", "label": "Hypertension"},
                {"value": "respiratory", "label": "Respiratory Disease"},
                {"value": "renal", "label": "Kidney Disease"},
                {"value": "hepatic", "label": "Liver Disease"},
                {"value": "neurological", "label": "Neurological Disorders"},
                {"value": "psychiatric", "label": "Psychiatric Conditions"},
                {"value": "cancer", "label": "Cancer/Malignancy"},
                {"value": "autoimmune", "label": "Autoimmune Disorders"},
                {"value": "endocrine", "label": "Endocrine Disorders"},
                {"value": "none", "label": "No Significant History"}
            ],
            "helpText": "Select all applicable significant medical conditions from patient history",
            "section": "past_history"
        },
        {
            "id": "surgical_history",
            "type": "textarea",
            "label": "Surgical History",
            "required": false,
            "maxLength": 1000,
            "rows": 3,
            "helpText": "List all previous surgical procedures with approximate dates",
            "section": "past_history"
        },
        {
            "id": "allergies",
            "type": "textarea",
            "label": "Allergies & Adverse Drug Reactions",
            "required": false,
            "maxLength": 500,
            "rows": 3,
            "helpText": "List all known allergies and adverse drug reactions including severity",
            "section": "allergies"
        },
        {
            "id": "no_known_allergies",
            "type": "checkbox",
            "label": "No Known Allergies",
            "helpText": "Check if patient has no known allergies or adverse drug reactions",
            "section": "allergies"
        },
        {
            "id": "family_history",
            "type": "multiselect",
            "label": "Significant Family History",
            "required": false,
            "options": [
                {"value": "heart_disease", "label": "Heart Disease"},
                {"value": "cancer", "label": "Cancer"},
                {"value": "diabetes", "label": "Diabetes"},
                {"value": "stroke", "label": "Stroke"},
                {"value": "mental_illness", "label": "Mental Illness"},
                {"value": "genetic_disorders", "label": "Genetic Disorders"},
                {"value": "none_significant", "label": "No Significant Family History"}
            ],
            "helpText": "Select applicable conditions with family history",
            "section": "family_history"
        },
        {
            "id": "smoking_status",
            "type": "select",
            "label": "Smoking Status",
            "required": true,
            "options": [
                {"value": "never", "label": "Never Smoked"},
                {"value": "current", "label": "Current Smoker"},
                {"value": "former", "label": "Former Smoker"},
                {"value": "unknown", "label": "Unknown"}
            ],
            "helpText": "Current smoking status",
            "section": "social_history"
        },
        {
            "id": "pack_years",
            "type": "number",
            "label": "Pack Years",
            "required": false,
            "dependsOn": {"field": "smoking_status", "value": ["current", "former"]},
            "min": 0,
            "max": 200,
            "step": 0.5,
            "helpText": "Total pack-years of smoking (packs per day × years smoked)",
            "section": "social_history"
        },
        {
            "id": "alcohol_use",
            "type": "select",
            "label": "Alcohol Use",
            "required": true,
            "options": [
                {"value": "none", "label": "No Alcohol Use"},
                {"value": "occasional", "label": "Occasional (1-7 drinks/week)"},
                {"value": "moderate", "label": "Moderate (8-14 drinks/week)"},
                {"value": "heavy", "label": "Heavy (>14 drinks/week)"},
                {"value": "unknown", "label": "Unknown"}
            ],
            "helpText": "Current alcohol consumption pattern",
            "section": "social_history"
        }
    ]',
    '{
        "sections": [
            {
                "id": "primary_condition",
                "title": "Primary Medical Condition",
                "description": "Main condition for study participation",
                "fields": ["primary_indication", "diagnosis_date", "previous_treatments"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "past_history",
                "title": "Past Medical History",
                "description": "Significant medical and surgical history",
                "fields": ["significant_medical_history", "surgical_history"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "allergies",
                "title": "Allergies",
                "description": "Known allergies and adverse reactions",
                "fields": ["allergies", "no_known_allergies"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "family_history",
                "title": "Family History",
                "description": "Relevant family medical history",
                "fields": ["family_history"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "social_history",
                "title": "Social History",
                "description": "Smoking and alcohol use patterns",
                "fields": ["smoking_status", "pack_years", "alcohol_use"],
                "layout": {"columns": 3, "style": "inline"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    'medical history,baseline,past history,family history,social history',
    0,
    1,
    NOW()
);

-- 6. Physical Examination Template
INSERT INTO form_templates (
    template_id, name, description, category, version, status, 
    fields, structure, tags, usage_count, created_by, created_at
) VALUES (
    'PE-001',
    'Physical Examination',
    'Comprehensive physical examination form for systematic clinical assessment covering all major organ systems and providing structured documentation for clinical trial baseline and follow-up evaluations.',
    'Physical Exam',
    '1.0',
    'PUBLISHED',
    '[
        {
            "id": "exam_date",
            "type": "datetime",
            "label": "Examination Date/Time",
            "required": true,
            "helpText": "Date and time when physical examination was performed",
            "section": "general"
        },
        {
            "id": "general_appearance",
            "type": "select",
            "label": "General Appearance",
            "required": true,
            "options": [
                {"value": "normal", "label": "Normal - Well-appearing"},
                {"value": "mild_distress", "label": "Mild Distress"},
                {"value": "moderate_distress", "label": "Moderate Distress"},
                {"value": "severe_distress", "label": "Severe Distress"},
                {"value": "chronic_illness", "label": "Chronically Ill Appearing"}
            ],
            "helpText": "Overall general appearance and level of distress",
            "section": "general"
        },
        {
            "id": "heent",
            "type": "select",
            "label": "HEENT (Head, Eyes, Ears, Nose, Throat)",
            "required": true,
            "options": [
                {"value": "normal", "label": "Normal"},
                {"value": "abnormal", "label": "Abnormal - See Comments"},
                {"value": "not_examined", "label": "Not Examined"}
            ],
            "helpText": "Head, eyes, ears, nose, and throat examination findings",
            "section": "systems"
        },
        {
            "id": "heent_comments",
            "type": "textarea",
            "label": "HEENT Comments",
            "required": false,
            "dependsOn": {"field": "heent", "value": "abnormal"},
            "maxLength": 500,
            "rows": 2,
            "helpText": "Describe abnormal HEENT findings",
            "section": "systems"
        },
        {
            "id": "cardiovascular",
            "type": "select",
            "label": "Cardiovascular",
            "required": true,
            "options": [
                {"value": "normal", "label": "Normal"},
                {"value": "abnormal", "label": "Abnormal - See Comments"},
                {"value": "not_examined", "label": "Not Examined"}
            ],
            "helpText": "Cardiovascular system examination findings",
            "section": "systems"
        },
        {
            "id": "cardiovascular_comments",
            "type": "textarea",
            "label": "Cardiovascular Comments",
            "required": false,
            "dependsOn": {"field": "cardiovascular", "value": "abnormal"},
            "maxLength": 500,
            "rows": 2,
            "helpText": "Describe abnormal cardiovascular findings",
            "section": "systems"
        },
        {
            "id": "respiratory",
            "type": "select",
            "label": "Respiratory",
            "required": true,
            "options": [
                {"value": "normal", "label": "Normal"},
                {"value": "abnormal", "label": "Abnormal - See Comments"},
                {"value": "not_examined", "label": "Not Examined"}
            ],
            "helpText": "Respiratory system examination findings",
            "section": "systems"
        },
        {
            "id": "respiratory_comments",
            "type": "textarea",
            "label": "Respiratory Comments",
            "required": false,
            "dependsOn": {"field": "respiratory", "value": "abnormal"},
            "maxLength": 500,
            "rows": 2,
            "helpText": "Describe abnormal respiratory findings",
            "section": "systems"
        },
        {
            "id": "abdomen",
            "type": "select",
            "label": "Abdomen",
            "required": true,
            "options": [
                {"value": "normal", "label": "Normal"},
                {"value": "abnormal", "label": "Abnormal - See Comments"},
                {"value": "not_examined", "label": "Not Examined"}
            ],
            "helpText": "Abdominal examination findings",
            "section": "systems"
        },
        {
            "id": "abdomen_comments",
            "type": "textarea",
            "label": "Abdomen Comments",
            "required": false,
            "dependsOn": {"field": "abdomen", "value": "abnormal"},
            "maxLength": 500,
            "rows": 2,
            "helpText": "Describe abnormal abdominal findings",
            "section": "systems"
        },
        {
            "id": "neurological",
            "type": "select",
            "label": "Neurological",
            "required": true,
            "options": [
                {"value": "normal", "label": "Normal"},
                {"value": "abnormal", "label": "Abnormal - See Comments"},
                {"value": "not_examined", "label": "Not Examined"}
            ],
            "helpText": "Neurological system examination findings",
            "section": "systems"
        },
        {
            "id": "neurological_comments",
            "type": "textarea",
            "label": "Neurological Comments",
            "required": false,
            "dependsOn": {"field": "neurological", "value": "abnormal"},
            "maxLength": 500,
            "rows": 2,
            "helpText": "Describe abnormal neurological findings",
            "section": "systems"
        },
        {
            "id": "extremities",
            "type": "select",
            "label": "Extremities",
            "required": true,
            "options": [
                {"value": "normal", "label": "Normal"},
                {"value": "abnormal", "label": "Abnormal - See Comments"},
                {"value": "not_examined", "label": "Not Examined"}
            ],
            "helpText": "Extremities examination findings",
            "section": "systems"
        },
        {
            "id": "extremities_comments",
            "type": "textarea",
            "label": "Extremities Comments",
            "required": false,
            "dependsOn": {"field": "extremities", "value": "abnormal"},
            "maxLength": 500,
            "rows": 2,
            "helpText": "Describe abnormal extremities findings",
            "section": "systems"
        },
        {
            "id": "skin",
            "type": "select",
            "label": "Skin",
            "required": true,
            "options": [
                {"value": "normal", "label": "Normal"},
                {"value": "abnormal", "label": "Abnormal - See Comments"},
                {"value": "not_examined", "label": "Not Examined"}
            ],
            "helpText": "Skin and integumentary system findings",
            "section": "systems"
        },
        {
            "id": "skin_comments",
            "type": "textarea",
            "label": "Skin Comments",
            "required": false,
            "dependsOn": {"field": "skin", "value": "abnormal"},
            "maxLength": 500,
            "rows": 2,
            "helpText": "Describe abnormal skin findings",
            "section": "systems"
        },
        {
            "id": "overall_assessment",
            "type": "textarea",
            "label": "Overall Clinical Assessment",
            "required": false,
            "maxLength": 1000,
            "rows": 3,
            "helpText": "Summary of overall physical examination findings and clinical impressions",
            "section": "assessment"
        }
    ]',
    '{
        "sections": [
            {
                "id": "general",
                "title": "General Assessment",
                "description": "Overall appearance and vital signs",
                "fields": ["exam_date", "general_appearance"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "systems",
                "title": "Systems Review",
                "description": "Systematic examination of organ systems",
                "fields": ["heent", "heent_comments", "cardiovascular", "cardiovascular_comments", "respiratory", "respiratory_comments", "abdomen", "abdomen_comments", "neurological", "neurological_comments", "extremities", "extremities_comments", "skin", "skin_comments"],
                "layout": {"columns": 2, "style": "paired"}
            },
            {
                "id": "assessment",
                "title": "Clinical Assessment",
                "description": "Overall clinical impression and summary",
                "fields": ["overall_assessment"],
                "layout": {"columns": 1, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    'physical examination,clinical assessment,baseline,organ systems',
    0,
    1,
    NOW()
);

-- 7. Concomitant Medications Template
INSERT INTO form_templates (
    template_id, name, description, category, version, status, 
    fields, structure, tags, usage_count, created_by, created_at
) VALUES (
    'MED-002',
    'Concomitant Medications',
    'Comprehensive medication history and concurrent therapy documentation form for tracking all medications, supplements, and treatments used during clinical trial participation for drug interaction assessment.',
    'Medications',
    '1.0',
    'PUBLISHED',
    '[
        {
            "id": "medication_name",
            "type": "text",
            "label": "Medication Name",
            "required": true,
            "maxLength": 200,
            "helpText": "Generic or brand name of the medication (include strength if part of name)",
            "section": "medication_info"
        },
        {
            "id": "active_ingredient",
            "type": "text",
            "label": "Active Ingredient",
            "required": false,
            "maxLength": 200,
            "helpText": "Active pharmaceutical ingredient (generic name preferred)",
            "section": "medication_info"
        },
        {
            "id": "indication",
            "type": "text",
            "label": "Indication",
            "required": true,
            "maxLength": 200,
            "helpText": "Medical condition or reason for taking this medication",
            "section": "medication_info"
        },
        {
            "id": "dose",
            "type": "text",
            "label": "Dose",
            "required": true,
            "maxLength": 50,
            "helpText": "Dose per administration (e.g., 10 mg, 5 mL, 1 tablet)",
            "section": "dosing"
        },
        {
            "id": "dose_unit",
            "type": "select",
            "label": "Dose Unit",
            "required": true,
            "options": [
                {"value": "mg", "label": "mg"},
                {"value": "mcg", "label": "mcg"},
                {"value": "g", "label": "g"},
                {"value": "mL", "label": "mL"},
                {"value": "L", "label": "L"},
                {"value": "tablet", "label": "tablet(s)"},
                {"value": "capsule", "label": "capsule(s)"},
                {"value": "unit", "label": "unit(s)"},
                {"value": "drop", "label": "drop(s)"},
                {"value": "spray", "label": "spray(s)"},
                {"value": "patch", "label": "patch(es)"},
                {"value": "other", "label": "Other"}
            ],
            "helpText": "Unit of measurement for the dose",
            "section": "dosing"
        },
        {
            "id": "frequency",
            "type": "select",
            "label": "Frequency",
            "required": true,
            "options": [
                {"value": "once_daily", "label": "Once daily (QD)"},
                {"value": "twice_daily", "label": "Twice daily (BID)"},
                {"value": "three_times_daily", "label": "Three times daily (TID)"},
                {"value": "four_times_daily", "label": "Four times daily (QID)"},
                {"value": "every_other_day", "label": "Every other day"},
                {"value": "weekly", "label": "Weekly"},
                {"value": "as_needed", "label": "As needed (PRN)"},
                {"value": "other", "label": "Other - See Comments"}
            ],
            "helpText": "How often the medication is taken",
            "section": "dosing"
        },
        {
            "id": "route",
            "type": "select",
            "label": "Route of Administration",
            "required": true,
            "options": [
                {"value": "oral", "label": "Oral (PO)"},
                {"value": "intravenous", "label": "Intravenous (IV)"},
                {"value": "intramuscular", "label": "Intramuscular (IM)"},
                {"value": "subcutaneous", "label": "Subcutaneous (SC)"},
                {"value": "topical", "label": "Topical"},
                {"value": "inhaled", "label": "Inhaled"},
                {"value": "nasal", "label": "Nasal"},
                {"value": "ophthalmic", "label": "Ophthalmic"},
                {"value": "otic", "label": "Otic"},
                {"value": "rectal", "label": "Rectal"},
                {"value": "transdermal", "label": "Transdermal"},
                {"value": "other", "label": "Other"}
            ],
            "helpText": "Route by which medication is administered",
            "section": "administration"
        },
        {
            "id": "start_date",
            "type": "date",
            "label": "Start Date",
            "required": true,
            "helpText": "Date when medication was first started",
            "section": "timeline"
        },
        {
            "id": "end_date",
            "type": "date",
            "label": "End Date",
            "required": false,
            "helpText": "Date when medication was stopped (leave blank if ongoing)",
            "section": "timeline"
        },
        {
            "id": "ongoing",
            "type": "checkbox",
            "label": "Ongoing",
            "helpText": "Check if medication is still being taken",
            "section": "timeline"
        },
        {
            "id": "prescription_status",
            "type": "select",
            "label": "Prescription Status",
            "required": true,
            "options": [
                {"value": "prescription", "label": "Prescription Medication"},
                {"value": "otc", "label": "Over-the-Counter (OTC)"},
                {"value": "supplement", "label": "Dietary Supplement"},
                {"value": "herbal", "label": "Herbal/Natural Product"},
                {"value": "medical_device", "label": "Medical Device"}
            ],
            "helpText": "Classification of the medication or product",
            "section": "classification"
        },
        {
            "id": "prescriber",
            "type": "text",
            "label": "Prescribing Physician",
            "required": false,
            "maxLength": 100,
            "helpText": "Name of physician who prescribed the medication",
            "section": "prescriber_info"
        },
        {
            "id": "comments",
            "type": "textarea",
            "label": "Comments",
            "required": false,
            "maxLength": 500,
            "rows": 3,
            "helpText": "Additional comments about the medication, dosing adjustments, or special instructions",
            "section": "additional_info"
        }
    ]',
    '{
        "sections": [
            {
                "id": "medication_info",
                "title": "Medication Information",
                "description": "Basic medication details and indication",
                "fields": ["medication_name", "active_ingredient", "indication"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "dosing",
                "title": "Dosing",
                "description": "Dose, frequency, and units",
                "fields": ["dose", "dose_unit", "frequency"],
                "layout": {"columns": 3, "style": "inline"}
            },
            {
                "id": "administration",
                "title": "Route of Administration",
                "description": "How medication is given",
                "fields": ["route"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "timeline",
                "title": "Timeline",
                "description": "Start and end dates",
                "fields": ["start_date", "end_date", "ongoing"],
                "layout": {"columns": 3, "style": "inline"}
            },
            {
                "id": "classification",
                "title": "Classification",
                "description": "Type of medication or product",
                "fields": ["prescription_status"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "prescriber_info",
                "title": "Prescriber Information",
                "description": "Prescribing physician details",
                "fields": ["prescriber"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "additional_info",
                "title": "Additional Information",
                "description": "Comments and special notes",
                "fields": ["comments"],
                "layout": {"columns": 1, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    'medications,concomitant,drug interactions,concurrent therapy',
    0,
    1,
    NOW()
);

-- 8. Efficacy Assessment Template
INSERT INTO form_templates (
    template_id, name, description, category, version, status, 
    fields, structure, tags, usage_count, created_by, created_at
) VALUES (
    'EFF-001',
    'Clinical Efficacy Assessment',
    'Standardized efficacy evaluation form for measuring primary and secondary endpoints in clinical trials, including symptom scores, functional assessments, and objective clinical measurements.',
    'Efficacy',
    '1.0',
    'PUBLISHED',
    '[
        {
            "id": "assessment_date",
            "type": "datetime",
            "label": "Assessment Date/Time",
            "required": true,
            "helpText": "Date and time when efficacy assessment was performed",
            "section": "timing"
        },
        {
            "id": "visit_type",
            "type": "select",
            "label": "Visit Type",
            "required": true,
            "options": [
                {"value": "baseline", "label": "Baseline/Screening"},
                {"value": "week_2", "label": "Week 2"},
                {"value": "week_4", "label": "Week 4"},
                {"value": "week_8", "label": "Week 8"},
                {"value": "week_12", "label": "Week 12"},
                {"value": "week_24", "label": "Week 24"},
                {"value": "unscheduled", "label": "Unscheduled"},
                {"value": "early_termination", "label": "Early Termination"},
                {"value": "end_of_study", "label": "End of Study"}
            ],
            "helpText": "Type of study visit when assessment was performed",
            "section": "timing"
        },
        {
            "id": "primary_endpoint_score",
            "type": "number",
            "label": "Primary Endpoint Score",
            "required": true,
            "min": 0,
            "max": 100,
            "step": 0.1,
            "helpText": "Primary efficacy endpoint measurement (scale 0-100)",
            "section": "primary_endpoints"
        },
        {
            "id": "primary_endpoint_change",
            "type": "calculated",
            "label": "Change from Baseline",
            "formula": "current_score - baseline_score",
            "helpText": "Calculated change from baseline in primary endpoint",
            "section": "primary_endpoints"
        },
        {
            "id": "symptom_severity",
            "type": "select",
            "label": "Overall Symptom Severity",
            "required": true,
            "options": [
                {"value": "none", "label": "None (0)"},
                {"value": "mild", "label": "Mild (1-3)"},
                {"value": "moderate", "label": "Moderate (4-6)"},
                {"value": "severe", "label": "Severe (7-9)"},
                {"value": "very_severe", "label": "Very Severe (10)"}
            ],
            "helpText": "Overall severity of target symptoms",
            "section": "symptoms"
        },
        {
            "id": "functional_status",
            "type": "select",
            "label": "Functional Status",
            "required": true,
            "options": [
                {"value": "normal", "label": "Normal Activity"},
                {"value": "mild_limitation", "label": "Mild Activity Limitation"},
                {"value": "moderate_limitation", "label": "Moderate Activity Limitation"},
                {"value": "severe_limitation", "label": "Severe Activity Limitation"},
                {"value": "unable", "label": "Unable to Perform Activities"}
            ],
            "helpText": "Patient functional status and ability to perform daily activities",
            "section": "functional"
        },
        {
            "id": "quality_of_life",
            "type": "number",
            "label": "Quality of Life Score",
            "required": true,
            "min": 0,
            "max": 10,
            "step": 0.1,
            "helpText": "Overall quality of life score (0 = worst, 10 = best possible)",
            "section": "quality_of_life"
        },
        {
            "id": "patient_global_impression",
            "type": "select",
            "label": "Patient Global Impression of Change",
            "required": true,
            "options": [
                {"value": "very_much_improved", "label": "Very Much Improved"},
                {"value": "much_improved", "label": "Much Improved"},
                {"value": "minimally_improved", "label": "Minimally Improved"},
                {"value": "no_change", "label": "No Change"},
                {"value": "minimally_worse", "label": "Minimally Worse"},
                {"value": "much_worse", "label": "Much Worse"},
                {"value": "very_much_worse", "label": "Very Much Worse"}
            ],
            "helpText": "Patient assessment of overall change since start of treatment",
            "section": "global_assessments"
        },
        {
            "id": "clinician_global_impression",
            "type": "select",
            "label": "Clinician Global Impression of Change",
            "required": true,
            "options": [
                {"value": "very_much_improved", "label": "Very Much Improved"},
                {"value": "much_improved", "label": "Much Improved"},
                {"value": "minimally_improved", "label": "Minimally Improved"},
                {"value": "no_change", "label": "No Change"},
                {"value": "minimally_worse", "label": "Minimally Worse"},
                {"value": "much_worse", "label": "Much Worse"},
                {"value": "very_much_worse", "label": "Very Much Worse"}
            ],
            "helpText": "Clinician assessment of overall change since start of treatment",
            "section": "global_assessments"
        },
        {
            "id": "objective_measurement_1",
            "type": "number",
            "label": "Objective Measurement #1",
            "required": false,
            "step": 0.01,
            "helpText": "First objective clinical measurement (define specific parameter in protocol)",
            "section": "objective_measures"
        },
        {
            "id": "objective_measurement_1_unit",
            "type": "text",
            "label": "Unit for Measurement #1",
            "required": false,
            "maxLength": 20,
            "helpText": "Unit of measurement for objective parameter #1",
            "section": "objective_measures"
        },
        {
            "id": "objective_measurement_2",
            "type": "number",
            "label": "Objective Measurement #2",
            "required": false,
            "step": 0.01,
            "helpText": "Second objective clinical measurement (define specific parameter in protocol)",
            "section": "objective_measures"
        },
        {
            "id": "objective_measurement_2_unit",
            "type": "text",
            "label": "Unit for Measurement #2",
            "required": false,
            "maxLength": 20,
            "helpText": "Unit of measurement for objective parameter #2",
            "section": "objective_measures"
        },
        {
            "id": "response_criteria_met",
            "type": "select",
            "label": "Response Criteria Met",
            "required": true,
            "options": [
                {"value": "complete_response", "label": "Complete Response"},
                {"value": "partial_response", "label": "Partial Response"},
                {"value": "stable_disease", "label": "Stable Disease"},
                {"value": "progressive_disease", "label": "Progressive Disease"},
                {"value": "not_evaluable", "label": "Not Evaluable"}
            ],
            "helpText": "Assessment of response based on predefined study criteria",
            "section": "response"
        },
        {
            "id": "assessment_comments",
            "type": "textarea",
            "label": "Assessment Comments",
            "required": false,
            "maxLength": 1000,
            "rows": 4,
            "helpText": "Additional comments about efficacy assessment, clinical observations, or notable changes",
            "section": "comments"
        }
    ]',
    '{
        "sections": [
            {
                "id": "timing",
                "title": "Assessment Timing",
                "description": "When and why assessment was performed",
                "fields": ["assessment_date", "visit_type"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "primary_endpoints",
                "title": "Primary Endpoints",
                "description": "Main efficacy measurements",
                "fields": ["primary_endpoint_score", "primary_endpoint_change"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "symptoms",
                "title": "Symptom Assessment",
                "description": "Overall symptom severity",
                "fields": ["symptom_severity"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "functional",
                "title": "Functional Status",
                "description": "Patient functional ability",
                "fields": ["functional_status"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "quality_of_life",
                "title": "Quality of Life",
                "description": "Overall quality of life score",
                "fields": ["quality_of_life"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "global_assessments",
                "title": "Global Impressions",
                "description": "Patient and clinician overall assessments",
                "fields": ["patient_global_impression", "clinician_global_impression"],
                "layout": {"columns": 2, "style": "standard"}
            },
            {
                "id": "objective_measures",
                "title": "Objective Measurements",
                "description": "Protocol-specific objective parameters",
                "fields": ["objective_measurement_1", "objective_measurement_1_unit", "objective_measurement_2", "objective_measurement_2_unit"],
                "layout": {"columns": 2, "style": "paired"}
            },
            {
                "id": "response",
                "title": "Response Assessment",
                "description": "Overall response criteria evaluation",
                "fields": ["response_criteria_met"],
                "layout": {"columns": 1, "style": "standard"}
            },
            {
                "id": "comments",
                "title": "Additional Comments",
                "description": "Additional observations and notes",
                "fields": ["assessment_comments"],
                "layout": {"columns": 1, "style": "standard"}
            }
        ],
        "layout": {
            "type": "sections",
            "orientation": "vertical",
            "spacing": "normal"
        }
    }',
    'efficacy,endpoints,clinical response,outcomes,assessment',
    0,
    1,
    NOW()
);

-- Create initial version records for all templates
INSERT INTO form_template_versions (template_id, version, version_notes, fields_snapshot, created_by)
SELECT 
    id,
    version,
    'Initial template version with structure support',
    JSON_OBJECT(
        'fields', fields,
        'structure', structure
    ),
    created_by
FROM form_templates;

-- Summary output
SELECT 
    'Form Templates Created' as summary,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT category ORDER BY category) as categories
FROM form_templates;

SELECT 
    template_id,
    name,
    category,
    status,
    JSON_LENGTH(fields) as field_count,
    created_at
FROM form_templates
ORDER BY category, template_id;