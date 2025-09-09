
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

INSERT INTO organization_types (name, code, description, created_at, updated_at) VALUES
('Sponsor', 'SPONSOR', 'Organization that initiates, manages and/or finances a clinical trial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CRO', 'CRO', 'Contract Research Organization that provides clinical trial services to sponsors', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Site', 'SITE', 'Clinical site where the study is conducted', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vendor', 'VENDOR', 'Service provider for the clinical trial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Laboratory', 'LAB', 'Laboratory for processing trial samples', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Academic', 'ACADEMIC', 'Academic or research institution', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Regulatory', 'REGULATORY', 'Regulatory agency or authority', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hospital', 'HOSPITAL', 'Hospital or healthcare provider', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample organizations
INSERT INTO organizations (name, org_type_id, external_id, address_line1, address_line2, city, state, postal_code, country, phone, email, website, status, created_at, updated_at) VALUES
-- Sponsors
('Pharma Global', (SELECT id FROM organization_types WHERE code = 'SPONSOR'), 'PG12345', '123 Research Drive', 'Suite 400', 'Boston', 'MA', '02110', 'USA', '+1-617-555-1234', 'contact@pharmaglobal.com', 'https://www.pharmaglobal.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BioAdvance Corp', (SELECT id FROM organization_types WHERE code = 'SPONSOR'), 'BAC7890', '500 Innovation Way', 'Building 3', 'San Francisco', 'CA', '94107', 'USA', '+1-415-555-2345', 'info@bioadvance.com', 'https://www.bioadvance.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- CROs
('Clinical Research Partners', (SELECT id FROM organization_types WHERE code = 'CRO'), 'CRP4567', '789 Science Park', NULL, 'Princeton', 'NJ', '08540', 'USA', '+1-609-555-3456', 'info@crpartners.com', 'https://www.crpartners.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Global Trial Services', (SELECT id FROM organization_types WHERE code = 'CRO'), 'GTS2345', '1000 Clinical Boulevard', '15th Floor', 'Durham', 'NC', '27701', 'USA', '+1-919-555-4567', 'contact@globaltrialservices.com', 'https://www.globaltrialservices.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Sites
('City Medical Center', (SELECT id FROM organization_types WHERE code = 'SITE'), 'CMC8901', '567 Hospital Drive', NULL, 'Chicago', 'IL', '60612', 'USA', '+1-312-555-5678', 'admin@citymedical.org', 'https://www.citymedical.org', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('University Research Hospital', (SELECT id FROM organization_types WHERE code = 'SITE'), 'URH3456', '200 University Ave', 'Clinical Trials Unit', 'Philadelphia', 'PA', '19104', 'USA', '+1-215-555-6789', 'trials@urh.edu', 'https://www.urh.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Vendors
('LabEquip Supplies', (SELECT id FROM organization_types WHERE code = 'VENDOR'), 'LES7654', '321 Industrial Parkway', NULL, 'Atlanta', 'GA', '30318', 'USA', '+1-404-555-7890', 'sales@labequip.com', 'https://www.labequip.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MedTech Solutions', (SELECT id FROM organization_types WHERE code = 'VENDOR'), 'MTS4321', '888 Technology Square', 'Suite 500', 'Cambridge', 'MA', '02139', 'USA', '+1-617-555-8901', 'info@medtechsolutions.com', 'https://www.medtechsolutions.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Laboratories
('Central Analysis Labs', (SELECT id FROM organization_types WHERE code = 'LAB'), 'CAL9876', '444 Science Center', NULL, 'Research Triangle Park', 'NC', '27709', 'USA', '+1-919-555-9012', 'info@centrallabs.com', 'https://www.centrallabs.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Precision Diagnostics', (SELECT id FROM organization_types WHERE code = 'LAB'), 'PD5432', '777 Biotech Way', 'Building 2', 'San Diego', 'CA', '92121', 'USA', '+1-858-555-0123', 'contact@precisiondiagnostics.com', 'https://www.precisiondiagnostics.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Academic Institutions
('Research University', (SELECT id FROM organization_types WHERE code = 'ACADEMIC'), 'RU1234', '100 Academic Way', 'Research Wing', 'Boston', 'MA', '02115', 'USA', '+1-617-555-4321', 'research@university.edu', 'https://www.university.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Medical College', (SELECT id FROM organization_types WHERE code = 'ACADEMIC'), 'MC5678', '300 College Blvd', NULL, 'New York', 'NY', '10065', 'USA', '+1-212-555-8765', 'info@medcollege.edu', 'https://www.medcollege.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Regulatory Organizations
('Healthcare Regulatory Authority', (SELECT id FROM organization_types WHERE code = 'REGULATORY'), 'HRA9012', '700 Regulatory Plaza', '20th Floor', 'Washington', 'DC', '20001', 'USA', '+1-202-555-6543', 'contact@healthregauth.gov', 'https://www.healthregauth.gov', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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



-- Insert sample studies
-- Study 1: COVID-19 Vaccine Trial
INSERT INTO studies (id, name, description, sponsor, protocol_number, phase, status, start_date, end_date, created_by, created_at, updated_at)
VALUES (1, 'COVID-19 Vaccine Trial', 'A randomized controlled trial to evaluate the efficacy of a novel COVID-19 vaccine.', 
        (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'BPI-COVID-001', 'Phase 3', 'active', '2024-01-15', '2025-01-15', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Study 2: Diabetes Management Study
INSERT INTO studies (id, name, description, sponsor, protocol_number, phase, status, start_date, end_date, created_by, created_at, updated_at)
VALUES (2, 'Diabetes Management Study', 'Evaluating a new approach to diabetes management.', 
        (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'MRG-DM-101', 'Phase 2', 'active', '2024-02-01', '2024-12-31', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Study 3: Alzheimer's Disease Intervention Study
INSERT INTO studies (id, name, description, sponsor, protocol_number, phase, status, start_date, end_date, created_by, created_at, updated_at)
VALUES (3, 'Alzheimer''s Disease Intervention Study', 'Evaluating a novel therapeutic approach for early-stage Alzheimer''s disease.', 
        (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'NCF-ALZ-202', 'Phase 2', 'active', '2024-03-10', '2025-09-30', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Study 4: Rheumatoid Arthritis Comparative Therapy Trial
INSERT INTO studies (id, name, description, sponsor, protocol_number, phase, status, start_date, end_date, created_by, created_at, updated_at)
VALUES (4, 'Rheumatoid Arthritis Comparative Therapy Trial', 'A comparative study of three different therapeutic approaches for rheumatoid arthritis.', 
        (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'ACP-RA-301', 'Phase 3', 'active', '2024-05-01', '2026-04-30', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Study 5: Hypertension Management in Elderly Patients
INSERT INTO studies (id, name, description, sponsor, protocol_number, phase, status, start_date, end_date, created_by, created_at, updated_at)
VALUES (5, 'Hypertension Management in Elderly Patients', 'Post-marketing study examining optimal hypertension management strategies in patients over 65.', 
        (SELECT name FROM organizations WHERE external_id = 'PG12345'), 'CHI-HTN-401', 'Phase 4', 'active', '2023-11-15', '2024-11-14', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Study 6: Pediatric Asthma Treatment Optimization
INSERT INTO studies (id, name, description, sponsor, protocol_number, phase, status, start_date, end_date, created_by, created_at, updated_at)
VALUES (6, 'Pediatric Asthma Treatment Optimization', 'Evaluating the efficacy of a modified treatment protocol in pediatric asthma patients aged 5-12.', 
        (SELECT name FROM organizations WHERE external_id = 'BAC7890'), 'RCF-AST-201', 'Phase 2', 'completed', '2023-01-10', '2023-12-20', @admin_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create study arms
-- Study 1 arm
INSERT INTO study_arms (id, study_id, name, description) 
VALUES (1, 1, 'Treatment Arm', 'Receives active treatment');

-- Study 3 arms
INSERT INTO study_arms (id, study_id, name, description)
VALUES 
(2, 3, 'High Dose Arm', 'Patients receiving high dose of the investigational product'),
(3, 3, 'Low Dose Arm', 'Patients receiving low dose of the investigational product');

-- Study 4 arms
INSERT INTO study_arms (id, study_id, name, description)
VALUES 
(4, 4, 'Standard of Care', 'Control arm receiving current standard of care'),
(5, 4, 'Experimental Therapy A', 'First experimental treatment arm'),
(6, 4, 'Experimental Therapy B', 'Second experimental treatment arm');

-- Study 5 arm
INSERT INTO study_arms (id, study_id, name, description)
VALUES (7, 5, 'Standard Medication', 'Patients receiving standard medication regimen');

-- Study 6 arms
INSERT INTO study_arms (id, study_id, name, description)
VALUES 
(8, 6, 'Standard Protocol', 'Control arm following standard asthma management protocol'),
(9, 6, 'Modified Protocol', 'Experimental arm using modified treatment approach');

-- Create visit definitions
-- Study 1 visits
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES (1, 1, 1, 'Screening Visit', 'Initial screening', 0, 'screening');

-- Study 3 visits - High Dose Arm
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(2, 3, 2, 'Screening', 'Initial patient assessment and eligibility screening', -14, 'screening'),
(3, 3, 2, 'Baseline Visit', 'First treatment administration and baseline assessments', 0, 'baseline'),
(4, 3, 2, 'Follow-up Visit 1', '30-day follow-up assessment', 30, 'follow_up');

-- Study 3 visits - Low Dose Arm
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(5, 3, 3, 'Screening', 'Initial patient assessment and eligibility screening', -14, 'screening'),
(6, 3, 3, 'Baseline Visit', 'First treatment administration and baseline assessments', 0, 'baseline'),
(7, 3, 3, 'Follow-up Visit 1', '30-day follow-up assessment', 30, 'follow_up');

-- Study 4 visits - Standard of Care
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(8, 4, 4, 'Enrollment', 'Patient enrollment and initial assessment', -7, 'screening'),
(9, 4, 4, 'Baseline', 'Baseline assessments before treatment starts', 0, 'baseline');

-- Study 4 visits - Experimental Therapy A
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(10, 4, 5, 'Enrollment', 'Patient enrollment and initial assessment', -7, 'screening'),
(11, 4, 5, 'Baseline', 'Baseline assessments before treatment starts', 0, 'baseline');

-- Study 4 visits - Experimental Therapy B
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(12, 4, 6, 'Enrollment', 'Patient enrollment and initial assessment', -7, 'screening'),
(13, 4, 6, 'Baseline', 'Baseline assessments before treatment starts', 0, 'baseline');

-- Study 5 visits
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(14, 5, 7, 'Initial Assessment', 'Baseline evaluation', 0, 'baseline');

-- Study 6 visits - Standard Protocol
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(15, 6, 8, 'Screening', 'Initial eligibility assessment', -14, 'screening'),
(16, 6, 8, 'Month 1 Follow-up', 'First follow-up visit', 30, 'follow_up'),
(17, 6, 8, 'Final Visit', 'End of study assessment', 90, 'follow_up');

-- Study 6 visits - Modified Protocol
INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)
VALUES 
(18, 6, 9, 'Screening', 'Initial eligibility assessment', -14, 'screening'),
(19, 6, 9, 'Month 1 Follow-up', 'First follow-up visit', 30, 'follow_up'),
(20, 6, 9, 'Final Visit', 'End of study assessment', 90, 'follow_up');

-- Create form definitions with proper fields JSON
-- Study 1 forms
INSERT INTO form_definitions (id, study_id, name, description, form_type, fields, created_by)
VALUES (1, 1, 'Demographics Form', 'Basic patient information', 'standard', 
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'field_1',
                'label', 'First Name',
                'type', 'text',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'field_2',
                'label', 'Last Name',
                'type', 'text',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'field_3',
                'label', 'Date of Birth',
                'type', 'date',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'field_4',
                'label', 'Gender',
                'type', 'select',
                'options', JSON_ARRAY('Male', 'Female', 'Other'),
                'required', true
            )
        ),
        @admin_user_id);

-- Study 3 forms
INSERT INTO form_definitions (id, study_id, name, description, form_type, fields, created_by)
VALUES 
-- High Dose Arm - Screening Visit forms
(2, 3, 'Eligibility Checklist', 'Inclusion/exclusion criteria verification', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'inc_1',
                'label', 'Age 55 or older',
                'type', 'checkbox',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'inc_2',
                'label', 'Confirmed early-stage Alzheimer\'s',
                'type', 'checkbox',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'exc_1',
                'label', 'History of stroke',
                'type', 'checkbox',
                'required', true
            )
        ),
        @admin_user_id),
        
(3, 3, 'Medical History', 'Complete medical history documentation', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'med_1',
                'label', 'Previous Medications',
                'type', 'textarea',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'med_2',
                'label', 'Known Allergies',
                'type', 'textarea',
                'required', false
            ),
            JSON_OBJECT(
                'id', 'med_3',
                'label', 'Past Surgeries',
                'type', 'textarea',
                'required', false
            )
        ),
        @admin_user_id),
        
(4, 3, 'Cognitive Assessment', 'Baseline cognitive function measurements', 'custom',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'cog_1',
                'label', 'MMSE Score',
                'type', 'number',
                'min', 0,
                'max', 30,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'cog_2',
                'label', 'Clock Drawing Test',
                'type', 'select',
                'options', JSON_ARRAY('Normal', 'Mildly Impaired', 'Moderately Impaired', 'Severely Impaired'),
                'required', true
            )
        ),
        @admin_user_id),

-- High Dose Arm - Baseline Visit forms
(5, 3, 'Vital Signs', 'Temperature, blood pressure, heart rate, etc.', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'vs_1',
                'label', 'Temperature (°C)',
                'type', 'number',
                'step', 0.1,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'vs_2',
                'label', 'Systolic BP (mmHg)',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'vs_3',
                'label', 'Diastolic BP (mmHg)',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'vs_4',
                'label', 'Heart Rate (bpm)',
                'type', 'number',
                'required', true
            )
        ),
        @admin_user_id),
        
(6, 3, 'Medication Administration', 'Details of study medication administration', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'med_adm_1',
                'label', 'Medication Lot Number',
                'type', 'text',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'med_adm_2',
                'label', 'Dose Administered',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'med_adm_3',
                'label', 'Administration Time',
                'type', 'time',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'med_adm_4',
                'label', 'Administered by',
                'type', 'text',
                'required', true
            )
        ),
        @admin_user_id),

-- High Dose Arm - Follow-up Visit forms
(7, 3, 'Adverse Events', 'Documentation of any adverse events', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'ae_1',
                'label', 'Any Adverse Events?',
                'type', 'radio',
                'options', JSON_ARRAY('Yes', 'No'),
                'required', true
            ),
            JSON_OBJECT(
                'id', 'ae_2',
                'label', 'Description',
                'type', 'textarea',
                'required', false
            ),
            JSON_OBJECT(
                'id', 'ae_3',
                'label', 'Severity',
                'type', 'select',
                'options', JSON_ARRAY('Mild', 'Moderate', 'Severe', 'Life-threatening'),
                'required', false
            ),
            JSON_OBJECT(
                'id', 'ae_4',
                'label', 'Relation to Study Treatment',
                'type', 'select',
                'options', JSON_ARRAY('Not Related', 'Unlikely', 'Possible', 'Probable', 'Definite'),
                'required', false
            )
        ),
        @admin_user_id),
        
(8, 3, 'Follow-up Cognitive Assessment', 'Repeat cognitive function measurements', 'custom',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'cog_f_1',
                'label', 'MMSE Score',
                'type', 'number',
                'min', 0,
                'max', 30,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'cog_f_2',
                'label', 'Clock Drawing Test',
                'type', 'select',
                'options', JSON_ARRAY('Normal', 'Mildly Impaired', 'Moderately Impaired', 'Severely Impaired'),
                'required', true
            ),
            JSON_OBJECT(
                'id', 'cog_f_3',
                'label', 'Change from Baseline',
                'type', 'select',
                'options', JSON_ARRAY('Improved', 'Stable', 'Declined'),
                'required', true
            )
        ),
        @admin_user_id),

-- Study 4 forms - Standard of Care - Enrollment
(9, 4, 'Patient Demographics', 'Basic patient information collection', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'pd_1',
                'label', 'Patient Age',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'pd_2',
                'label', 'Gender',
                'type', 'select',
                'options', JSON_ARRAY('Male', 'Female', 'Other'),
                'required', true
            ),
            JSON_OBJECT(
                'id', 'pd_3',
                'label', 'Ethnicity',
                'type', 'select',
                'options', JSON_ARRAY('Hispanic or Latino', 'Not Hispanic or Latino', 'Unknown'),
                'required', true
            ),
            JSON_OBJECT(
                'id', 'pd_4',
                'label', 'Race',
                'type', 'select',
                'options', JSON_ARRAY('White', 'Black or African American', 'Asian', 'American Indian/Alaska Native', 'Native Hawaiian/Pacific Islander', 'Other'),
                'required', true
            )
        ),
        @admin_user_id),
        
