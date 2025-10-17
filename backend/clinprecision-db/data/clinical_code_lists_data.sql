-- ===================================================================
-- Clinical Code Lists Data
-- Code lists for clinical data collection and patient safety
-- Generated: October 17, 2025
-- ===================================================================

-- System user for data setup
SET @system_user_id = 1;

-- ===================================================================
-- PATIENT POSITION (for vitals, procedures)
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('PATIENT_POSITION', 'SUPINE', 'Supine', 'Lying on back, face up', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('clinical_use', 'vitals_procedures', 'standard_position', true)),
('PATIENT_POSITION', 'PRONE', 'Prone', 'Lying on stomach, face down', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('clinical_use', 'vitals_procedures', 'standard_position', false)),
('PATIENT_POSITION', 'SITTING', 'Sitting', 'Sitting upright', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('clinical_use', 'vitals_procedures', 'standard_position', true)),
('PATIENT_POSITION', 'STANDING', 'Standing', 'Standing upright', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('clinical_use', 'vitals_procedures', 'standard_position', true)),
('PATIENT_POSITION', 'LEFT_LATERAL', 'Left Lateral Decubitus', 'Lying on left side', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('clinical_use', 'vitals_procedures', 'standard_position', false)),
('PATIENT_POSITION', 'RIGHT_LATERAL', 'Right Lateral Decubitus', 'Lying on right side', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('clinical_use', 'vitals_procedures', 'standard_position', false)),
('PATIENT_POSITION', 'SEMI_RECUMBENT', 'Semi-Recumbent', 'Reclined at 30-45 degrees', 7, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('clinical_use', 'vitals_procedures', 'angle', '30-45 degrees')),
('PATIENT_POSITION', 'FOWLERS', 'Fowler\'s Position', 'Semi-sitting at 45-60 degrees', 8, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('clinical_use', 'vitals_procedures', 'angle', '45-60 degrees')),
('PATIENT_POSITION', 'TRENDELENBURG', 'Trendelenburg', 'Supine with feet elevated', 9, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('clinical_use', 'procedures', 'special_indication', true));

-- ===================================================================
-- TEMPERATURE ROUTE (method of temperature measurement)
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('TEMPERATURE_ROUTE', 'ORAL', 'Oral', 'Temperature taken orally', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('typical_range_c', '36.5-37.5', 'typical_range_f', '97.7-99.5', 'most_common', true)),
('TEMPERATURE_ROUTE', 'AXILLARY', 'Axillary', 'Temperature taken under armpit', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('typical_range_c', '36.0-37.0', 'typical_range_f', '96.8-98.6', 'adjustment', '-0.5C')),
('TEMPERATURE_ROUTE', 'RECTAL', 'Rectal', 'Temperature taken rectally', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('typical_range_c', '37.0-38.0', 'typical_range_f', '98.6-100.4', 'adjustment', '+0.5C')),
('TEMPERATURE_ROUTE', 'TYMPANIC', 'Tympanic', 'Temperature taken via ear', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('typical_range_c', '36.5-37.5', 'typical_range_f', '97.7-99.5', 'method', 'infrared')),
('TEMPERATURE_ROUTE', 'TEMPORAL', 'Temporal Artery', 'Temperature taken on forehead', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('typical_range_c', '36.5-37.5', 'typical_range_f', '97.7-99.5', 'method', 'infrared')),
('TEMPERATURE_ROUTE', 'CORE', 'Core', 'Core body temperature (invasive)', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('typical_range_c', '37.0-37.5', 'typical_range_f', '98.6-99.5', 'invasive', true));

