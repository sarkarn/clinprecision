/**
 * Form Validation Engine
 * Validates form field values against metadata rules
 * 
 * Features:
 * - Field-level validation (required, type, length, range, pattern)
 * - Form-level validation (all fields)
 * - Custom validation rules
 * - Conditional validation (based on other fields)
 * - Cross-field validation
 * - Data quality range checks
 * - Clinical trial specific date validation
 * 
 * @see Quality.types.ts
 * @see Backend: FormValidationController.java
 */

import {
  ValidationSeverity,
  DataQualityAction,
} from '@packages/utils/types/domain/Quality.types';
import type {
  ValidationError,
  ValidationWarning,
  FieldValidationResult,
  FormValidationResult,
  ValidationRule,
  ConditionalValidationRule,
  CrossFieldValidationRule,
  RangeCheck,
  FieldValidationMetadata,
  DataQualityMetadata,
  FieldMetadata,
  FormDefinition,
} from '@packages/utils/types/domain/Quality.types';

// ==================== Validation Engine Class ====================

/**
 * Singleton validation engine for form validation
 */
class ValidationEngine {
  /**
   * Validate a single field value against its metadata
   * @param fieldId - Field identifier
   * @param value - Field value to validate
   * @param metadata - Field metadata with validation rules
   * @param allFormData - All form data for cross-field validation
   * @returns Validation result with errors and warnings
   */
  validateField(
    fieldId: string,
    value: any,
    metadata?: FieldMetadata,
    allFormData: Record<string, any> = {}
  ): FieldValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!metadata) {
      return { valid: true, errors, warnings };
    }

    console.log('[VALIDATION_ENGINE] *** Validating field:', fieldId, 'value:', value);

    // 1. Required validation
    if (metadata.validation?.required) {
      if (!this.hasValue(value)) {
        errors.push({
          field: fieldId,
          type: 'required',
          message: 'This field is required',
          severity: ValidationSeverity.ERROR,
          ruleId: 'REQUIRED',
        });
      }
    }

    // If no value and not required, skip other validations
    if (!this.hasValue(value) && !metadata.validation?.required) {
      return { valid: errors.length === 0, errors, warnings };
    }

    // 2. Type validation
    if (metadata.validation?.type) {
      const typeError = this.validateType(fieldId, value, metadata.validation.type);
      if (typeError) errors.push(typeError);
    }

    // 2b. Enhanced date validation for date/datetime fields
    if (metadata.validation?.type === 'date' || metadata.validation?.type === 'datetime') {
      const dateValidation = this.validateDateField(fieldId, value, metadata);
      errors.push(...dateValidation.errors);
      warnings.push(...dateValidation.warnings);
    }

    // 3. String length validation
    if (typeof value === 'string') {
      const minLengthRaw = metadata.validation?.minLength ?? (metadata as any).minLength;
      const minLength = minLengthRaw && minLengthRaw !== '' ? Number(minLengthRaw) : undefined;

      if (minLength !== undefined && !isNaN(minLength) && minLength > 0) {
        if (value.length < minLength) {
          errors.push({
            field: fieldId,
            type: 'minLength',
            message: `Minimum length is ${minLength} characters`,
            severity: ValidationSeverity.ERROR,
            ruleId: 'MIN_LENGTH',
          });
        }
      }

      const maxLengthRaw = metadata.validation?.maxLength ?? (metadata as any).maxLength;
      const maxLength = maxLengthRaw && maxLengthRaw !== '' ? Number(maxLengthRaw) : undefined;

      if (maxLength !== undefined && !isNaN(maxLength) && maxLength > 0) {
        if (value.length > maxLength) {
          errors.push({
            field: fieldId,
            type: 'maxLength',
            message: `Maximum length is ${maxLength} characters`,
            severity: ValidationSeverity.ERROR,
            ruleId: 'MAX_LENGTH',
          });
        }
      }
    }

    // 4. Numeric range validation
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      const numValue = typeof value === 'number' ? value : parseFloat(value);

      const minValueRaw = metadata.validation?.minValue ?? (metadata as any).minValue;
      const minValue = minValueRaw && minValueRaw !== '' ? Number(minValueRaw) : undefined;

      if (minValue !== undefined && !isNaN(minValue)) {
        if (numValue < minValue) {
          errors.push({
            field: fieldId,
            type: 'minValue',
            message: `Value must be at least ${minValue}`,
            severity: ValidationSeverity.ERROR,
            ruleId: 'MIN_VALUE',
          });
        }
      }

      const maxValueRaw = metadata.validation?.maxValue ?? (metadata as any).maxValue;
      const maxValue = maxValueRaw && maxValueRaw !== '' ? Number(maxValueRaw) : undefined;

      if (maxValue !== undefined && !isNaN(maxValue)) {
        if (numValue > maxValue) {
          errors.push({
            field: fieldId,
            type: 'maxValue',
            message: `Value must be at most ${maxValue}`,
            severity: ValidationSeverity.ERROR,
            ruleId: 'MAX_VALUE',
          });
        }
      }

      // Decimal places validation
      if (metadata.validation?.decimalPlaces !== undefined) {
        const decimalPart = numValue.toString().split('.')[1];
        if (decimalPart && decimalPart.length > metadata.validation.decimalPlaces) {
          errors.push({
            field: fieldId,
            type: 'decimalPlaces',
            message: `Maximum ${metadata.validation.decimalPlaces} decimal places allowed`,
            severity: ValidationSeverity.ERROR,
            ruleId: 'DECIMAL_PLACES',
          });
        }
      }

      // Negative number validation
      if (metadata.validation?.allowNegative === false && numValue < 0) {
        errors.push({
          field: fieldId,
          type: 'allowNegative',
          message: 'Negative values are not allowed',
          severity: ValidationSeverity.ERROR,
          ruleId: 'NO_NEGATIVE',
        });
      }
    }

    // 5. Pattern validation
    if (metadata.validation?.pattern) {
      try {
        const regex = new RegExp(metadata.validation.pattern);
        if (!regex.test(String(value))) {
          const message = metadata.validation.patternDescription
            ? `Invalid format. Expected: ${metadata.validation.patternDescription}`
            : 'Value does not match required pattern';
          errors.push({
            field: fieldId,
            type: 'pattern',
            message,
            severity: ValidationSeverity.ERROR,
            ruleId: 'PATTERN',
          });
        }
      } catch (e) {
        console.error(`[VALIDATION_ENGINE] Invalid regex pattern for field ${fieldId}:`, e);
      }
    }

    // 6. Custom rules
    if (metadata.validation?.customRules) {
      const customResults = this.validateCustomRules(fieldId, value, metadata.validation.customRules, allFormData);
      errors.push(...(customResults.filter((r) => r.severity === ValidationSeverity.ERROR) as ValidationError[]));
      warnings.push(...(customResults.filter((r) => r.severity === ValidationSeverity.WARNING) as ValidationWarning[]));
    }

    // 7. Conditional validation
    if (metadata.validation?.conditionalValidation) {
      const conditionalResults = this.validateConditional(
        fieldId,
        value,
        metadata.validation.conditionalValidation,
        allFormData
      );
      errors.push(...conditionalResults);
    }

    // 8. Data quality range checks
    if (metadata.dataQuality?.rangeChecks) {
      const rangeResults = this.checkRanges(fieldId, value, metadata.dataQuality.rangeChecks);
      warnings.push(...(rangeResults.filter((r) => r.severity === ValidationSeverity.WARNING) as ValidationWarning[]));
      errors.push(...(rangeResults.filter((r) => r.severity === ValidationSeverity.ERROR) as ValidationError[]));
    }

    // 9. Cross-field validation
    if (metadata.dataQuality?.crossFieldValidation) {
      const crossFieldResults = this.validateCrossField(
        fieldId,
        value,
        metadata.dataQuality.crossFieldValidation,
        allFormData
      );
      errors.push(...(crossFieldResults.filter((r) => r.severity === ValidationSeverity.ERROR) as ValidationError[]));
      warnings.push(...(crossFieldResults.filter((r) => r.severity === ValidationSeverity.WARNING) as ValidationWarning[]));
    }

    const isValid = errors.length === 0;
    console.log('[VALIDATION_ENGINE] *** Field validation result:', { fieldId, valid: isValid, errorCount: errors.length, warningCount: warnings.length });

    return {
      valid: isValid,
      errors,
      warnings,
    };
  }

  /**
   * Validate entire form
   * @param formData - Complete form data
   * @param formDefinition - Form definition with fields array
   * @returns Form validation result
   */
  validateForm(formData: Record<string, any>, formDefinition: FormDefinition): FormValidationResult {
    console.log('[VALIDATION_ENGINE] *** Validating form:', formDefinition.name, 'fields:', formDefinition.fields?.length || 0);

    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    const fieldErrors: Record<string, ValidationError[]> = {};
    const fieldWarnings: Record<string, ValidationWarning[]> = {};

    if (!formDefinition?.fields) {
      return { valid: true, errors: [], warnings: [], fieldErrors: {}, fieldWarnings: {} };
    }

    formDefinition.fields.forEach((field) => {
      const result = this.validateField(field.id, formData[field.id], field, formData);

      if (result.errors.length > 0) {
        allErrors.push(...result.errors);
        fieldErrors[field.id] = result.errors;
      }

      if (result.warnings.length > 0) {
        allWarnings.push(...result.warnings);
        fieldWarnings[field.id] = result.warnings;
      }
    });

    const isValid = allErrors.length === 0;
    console.log('[VALIDATION_ENGINE] *** Form validation result:', { 
      formId: formDefinition.id, 
      valid: isValid, 
      errorCount: allErrors.length, 
      warningCount: allWarnings.length 
    });

    return {
      valid: isValid,
      errors: allErrors,
      warnings: allWarnings,
      fieldErrors,
      fieldWarnings,
    };
  }

  // ==================== Helper Methods ====================

  /**
   * Check if value exists (not null, undefined, or empty string)
   */
  hasValue(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (typeof value === 'boolean') return true; // Checkboxes
    return true;
  }

  /**
   * Validate data type
   */
  validateType(fieldId: string, value: any, expectedType: string): ValidationError | null {
    const strValue = String(value);

    switch (expectedType) {
      case 'string':
        return null; // Any value can be a string

      case 'integer':
        if (!/^-?\d+$/.test(strValue)) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Value must be an integer',
            severity: ValidationSeverity.ERROR,
            ruleId: 'TYPE_INTEGER',
          };
        }
        break;

      case 'decimal':
        if (isNaN(parseFloat(strValue))) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Value must be a number',
            severity: ValidationSeverity.ERROR,
            ruleId: 'TYPE_DECIMAL',
          };
        }
        break;

      case 'date':
        if (!this.isValidDate(strValue)) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Invalid date format',
            severity: ValidationSeverity.ERROR,
            ruleId: 'TYPE_DATE',
          };
        }
        break;

      case 'datetime':
        if (!this.isValidDateTime(strValue)) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Invalid date/time format',
            severity: ValidationSeverity.ERROR,
            ruleId: 'TYPE_DATETIME',
          };
        }
        break;

      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Invalid email format',
            severity: ValidationSeverity.ERROR,
            ruleId: 'TYPE_EMAIL',
          };
        }
        break;

      case 'phone':
        if (!/^\+?[\d\s\-()]+$/.test(strValue)) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Invalid phone number format',
            severity: ValidationSeverity.ERROR,
            ruleId: 'TYPE_PHONE',
          };
        }
        break;

      case 'url':
        try {
          new URL(strValue);
        } catch {
          return {
            field: fieldId,
            type: 'type',
            message: 'Invalid URL format',
            severity: ValidationSeverity.ERROR,
            ruleId: 'TYPE_URL',
          };
        }
        break;
    }

    return null;
  }

  /**
   * Validate custom rules
   */
  validateCustomRules(
    fieldId: string,
    value: any,
    customRules: ValidationRule[],
    allFormData: Record<string, any>
  ): Array<ValidationError | ValidationWarning> {
    const results: Array<ValidationError | ValidationWarning> = [];

    customRules.forEach((rule) => {
      try {
        // Create evaluation context
        const context = {
          value,
          field: { value },
          ...allFormData,
        };

        // Evaluate expression
        const isValid = this.evaluateExpression(rule.expression, context);

        if (!isValid) {
          const severity = rule.severity || ValidationSeverity.ERROR;
          results.push({
            field: fieldId,
            type: rule.ruleType || 'custom',
            message: rule.errorMessage,
            severity,
            ruleId: rule.ruleId,
          });
        }
      } catch (e) {
        console.error(`[VALIDATION_ENGINE] Error evaluating custom rule ${rule.ruleId}:`, e);
      }
    });

    return results;
  }

  /**
   * Validate conditional rules
   */
  validateConditional(
    fieldId: string,
    value: any,
    conditionalRules: ConditionalValidationRule[],
    allFormData: Record<string, any>
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    conditionalRules.forEach((conditionalRule) => {
      try {
        // Create evaluation context
        const context = {
          value,
          field: { value },
          ...allFormData,
        };

        // Evaluate condition
        const conditionMet = this.evaluateExpression(conditionalRule.condition, context);

        if (conditionMet && conditionalRule.rules) {
          // Apply conditional validation rules
          if (conditionalRule.rules.required && !this.hasValue(value)) {
            errors.push({
              field: fieldId,
              type: 'conditionalRequired',
              message: 'This field is required based on other field values',
              severity: ValidationSeverity.ERROR,
              ruleId: 'CONDITIONAL_REQUIRED',
            });
          }

          // Additional conditional rule checks can be added here
        }
      } catch (e) {
        console.error('[VALIDATION_ENGINE] Error evaluating conditional validation:', e);
      }
    });

    return errors;
  }

  /**
   * Check data quality ranges
   */
  checkRanges(fieldId: string, value: any, rangeChecks: RangeCheck[]): Array<ValidationError | ValidationWarning> {
    const results: Array<ValidationError | ValidationWarning> = [];
    const numValue = parseFloat(value);

    if (isNaN(numValue)) return results;

    rangeChecks.forEach((check) => {
      let outOfRange = false;

      if (check.min !== undefined && numValue < check.min) {
        outOfRange = true;
      }

      if (check.max !== undefined && numValue > check.max) {
        outOfRange = true;
      }

      if (outOfRange) {
        const severity =
          check.action === DataQualityAction.ERROR ? ValidationSeverity.ERROR : ValidationSeverity.WARNING;
        results.push({
          field: fieldId,
          type: 'rangeCheck',
          message: check.message || `Value outside ${check.type} range`,
          severity,
          ruleId: check.checkId,
        });
      }
    });

    return results;
  }

  /**
   * Validate cross-field rules
   */
  validateCrossField(
    fieldId: string,
    value: any,
    crossFieldRules: CrossFieldValidationRule[],
    allFormData: Record<string, any>
  ): Array<ValidationError | ValidationWarning> {
    const results: Array<ValidationError | ValidationWarning> = [];

    crossFieldRules.forEach((rule) => {
      try {
        // Create evaluation context with all form data
        const context = {
          ...allFormData,
          currentField: value,
        };

        // Evaluate expression
        const isValid = this.evaluateExpression(rule.expression, context);

        if (!isValid) {
          const severity = rule.severity || ValidationSeverity.ERROR;
          results.push({
            field: fieldId,
            type: 'crossField',
            message: rule.message,
            severity,
            ruleId: rule.ruleId,
          });
        }
      } catch (e) {
        console.error(`[VALIDATION_ENGINE] Error evaluating cross-field rule ${rule.ruleId}:`, e);
      }
    });

    return results;
  }

  /**
   * Evaluate JavaScript expression safely
   */
  evaluateExpression(expression: string, context: Record<string, any>): boolean {
    try {
      // Create function with context variables
      const contextKeys = Object.keys(context);
      const contextValues = Object.values(context);

      // Build function
      const func = new Function(...contextKeys, `return ${expression}`);

      // Execute
      return func(...contextValues);
    } catch (e) {
      console.error('[VALIDATION_ENGINE] Expression evaluation error:', e);
      return true; // Default to valid to avoid blocking
    }
  }

  /**
   * Check if string is valid date
   */
  isValidDate(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Check if string is valid datetime
   */
  isValidDateTime(dateTimeString: string): boolean {
    return this.isValidDate(dateTimeString);
  }

  /**
   * Validate date field with clinical trial specific rules
   */
  validateDateField(
    fieldId: string,
    value: any,
    metadata: FieldMetadata
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!value) return { errors, warnings };

    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const dateValue = new Date(date);
    dateValue.setHours(0, 0, 0, 0); // Normalize to start of day

    // 1. Check for future dates (usually not allowed in clinical trials)
    const allowFutureDates = (metadata.validation as any)?.allowFutureDates;
    const isFutureDate = (metadata.validation as any)?.isFutureDate;

    if (allowFutureDates === false || (allowFutureDates === undefined && !isFutureDate)) {
      if (dateValue > today) {
        errors.push({
          field: fieldId,
          type: 'futureDate',
          message: 'Date cannot be in the future',
          severity: ValidationSeverity.ERROR,
          ruleId: 'DATE_FUTURE',
        });
      }
    }

    // 2. Check for dates too far in the past (data quality check)
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(today.getFullYear() - 100);

    if (dateValue < hundredYearsAgo) {
      warnings.push({
        field: fieldId,
        type: 'oldDate',
        message: 'Date is more than 100 years ago. Please verify.',
        severity: ValidationSeverity.WARNING,
        ruleId: 'DATE_VERY_OLD',
      });
    }

    // 3. Check for dates more than 1 year in the future (if future dates allowed)
    if (allowFutureDates === true) {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      if (dateValue > oneYearFromNow) {
        warnings.push({
          field: fieldId,
          type: 'farFutureDate',
          message: 'Date is more than 1 year in the future. Please verify.',
          severity: ValidationSeverity.WARNING,
          ruleId: 'DATE_FAR_FUTURE',
        });
      }
    }

    // 4. Check minimum date if specified
    const minDate = (metadata.validation as any)?.minDate;
    if (minDate) {
      const minDateValue = new Date(minDate);
      minDateValue.setHours(0, 0, 0, 0);

      if (dateValue < minDateValue) {
        errors.push({
          field: fieldId,
          type: 'minDate',
          message: `Date must be on or after ${minDate}`,
          severity: ValidationSeverity.ERROR,
          ruleId: 'DATE_MIN',
        });
      }
    }

    // 5. Check maximum date if specified
    const maxDate = (metadata.validation as any)?.maxDate;
    if (maxDate) {
      const maxDateValue = new Date(maxDate);
      maxDateValue.setHours(0, 0, 0, 0);

      if (dateValue > maxDateValue) {
        errors.push({
          field: fieldId,
          type: 'maxDate',
          message: `Date must be on or before ${maxDate}`,
          severity: ValidationSeverity.ERROR,
          ruleId: 'DATE_MAX',
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Get field label from metadata
   */
  getFieldLabel(field: FieldMetadata): string {
    return field.label || field.id;
  }
}

// ==================== Utility Functions ====================

/**
 * Check if validation result has errors
 */
export function hasErrors(result: FieldValidationResult | FormValidationResult): boolean {
  return result.errors.length > 0;
}

/**
 * Check if validation result has warnings
 */
export function hasWarnings(result: FieldValidationResult | FormValidationResult): boolean {
  return result.warnings.length > 0;
}

/**
 * Get error messages as array of strings
 */
export function getErrorMessages(result: FieldValidationResult | FormValidationResult): string[] {
  return result.errors.map((error) => error.message);
}

/**
 * Get warning messages as array of strings
 */
export function getWarningMessages(result: FieldValidationResult | FormValidationResult): string[] {
  return result.warnings.map((warning) => warning.message);
}

/**
 * Filter errors by severity
 */
export function filterBySeverity(
  errors: Array<ValidationError | ValidationWarning>,
  severity: ValidationSeverity
): Array<ValidationError | ValidationWarning> {
  return errors.filter((error) => error.severity === severity);
}

/**
 * Get critical errors only
 */
export function getCriticalErrors(errors: ValidationError[]): ValidationError[] {
  return filterBySeverity(errors, ValidationSeverity.ERROR) as ValidationError[];
}

/**
 * Get warnings only
 */
export function getWarningsOnly(errors: Array<ValidationError | ValidationWarning>): ValidationWarning[] {
  return filterBySeverity(errors, ValidationSeverity.WARNING) as ValidationWarning[];
}

/**
 * Group errors by field
 */
export function groupByField(errors: ValidationError[]): Record<string, ValidationError[]> {
  return errors.reduce((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = [];
    }
    acc[error.field].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);
}

/**
 * Format validation result for display
 */
export function formatValidationResult(result: FormValidationResult): string {
  if (result.valid) {
    return 'Form is valid ✓';
  }

  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;

  let message = `Validation failed: ${errorCount} error(s)`;
  if (warningCount > 0) {
    message += `, ${warningCount} warning(s)`;
  }

  return message;
}

// ==================== Export Singleton Instance ====================

/**
 * Singleton validation engine instance
 */
const validationEngine = new ValidationEngine();

export default validationEngine;

// Also export the class for testing
export { ValidationEngine };