(10, 4, 'Disease History', 'Detailed history of RA progression and treatments', 'custom',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'ra_1',
                'label', 'Year of RA Diagnosis',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'ra_2',
                'label', 'Previous RA Medications',
                'type', 'textarea',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'ra_3',
                'label', 'Affected Joints',
                'type', 'textarea',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'ra_4',
                'label', 'Family History of RA',
                'type', 'radio',
                'options', JSON_ARRAY('Yes', 'No', 'Unknown'),
                'required', true
            )
        ),
        @admin_user_id),

-- Study 4 forms - Standard of Care - Baseline
(11, 4, 'Joint Assessment', 'Comprehensive joint evaluation', 'custom',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'ja_1',
                'label', 'Tender Joint Count (0-28)',
                'type', 'number',
                'min', 0,
                'max', 28,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'ja_2',
                'label', 'Swollen Joint Count (0-28)',
                'type', 'number',
                'min', 0,
                'max', 28,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'ja_3',
                'label', 'DAS28-ESR Score',
                'type', 'number',
                'step', 0.01,
                'required', true
            )
        ),
        @admin_user_id),
        
(12, 4, 'Quality of Life Questionnaire', 'Patient-reported quality of life measures', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'qol_1',
                'label', 'Overall Health Rating (0-10)',
                'type', 'number',
                'min', 0,
                'max', 10,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'qol_2',
                'label', 'Difficulty with Daily Activities',
                'type', 'select',
                'options', JSON_ARRAY('None', 'Mild', 'Moderate', 'Severe', 'Unable to perform'),
                'required', true
            ),
            JSON_OBJECT(
                'id', 'qol_3',
                'label', 'Pain Impact on Sleep',
                'type', 'select',
                'options', JSON_ARRAY('None', 'Mild', 'Moderate', 'Severe'),
                'required', true
            )
        ),
        @admin_user_id),
        