-- ===================================================================
-- SIGNIFICANT MEDICAL HISTORY
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('MEDICAL_HISTORY', 'CARDIOVASCULAR', 'Cardiovascular Disease', 'Heart and blood vessel conditions', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'cardiovascular', 'high_risk', true)),
('MEDICAL_HISTORY', 'DIABETES', 'Diabetes Mellitus', 'Type 1 or Type 2 diabetes', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'endocrine', 'chronic_condition', true)),
('MEDICAL_HISTORY', 'HYPERTENSION', 'Hypertension', 'High blood pressure', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'cardiovascular', 'chronic_condition', true)),
('MEDICAL_HISTORY', 'ASTHMA', 'Asthma', 'Chronic respiratory condition', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'respiratory', 'chronic_condition', true)),
('MEDICAL_HISTORY', 'COPD', 'COPD', 'Chronic Obstructive Pulmonary Disease', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'respiratory', 'chronic_condition', true)),
('MEDICAL_HISTORY', 'CANCER', 'Cancer', 'History of cancer (any type)', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'oncology', 'high_risk', true, 'requires_details', true)),
('MEDICAL_HISTORY', 'RENAL_DISEASE', 'Renal Disease', 'Kidney disease or dysfunction', 7, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'renal', 'high_risk', true)),
('MEDICAL_HISTORY', 'HEPATIC_DISEASE', 'Hepatic Disease', 'Liver disease or dysfunction', 8, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'hepatic', 'high_risk', true)),
('MEDICAL_HISTORY', 'NEUROLOGICAL', 'Neurological Disorder', 'Brain or nervous system conditions', 9, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'neurological', 'requires_details', true)),
('MEDICAL_HISTORY', 'PSYCHIATRIC', 'Psychiatric Disorder', 'Mental health conditions', 10, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'psychiatric', 'requires_details', true)),
('MEDICAL_HISTORY', 'AUTOIMMUNE', 'Autoimmune Disease', 'Autoimmune disorders', 11, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'immunology', 'chronic_condition', true)),
('MEDICAL_HISTORY', 'THYROID', 'Thyroid Disorder', 'Thyroid dysfunction', 12, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'endocrine', 'chronic_condition', true)),
('MEDICAL_HISTORY', 'SEIZURE', 'Seizure Disorder', 'Epilepsy or seizure history', 13, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'neurological', 'high_risk', true)),
('MEDICAL_HISTORY', 'STROKE', 'Stroke/TIA', 'History of stroke or transient ischemic attack', 14, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('system', 'neurological', 'high_risk', true)),
('MEDICAL_HISTORY', 'NONE', 'None', 'No significant medical history', 99, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('default_option', true, 'excludes_others', true));

-- ===================================================================
-- SIGNIFICANT FAMILY HISTORY
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('FAMILY_HISTORY', 'CARDIAC', 'Cardiac Disease', 'Family history of heart disease', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('risk_factor', true, 'genetic_component', 'moderate')),
('FAMILY_HISTORY', 'DIABETES', 'Diabetes', 'Family history of diabetes', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('risk_factor', true, 'genetic_component', 'high')),
('FAMILY_HISTORY', 'CANCER', 'Cancer', 'Family history of cancer', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('risk_factor', true, 'genetic_component', 'variable', 'requires_details', true)),
('FAMILY_HISTORY', 'HYPERTENSION', 'Hypertension', 'Family history of high blood pressure', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('risk_factor', true, 'genetic_component', 'moderate')),
('FAMILY_HISTORY', 'STROKE', 'Stroke', 'Family history of stroke', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('risk_factor', true, 'genetic_component', 'moderate')),
('FAMILY_HISTORY', 'PSYCHIATRIC', 'Psychiatric Disorder', 'Family history of mental illness', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('risk_factor', true, 'genetic_component', 'moderate')),
('FAMILY_HISTORY', 'AUTOIMMUNE', 'Autoimmune Disease', 'Family history of autoimmune disorders', 7, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('risk_factor', true, 'genetic_component', 'high')),
('FAMILY_HISTORY', 'ALZHEIMERS', 'Alzheimer\'s Disease', 'Family history of Alzheimer\'s', 8, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('risk_factor', true, 'genetic_component', 'high')),
('FAMILY_HISTORY', 'ASTHMA', 'Asthma', 'Family history of asthma', 9, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('risk_factor', true, 'genetic_component', 'moderate')),
('FAMILY_HISTORY', 'NONE', 'None', 'No significant family history', 99, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('default_option', true, 'excludes_others', true));

