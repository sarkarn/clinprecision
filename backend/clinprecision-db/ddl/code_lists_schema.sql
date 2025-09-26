

-- Create triggers for audit trail
DELIMITER //

CREATE TRIGGER code_lists_audit_insert
    AFTER INSERT ON code_lists
    FOR EACH ROW
BEGIN
    INSERT INTO code_lists_audit (
        code_list_id, operation_type, new_values, changed_by, change_reason
    ) VALUES (
        NEW.id, 'INSERT', 
        JSON_OBJECT(
            'category', NEW.category,
            'code', NEW.code,
            'display_name', NEW.display_name,
            'description', NEW.description,
            'is_active', NEW.is_active
        ),
        NEW.created_by, 'Initial creation'
    );
END //

CREATE TRIGGER code_lists_audit_update
    AFTER UPDATE ON code_lists
    FOR EACH ROW
BEGIN
    INSERT INTO code_lists_audit (
        code_list_id, operation_type, old_values, new_values, changed_by
    ) VALUES (
        NEW.id, 'UPDATE',
        JSON_OBJECT(
            'category', OLD.category,
            'code', OLD.code,
            'display_name', OLD.display_name,
            'description', OLD.description,
            'is_active', OLD.is_active
        ),
        JSON_OBJECT(
            'category', NEW.category,
            'code', NEW.code,
            'display_name', NEW.display_name,
            'description', NEW.description,
            'is_active', NEW.is_active
        ),
        NEW.updated_by
    );
END //

CREATE TRIGGER code_lists_audit_delete
    AFTER DELETE ON code_lists
    FOR EACH ROW
BEGIN
    INSERT INTO code_lists_audit (
        code_list_id, operation_type, old_values, changed_by, change_reason
    ) VALUES (
        OLD.id, 'DELETE',
        JSON_OBJECT(
            'category', OLD.category,
            'code', OLD.code,
            'display_name', OLD.display_name,
            'description', OLD.description,
            'is_active', OLD.is_active
        ),
        OLD.updated_by, 'Record deleted'
    );
END //

DELIMITER ;

-- Create indexes for performance
-- Note: Using CAST to convert JSON extracted value to VARCHAR for indexing
CREATE INDEX idx_code_lists_color ON code_lists((CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.color')) AS CHAR(100))));
CREATE INDEX idx_code_lists_valid_date ON code_lists(valid_from, valid_to);