(13, 4, 'Pain Assessment', 'Standardized pain scale evaluation', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'pain_1',
                'label', 'Pain Level (0-10)',
                'type', 'number',
                'min', 0,
                'max', 10,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'pain_2',
                'label', 'Pain Character',
                'type', 'select',
                'options', JSON_ARRAY('Dull', 'Sharp', 'Burning', 'Throbbing', 'Stabbing'),
                'required', true
            ),
            JSON_OBJECT(
                'id', 'pain_3',
                'label', 'Pain Frequency',
                'type', 'select',
                'options', JSON_ARRAY('Constant', 'Intermittent', 'Occasional', 'Rare'),
                'required', true
            )
        ),
        @admin_user_id),

-- Study 5 forms
(14, 5, 'Blood Pressure Log', 'Daily blood pressure recording form', 'custom',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'bp_1',
                'label', 'Systolic BP (mmHg)',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'bp_2',
                'label', 'Diastolic BP (mmHg)',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'bp_3',
                'label', 'Time of Measurement',
                'type', 'time',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'bp_4',
                'label', 'Position',
                'type', 'select',
                'options', JSON_ARRAY('Sitting', 'Standing', 'Lying'),
                'required', true
            )
        ),
        @admin_user_id),
        
(15, 5, 'Medication History', 'Current and previous medications', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'med_hist_1',
                'label', 'Current Antihypertensive Medications',
                'type', 'textarea',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'med_hist_2',
                'label', 'Medication Changes in Last 6 Months',
                'type', 'textarea',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'med_hist_3',
                'label', 'Medication Adherence',
                'type', 'select',
                'options', JSON_ARRAY('Excellent', 'Good', 'Fair', 'Poor'),
                'required', true
            )
        ),
        @admin_user_id),

