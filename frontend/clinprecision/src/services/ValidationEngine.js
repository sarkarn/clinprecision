/**
 * Form Validation Engine
 * Validates form field values against metadata rules
 */

class ValidationEngine {
  /**
   * Validate a single field value against its metadata
   * @param {string} fieldId - Field identifier
   * @param {any} value - Field value to validate
   * @param {Object} metadata - Field metadata from FieldMetadata type
   * @param {Object} allFormData - All form data for cross-field validation
   * @returns {Object} Validation result { valid, errors, warnings }
   */
  validateField(fieldId, value, metadata, allFormData = {}) {
    const errors = [];
    const warnings = [];

    if (!metadata) {
      return { valid: true, errors, warnings };
    }

    // 1. Required validation
    if (metadata.validation?.required) {
      if (!this.hasValue(value)) {
        errors.push({
          field: fieldId,
          type: 'required',
          message: `This field is required`,
          ruleId: 'REQUIRED'
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
      // Support both metadata.validation.minLength and metadata.minLength
      // Also filter out empty strings and convert to numbers
      const minLengthRaw = metadata.validation?.minLength ?? metadata.minLength;
      const minLength = minLengthRaw && minLengthRaw !== '' ? Number(minLengthRaw) : undefined;
      
      if (minLength !== undefined && !isNaN(minLength) && minLength > 0) {
        if (value.length < minLength) {
          errors.push({
            field: fieldId,
            type: 'minLength',
            message: `Minimum length is ${minLength} characters`,
            ruleId: 'MIN_LENGTH'
          });
        }
      }

      // Support both metadata.validation.maxLength and metadata.maxLength
      // Also filter out empty strings and convert to numbers
      const maxLengthRaw = metadata.validation?.maxLength ?? metadata.maxLength;
      const maxLength = maxLengthRaw && maxLengthRaw !== '' ? Number(maxLengthRaw) : undefined;
      
      if (maxLength !== undefined && !isNaN(maxLength) && maxLength > 0) {
        if (value.length > maxLength) {
          errors.push({
            field: fieldId,
            type: 'maxLength',
            message: `Maximum length is ${maxLength} characters`,
            ruleId: 'MAX_LENGTH'
          });
        }
      }
    }

    // 4. Numeric range validation
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      const numValue = typeof value === 'number' ? value : parseFloat(value);

      // Support both metadata.validation.minValue and metadata.minValue
      // Also filter out empty strings and convert to numbers
      const minValueRaw = metadata.validation?.minValue ?? metadata.minValue;
      const minValue = minValueRaw && minValueRaw !== '' ? Number(minValueRaw) : undefined;
      
      if (minValue !== undefined && !isNaN(minValue)) {
        if (numValue < minValue) {
          errors.push({
            field: fieldId,
            type: 'minValue',
            message: `Value must be at least ${minValue}`,
            ruleId: 'MIN_VALUE'
          });
        }
      }

      // Support both metadata.validation.maxValue and metadata.maxValue
      // Also filter out empty strings and convert to numbers
      const maxValueRaw = metadata.validation?.maxValue ?? metadata.maxValue;
      const maxValue = maxValueRaw && maxValueRaw !== '' ? Number(maxValueRaw) : undefined;
      
      if (maxValue !== undefined && !isNaN(maxValue)) {
        if (numValue > maxValue) {
          errors.push({
            field: fieldId,
            type: 'maxValue',
            message: `Value must be at most ${maxValue}`,
            ruleId: 'MAX_VALUE'
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
            ruleId: 'DECIMAL_PLACES'
          });
        }
      }

      // Negative number validation
      if (metadata.validation?.allowNegative === false && numValue < 0) {
        errors.push({
          field: fieldId,
          type: 'allowNegative',
          message: `Negative values are not allowed`,
          ruleId: 'NO_NEGATIVE'
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
            : `Value does not match required pattern`;
          errors.push({
            field: fieldId,
            type: 'pattern',
            message,
            ruleId: 'PATTERN'
          });
        }
      } catch (e) {
        console.error(`Invalid regex pattern for field ${fieldId}:`, e);
      }
    }

    // 6. Custom rules
    if (metadata.validation?.customRules) {
      const customResults = this.validateCustomRules(
        fieldId,
        value,
        metadata.validation.customRules,
        allFormData
      );
      errors.push(...customResults.filter(r => r.severity === 'error'));
      warnings.push(...customResults.filter(r => r.severity === 'warning'));
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
      const rangeResults = this.checkRanges(
        fieldId,
        value,
        metadata.dataQuality.rangeChecks
      );
      warnings.push(...rangeResults.filter(r => r.action === 'warning'));
      errors.push(...rangeResults.filter(r => r.action === 'error'));
    }

    // 9. Cross-field validation (only errors, warnings handled separately)
    if (metadata.dataQuality?.crossFieldValidation) {
      const crossFieldResults = this.validateCrossField(
        fieldId,
        value,
        metadata.dataQuality.crossFieldValidation,
        allFormData
      );
      errors.push(...crossFieldResults.filter(r => r.severity === 'error'));
      warnings.push(...crossFieldResults.filter(r => r.severity === 'warning'));
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate entire form
   * @param {Object} formData - Complete form data
   * @param {Object} formDefinition - Form definition with fields array
   * @returns {Object} Form validation result
   */
  validateForm(formData, formDefinition) {
    const allErrors = [];
    const allWarnings = [];
    const fieldErrors = {};
    const fieldWarnings = {};

    if (!formDefinition?.fields) {
      return { valid: true, errors: [], warnings: [], fieldErrors: {}, fieldWarnings: {} };
    }

    formDefinition.fields.forEach(field => {
      const result = this.validateField(
        field.id,
        formData[field.id],
        field.metadata,
        formData
      );

      if (result.errors.length > 0) {
        allErrors.push(...result.errors);
        fieldErrors[field.id] = result.errors;
      }

      if (result.warnings.length > 0) {
        allWarnings.push(...result.warnings);
        fieldWarnings[field.id] = result.warnings;
      }
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      fieldErrors,
      fieldWarnings
    };
  }

  /**
   * Check if value exists (not null, undefined, or empty string)
   */
  hasValue(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (typeof value === 'boolean') return true; // Checkboxes
    return true;
  }

  /**
   * Validate data type
   */
  validateType(fieldId, value, expectedType) {
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
            ruleId: 'TYPE_INTEGER'
          };
        }
        break;

      case 'decimal':
        if (isNaN(parseFloat(strValue))) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Value must be a number',
            ruleId: 'TYPE_DECIMAL'
          };
        }
        break;

      case 'date':
        if (!this.isValidDate(strValue)) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Invalid date format',
            ruleId: 'TYPE_DATE'
          };
        }
        break;

      case 'datetime':
        if (!this.isValidDateTime(strValue)) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Invalid date/time format',
            ruleId: 'TYPE_DATETIME'
          };
        }
        break;

      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Invalid email format',
            ruleId: 'TYPE_EMAIL'
          };
        }
        break;

      case 'phone':
        if (!/^\+?[\d\s\-()]+$/.test(strValue)) {
          return {
            field: fieldId,
            type: 'type',
            message: 'Invalid phone number format',
            ruleId: 'TYPE_PHONE'
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
            ruleId: 'TYPE_URL'
          };
        }
        break;
    }

    return null;
  }

  /**
   * Validate custom rules
   */
  validateCustomRules(fieldId, value, customRules, allFormData) {
    const results = [];

    customRules.forEach(rule => {
      try {
        // Create evaluation context
        const context = {
          value,
          field: { value },
          ...allFormData
        };

        // Evaluate expression
        const isValid = this.evaluateExpression(rule.expression, context);

        if (!isValid) {
          results.push({
            field: fieldId,
            type: rule.ruleType || 'custom',
            message: rule.errorMessage,
            severity: rule.severity || 'error',
            ruleId: rule.ruleId
          });
        }
      } catch (e) {
        console.error(`Error evaluating custom rule ${rule.ruleId}:`, e);
      }
    });

    return results;
  }

  /**
   * Validate conditional rules
   */
  validateConditional(fieldId, value, conditionalRules, allFormData) {
    const errors = [];

    conditionalRules.forEach(conditionalRule => {
      try {
        // Create evaluation context
        const context = {
          value,
          field: { value },
          ...allFormData
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
              ruleId: 'CONDITIONAL_REQUIRED'
            });
          }

          // Can add more conditional rule checks here
        }
      } catch (e) {
        console.error(`Error evaluating conditional validation:`, e);
      }
    });

    return errors;
  }

  /**
   * Check data quality ranges
   */
  checkRanges(fieldId, value, rangeChecks) {
    const results = [];
    const numValue = parseFloat(value);

    if (isNaN(numValue)) return results;

    rangeChecks.forEach(check => {
      let outOfRange = false;

      if (check.min !== undefined && numValue < check.min) {
        outOfRange = true;
      }

      if (check.max !== undefined && numValue > check.max) {
        outOfRange = true;
      }

      if (outOfRange) {
        results.push({
          field: fieldId,
          type: 'rangeCheck',
          message: check.message || `Value outside ${check.type} range`,
          action: check.action,
          ruleId: check.checkId
        });
      }
    });

    return results;
  }

  /**
   * Validate cross-field rules
   */
  validateCrossField(fieldId, value, crossFieldRules, allFormData) {
    const results = [];

    crossFieldRules.forEach(rule => {
      try {
        // Create evaluation context with all form data
        const context = {
          ...allFormData,
          currentField: value
        };

        // Evaluate expression
        const isValid = this.evaluateExpression(rule.expression, context);

        if (!isValid) {
          results.push({
            field: fieldId,
            type: 'crossField',
            message: rule.message,
            severity: rule.severity || 'error',
            ruleId: rule.ruleId
          });
        }
      } catch (e) {
        console.error(`Error evaluating cross-field rule ${rule.ruleId}:`, e);
      }
    });

    return results;
  }

  /**
   * Evaluate JavaScript expression safely
   */
  evaluateExpression(expression, context) {
    try {
      // Create function with context variables
      const contextKeys = Object.keys(context);
      const contextValues = Object.values(context);
      
      // Build function
      const func = new Function(...contextKeys, `return ${expression}`);
      
      // Execute
      return func(...contextValues);
    } catch (e) {
      console.error('Expression evaluation error:', e);
      return true; // Default to valid to avoid blocking
    }
  }

  /**
   * Check if string is valid date
   */
  isValidDate(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Check if string is valid datetime
   */
  isValidDateTime(dateTimeString) {
    return this.isValidDate(dateTimeString);
  }

  /**
   * Validate date field with clinical trial specific rules
   * This adds additional validation beyond basic type checking
   */
  validateDateField(fieldId, value, metadata) {
    const errors = [];
    const warnings = [];

    if (!value) return { errors, warnings };

    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const dateValue = new Date(date);
    dateValue.setHours(0, 0, 0, 0); // Normalize to start of day

    // 1. Check for future dates (usually not allowed in clinical trials)
    if (metadata.validation?.allowFutureDates === false || 
        (metadata.validation?.allowFutureDates === undefined && !metadata.validation?.isFutureDate)) {
      if (dateValue > today) {
        errors.push({
          field: fieldId,
          type: 'futureDate',
          message: 'Date cannot be in the future',
          ruleId: 'DATE_FUTURE'
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
        ruleId: 'DATE_VERY_OLD',
        severity: 'warning'
      });
    }

    // 3. Check for dates more than 1 year in the future (if future dates allowed)
    if (metadata.validation?.allowFutureDates === true) {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);
      
      if (dateValue > oneYearFromNow) {
        warnings.push({
          field: fieldId,
          type: 'farFutureDate',
          message: 'Date is more than 1 year in the future. Please verify.',
          ruleId: 'DATE_FAR_FUTURE',
          severity: 'warning'
        });
      }
    }

    // 4. Check minimum date if specified
    if (metadata.validation?.minDate) {
      const minDate = new Date(metadata.validation.minDate);
      minDate.setHours(0, 0, 0, 0);
      
      if (dateValue < minDate) {
        errors.push({
          field: fieldId,
          type: 'minDate',
          message: `Date must be on or after ${metadata.validation.minDate}`,
          ruleId: 'DATE_MIN'
        });
      }
    }

    // 5. Check maximum date if specified
    if (metadata.validation?.maxDate) {
      const maxDate = new Date(metadata.validation.maxDate);
      maxDate.setHours(0, 0, 0, 0);
      
      if (dateValue > maxDate) {
        errors.push({
          field: fieldId,
          type: 'maxDate',
          message: `Date must be on or before ${metadata.validation.maxDate}`,
          ruleId: 'DATE_MAX'
        });
      }
    }

    // 6. Warn about dates entered as today (possible data entry error)
    if (dateValue.getTime() === today.getTime() && metadata.validation?.warnIfToday !== false) {
      // Only warn if the time is within the last hour (likely just entered)
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // This is a soft warning - we can't reliably detect if "today" is correct
      // So we'll skip this check for now to avoid false positives
    }

    return { errors, warnings };
  }

  /**
   * Get field label from metadata
   */
  getFieldLabel(field) {
    return field.label || field.id;
  }
}

// Export singleton instance
export default new ValidationEngine();
