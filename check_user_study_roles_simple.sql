-- ============================================================================
-- SIMPLEST QUERY: Quick Data Check
-- Run this first to see what data exists
-- ============================================================================

-- Count total records
SELECT 'Total Records' AS metric, COUNT(*) AS count FROM user_study_roles
UNION ALL
SELECT 'Active Records', COUNT(*) 
FROM user_study_roles 
WHERE start_date <= CURDATE() AND (end_date IS NULL OR end_date >= CURDATE())
UNION ALL
SELECT 'Inactive Records', COUNT(*) 
FROM user_study_roles 
WHERE end_date IS NOT NULL AND end_date < CURDATE()
UNION ALL
SELECT 'Pending Records', COUNT(*) 
FROM user_study_roles 
WHERE start_date > CURDATE();

-- ============================================================================
-- Show all records in a simple readable format
-- ============================================================================
SELECT 
    usr.id AS 'ID',
    CONCAT(u.first_name, ' ', u.last_name) AS 'User',
    s.title AS 'Study',
    r.name AS 'Role',
    usr.start_date AS 'Start',
    usr.end_date AS 'End',
    CASE 
        WHEN usr.start_date > CURDATE() THEN '⏳ PENDING'
        WHEN usr.end_date IS NOT NULL AND usr.end_date < CURDATE() THEN '❌ INACTIVE'
        ELSE '✅ ACTIVE'
    END AS 'Status'
FROM user_study_roles usr
LEFT JOIN users u ON usr.user_id = u.id
LEFT JOIN studies s ON usr.study_id = s.id
LEFT JOIN roles r ON usr.role_id = r.id
ORDER BY usr.id DESC;

-- ============================================================================
-- LOOK FOR DUPLICATES: Same user + study + role appearing multiple times
-- ============================================================================
SELECT 
    CONCAT(u.first_name, ' ', u.last_name) AS 'User',
    s.title AS 'Study',
    r.name AS 'Role',
    COUNT(*) AS 'Occurrences',
    GROUP_CONCAT(usr.id ORDER BY usr.id) AS 'Assignment IDs',
    GROUP_CONCAT(
        CONCAT(usr.start_date, ' to ', IFNULL(usr.end_date, 'ongoing'))
        ORDER BY usr.id SEPARATOR ' | '
    ) AS 'Date Ranges'
FROM user_study_roles usr
LEFT JOIN users u ON usr.user_id = u.id
LEFT JOIN studies s ON usr.study_id = s.id
LEFT JOIN roles r ON usr.role_id = r.id
GROUP BY usr.user_id, usr.study_id, usr.role_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- ============================================================================
-- WHAT TO LOOK FOR:
-- ============================================================================
/*
1. If the "Show all records" query shows duplicates:
   → Each ID should appear once
   → If you see same User+Study+Role multiple times with DIFFERENT IDs,
     you have duplicate data in the database (not a query issue)

2. If the "LOOK FOR DUPLICATES" query returns rows:
   → You have actual duplicate assignments in the database
   → These need to be cleaned up or consolidated
   
3. If the UI shows more records than this query:
   → Backend is creating duplicates (our JOIN FETCH fix should prevent this)
   → Check if backend service was restarted after the fix
   
4. If the UI shows fewer records than this query:
   → Frontend filters might be hiding records
   → Check browser console for errors
   → Check network tab to see what API actually returns
*/