-- Study 6 forms - Standard Protocol - Screening
(16, 6, 'Asthma History', 'Detailed asthma history documentation', 'custom',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'ast_1',
                'label', 'Age at Diagnosis',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'ast_2',
                'label', 'Triggers',
                'type', 'checkbox',
                'options', JSON_ARRAY('Exercise', 'Allergens', 'Cold air', 'Respiratory infections', 'Other'),
                'required', true
            ),
            JSON_OBJECT(
                'id', 'ast_3',
                'label', 'Previous Hospitalizations',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'ast_4',
                'label', 'Family History of Asthma',
                'type', 'radio',
                'options', JSON_ARRAY('Yes', 'No', 'Unknown'),
                'required', true
            )
        ),
        @admin_user_id),
        
(17, 6, 'Pulmonary Function Test', 'Baseline lung function assessment', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'pft_1',
                'label', 'FEV1 (L)',
                'type', 'number',
                'step', 0.01,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'pft_2',
                'label', 'FEV1 % Predicted',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'pft_3',
                'label', 'FVC (L)',
                'type', 'number',
                'step', 0.01,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'pft_4',
                'label', 'FEV1/FVC Ratio',
                'type', 'number',
                'step', 0.01,
                'required', true
            )
        ),
        @admin_user_id),

-- Study 6 forms - Standard Protocol - Month 1 Follow-up
(18, 6, 'Symptom Diary Review', 'Analysis of patient-recorded symptoms', 'custom',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'sym_1',
                'label', 'Days with Symptoms',
                'type', 'number',
                'min', 0,
                'max', 30,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'sym_2',
                'label', 'Rescue Medication Use (days)',
                'type', 'number',
                'min', 0,
                'max', 30,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'sym_3',
                'label', 'Night Awakenings',
                'type', 'number',
                'min', 0,
                'required', true
            )
        ),
        @admin_user_id),
        
