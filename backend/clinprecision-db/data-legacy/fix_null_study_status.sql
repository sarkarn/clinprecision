-- Fix NULL study statuses
-- Run this SQL to restore proper statuses for studies that were affected by the bug

-- First, check which studies have NULL status
SELECT id, name, study_status_id, created_at 
FROM studies 
WHERE study_status_id IS NULL
ORDER BY id;

-- Fix by setting them to PLANNING (status_id = 2)
-- Adjust status_id based on your study_status table
UPDATE studies 
SET study_status_id = 2  -- 2 = PLANNING (verify this in your study_status table)
WHERE study_status_id IS NULL;

-- Verify the fix
SELECT id, name, study_status_id, created_at 
FROM studies 
WHERE id IN (2, 3, 4, 10)
ORDER BY id;

-- Optional: Check your study_status table to see available statuses
SELECT id, code, name, display_order 
FROM study_status 
ORDER BY display_order;
