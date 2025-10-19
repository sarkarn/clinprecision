

-- ============================================================================
-- Step 3: Insert default unscheduled visit configurations
-- ============================================================================
INSERT INTO unscheduled_visit_config 
    (visit_code, visit_name, description, visit_order, is_enabled, created_by) 
VALUES
    ('EARLY_TERM', 'Early Termination Visit', 
     'Visit conducted when subject discontinues from study prematurely', 
     9001, TRUE, 'SYSTEM'),
    
    ('UNSCHED_SAFETY', 'Unscheduled Safety Visit', 
     'Visit conducted for safety monitoring outside scheduled visits', 
     9002, TRUE, 'SYSTEM'),
    
    ('AE_VISIT', 'Adverse Event Visit', 
     'Visit conducted to assess or follow up on adverse event', 
     9003, TRUE, 'SYSTEM'),
    
    ('PROTO_DEV', 'Protocol Deviation Visit', 
     'Visit conducted outside protocol due to deviation or amendment', 
     9004, TRUE, 'SYSTEM'),
    
    ('UNSCHED_FU', 'Unscheduled Follow-up', 
     'Unplanned follow-up visit for additional monitoring', 
     9005, TRUE, 'SYSTEM');

