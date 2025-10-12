USE clinprecisiondb;

DELIMITER $$

-- Grant permissions (adjust as needed for your user)
GRANT SELECT, INSERT, UPDATE, DELETE ON study_design_progress TO 'clinprecadmin'@'localhost';
GRANT SELECT ON v_study_design_progress_summary TO 'clinprecadmin'@'localhost';
-- Grant execute permissions on procedures
GRANT EXECUTE ON PROCEDURE InitializeStudyDesignProgress TO 'clinprecadmin'@'localhost';
GRANT EXECUTE ON PROCEDURE MarkPhaseCompleted TO 'clinprecadmin'@'localhost';
-- Grant permissions to the application user
GRANT SELECT, INSERT, UPDATE, DELETE ON study_documents TO 'clinprecadmin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON study_document_audit TO 'clinprecadmin'@'localhost';



