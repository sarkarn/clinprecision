package com.clinprecision.clinopsservice.studydesign.domain.model;

import lombok.Value;

import java.util.UUID;

/**
 * FormAssignment - Domain Model (not JPA entity)
 * 
 * Rich domain object representing assignment of a form to a visit.
 * Part of the aggregate's internal state.
 */
@Value
public class FormAssignment {
    
    UUID assignmentId;
    UUID visitId;
    UUID formId;              // Form definition ID
    boolean isRequired;
    boolean isConditional;
    String conditionalLogic;  // Expression or JSON for conditional display
    int displayOrder;
    String instructions;
    
    private FormAssignment(UUID assignmentId, UUID visitId, UUID formId, 
                          boolean isRequired, boolean isConditional, 
                          String conditionalLogic, int displayOrder, String instructions) {
        // Validation
        if (assignmentId == null) {
            throw new IllegalArgumentException("Assignment ID cannot be null");
        }
        if (visitId == null) {
            throw new IllegalArgumentException("Visit ID cannot be null");
        }
        if (formId == null) {
            throw new IllegalArgumentException("Form ID cannot be null");
        }
        if (displayOrder < 1) {
            throw new IllegalArgumentException("Display order must be positive");
        }
        if (isConditional && (conditionalLogic == null || conditionalLogic.trim().isEmpty())) {
            throw new IllegalArgumentException("Conditional logic required for conditional forms");
        }
        
        this.assignmentId = assignmentId;
        this.visitId = visitId;
        this.formId = formId;
        this.isRequired = isRequired;
        this.isConditional = isConditional;
        this.conditionalLogic = conditionalLogic != null ? conditionalLogic.trim() : null;
        this.displayOrder = displayOrder;
        this.instructions = instructions != null ? instructions.trim() : null;
    }
    
    /**
     * Create new form assignment
     */
    public static FormAssignment create(UUID visitId, UUID formId, boolean isRequired, 
                                       boolean isConditional, String conditionalLogic, 
                                       int displayOrder, String instructions) {
        return new FormAssignment(UUID.randomUUID(), visitId, formId, isRequired, 
                                 isConditional, conditionalLogic, displayOrder, instructions);
    }
    
    /**
     * Reconstruct form assignment from events
     */
    public static FormAssignment reconstruct(UUID assignmentId, UUID visitId, UUID formId, 
                                            boolean isRequired, boolean isConditional, 
                                            String conditionalLogic, int displayOrder, 
                                            String instructions) {
        return new FormAssignment(assignmentId, visitId, formId, isRequired, isConditional, 
                                 conditionalLogic, displayOrder, instructions);
    }
    
    /**
     * Update assignment details
     */
    public FormAssignment withUpdatedDetails(boolean isRequired, boolean isConditional, 
                                            String conditionalLogic, String instructions) {
        return new FormAssignment(this.assignmentId, this.visitId, this.formId, 
                                 isRequired, isConditional, conditionalLogic, 
                                 this.displayOrder, instructions);
    }
    
    /**
     * Change display order
     */
    public FormAssignment withDisplayOrder(int newOrder) {
        return new FormAssignment(this.assignmentId, this.visitId, this.formId, 
                                 this.isRequired, this.isConditional, this.conditionalLogic, 
                                 newOrder, this.instructions);
    }
    
    /**
     * Business rule: Check if form is always displayed
     */
    public boolean isAlwaysDisplayed() {
        return !isConditional;
    }
    
    /**
     * Business rule: Check if form is optional
     */
    public boolean isOptional() {
        return !isRequired;
    }
    
    /**
     * Business rule: Check if form has special instructions
     */
    public boolean hasInstructions() {
        return instructions != null && !instructions.isEmpty();
    }
}
