
-- Create the admin user first
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    user_id, 
    encrypted_password, 
    title,
    status, 
    created_at, 
    updated_at
) VALUES (
    'System', 
    'Administrator', 
    'admin@clinprecision.com',
    'admin',
    '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AdmIn',
    'Admin',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

SET @admin_user_id = LAST_INSERT_ID();

INSERT INTO user_types (name, description, code,category) VALUES
('CRA', 'Clinical Research Associate responsible for monitoring trial sites', 'CRA','CRO_USER'),
('Data Manager', 'Responsible for managing clinical trial data','DM','CRO_USER'),
('Principal Investigator', 'Lead investigator at a clinical site','PI','SITE_USER'),
('Clinical Research Coordinator', 'Coordinates clinical trial activities at a site','CRC','CRO_USER'),
('Clinical Data Manager', 'Manages data at the site level','CDM','CRO_USER'),
('Database Administrator', 'Administers the clinical trial database','DBADMIN','SYSTEM_USER'),
('System Administrator', 'Manages the EDC system','SYSADMIN','SYSTEM_USER'),
('Lab Technician', 'Laboratory staff processing trial samples','LABTECH','SITE_USER'),
('Lab Manager', 'Manages laboratory operations','LABMGR','SITE_USER'),
('Patient/Subject', 'Trial participant','SUBJ','SUBJECT_USER'),
('Medical Monitor', 'Provides medical oversight for the trial','MEDMON','CRO_USER'),
('Sponsor Monitor', 'Monitors the trial on behalf of the sponsor','SPONMON','SPONSOR_USER'),
('Statistician', 'Performs statistical analysis of trial data','STAT','CRO_USER'),
('Regulatory Affairs', 'Handles regulatory compliance','REGAFFR','REG_USER'),
('Quality Assurance', 'Ensures quality standards are met','QA','CRO_USER');

-- Insert default roles aligned with BRIDG/CDISC
INSERT INTO roles (name, description, is_system_role) VALUES
('SYSTEM_ADMIN', 'Full system administration rights', TRUE),
('DB_ADMIN', 'Database administration rights', TRUE),
('SPONSOR_ADMIN', 'Sponsor administrator with study oversight', TRUE),
('CRO_ADMIN', 'CRO administrator with delegated study oversight', TRUE),
('SITE_ADMIN', 'Site administrator with site management rights', TRUE),
('PI', 'Principal Investigator role', TRUE),
('SUB_I', 'Sub-investigator role', TRUE),
('CRC', 'Clinical Research Coordinator role', TRUE),
('CRA', 'Clinical Research Associate role', TRUE),
('DATA_MANAGER', 'Data management role', TRUE),
('MEDICAL_MONITOR', 'Medical monitoring role', TRUE),
('LAB_USER', 'Laboratory user role', TRUE),
('PATIENT', 'Patient/subject portal access', TRUE),
('DATA_ENTRY', 'Data entry capabilities', TRUE),
('DATA_REVIEW', 'Data review capabilities', TRUE),
('QUERY_MANAGEMENT', 'Query creation and resolution', TRUE),
('REPORT_VIEWER', 'Report viewing capabilities', TRUE),
('STUDY_BUILDER', 'Study and CRF design capabilities', TRUE);

-- Insert default authorities
INSERT INTO authorities (name) VALUES
('READ_STUDY'),
('CREATE_STUDY'),
('UPDATE_STUDY'),
('DELETE_STUDY'),
('READ_SUBJECT'),
('CREATE_SUBJECT'),
('UPDATE_SUBJECT'),
('DELETE_SUBJECT'),
('READ_FORM'),
('CREATE_FORM'),
('UPDATE_FORM'),
('DELETE_FORM'),
('ENTER_DATA'),
('REVIEW_DATA'),
('SIGN_DATA'),
('LOCK_FORM'),
('UNLOCK_FORM'),
('CREATE_QUERY'),
('ANSWER_QUERY'),
('CLOSE_QUERY'),
('EXPORT_DATA'),
('IMPORT_DATA'),
('ASSIGN_USER'),
('MANAGE_SITE'),
('MANAGE_USER'),
('SYSTEM_CONFIGURATION');

-- Assign authorities to roles (system admin example)
INSERT INTO roles_authorities (roles_id, authorities_id) 
SELECT r.id, a.id FROM roles r, authorities a WHERE r.name = 'SYSTEM_ADMIN' AND a.name IN (
    'READ_STUDY', 'CREATE_STUDY', 'UPDATE_STUDY', 'DELETE_STUDY', 
    'READ_SUBJECT', 'CREATE_SUBJECT', 'UPDATE_SUBJECT', 'DELETE_SUBJECT',
    'READ_FORM', 'CREATE_FORM', 'UPDATE_FORM', 'DELETE_FORM',
    'ENTER_DATA', 'REVIEW_DATA', 'SIGN_DATA', 'LOCK_FORM', 'UNLOCK_FORM',
    'CREATE_QUERY', 'ANSWER_QUERY', 'CLOSE_QUERY', 'EXPORT_DATA', 'IMPORT_DATA',
    'ASSIGN_USER', 'MANAGE_SITE', 'MANAGE_USER', 'SYSTEM_CONFIGURATION'
);

-- Assign system admin role to the admin user
INSERT INTO users_roles (users_id, roles_id)
VALUES (@admin_user_id, (SELECT id FROM roles WHERE name = 'SYSTEM_ADMIN'));

INSERT INTO organization_roles (name, code, description, created_at, updated_at) VALUES
('Sponsor', 'SPONSOR', 'Organization that initiates, manages and/or finances a clinical trial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CRO', 'CRO', 'Contract Research Organization that provides clinical trial services to sponsors', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Site', 'SITE', 'Clinical site where the study is conducted', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vendor', 'VENDOR', 'Service provider for the clinical trial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Laboratory', 'LABORATORY', 'Laboratory for processing trial samples', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Regulatory', 'REGULATORY', 'Regulatory agency or authority', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Statistics', 'STATISTICS', 'Statistics Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Safety', 'SAFETY', 'Safety Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample organizations
INSERT INTO organizations (name, external_id, address_line1, address_line2, city, state, postal_code, country, phone, email, website, status, created_at, updated_at) VALUES
-- Sponsors
('Pharma Global', 'PG12345', '123 Research Drive', 'Suite 400', 'Boston', 'MA', '02110', 'USA', '+1-617-555-1234', 'contact@pharmaglobal.com', 'https://www.pharmaglobal.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BioAdvance Corp', 'BAC7890', '500 Innovation Way', 'Building 3', 'San Francisco', 'CA', '94107', 'USA', '+1-415-555-2345', 'info@bioadvance.com', 'https://www.bioadvance.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- CROs
('Clinical Research Partners', 'CRP4567', '789 Science Park', NULL, 'Princeton', 'NJ', '08540', 'USA', '+1-609-555-3456', 'info@crpartners.com', 'https://www.crpartners.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Global Trial Services', 'GTS2345', '1000 Clinical Boulevard', '15th Floor', 'Durham', 'NC', '27701', 'USA', '+1-919-555-4567', 'contact@globaltrialservices.com', 'https://www.globaltrialservices.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Sites
('City Medical Center', 'CMC8901', '567 Hospital Drive', NULL, 'Chicago', 'IL', '60612', 'USA', '+1-312-555-5678', 'admin@citymedical.org', 'https://www.citymedical.org', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('University Research Hospital', 'URH3456', '200 University Ave', 'Clinical Trials Unit', 'Philadelphia', 'PA', '19104', 'USA', '+1-215-555-6789', 'trials@urh.edu', 'https://www.urh.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Vendors
('LabEquip Supplies', 'LES7654', '321 Industrial Parkway', NULL, 'Atlanta', 'GA', '30318', 'USA', '+1-404-555-7890', 'sales@labequip.com', 'https://www.labequip.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MedTech Solutions', 'MTS4321', '888 Technology Square', 'Suite 500', 'Cambridge', 'MA', '02139', 'USA', '+1-617-555-8901', 'info@medtechsolutions.com', 'https://www.medtechsolutions.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Laboratories
('Central Analysis Labs', 'CAL9876', '444 Science Center', NULL, 'Research Triangle Park', 'NC', '27709', 'USA', '+1-919-555-9012', 'info@centrallabs.com', 'https://www.centrallabs.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Precision Diagnostics',  'PD5432', '777 Biotech Way', 'Building 2', 'San Diego', 'CA', '92121', 'USA', '+1-858-555-0123', 'contact@precisiondiagnostics.com', 'https://www.precisiondiagnostics.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Academic Institutions
('Research University', 'RU1234', '100 Academic Way', 'Research Wing', 'Boston', 'MA', '02115', 'USA', '+1-617-555-4321', 'research@university.edu', 'https://www.university.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Medical College', 'MC5678', '300 College Blvd', NULL, 'New York', 'NY', '10065', 'USA', '+1-212-555-8765', 'info@medcollege.edu', 'https://www.medcollege.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Regulatory Organizations
('Healthcare Regulatory Authority', 'HRA9012', '700 Regulatory Plaza', '20th Floor', 'Washington', 'DC', '20001', 'USA', '+1-202-555-6543', 'contact@healthregauth.gov', 'https://www.healthregauth.gov', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO organization_contacts (
    organization_id, contact_name, title, department, email, phone, is_primary, created_at, updated_at
) VALUES
-- Pharma Global contacts
((SELECT id FROM organizations WHERE external_id = 'PG12345'), 'John Smith', 'Dr.', 'Clinical Operations', 'john.smith@pharmaglobal.com', '+1-617-555-1111', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'PG12345'), 'Sarah Johnson', 'Ms.', 'Regulatory Affairs', 'sarah.johnson@pharmaglobal.com', '+1-617-555-1113', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'PG12345'), 'Robert Chen', 'Mr.', 'Finance', 'robert.chen@pharmaglobal.com', '+1-617-555-1115', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- BioAdvance Corp contacts
((SELECT id FROM organizations WHERE external_id = 'BAC7890'), 'Michael Lee', 'Mr.', 'Research & Development', 'michael.lee@bioadvance.com', '+1-415-555-2222', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'BAC7890'), 'Emily Chen', 'Dr.', 'Clinical Research', 'emily.chen@bioadvance.com', '+1-415-555-2224', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'BAC7890'), 'James Wilson', 'Dr.', 'Medical Affairs', 'james.wilson@bioadvance.com', '+1-415-555-2226', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Clinical Research Partners contacts
((SELECT id FROM organizations WHERE external_id = 'CRP4567'), 'David Wilson', 'Mr.', 'Clinical Operations', 'david.wilson@crpartners.com', '+1-609-555-3333', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'CRP4567'), 'Jennifer Garcia', 'Ms.', 'Data Management', 'jennifer.garcia@crpartners.com', '+1-609-555-3335', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'CRP4567'), 'Thomas Brown', 'Mr.', 'Business Development', 'thomas.brown@crpartners.com', '+1-609-555-3337', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Global Trial Services contacts
((SELECT id FROM organizations WHERE external_id = 'GTS2345'), 'Robert Taylor', 'Dr.', 'Clinical Operations', 'robert.taylor@globaltrialservices.com', '+1-919-555-4444', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'GTS2345'), 'Amanda Brown', 'Ms.', 'Business Development', 'amanda.brown@globaltrialservices.com', '+1-919-555-4446', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'GTS2345'), 'Christopher Lopez', 'Mr.', 'Regulatory Affairs', 'christopher.lopez@globaltrialservices.com', '+1-919-555-4448', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- City Medical Center contacts
((SELECT id FROM organizations WHERE external_id = 'CMC8901'), 'Patricia Martinez', 'Dr.', 'Research Department', 'p.martinez@citymedical.org', '+1-312-555-5679', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'CMC8901'), 'Kevin Anderson', 'Mr.', 'Research Department', 'k.anderson@citymedical.org', '+1-312-555-5681', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- University Research Hospital contacts
((SELECT id FROM organizations WHERE external_id = 'URH3456'), 'Elizabeth Miller', 'Dr.', 'Clinical Trials Unit', 'e.miller@urh.edu', '+1-215-555-6790', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'URH3456'), 'Richard Davis', 'Dr.', 'Oncology Department', 'r.davis@urh.edu', '+1-215-555-6792', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);





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


-- Insert sample studies
-- Study 1: COVID-19 Vaccine Trial
INSERT INTO studies (id, name, description, sponsor, protocol_number, study_phase_id, study_status_id,regulatory_status_id, start_date, end_date, created_by, created_at, updated_at)
VALUES (1, 'COVID-19 Vaccine Trial', 'A randomized controlled trial to evaluate the efficacy of a novel COVID-19 vaccine.', 
        (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'BPI-COVID-001', '1', '1','1', '2024-01-15', '2025-01-15', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Study 2: Diabetes Management Study
INSERT INTO studies (id, name, description, sponsor, protocol_number, study_phase_id, study_status_id,regulatory_status_id, start_date, end_date, created_by, created_at, updated_at)
VALUES (2, 'Diabetes Management Study', 'Evaluating a new approach to diabetes management.', 
        (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'MRG-DM-101', '1', '1','1', '2024-02-01', '2024-12-31', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Study 3: Alzheimer's Disease Intervention Study
INSERT INTO studies (id, name, description, sponsor, protocol_number, study_phase_id, study_status_id,regulatory_status_id, start_date, end_date, created_by, created_at, updated_at)
VALUES (3, 'Alzheimer''s Disease Intervention Study', 'Evaluating a novel therapeutic approach for early-stage Alzheimer''s disease.', 
        (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'NCF-ALZ-202', '1', '1','1', '2024-03-10', '2025-09-30', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Study 4: Rheumatoid Arthritis Comparative Therapy Trial
INSERT INTO studies (id, name, description, sponsor, protocol_number, study_phase_id, study_status_id,regulatory_status_id, start_date, end_date, created_by, created_at, updated_at)
VALUES (4, 'Rheumatoid Arthritis Comparative Therapy Trial', 'A comparative study of three different therapeutic approaches for rheumatoid arthritis.', 
        (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'ACP-RA-301', '1', '1','1','2024-05-01', '2026-04-30', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Study 5: Hypertension Management in Elderly Patients
INSERT INTO studies (id, name, description, sponsor, protocol_number, study_phase_id, study_status_id,regulatory_status_id, start_date, end_date, created_by, created_at, updated_at)
VALUES (5, 'Hypertension Management in Elderly Patients', 'Post-marketing study examining optimal hypertension management strategies in patients over 65.', 
        (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'CHI-HTN-401', '1', '1','1', '2023-11-15', '2024-11-14', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Study 6: Pediatric Asthma Treatment Optimization
INSERT INTO studies (id, name, description, sponsor, protocol_number, study_phase_id, study_status_id,regulatory_status_id, start_date, end_date, created_by, created_at, updated_at)
VALUES (6, 'Pediatric Asthma Treatment Optimization', 'Evaluating the efficacy of a modified treatment protocol in pediatric asthma patients aged 5-12.', 
        (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'RCF-AST-201', '1', '1','1', '2023-01-10', '2023-12-20', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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

-- Add sample users with specific roles
INSERT INTO users (first_name, last_name, email, user_id, encrypted_password, status, organization_id, created_at, updated_at)
VALUES 
('Jane', 'Smith', 'jsmith@biopharm.com', 'jsmith', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd1', 'active', (SELECT id FROM organizations WHERE external_id = 'PG12345'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Robert', 'Johnson', 'rjohnson@medicalresearch.org', 'rjohnson', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd2', 'active', (SELECT id FROM organizations WHERE external_id = 'BAC7890'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Emily', 'Chen', 'echen@neurocare.org', 'echen', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd3', 'active', (SELECT id FROM organizations WHERE external_id = 'PG12345'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Michael', 'Rodriguez', 'mrodriguez@arthricare.com', 'mrodriguez', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd4', 'active', (SELECT id FROM organizations WHERE external_id = 'BAC7890'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sarah', 'Williams', 'swilliams@cardiohealth.org', 'swilliams', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd5', 'active', (SELECT id FROM organizations WHERE external_id = 'PG12345'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('David', 'Lee', 'dlee@respicare.org', 'dlee', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd6', 'active', (SELECT id FROM organizations WHERE external_id = 'BAC7890'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign global roles to users
INSERT INTO users_roles (users_id, roles_id)
VALUES 
((SELECT id FROM users WHERE email = 'jsmith@biopharm.com'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN')),
((SELECT id FROM users WHERE email = 'rjohnson@medicalresearch.org'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN')),
((SELECT id FROM users WHERE email = 'echen@neurocare.org'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN')),
((SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN')),
((SELECT id FROM users WHERE email = 'swilliams@cardiohealth.org'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN')),
((SELECT id FROM users WHERE email = 'dlee@respicare.org'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'));

-- Assign study roles to users
INSERT INTO user_study_roles (user_id, study_id, role_id, start_date)
VALUES
((SELECT id FROM users WHERE email = 'jsmith@biopharm.com'), 1, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2024-01-15'),
((SELECT id FROM users WHERE email = 'rjohnson@medicalresearch.org'), 2, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2024-02-01'),
((SELECT id FROM users WHERE email = 'echen@neurocare.org'), 3, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2024-03-10'),
((SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com'), 4, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2024-05-01'),
((SELECT id FROM users WHERE email = 'swilliams@cardiohealth.org'), 5, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2023-11-15'),
((SELECT id FROM users WHERE email = 'dlee@respicare.org'), 6, (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'), '2023-01-10');

-- Update the studies to set created_by to the corresponding sponsor admin
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'jsmith@biopharm.com') WHERE id = 1;
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'rjohnson@medicalresearch.org') WHERE id = 2;
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'echen@neurocare.org') WHERE id = 3;
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com') WHERE id = 4;
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'swilliams@cardiohealth.org') WHERE id = 5;
UPDATE studies SET created_by = (SELECT id FROM users WHERE email = 'dlee@respicare.org') WHERE id = 6;

-- Add sample sites
INSERT INTO sites (organization_id, site_number, study_id, principal_investigator_id, status, activation_date, deactivation_date, max_subjects, created_at, updated_at)
VALUES
-- Sites for Study 1
(
  (SELECT id FROM organizations WHERE external_id = 'CMC8901'),
  'SITE-001',
  1,
  (SELECT id FROM users WHERE email = 'jsmith@biopharm.com'),
  'active',
  '2024-01-20',
  NULL,
  100,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Sites for Study 3
(
  (SELECT id FROM organizations WHERE external_id = 'URH3456'),
  'SITE-002',
  3,
  (SELECT id FROM users WHERE email = 'echen@neurocare.org'),
  'active',
  '2024-03-15',
  NULL,
  75,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Sites for Study 4
(
  (SELECT id FROM organizations WHERE external_id = 'CMC8901'),
  'SITE-003',
  4,
  (SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com'),
  'active',
  '2024-05-10',
  NULL,
  150,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Add sample subjects for testing
INSERT INTO subjects (protocol_subject_id, study_id, arm_id, enrollment_date, status, created_by)
VALUES
-- Study 1 subjects
('S1-001', 1, 1, '2024-01-20', 'active', (SELECT id FROM users WHERE email = 'jsmith@biopharm.com')),
('S1-002', 1, 1, '2024-01-22', 'active', (SELECT id FROM users WHERE email = 'jsmith@biopharm.com')),
-- Study 3 subjects
('S3-001', 3, 2, '2024-03-15', 'active', (SELECT id FROM users WHERE email = 'echen@neurocare.org')),
('S3-002', 3, 2, '2024-03-17', 'active', (SELECT id FROM users WHERE email = 'echen@neurocare.org')),
('S3-003', 3, 3, '2024-03-20', 'active', (SELECT id FROM users WHERE email = 'echen@neurocare.org')),
-- Study 4 subjects
('S4-001', 4, 4, '2024-05-10', 'active', (SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com')),
('S4-002', 4, 5, '2024-05-12', 'active', (SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com')),
('S4-003', 4, 6, '2024-05-15', 'active', (SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com')),
-- Study 5 subjects
('S5-001', 5, 7, '2023-11-20', 'active', (SELECT id FROM users WHERE email = 'swilliams@cardiohealth.org')),
-- Study 6 subjects
('S6-001', 6, 8, '2023-01-15', 'completed', (SELECT id FROM users WHERE email = 'dlee@respicare.org')),
('S6-002', 6, 9, '2023-01-18', 'completed', (SELECT id FROM users WHERE email = 'dlee@respicare.org'));

-- Schedule visits for subjects
INSERT INTO subject_visits (subject_id, visit_definition_id, scheduled_date, actual_date, status, created_by)
VALUES
-- Study 1 subject visits
(
  (SELECT id FROM subjects WHERE protocol_subject_id = 'S1-001'),
  1,
  '2024-01-21',
  '2024-01-21',
  'completed',
  (SELECT id FROM users WHERE email = 'jsmith@biopharm.com')
),
(
  (SELECT id FROM subjects WHERE protocol_subject_id = 'S1-002'),
  1,
  '2024-01-23',
  '2024-01-23',
  'completed',
  (SELECT id FROM users WHERE email = 'jsmith@biopharm.com')
),
-- Study 3 subject visits (just for the first subject)
(
  (SELECT id FROM subjects WHERE protocol_subject_id = 'S3-001'),
  2,  -- Screening visit
  '2024-03-01',
  '2024-03-01',
  'completed',
  (SELECT id FROM users WHERE email = 'echen@neurocare.org')
),
(
  (SELECT id FROM subjects WHERE protocol_subject_id = 'S3-001'),
  3,  -- Baseline visit
  '2024-03-15',
  '2024-03-15',
  'completed',
  (SELECT id FROM users WHERE email = 'echen@neurocare.org')
),
(
  (SELECT id FROM subjects WHERE protocol_subject_id = 'S3-001'),
  4,  -- Follow-up visit
  '2024-04-14',
  '2024-04-14',
  'completed',
  (SELECT id FROM users WHERE email = 'echen@neurocare.org')
);