-- ===================================================================
-- SMOKING STATUS
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('SMOKING_STATUS', 'NEVER', 'Never Smoker', 'Never smoked or < 100 cigarettes lifetime', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('pack_years', 0, 'risk_level', 'low')),
('SMOKING_STATUS', 'CURRENT', 'Current Smoker', 'Currently smoking', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('requires_pack_years', true, 'risk_level', 'high')),
('SMOKING_STATUS', 'FORMER', 'Former Smoker', 'Quit smoking', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('requires_pack_years', true, 'requires_quit_date', true, 'risk_level', 'moderate')),
('SMOKING_STATUS', 'PASSIVE', 'Passive Smoker', 'Exposed to secondhand smoke', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('risk_level', 'low_moderate')),
('SMOKING_STATUS', 'UNKNOWN', 'Unknown', 'Smoking status unknown', 99, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('requires_clarification', true));

-- ===================================================================
-- ALCOHOL USE
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('ALCOHOL_USE', 'NEVER', 'Never', 'Never consumed alcohol', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('drinks_per_week', 0, 'risk_level', 'low')),
('ALCOHOL_USE', 'RARE', 'Rare (< 1/month)', 'Less than once per month', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('drinks_per_week', '0-1', 'risk_level', 'low')),
('ALCOHOL_USE', 'OCCASIONAL', 'Occasional (1-4/month)', 'Occasional social drinking', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('drinks_per_week', '1-2', 'risk_level', 'low')),
('ALCOHOL_USE', 'MODERATE', 'Moderate', 'Moderate regular consumption', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('drinks_per_week', '3-7', 'risk_level', 'moderate', 'note', 'Up to 7/week women, 14/week men')),
('ALCOHOL_USE', 'HEAVY', 'Heavy', 'Heavy regular consumption', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('drinks_per_week', '8+', 'risk_level', 'high', 'requires_assessment', true)),
('ALCOHOL_USE', 'FORMER', 'Former User', 'Previously consumed alcohol, now abstinent', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('requires_quit_date', true, 'requires_history', true)),
('ALCOHOL_USE', 'UNKNOWN', 'Unknown', 'Alcohol use status unknown', 99, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('requires_clarification', true));

-- ===================================================================
-- GENDER (Administrative/Legal)
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('GENDER', 'MALE', 'Male', 'Male', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('hl7_code', 'M', 'biological_considerations', true)),
('GENDER', 'FEMALE', 'Female', 'Female', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('hl7_code', 'F', 'biological_considerations', true)),
('GENDER', 'NON_BINARY', 'Non-Binary', 'Non-binary gender identity', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('hl7_code', 'X', 'inclusive_option', true)),
('GENDER', 'OTHER', 'Other', 'Other gender identity', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('hl7_code', 'O', 'allows_specification', true)),
('GENDER', 'UNKNOWN', 'Unknown', 'Gender unknown or not disclosed', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('hl7_code', 'U', 'privacy_option', true));