(19, 6, 'Medication Adherence', 'Assessment of treatment compliance', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'adh_1',
                'label', 'Missed Doses',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'adh_2',
                'label', 'Reason for Missed Doses',
                'type', 'select',
                'options', JSON_ARRAY('Forgot', 'Side effects', 'Felt better', 'Other'),
                'required', false
            ),
            JSON_OBJECT(
                'id', 'adh_3',
                'label', 'Adherence Rating',
                'type', 'select',
                'options', JSON_ARRAY('Excellent', 'Good', 'Fair', 'Poor'),
                'required', true
            )
        ),
        @admin_user_id),
        
(20, 6, 'Quality of Life Assessment', 'Pediatric quality of life questionnaire', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'qol_p_1',
                'label', 'School Attendance (days missed)',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'qol_p_2',
                'label', 'Activity Limitations',
                'type', 'select',
                'options', JSON_ARRAY('None', 'Mild', 'Moderate', 'Severe'),
                'required', true
            ),
            JSON_OBJECT(
                'id', 'qol_p_3',
                'label', 'Sleep Disturbance',
                'type', 'select',
                'options', JSON_ARRAY('None', 'Mild', 'Moderate', 'Severe'),
                'required', true
            ),
            JSON_OBJECT(
                'id', 'qol_p_4',
                'label', 'Overall Quality of Life (1-10)',
                'type', 'number',
                'min', 1,
                'max', 10,
                'required', true
            )
        ),
        @admin_user_id),

