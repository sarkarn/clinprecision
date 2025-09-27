package com.clinprecision.common.application.command;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/**
 * Base class for all commands in the system
 * Provides common functionality for command validation and metadata
 */
@Getter
public abstract class BaseCommand {
    
    private final String commandId;
    private final LocalDateTime timestamp;
    private static final Validator validator;
    
    static {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }
    
    protected BaseCommand() {
        this.commandId = UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
    }
    
    /**
     * Validate the command using Bean Validation annotations and custom business rules
     */
    public void validate() {
        // Bean Validation
        Set<ConstraintViolation<BaseCommand>> violations = validator.validate(this);
        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder("Command validation failed: ");
            violations.forEach(violation -> 
                sb.append(violation.getPropertyPath())
                  .append(" ")
                  .append(violation.getMessage())
                  .append("; ")
            );
            throw new IllegalArgumentException(sb.toString());
        }
    }
    
    /**
     * Get command type for logging and auditing
     */
    public String getCommandType() {
        return this.getClass().getSimpleName();
    }
    
    @Override
    public String toString() {
        return String.format("%s{commandId='%s', timestamp=%s}", 
            getCommandType(), commandId, timestamp);
    }
}