-- ===================================================================
-- ETHNICITY (NIH/FDA categories)
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('ETHNICITY', 'HISPANIC_LATINO', 'Hispanic or Latino', 'Hispanic or Latino ethnicity', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', true, 'reporting_required', true)),
('ETHNICITY', 'NOT_HISPANIC_LATINO', 'Not Hispanic or Latino', 'Not Hispanic or Latino', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', true, 'reporting_required', true)),
('ETHNICITY', 'UNKNOWN', 'Unknown', 'Ethnicity unknown or not reported', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', false, 'reporting_option', true));

-- ===================================================================
-- RACE (NIH/FDA categories - OMB standards)
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('RACE', 'AMERICAN_INDIAN_ALASKA_NATIVE', 'American Indian or Alaska Native', 'American Indian or Alaska Native', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', true, 'reporting_required', true)),
('RACE', 'ASIAN', 'Asian', 'Asian', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', true, 'reporting_required', true)),
('RACE', 'BLACK_AFRICAN_AMERICAN', 'Black or African American', 'Black or African American', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', true, 'reporting_required', true)),
('RACE', 'NATIVE_HAWAIIAN_PACIFIC_ISLANDER', 'Native Hawaiian or Other Pacific Islander', 'Native Hawaiian or Other Pacific Islander', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', true, 'reporting_required', true)),
('RACE', 'WHITE', 'White', 'White', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', true, 'reporting_required', true)),
('RACE', 'MULTIPLE', 'Multiple Races', 'More than one race', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', false, 'allows_multiple', true)),
('RACE', 'OTHER', 'Other', 'Other race', 7, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', false, 'allows_specification', true)),
('RACE', 'UNKNOWN', 'Unknown', 'Race unknown or not reported', 99, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('omb_category', false, 'reporting_option', true));

-- ===================================================================
-- DOSE UNIT (medication dosing)
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('DOSE_UNIT', 'MG', 'Milligram (mg)', 'Milligrams', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('ucum_code', 'mg', 'unit_type', 'mass', 'most_common', true)),
('DOSE_UNIT', 'G', 'Gram (g)', 'Grams', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('ucum_code', 'g', 'unit_type', 'mass')),
('DOSE_UNIT', 'MCG', 'Microgram (mcg)', 'Micrograms', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('ucum_code', 'ug', 'unit_type', 'mass', 'precision_required', true)),
('DOSE_UNIT', 'ML', 'Milliliter (mL)', 'Milliliters', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('ucum_code', 'mL', 'unit_type', 'volume')),
('DOSE_UNIT', 'L', 'Liter (L)', 'Liters', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('ucum_code', 'L', 'unit_type', 'volume')),
('DOSE_UNIT', 'IU', 'International Unit (IU)', 'International Units', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('ucum_code', 'IU', 'unit_type', 'biological')),
('DOSE_UNIT', 'MEQ', 'Milliequivalent (mEq)', 'Milliequivalents', 7, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('ucum_code', 'meq', 'unit_type', 'chemical')),
('DOSE_UNIT', 'UNIT', 'Unit', 'Units (e.g., insulin)', 8, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('ucum_code', 'U', 'unit_type', 'biological')),
('DOSE_UNIT', 'TABLET', 'Tablet', 'Tablets', 9, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('unit_type', 'dosage_form')),
('DOSE_UNIT', 'CAPSULE', 'Capsule', 'Capsules', 10, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('unit_type', 'dosage_form')),
('DOSE_UNIT', 'DROP', 'Drop', 'Drops', 11, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('unit_type', 'volume')),
('DOSE_UNIT', 'PUFF', 'Puff', 'Puffs (inhaler)', 12, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('unit_type', 'dosage_form')),
('DOSE_UNIT', 'PATCH', 'Patch', 'Transdermal patches', 13, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('unit_type', 'dosage_form'));

-- ===================================================================
-- FREQUENCY (medication frequency)
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('FREQUENCY', 'QD', 'Once Daily (QD)', 'Once per day', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('times_per_day', 1, 'latin', 'quaque die', 'most_common', true)),
('FREQUENCY', 'BID', 'Twice Daily (BID)', 'Twice per day', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('times_per_day', 2, 'latin', 'bis in die', 'interval_hours', 12)),
('FREQUENCY', 'TID', 'Three Times Daily (TID)', 'Three times per day', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('times_per_day', 3, 'latin', 'ter in die', 'interval_hours', 8)),
('FREQUENCY', 'QID', 'Four Times Daily (QID)', 'Four times per day', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('times_per_day', 4, 'latin', 'quater in die', 'interval_hours', 6)),
('FREQUENCY', 'Q2H', 'Every 2 Hours', 'Every 2 hours', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('interval_hours', 2, 'times_per_day', 12)),
('FREQUENCY', 'Q4H', 'Every 4 Hours', 'Every 4 hours', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('interval_hours', 4, 'times_per_day', 6)),
('FREQUENCY', 'Q6H', 'Every 6 Hours', 'Every 6 hours', 7, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('interval_hours', 6, 'times_per_day', 4)),
('FREQUENCY', 'Q8H', 'Every 8 Hours', 'Every 8 hours', 8, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('interval_hours', 8, 'times_per_day', 3)),
('FREQUENCY', 'Q12H', 'Every 12 Hours', 'Every 12 hours', 9, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('interval_hours', 12, 'times_per_day', 2)),
('FREQUENCY', 'QHS', 'At Bedtime (QHS)', 'Once daily at bedtime', 10, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('times_per_day', 1, 'latin', 'quaque hora somni', 'timing', 'bedtime')),
('FREQUENCY', 'QAM', 'Every Morning (QAM)', 'Once daily in morning', 11, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('times_per_day', 1, 'timing', 'morning')),
('FREQUENCY', 'QPM', 'Every Evening (QPM)', 'Once daily in evening', 12, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('times_per_day', 1, 'timing', 'evening')),
('FREQUENCY', 'PRN', 'As Needed (PRN)', 'As needed', 13, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('latin', 'pro re nata', 'variable', true, 'requires_condition', true)),
('FREQUENCY', 'STAT', 'Immediately (STAT)', 'Immediately, one time only', 14, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('latin', 'statim', 'urgent', true, 'one_time', true)),
('FREQUENCY', 'QOD', 'Every Other Day', 'Every other day', 15, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('days_interval', 2)),
('FREQUENCY', 'WEEKLY', 'Weekly', 'Once per week', 16, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('days_interval', 7)),
('FREQUENCY', 'MONTHLY', 'Monthly', 'Once per month', 17, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('days_interval', 30, 'approximate', true));

-- ===================================================================
-- ROUTE OF ADMINISTRATION
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('ROUTE_OF_ADMINISTRATION', 'PO', 'Oral (PO)', 'By mouth', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('latin', 'per os', 'most_common', true, 'invasive', false)),
('ROUTE_OF_ADMINISTRATION', 'IV', 'Intravenous (IV)', 'Into a vein', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', true, 'requires_professional', true, 'rapid_onset', true)),
('ROUTE_OF_ADMINISTRATION', 'IM', 'Intramuscular (IM)', 'Into a muscle', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', true, 'requires_professional', true)),
('ROUTE_OF_ADMINISTRATION', 'SC', 'Subcutaneous (SC)', 'Under the skin', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', true, 'can_self_administer', true)),
('ROUTE_OF_ADMINISTRATION', 'SL', 'Sublingual (SL)', 'Under the tongue', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', false, 'rapid_absorption', true)),
('ROUTE_OF_ADMINISTRATION', 'TOPICAL', 'Topical', 'Applied to skin', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', false, 'local_effect', true)),
('ROUTE_OF_ADMINISTRATION', 'INHALATION', 'Inhalation', 'Breathed into lungs', 7, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', false, 'local_or_systemic', true)),
('ROUTE_OF_ADMINISTRATION', 'RECTAL', 'Rectal (PR)', 'Into rectum', 8, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('latin', 'per rectum', 'alternative_route', true)),
('ROUTE_OF_ADMINISTRATION', 'VAGINAL', 'Vaginal (PV)', 'Into vagina', 9, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('latin', 'per vagina', 'local_effect', true)),
('ROUTE_OF_ADMINISTRATION', 'OPHTHALMIC', 'Ophthalmic', 'Into the eye', 10, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', false, 'local_effect', true)),
('ROUTE_OF_ADMINISTRATION', 'OTIC', 'Otic', 'Into the ear', 11, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', false, 'local_effect', true)),
('ROUTE_OF_ADMINISTRATION', 'NASAL', 'Nasal', 'Into the nose', 12, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', false, 'local_or_systemic', true)),
('ROUTE_OF_ADMINISTRATION', 'TRANSDERMAL', 'Transdermal', 'Through the skin (patch)', 13, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', false, 'sustained_release', true)),
('ROUTE_OF_ADMINISTRATION', 'INTRATHECAL', 'Intrathecal (IT)', 'Into spinal canal', 14, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', true, 'requires_specialist', true, 'high_risk', true)),
('ROUTE_OF_ADMINISTRATION', 'EPIDURAL', 'Epidural', 'Into epidural space', 15, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', true, 'requires_specialist', true)),
('ROUTE_OF_ADMINISTRATION', 'INTRA_ARTICULAR', 'Intra-articular', 'Into a joint', 16, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('invasive', true, 'requires_specialist', true));

-- ===================================================================
-- PRESCRIPTION STATUS
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('PRESCRIPTION_STATUS', 'ACTIVE', 'Active', 'Prescription currently active', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('color', 'text-green-600', 'patient_taking', true)),
('PRESCRIPTION_STATUS', 'COMPLETED', 'Completed', 'Prescription completed as prescribed', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('color', 'text-blue-600', 'patient_taking', false)),
('PRESCRIPTION_STATUS', 'DISCONTINUED', 'Discontinued', 'Prescription stopped before completion', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('color', 'text-orange-600', 'patient_taking', false, 'requires_reason', true)),
('PRESCRIPTION_STATUS', 'HELD', 'Held', 'Temporarily on hold', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('color', 'text-yellow-600', 'patient_taking', false, 'requires_reason', true)),
('PRESCRIPTION_STATUS', 'MODIFIED', 'Modified', 'Dose or frequency modified', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('color', 'text-purple-600', 'patient_taking', true, 'requires_details', true)),
('PRESCRIPTION_STATUS', 'CANCELLED', 'Cancelled', 'Prescription cancelled (not started)', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('color', 'text-red-600', 'patient_taking', false, 'requires_reason', true));

-- ===================================================================
-- FASTING STATUS (for labs, procedures)
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('FASTING_STATUS', 'FASTING', 'Fasting', 'Patient has been fasting (≥8 hours)', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('minimum_hours', 8, 'required_for_labs', true)),
('FASTING_STATUS', 'NON_FASTING', 'Non-Fasting', 'Patient has not been fasting', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('minimum_hours', 0, 'standard_collection', true)),
('FASTING_STATUS', 'UNKNOWN', 'Unknown', 'Fasting status unknown', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('requires_clarification', true, 'may_affect_results', true)),
('FASTING_STATUS', 'POST_PRANDIAL', 'Post-Prandial', 'After meal (typically 2 hours)', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT('typical_hours_after_meal', 2, 'specific_test_requirement', true));

-- ===================================================================
-- REGISTER CODE LIST USAGE FOR CLINICAL MODULES
-- ===================================================================
INSERT INTO code_list_usage (category, application_module, usage_type, field_name, is_required) VALUES
-- Vital Signs
('PATIENT_POSITION', 'clinprecision-clinops-service', 'DROPDOWN', 'patientPosition', TRUE),
('PATIENT_POSITION', 'frontend-vitals', 'DROPDOWN', 'position', TRUE),
('TEMPERATURE_ROUTE', 'clinprecision-clinops-service', 'DROPDOWN', 'temperatureRoute', TRUE),
('TEMPERATURE_ROUTE', 'frontend-vitals', 'DROPDOWN', 'tempRoute', TRUE),

-- Medical History
('MEDICAL_HISTORY', 'clinprecision-clinops-service', 'MULTI_SELECT', 'medicalHistory', FALSE),
('MEDICAL_HISTORY', 'frontend-patient-enrollment', 'CHECKBOX_GROUP', 'medicalHistory', FALSE),
('FAMILY_HISTORY', 'clinprecision-clinops-service', 'MULTI_SELECT', 'familyHistory', FALSE),
('FAMILY_HISTORY', 'frontend-patient-enrollment', 'CHECKBOX_GROUP', 'familyHistory', FALSE),

-- Social History
('SMOKING_STATUS', 'clinprecision-clinops-service', 'DROPDOWN', 'smokingStatus', TRUE),
('SMOKING_STATUS', 'frontend-patient-enrollment', 'DROPDOWN', 'smokingStatus', TRUE),
('ALCOHOL_USE', 'clinprecision-clinops-service', 'DROPDOWN', 'alcoholUse', TRUE),
('ALCOHOL_USE', 'frontend-patient-enrollment', 'DROPDOWN', 'alcoholUse', TRUE),

-- Demographics
('GENDER', 'clinprecision-clinops-service', 'DROPDOWN', 'gender', TRUE),
('GENDER', 'frontend-patient-enrollment', 'DROPDOWN', 'gender', TRUE),
('ETHNICITY', 'clinprecision-clinops-service', 'DROPDOWN', 'ethnicity', TRUE),
('ETHNICITY', 'frontend-patient-enrollment', 'DROPDOWN', 'ethnicity', TRUE),
('RACE', 'clinprecision-clinops-service', 'MULTI_SELECT', 'race', TRUE),
('RACE', 'frontend-patient-enrollment', 'CHECKBOX_GROUP', 'race', TRUE),

-- Medications
('DOSE_UNIT', 'clinprecision-clinops-service', 'DROPDOWN', 'doseUnit', TRUE),
('DOSE_UNIT', 'frontend-medications', 'DROPDOWN', 'unit', TRUE),
('FREQUENCY', 'clinprecision-clinops-service', 'DROPDOWN', 'frequency', TRUE),
('FREQUENCY', 'frontend-medications', 'DROPDOWN', 'frequency', TRUE),
('ROUTE_OF_ADMINISTRATION', 'clinprecision-clinops-service', 'DROPDOWN', 'route', TRUE),
('ROUTE_OF_ADMINISTRATION', 'frontend-medications', 'DROPDOWN', 'route', TRUE),
('PRESCRIPTION_STATUS', 'clinprecision-clinops-service', 'DROPDOWN', 'prescriptionStatus', TRUE),
('PRESCRIPTION_STATUS', 'frontend-medications', 'DROPDOWN', 'status', TRUE),

-- Laboratory
('FASTING_STATUS', 'clinprecision-clinops-service', 'DROPDOWN', 'fastingStatus', TRUE),
('FASTING_STATUS', 'frontend-laboratory', 'DROPDOWN', 'fastingStatus', TRUE);

-- ===================================================================
-- Summary of Clinical Code Lists Added
-- ===================================================================
-- PATIENT_POSITION: 9 codes
-- TEMPERATURE_ROUTE: 6 codes
-- MEDICAL_HISTORY: 15 codes
-- FAMILY_HISTORY: 10 codes
-- SMOKING_STATUS: 5 codes
-- ALCOHOL_USE: 7 codes
-- GENDER: 5 codes
-- ETHNICITY: 3 codes (NIH/FDA compliant)
-- RACE: 8 codes (NIH/FDA compliant)
-- DOSE_UNIT: 13 codes
-- FREQUENCY: 17 codes
-- ROUTE_OF_ADMINISTRATION: 16 codes
-- PRESCRIPTION_STATUS: 6 codes
-- FASTING_STATUS: 4 codes
-- Total: 124 clinical codes
-- ===================================================================
