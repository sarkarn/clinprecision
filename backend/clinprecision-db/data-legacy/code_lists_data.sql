-- ===================================================================
-- Code Lists Data Setup
-- Initial data for all application code lists
-- ===================================================================

-- First, let's set up a system user for data setup (if not exists)
SET @system_user_id = 1; -- Assuming system user ID is 1

-- ===================================================================
-- PROTOCOL VERSION AMENDMENT TYPES
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('AMENDMENT_TYPE', 'MAJOR', 'Major Amendment', 'Protocol changes affecting safety/efficacy', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('requires_regulatory', true, 'impact_level', 'high')),
('AMENDMENT_TYPE', 'MINOR', 'Minor Amendment', 'Administrative changes', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('requires_regulatory', false, 'impact_level', 'low')),
('AMENDMENT_TYPE', 'SAFETY', 'Safety Amendment', 'Safety-related changes', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('requires_regulatory', true, 'impact_level', 'critical', 'priority', 'urgent')),
('AMENDMENT_TYPE', 'ADMINISTRATIVE', 'Administrative Amendment', 'Non-substantial changes', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('requires_regulatory', false, 'impact_level', 'minimal')),
('AMENDMENT_TYPE', 'INITIAL', 'Initial Protocol', 'Initial protocol version', 0, TRUE, TRUE, @system_user_id, JSON_OBJECT('is_initial', true, 'requires_regulatory', true));

-- ===================================================================
-- PROTOCOL VERSION STATUS
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('PROTOCOL_VERSION_STATUS', 'DRAFT', 'Draft', 'Protocol version in development', 1, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT(
        'color', 'bg-gray-100 text-gray-700',
        'can_edit', true,
        'can_submit', true,
        'can_approve', false,
        'can_activate', false
    )),
('PROTOCOL_VERSION_STATUS', 'PROTOCOL_REVIEW', 'Protocol Review', 'Under protocol review', 2, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT(
        'color', 'bg-yellow-100 text-yellow-700',
        'can_edit', false,
        'can_submit', false,
        'can_approve', true,
        'can_activate', false
    )),
('PROTOCOL_VERSION_STATUS', 'APPROVED', 'Approved', 'Protocol version approved', 3, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT(
        'color', 'bg-green-100 text-green-700',
        'can_edit', false,
        'can_submit', false,
        'can_approve', false,
        'can_activate', true
    )),
('PROTOCOL_VERSION_STATUS', 'ACTIVE', 'Active', 'Currently active protocol version', 4, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT(
        'color', 'bg-blue-100 text-blue-700',
        'can_edit', false,
        'can_submit', false,
        'can_approve', false,
        'can_activate', false
    )),
('PROTOCOL_VERSION_STATUS', 'SUPERSEDED', 'Superseded', 'Replaced by newer version', 5, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT(
        'color', 'bg-orange-100 text-orange-700',
        'can_edit', false,
        'can_submit', false,
        'can_approve', false,
        'can_activate', false
    )),
('PROTOCOL_VERSION_STATUS', 'WITHDRAWN', 'Withdrawn', 'Protocol version withdrawn', 6, TRUE, TRUE, @system_user_id, 
    JSON_OBJECT(
        'color', 'bg-red-100 text-red-700',
        'can_edit', false,
        'can_submit', false,
        'can_approve', false,
        'can_activate', false
    ));

