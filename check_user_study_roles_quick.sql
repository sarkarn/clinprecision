-- ============================================================================
-- QUICK REFERENCE: What the UserStudyRoleList UI Should Display
-- This mimics what the backend API returns after the duplicate fix
-- ============================================================================

-- This query shows EXACTLY what GET /api/user-study-roles returns
-- after the JOIN FETCH DISTINCT fix we just applied

SELECT 
    usr.id,
    usr.user_id,
    usr.study_id,
    usr.role_id,
    r.code AS roleCode,
    r.name AS roleName,
    CASE 
        WHEN usr.start_date > CURDATE() THEN 'PENDING'
        WHEN usr.end_date IS NOT NULL AND usr.end_date < CURDATE() THEN 'INACTIVE'
        ELSE 'ACTIVE'
    END AS status,
    CASE 
        WHEN usr.start_date <= CURDATE() 
         AND (usr.end_date IS NULL OR usr.end_date >= CURDATE()) 
        THEN TRUE 
        ELSE FALSE 
    END AS active,
    usr.start_date AS startDate,
    usr.end_date AS endDate,
    usr.created_at AS createdAt,
    usr.updated_at AS updatedAt,
    -- Additional fields populated by enrichWithStudyInfo()
    s.title AS studyName,
    s.protocol_number AS studyCode,
    -- For debugging
    CONCAT(u.first_name, ' ', u.last_name) AS userName,
    u.email AS userEmail
FROM user_study_roles usr
LEFT JOIN users u ON usr.user_id = u.id
LEFT JOIN studies s ON usr.study_id = s.id
LEFT JOIN roles r ON usr.role_id = r.id
ORDER BY usr.id DESC;

-- ============================================================================
-- If you see DUPLICATES in the above query, it means:
-- ============================================================================
/*
1. Multiple rows with SAME id → Indicates JOIN is creating duplicates
   - Check if user has multiple records in users table (shouldn't happen)
   - Check if role has multiple records in roles table (shouldn't happen)
   
2. Multiple rows with DIFFERENT id but same user+study+role → Indicates duplicate assignments
   - This is a data issue, not a query issue
   - Run Query 2 from check_user_study_roles.sql to identify duplicates
   
3. Expected behavior:
   - Each usr.id should appear EXACTLY ONCE
   - DISTINCT in the backend query eliminates any JOIN duplicates
*/