-- Study 6 forms - Standard Protocol - Final Visit
(21, 6, 'Final Pulmonary Function', 'Final lung function assessment', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'fpft_1',
                'label', 'FEV1 (L)',
                'type', 'number',
                'step', 0.01,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'fpft_2',
                'label', 'FEV1 % Predicted',
                'type', 'number',
                'required', true
            ),
            JSON_OBJECT(
                'id', 'fpft_3',
                'label', 'FVC (L)',
                'type', 'number',
                'step', 0.01,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'fpft_4',
                'label', 'FEV1/FVC Ratio',
                'type', 'number',
                'step', 0.01,
                'required', true
            ),
            JSON_OBJECT(
                'id', 'fpft_5',
                'label', 'Change from Baseline',
                'type', 'select',
                'options', JSON_ARRAY('Improved', 'Stable', 'Declined'),
                'required', true
            )
        ),
        @admin_user_id),
        
(22, 6, 'Study Completion Form', 'Study conclusion documentation', 'standard',
        JSON_ARRAY(
            JSON_OBJECT(
                'id', 'comp_1',
                'label', 'Study Completion Status',
                'type', 'select',
                'options', JSON_ARRAY('Completed', 'Discontinued'),
                'required', true
            ),
            JSON_OBJECT(
                'id', 'comp_2',
                'label', 'Reason for Discontinuation',
                'type', 'select',
                'options', JSON_ARRAY('N/A', 'Adverse Event', 'Withdrawal of Consent', 'Lost to Follow-up', 'Protocol Violation', 'Other'),
                'required', false
            ),
            JSON_OBJECT(
                'id', 'comp_3',
                'label', 'Investigator Comments',
                'type', 'textarea',
                'required', false
            )
        ),
        @admin_user_id);

