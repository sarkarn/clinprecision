-- ========================================
-- CodeList Seed Data for Study Management
-- ========================================
-- This script populates the code_lists table with STUDY_PHASE_CATEGORY and STUDY_STATUS entries
-- Used by Study Creation wizard and other study management features
-- 
-- NOTE: Using STUDY_PHASE_CATEGORY instead of STUDY_PHASE to avoid conflicts with existing data
-- NOTE: Using STUDY_STATUS (not STUDY_STATUS_CATEGORY) as this is the correct category name
-- 
-- Table: code_lists
-- Entity: CodeListEntity
-- Required fields: category, code, display_name, created_by
-- 
-- NOTE: Set @system_user_id to a valid user ID in your system before running!
-- ========================================

-- Set system user ID (replace with actual system/admin user ID)
SET @system_user_id = 1;

-- ========================================
-- STUDY_PHASE_CATEGORY CodeList Entries
-- ========================================
-- Clinical trial phases based on FDA/ICH guidelines

INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('STUDY_PHASE_CATEGORY', 'PRECLINICAL', 'Preclinical', 'Laboratory and animal studies before human trials', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-gray-100 text-gray-800', 'icon', 'flask')),
('STUDY_PHASE_CATEGORY', 'PHASE_0', 'Phase 0', 'Exploratory study with limited human exposure', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-indigo-100 text-indigo-800', 'icon', 'beaker')),
('STUDY_PHASE_CATEGORY', 'PHASE_I', 'Phase I', 'First-in-human studies, safety and dosage', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-blue-100 text-blue-800', 'icon', 'activity')),
('STUDY_PHASE_CATEGORY', 'PHASE_I_II', 'Phase I/II', 'Combined Phase I and II studies', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-cyan-100 text-cyan-800', 'icon', 'layers')),
('STUDY_PHASE_CATEGORY', 'PHASE_II', 'Phase II', 'Efficacy and side effects evaluation', 5, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-teal-100 text-teal-800', 'icon', 'check-circle')),
('STUDY_PHASE_CATEGORY', 'PHASE_II_III', 'Phase II/III', 'Combined Phase II and III studies', 6, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-emerald-100 text-emerald-800', 'icon', 'layers')),
('STUDY_PHASE_CATEGORY', 'PHASE_III', 'Phase III', 'Large-scale efficacy and safety confirmation', 7, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-green-100 text-green-800', 'icon', 'users')),
('STUDY_PHASE_CATEGORY', 'PHASE_IV', 'Phase IV', 'Post-marketing surveillance studies', 8, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-lime-100 text-lime-800', 'icon', 'trending-up')),
('STUDY_PHASE_CATEGORY', 'NA', 'Not Applicable', 'Phase not applicable to this study type', 9, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-gray-100 text-gray-600', 'icon', 'minus'))
ON CONFLICT (category, code) DO UPDATE
SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata;

-- ========================================
-- STUDY_STATUS CodeList Entries
-- ========================================
-- Study lifecycle statuses with color coding and edit permissions

INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('STUDY_STATUS', 'DRAFT', 'Draft', 'Study in development', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-gray-100 text-gray-800', 'can_edit', true, 'icon', 'file-text')),
('STUDY_STATUS', 'PROTOCOL_DEVELOPMENT', 'Protocol Development', 'Protocol being developed and reviewed', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-slate-100 text-slate-800', 'can_edit', true, 'icon', 'edit')),
('STUDY_STATUS', 'REGULATORY_SUBMISSION', 'Regulatory Submission', 'Submitted to regulatory authorities for approval', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-amber-100 text-amber-800', 'can_edit', true, 'icon', 'send')),
('STUDY_STATUS', 'REGULATORY_APPROVED', 'Regulatory Approved', 'Approved by regulatory authorities', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-blue-100 text-blue-800', 'can_edit', false, 'icon', 'check-circle')),
('STUDY_STATUS', 'SITE_ACTIVATION', 'Site Activation', 'Sites being activated for recruitment', 5, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-indigo-100 text-indigo-800', 'can_edit', true, 'icon', 'map-pin')),
('STUDY_STATUS', 'ACTIVE', 'Active', 'Study currently active and recruiting', 6, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-green-100 text-green-800', 'can_edit', true, 'icon', 'play-circle')),
('STUDY_STATUS', 'ENROLLING', 'Enrolling', 'Actively enrolling participants', 7, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-emerald-100 text-emerald-800', 'can_edit', true, 'icon', 'user-plus')),
('STUDY_STATUS', 'ENROLLMENT_COMPLETE', 'Enrollment Complete', 'All subjects enrolled, follow-up ongoing', 8, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-teal-100 text-teal-800', 'can_edit', true, 'icon', 'user-check')),
('STUDY_STATUS', 'SUSPENDED', 'Suspended', 'Study temporarily halted', 9, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-orange-100 text-orange-800', 'can_edit', true, 'icon', 'pause-circle')),
('STUDY_STATUS', 'ON_HOLD', 'On Hold', 'Study paused pending review or decision', 10, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-yellow-100 text-yellow-800', 'can_edit', true, 'icon', 'alert-circle')),
('STUDY_STATUS', 'COMPLETED', 'Completed', 'Study completed successfully', 11, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-purple-100 text-purple-800', 'can_edit', false, 'icon', 'check-square')),
('STUDY_STATUS', 'TERMINATED', 'Terminated', 'Study terminated early', 12, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-red-100 text-red-800', 'can_edit', false, 'icon', 'x-circle')),
('STUDY_STATUS', 'WITHDRAWN', 'Withdrawn', 'Study withdrawn before enrollment', 13, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-rose-100 text-rose-800', 'can_edit', false, 'icon', 'arrow-left')),
('STUDY_STATUS', 'CLOSED', 'Closed', 'Study closed, no further activity', 14, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-gray-200 text-gray-900', 'can_edit', false, 'icon', 'lock'))
ON CONFLICT (category, code) DO UPDATE
SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata;

-- ========================================
-- REGULATORY_STATUS CodeList Entries (Optional)
-- ========================================
-- Regulatory approval statuses

INSERT INTO code_lists (category, code, display_name, description, sort_order, is_active, system_code, created_by, metadata) VALUES
('REGULATORY_STATUS', 'NOT_SUBMITTED', 'Not Submitted', 'Not yet submitted to regulatory authority', 1, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-gray-100 text-gray-800', 'icon', 'file')),
('REGULATORY_STATUS', 'PENDING_SUBMISSION', 'Pending Submission', 'Preparing for regulatory submission', 2, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-yellow-100 text-yellow-800', 'icon', 'clock')),
('REGULATORY_STATUS', 'SUBMITTED', 'Submitted', 'Submitted to regulatory authority', 3, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-blue-100 text-blue-800', 'icon', 'send')),
('REGULATORY_STATUS', 'UNDER_REVIEW', 'Under Review', 'Under regulatory review', 4, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-indigo-100 text-indigo-800', 'icon', 'search')),
('REGULATORY_STATUS', 'ADDITIONAL_INFO_REQUESTED', 'Additional Information Requested', 'Regulatory authority requested more information', 5, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-amber-100 text-amber-800', 'icon', 'message-square')),
('REGULATORY_STATUS', 'APPROVED', 'Approved', 'Approved by regulatory authority', 6, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-green-100 text-green-800', 'icon', 'check-circle')),
('REGULATORY_STATUS', 'CONDITIONALLY_APPROVED', 'Conditionally Approved', 'Approved with conditions', 7, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-teal-100 text-teal-800', 'icon', 'check')),
('REGULATORY_STATUS', 'REJECTED', 'Rejected', 'Rejected by regulatory authority', 8, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-red-100 text-red-800', 'icon', 'x-circle')),
('REGULATORY_STATUS', 'WITHDRAWN', 'Withdrawn', 'Submission withdrawn', 9, TRUE, TRUE, @system_user_id, JSON_OBJECT('color', 'bg-rose-100 text-rose-800', 'icon', 'arrow-left'))
ON CONFLICT (category, code) DO UPDATE
SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata;

-- ========================================
-- Verify Data Insertion
-- ========================================
SELECT 'STUDY_PHASE_CATEGORY' as category, COUNT(*) as count FROM code_lists WHERE category = 'STUDY_PHASE_CATEGORY'
UNION ALL
SELECT 'STUDY_STATUS' as category, COUNT(*) as count FROM code_lists WHERE category = 'STUDY_STATUS'
UNION ALL
SELECT 'REGULATORY_STATUS' as category, COUNT(*) as count FROM code_lists WHERE category = 'REGULATORY_STATUS';
