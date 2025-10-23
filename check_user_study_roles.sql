-- ============================================================================
-- USER STUDY ROLE DIAGNOSTIC QUERIES
-- Purpose: Examine user study role assignments and identify data issues
-- Date: October 22, 2025
-- ============================================================================

-- -----------------------------------------------------------------------------
-- QUERY 1: All User Study Roles with Full Details
-- Shows complete assignment information including user, study, and role names
-- -----------------------------------------------------------------------------
SELECT 
    usr.id AS assignment_id,
    usr.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email AS user_email,
    usr.study_id,
    s.title AS study_name,
    s.protocol_number AS protocol_number,
    usr.role_id,
    r.name AS role_name,
    r.code AS role_code,
    usr.site_id,
    usr.start_date,
    usr.end_date,
    usr.created_at,
    usr.updated_at,
    -- Calculate status
    CASE 
        WHEN usr.start_date > CURDATE() THEN 'PENDING'
        WHEN usr.end_date IS NOT NULL AND usr.end_date < CURDATE() THEN 'INACTIVE'
        ELSE 'ACTIVE'
    END AS status
FROM user_study_roles usr
LEFT JOIN users u ON usr.user_id = u.id
LEFT JOIN studies s ON usr.study_id = s.id
LEFT JOIN roles r ON usr.role_id = r.id
ORDER BY usr.id DESC;

-- -----------------------------------------------------------------------------
-- QUERY 2: Check for Duplicate Assignments
-- Identifies if same user has multiple assignments for same study+role
-- -----------------------------------------------------------------------------
SELECT 
    usr.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    usr.study_id,
    s.title AS study_name,
    usr.role_id,
    r.name AS role_name,
    COUNT(*) AS assignment_count,
    GROUP_CONCAT(usr.id ORDER BY usr.id) AS assignment_ids,
    GROUP_CONCAT(
        CONCAT('ID:', usr.id, ' Start:', usr.start_date, ' End:', IFNULL(usr.end_date, 'NULL'))
        ORDER BY usr.id SEPARATOR ' | '
    ) AS assignment_details
FROM user_study_roles usr
LEFT JOIN users u ON usr.user_id = u.id
LEFT JOIN studies s ON usr.study_id = s.id
LEFT JOIN roles r ON usr.role_id = r.id
GROUP BY usr.user_id, usr.study_id, usr.role_id
HAVING COUNT(*) > 1
ORDER BY assignment_count DESC, usr.user_id;

-- -----------------------------------------------------------------------------
-- QUERY 3: Check for Orphaned Records (Missing User, Study, or Role)
-- Identifies data integrity issues where foreign keys don't match
-- -----------------------------------------------------------------------------
SELECT 
    'Missing User' AS issue_type,
    usr.id AS assignment_id,
    usr.user_id,
    usr.study_id,
    usr.role_id,
    usr.created_at
FROM user_study_roles usr
LEFT JOIN users u ON usr.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Missing Study' AS issue_type,
    usr.id AS assignment_id,
    usr.user_id,
    usr.study_id,
    usr.role_id,
    usr.created_at
FROM user_study_roles usr
LEFT JOIN studies s ON usr.study_id = s.id
WHERE s.id IS NULL

UNION ALL

SELECT 
    'Missing Role' AS issue_type,
    usr.id AS assignment_id,
    usr.user_id,
    usr.study_id,
    usr.role_id,
    usr.created_at
FROM user_study_roles usr
LEFT JOIN roles r ON usr.role_id = r.id
WHERE r.id IS NULL

ORDER BY issue_type, assignment_id;

-- -----------------------------------------------------------------------------
-- QUERY 4: Active Assignments Summary by Study
-- Shows current active assignments grouped by study
-- -----------------------------------------------------------------------------
SELECT 
    s.id AS study_id,
    s.title AS study_name,
    s.protocol_number,
    COUNT(DISTINCT usr.user_id) AS unique_users,
    COUNT(*) AS total_assignments,
    GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ', ') AS roles_assigned
FROM user_study_roles usr
INNER JOIN studies s ON usr.study_id = s.id
INNER JOIN roles r ON usr.role_id = r.id
WHERE usr.start_date <= CURDATE()
  AND (usr.end_date IS NULL OR usr.end_date >= CURDATE())
GROUP BY s.id, s.title, s.protocol_number
ORDER BY total_assignments DESC;

-- -----------------------------------------------------------------------------
-- QUERY 5: User Assignment Summary
-- Shows all assignments per user with status
-- -----------------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email,
    COUNT(*) AS total_assignments,
    SUM(CASE 
        WHEN usr.start_date <= CURDATE() 
         AND (usr.end_date IS NULL OR usr.end_date >= CURDATE()) 
        THEN 1 ELSE 0 
    END) AS active_assignments,
    SUM(CASE 
        WHEN usr.start_date > CURDATE() 
        THEN 1 ELSE 0 
    END) AS pending_assignments,
    SUM(CASE 
        WHEN usr.end_date IS NOT NULL AND usr.end_date < CURDATE() 
        THEN 1 ELSE 0 
    END) AS inactive_assignments,
    GROUP_CONCAT(
        CONCAT(s.title, ' (', r.name, ')')
        ORDER BY usr.created_at DESC
        SEPARATOR ' | '
    ) AS all_assignments
