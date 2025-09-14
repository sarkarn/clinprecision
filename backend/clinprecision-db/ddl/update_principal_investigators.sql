-- Update Principal Investigators for existing studies for testing
-- Run this script to test the Principal Investigator field updates

UPDATE studies SET principal_investigator = 'Dr. Sarah Johnson' WHERE id = 1;
UPDATE studies SET principal_investigator = 'Dr. Michael Chen' WHERE id = 2;
UPDATE studies SET principal_investigator = 'Dr. Emily Rodriguez' WHERE id = 3;
UPDATE studies SET principal_investigator = 'Dr. James Wilson' WHERE id = 4;
UPDATE studies SET principal_investigator = 'Dr. Maria Garcia' WHERE id = 5;
UPDATE studies SET principal_investigator = 'Dr. David Thompson' WHERE id = 6;

-- Verify the updates
SELECT id, name, principal_investigator FROM studies WHERE principal_investigator IS NOT NULL;