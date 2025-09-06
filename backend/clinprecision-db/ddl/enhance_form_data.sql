-- Enhance form_data table with version-related fields
ALTER TABLE form_data
ADD COLUMN uses_latest_form_version BOOLEAN DEFAULT TRUE AFTER form_version,
ADD COLUMN entry_reason VARCHAR(255) AFTER data,
ADD COLUMN form_version_used VARCHAR(255) AFTER entry_reason;

-- Add SUPERSEDED status to form_data status enum
ALTER TABLE form_data
MODIFY COLUMN status ENUM('not_started', 'incomplete', 'complete', 'signed', 'locked', 'superseded') DEFAULT 'not_started';

-- Create form_data_history table to track all changes to form data
CREATE TABLE form_data_history (
  id VARCHAR(36) PRIMARY KEY,
  form_data_id VARCHAR(36) NOT NULL,
  subject_id VARCHAR(36) NOT NULL,
  subject_visit_id VARCHAR(36) NOT NULL,
  form_definition_id VARCHAR(36) NOT NULL,
  form_version VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  data JSON,
  changed_by BIGINT,
  change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  change_type ENUM('create', 'update', 'sign', 'lock', 'unlock', 'version_upgrade') NOT NULL,
  change_reason TEXT,
  FOREIGN KEY (form_data_id) REFERENCES form_data(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Add audit trigger for form_data
DELIMITER //
CREATE TRIGGER after_form_data_update
AFTER UPDATE ON form_data
FOR EACH ROW
BEGIN
  DECLARE change_type VARCHAR(20);
  
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'signed' THEN
      SET change_type = 'sign';
    ELSEIF NEW.status = 'locked' THEN
      SET change_type = 'lock';
    ELSEIF OLD.status = 'locked' AND NEW.status != 'locked' THEN
      SET change_type = 'unlock';
    ELSE
      SET change_type = 'update';
    END IF;
  ELSEIF OLD.form_definition_id != NEW.form_definition_id OR OLD.form_version != NEW.form_version THEN
    SET change_type = 'version_upgrade';
  ELSE
    SET change_type = 'update';
  END IF;
  
  INSERT INTO form_data_history (
    id, form_data_id, subject_id, subject_visit_id, 
    form_definition_id, form_version, status, data,
    changed_by, change_timestamp, change_type, change_reason
  )
  VALUES (
    UUID(), NEW.id, NEW.subject_id, NEW.subject_visit_id,
    NEW.form_definition_id, NEW.form_version, NEW.status, NEW.data,
    NEW.updated_by, NOW(), change_type, NEW.entry_reason
  );
END //
DELIMITER ;

-- Add audit trigger for form_data creation
DELIMITER //
CREATE TRIGGER after_form_data_insert
AFTER INSERT ON form_data
FOR EACH ROW
BEGIN
  INSERT INTO form_data_history (
    id, form_data_id, subject_id, subject_visit_id, 
    form_definition_id, form_version, status, data,
    changed_by, change_timestamp, change_type, change_reason
  )
  VALUES (
    UUID(), NEW.id, NEW.subject_id, NEW.subject_visit_id,
    NEW.form_definition_id, NEW.form_version, NEW.status, NEW.data,
    NEW.created_by, NOW(), 'create', NEW.entry_reason
  );
END //
DELIMITER ;