FROM users u
LEFT JOIN user_study_roles usr ON u.id = usr.user_id
LEFT JOIN studies s ON usr.study_id = s.id
LEFT JOIN roles r ON usr.role_id = r.id
GROUP BY u.id, u.first_name, u.last_name, u.email
HAVING total_assignments > 0
ORDER BY active_assignments DESC, total_assignments DESC;

-- -----------------------------------------------------------------------------
-- QUERY 6: Recent Assignment Changes
-- Shows last 20 created/updated assignments
-- -----------------------------------------------------------------------------
SELECT 
    usr.id AS assignment_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    s.title AS study_name,
    r.name AS role_name,
    usr.start_date,
    usr.end_date,
    usr.created_at,
    usr.updated_at,
    CASE 
        WHEN usr.created_at = usr.updated_at THEN 'Created'
        ELSE 'Updated'
    END AS action,
    CASE 
        WHEN usr.start_date > CURDATE() THEN 'PENDING'
        WHEN usr.end_date IS NOT NULL AND usr.end_date < CURDATE() THEN 'INACTIVE'
        ELSE 'ACTIVE'
    END AS status
FROM user_study_roles usr
LEFT JOIN users u ON usr.user_id = u.id
LEFT JOIN studies s ON usr.study_id = s.id
LEFT JOIN roles r ON usr.role_id = r.id
ORDER BY usr.updated_at DESC, usr.created_at DESC
LIMIT 20;

-- -----------------------------------------------------------------------------
-- QUERY 7: Check Table Structure and Constraints
-- Verifies the schema matches expectations
-- -----------------------------------------------------------------------------
DESCRIBE user_study_roles;

-- -----------------------------------------------------------------------------
-- QUERY 8: Check for Date Range Issues
-- Identifies assignments with problematic date ranges
-- -----------------------------------------------------------------------------
SELECT 
    usr.id AS assignment_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    s.title AS study_name,
    r.name AS role_name,
    usr.start_date,
    usr.end_date,
    CASE
        WHEN usr.end_date IS NOT NULL AND usr.end_date < usr.start_date 
            THEN 'End date before start date'
        WHEN usr.start_date > CURDATE() + INTERVAL 1 YEAR 
            THEN 'Start date too far in future'
        WHEN usr.end_date IS NOT NULL AND usr.end_date < CURDATE() - INTERVAL 5 YEAR 
            THEN 'End date very old'
        ELSE 'OK'
    END AS date_issue
FROM user_study_roles usr
LEFT JOIN users u ON usr.user_id = u.id
LEFT JOIN studies s ON usr.study_id = s.id
LEFT JOIN roles r ON usr.role_id = r.id
HAVING date_issue != 'OK'
ORDER BY usr.id;

-- -----------------------------------------------------------------------------
-- QUERY 9: Count Assignments by Role
-- Shows distribution of roles across all assignments
-- -----------------------------------------------------------------------------
SELECT 
    r.id AS role_id,
    r.name AS role_name,
    r.code AS role_code,
    COUNT(usr.id) AS total_assignments,
    SUM(CASE 
        WHEN usr.start_date <= CURDATE() 
         AND (usr.end_date IS NULL OR usr.end_date >= CURDATE()) 
        THEN 1 ELSE 0 
    END) AS active_assignments,
    COUNT(DISTINCT usr.user_id) AS unique_users,
    COUNT(DISTINCT usr.study_id) AS unique_studies
FROM roles r
LEFT JOIN user_study_roles usr ON r.id = usr.role_id
GROUP BY r.id, r.name, r.code
ORDER BY total_assignments DESC;

-- -----------------------------------------------------------------------------
-- QUERY 10: Raw Data Sample (First 50 Records)
-- Shows raw data exactly as stored in database
-- -----------------------------------------------------------------------------
SELECT 
    id,
    user_id,
    role_id,
    study_id,
    site_id,
    start_date,
    end_date,
    created_at,
    updated_at
FROM user_study_roles
ORDER BY id DESC
LIMIT 50;

-- ============================================================================
-- TROUBLESHOOTING NOTES
-- ============================================================================
/*
COMMON ISSUES TO CHECK:

1. DUPLICATES (Query 2):
   - If you see duplicate assignments, check if they have different date ranges
   - Multiple active assignments for same user+study+role indicates a bug

2. ORPHANED RECORDS (Query 3):
   - Missing users: User was deleted but assignment wasn't
   - Missing studies: Study was deleted but assignment wasn't
   - Missing roles: Role was deleted but assignment wasn't

3. DATE ISSUES (Query 8):
   - End date before start date: Data entry error
   - Future start dates: Pending assignments (normal)
   - Very old end dates: Historical data (may need cleanup)

4. WHAT THE UI SHOWS:
   - Frontend filters by: user, study, role, active_only, search term
   - Frontend calls: GET /api/user-study-roles
   - Backend query (after fix): findAllWithUserAndRole() with JOIN FETCH
   
5. IF DATA STILL LOOKS WRONG:
   - Check browser console for API errors
   - Check network tab to see actual API response
   - Compare API response with database query results
   - Verify frontend filter logic isn't hiding records
*/
