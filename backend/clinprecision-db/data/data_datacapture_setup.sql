

-- Add sample sites
INSERT INTO sites (name,organization_id, site_number, study_id, principal_investigator_id, status, activation_date, deactivation_date, max_subjects, created_at, updated_at)
VALUES
-- Sites for Study 1

(
'Site 1',
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
  'Site 3',
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
  'Site 4',
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