-- Associate forms with visits
-- Study 1
INSERT INTO visit_forms (visit_definition_id, form_definition_id, sequence_number, is_required)
VALUES (1, 1, 1, true);

-- Study 3 - High Dose Arm
INSERT INTO visit_forms (visit_definition_id, form_definition_id, sequence_number, is_required)
VALUES 
-- Screening visit forms
(2, 2, 1, true),
(2, 3, 2, true),
(2, 4, 3, true),
-- Baseline visit forms
(3, 5, 1, true),
(3, 6, 2, true),
-- Follow-up visit forms
(4, 7, 1, true),
(4, 8, 2, true);

-- Study 3 - Low Dose Arm (uses same form definitions as High Dose Arm)
INSERT INTO visit_forms (visit_definition_id, form_definition_id, sequence_number, is_required)
VALUES 
-- Screening visit forms
(5, 2, 1, true),
(5, 3, 2, true),
(5, 4, 3, true),
-- Baseline visit forms
(6, 5, 1, true),
(6, 6, 2, true),
-- Follow-up visit forms
(7, 7, 1, true),
(7, 8, 2, true);

-- Study 4 - Standard of Care
INSERT INTO visit_forms (visit_definition_id, form_definition_id, sequence_number, is_required)
VALUES 
-- Enrollment forms
(8, 9, 1, true),
(8, 10, 2, true),
-- Baseline forms
(9, 11, 1, true),
(9, 12, 2, true),
(9, 13, 3, true);

-- Study 4 - Experimental Therapy A (uses same form definitions as Standard of Care)
INSERT INTO visit_forms (visit_definition_id, form_definition_id, sequence_number, is_required)
VALUES 
-- Enrollment forms
(10, 9, 1, true),
(10, 10, 2, true),
-- Baseline forms
(11, 11, 1, true),
(11, 12, 2, true),
(11, 13, 3, true);

-- Study 4 - Experimental Therapy B (uses same form definitions as Standard of Care)
INSERT INTO visit_forms (visit_definition_id, form_definition_id, sequence_number, is_required)
VALUES 
-- Enrollment forms
(12, 9, 1, true),
(12, 10, 2, true),
-- Baseline forms
(13, 11, 1, true),
(13, 12, 2, true),
(13, 13, 3, true);

-- Study 5
INSERT INTO visit_forms (visit_definition_id, form_definition_id, sequence_number, is_required)
VALUES 
(14, 14, 1, true),
(14, 15, 2, true);

-- Study 6 - Standard Protocol
INSERT INTO visit_forms (visit_definition_id, form_definition_id, sequence_number, is_required)
VALUES 
-- Screening visit forms
(15, 16, 1, true),
(15, 17, 2, true),
-- Month 1 Follow-up forms
(16, 18, 1, true),
(16, 19, 2, true),
(16, 20, 3, true),
-- Final Visit forms
(17, 21, 1, true),
(17, 22, 2, true);

-- Study 6 - Modified Protocol (uses same form definitions as Standard Protocol)
INSERT INTO visit_forms (visit_definition_id, form_definition_id, sequence_number, is_required)
VALUES 
-- Screening visit forms
(18, 16, 1, true),
(18, 17, 2, true),
-- Month 1 Follow-up forms
(19, 18, 1, true),
(19, 19, 2, true),
(19, 20, 3, true),
-- Final Visit forms
(20, 21, 1, true),
(20, 22, 2, true);

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