-- ===================================================================
-- STUDY STATUS
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('STUDY_STATUS', 'DRAFT', 'Draft', 'Study in development', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-gray-100 text-gray-800', 'can_edit', true)),
('STUDY_STATUS', 'ACTIVE', 'Active', 'Study currently active', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-green-100 text-green-800', 'can_edit', true)),
('STUDY_STATUS', 'APPROVED', 'Approved', 'Study approved by regulatory', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-blue-100 text-blue-800', 'can_edit', false)),
('STUDY_STATUS', 'COMPLETED', 'Completed', 'Study completed', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-purple-100 text-purple-800', 'can_edit', false)),
('STUDY_STATUS', 'TERMINATED', 'Terminated', 'Study terminated early', 5, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-red-100 text-red-800', 'can_edit', false));

-- ===================================================================
-- VISIT TYPES
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('VISIT_TYPE', 'SCREENING', 'Screening', 'Patient screening visit', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('typical_duration', '2-4 hours', 'requires_consent', true)),
('VISIT_TYPE', 'BASELINE', 'Baseline', 'Baseline assessment visit', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('typical_duration', '3-5 hours', 'critical_path', true)),
('VISIT_TYPE', 'TREATMENT', 'Treatment', 'Treatment administration visit', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('typical_duration', '1-2 hours', 'requires_monitoring', true)),
('VISIT_TYPE', 'FOLLOW_UP', 'Follow-up', 'Follow-up assessment visit', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('typical_duration', '1-2 hours', 'can_be_remote', true)),
('VISIT_TYPE', 'UNSCHEDULED', 'Unscheduled', 'Unscheduled safety or adverse event visit', 5, TRUE, TRUE, @system_user_id, JSON_OBJECT('urgent', true, 'flexible_timing', true));

-- ===================================================================
-- STUDY PHASES
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('STUDY_PHASE_CATEGORY', 'PRECLINICAL', 'Preclinical', 'Preclinical research phase', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('requires_ind', false)),
('STUDY_PHASE_CATEGORY', 'EARLY_PHASE', 'Early Phase', 'Early clinical phases (Phase 0, I)', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('requires_ind', true, 'focus', 'safety')),
('STUDY_PHASE_CATEGORY', 'EFFICACY', 'Efficacy', 'Efficacy testing phases (Phase II)', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('requires_ind', true, 'focus', 'efficacy')),
('STUDY_PHASE_CATEGORY', 'REGISTRATION', 'Registration', 'Registration phases (Phase III)', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('requires_ind', true, 'focus', 'confirmation')),
('STUDY_PHASE_CATEGORY', 'POST_MARKET', 'Post-Market', 'Post-market surveillance (Phase IV)', 5, TRUE, TRUE, @system_user_id, JSON_OBJECT('requires_ind', false, 'focus', 'surveillance'));

-- ===================================================================
-- USER STATUS
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('USER_STATUS', 'ACTIVE', 'Active', 'User account is active', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_login', true, 'color', 'text-green-600')),
('USER_STATUS', 'INACTIVE', 'Inactive', 'User account is inactive', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_login', false, 'color', 'text-gray-600')),
('USER_STATUS', 'PENDING', 'Pending', 'User account pending approval', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_login', false, 'color', 'text-yellow-600')),
('USER_STATUS', 'LOCKED', 'Locked', 'User account is locked', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_login', false, 'color', 'text-red-600'));

-- ===================================================================
-- SITE STATUS
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('SITE_STATUS', 'ACTIVE', 'Active', 'Site is active and recruiting', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_recruit', true, 'color', 'text-green-600')),
('SITE_STATUS', 'INACTIVE', 'Inactive', 'Site is inactive', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_recruit', false, 'color', 'text-gray-600')),
('SITE_STATUS', 'PENDING', 'Pending', 'Site activation pending', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_recruit', false, 'color', 'text-yellow-600')),
('SITE_STATUS', 'SUSPENDED', 'Suspended', 'Site temporarily suspended', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_recruit', false, 'color', 'text-orange-600')),
('SITE_STATUS', 'CLOSED', 'Closed', 'Site permanently closed', 5, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_recruit', false, 'color', 'text-red-600'));

-- ===================================================================
-- ORGANIZATION STATUS
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('ORGANIZATION_STATUS', 'ACTIVE', 'Active', 'Organization is active', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'text-green-600')),
('ORGANIZATION_STATUS', 'INACTIVE', 'Inactive', 'Organization is inactive', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'text-gray-600')),
('ORGANIZATION_STATUS', 'PENDING', 'Pending', 'Organization pending approval', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'text-yellow-600'));

-- ===================================================================
-- WORKFLOW STATUS (for data capture workflows)
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('WORKFLOW_STATUS', 'PENDING', 'Pending', 'Workflow is pending execution', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'text-yellow-600', 'icon', 'clock')),
('WORKFLOW_STATUS', 'IN_PROGRESS', 'In Progress', 'Workflow is currently executing', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'text-blue-600', 'icon', 'play')),
('WORKFLOW_STATUS', 'COMPLETED', 'Completed', 'Workflow completed successfully', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'text-green-600', 'icon', 'check')),
('WORKFLOW_STATUS', 'FAILED', 'Failed', 'Workflow failed with errors', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'text-red-600', 'icon', 'x')),
('WORKFLOW_STATUS', 'CANCELLED', 'Cancelled', 'Workflow was cancelled', 5, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'text-gray-600', 'icon', 'slash'));

-- ===================================================================
-- FORM TEMPLATE STATUS
-- ===================================================================
INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('TEMPLATE_STATUS', 'DRAFT', 'Draft', 'Template is in draft state', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_edit', true, 'can_use', false)),
('TEMPLATE_STATUS', 'ACTIVE', 'Active', 'Template is active and ready for use', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_edit', false, 'can_use', true)),
('TEMPLATE_STATUS', 'INACTIVE', 'Inactive', 'Template is inactive', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_edit', false, 'can_use', false)),
('TEMPLATE_STATUS', 'ARCHIVED', 'Archived', 'Template is archived', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('can_edit', false, 'can_use', false));

-- ===================================================================
-- REGISTER CODE LIST USAGE FOR TRACKING
-- ===================================================================
INSERT INTO code_list_usage (category, application_module, usage_type, field_name, is_required) VALUES
-- Protocol Version Management
('AMENDMENT_TYPE', 'clinprecision-studydesign-service', 'DROPDOWN', 'amendmentType', TRUE),
('AMENDMENT_TYPE', 'frontend-protocol-version', 'DROPDOWN', 'amendmentType', TRUE),
('PROTOCOL_VERSION_STATUS', 'clinprecision-studydesign-service', 'VALIDATION', 'status', TRUE),
('PROTOCOL_VERSION_STATUS', 'frontend-protocol-version', 'DISPLAY', 'status', TRUE),

-- Study Management
('STUDY_STATUS', 'clinprecision-studydesign-service', 'VALIDATION', 'status', TRUE),
('STUDY_STATUS', 'frontend-study-management', 'DROPDOWN', 'status', TRUE),
('STUDY_STATUS', 'frontend-study-dashboard', 'FILTER', 'status', FALSE),

-- Visit Management
('VISIT_TYPE', 'clinprecision-studydesign-service', 'VALIDATION', 'visitType', TRUE),
('VISIT_TYPE', 'frontend-visit-definition', 'DROPDOWN', 'visitType', TRUE),

-- User Management
('USER_STATUS', 'clinprecision-user-service', 'VALIDATION', 'status', TRUE),
('USER_STATUS', 'frontend-user-management', 'DROPDOWN', 'status', TRUE),

-- Site Management
('SITE_STATUS', 'clinprecision-studydesign-service', 'VALIDATION', 'status', TRUE),
('SITE_STATUS', 'frontend-site-management', 'DROPDOWN', 'status', TRUE);

-- ===================================================================
-- CREATE VIEWS FOR EASY ACCESS
-- ===================================================================

-- View for active code lists only
CREATE VIEW v_active_code_lists AS
SELECT 
    id,
    category,
    code,
    display_name,
    description,
    sort_order,
    metadata,
    valid_from,
    valid_to
FROM code_lists 
WHERE is_active = TRUE 
  AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
  AND (valid_to IS NULL OR valid_to >= CURRENT_DATE)
ORDER BY category, sort_order, display_name;

-- View for amendment types with permissions
CREATE VIEW v_amendment_types AS
SELECT 
    code,
    display_name,
    description,
    sort_order,
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.requires_regulatory')) as requires_regulatory,
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.impact_level')) as impact_level
FROM code_lists 
WHERE category = 'AMENDMENT_TYPE' 
  AND is_active = TRUE
ORDER BY sort_order;

-- View for protocol version status with UI metadata
CREATE VIEW v_protocol_version_status AS
SELECT 
    code,
    display_name,
    description,
    sort_order,
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.color')) as color_class,
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.can_edit')) = 'true' as can_edit,
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.can_submit')) = 'true' as can_submit,
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.can_approve')) = 'true' as can_approve,
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.can_activate')) = 'true' as can_activate
FROM code_lists 
WHERE category = 'PROTOCOL_VERSION_STATUS' 
  AND is_active = TRUE
ORDER BY sort_order;

-- ===================================================================
-- SAMPLE QUERIES FOR TESTING
-- ===================================================================

-- Get all amendment types
-- SELECT * FROM v_amendment_types;

-- Get protocol version status with UI info
-- SELECT * FROM v_protocol_version_status;

-- Get code list usage by module
-- SELECT category, COUNT(*) as usage_count 
-- FROM code_list_usage 
-- WHERE application_module LIKE 'frontend%' 
-- GROUP BY category;

-- Check audit trail
-- SELECT * FROM code_lists_audit ORDER BY changed_at DESC LIMIT 10;