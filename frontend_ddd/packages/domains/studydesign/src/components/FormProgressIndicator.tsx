import React, { FC } from 'react';
import { AlertCircle, CheckCircle, Clock, HelpCircle } from 'lucide-react';

type ValidationSeverity = 'ERROR' | 'CRITICAL';

interface FieldValidationState {
  isValid: boolean;
  error?: string;
  isValidating?: boolean;
  isTouched?: boolean;
  severity?: ValidationSeverity;
}

interface FormProgressIndicatorProps {
  completionPercentage?: number;
  requiredFieldsCompleted?: number;
  totalRequiredFields?: number;
  totalErrors?: number;
  isFormValid?: boolean;
  showDetailedProgress?: boolean;
  fieldValidationStates?: Record<string, FieldValidationState>;
  className?: string;
}

interface FieldValidationIndicatorProps {
  validationState: FieldValidationState;
  showProgress?: boolean;
  className?: string;
}

interface Step {
  id: string;
  title: string;
}

interface StepProgressIndicatorProps {
  steps?: Step[];
  currentStep?: number;
  stepValidationStates?: Record<string, FieldValidationState>;
  className?: string;
}

// Inline validation status that drives the form wizard helper copy
export const FieldValidationIndicator: FC<FieldValidationIndicatorProps> = ({
  validationState,
  showProgress = true,
  className = '',
}) => {
  const { isValid, error, isValidating } = validationState;

  if (isValidating && showProgress) {
    return (
      <div className={`flex items-center text-blue-600 text-sm ${className}`}>
        <Clock className="w-4 h-4 mr-1 animate-spin" />
        <span>Validating...</span>
      </div>
    );
  }

  if (isValid) {
    return (
      <div className={`flex items-center text-green-600 text-sm ${className}`}>
        <CheckCircle className="w-4 h-4 mr-1" />
        <span>Valid</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center text-red-600 text-sm ${className}`}>
        <AlertCircle className="w-4 h-4 mr-1" />
        <span>{error}</span>
      </div>
    );
  }

  return null;
};

// Progress indicator used in the multi-step wizard to visualize step completion
export const StepProgressIndicator: FC<StepProgressIndicatorProps> = ({
  steps = [],
  currentStep = 0,
  stepValidationStates = {},
  className = '',
}) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    {steps.map((step, index) => {
      const validationState = stepValidationStates[step.id];
      const isCompleted = index < currentStep;
      const isCurrent = index === currentStep;
      const hasError = validationState && !validationState.isValid && validationState.error;

      return (
        <div key={step.id} className="flex items-center">
          <div
            className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${isCompleted ? 'bg-green-600 text-white' : ''}
              ${isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
              ${hasError ? 'bg-red-600 text-white' : ''}
              ${!isCompleted && !isCurrent && !hasError ? 'bg-gray-200 text-gray-600' : ''}
            `}
          >
            {isCompleted ? (
              <CheckCircle className="w-5 h-5" />
            ) : hasError ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              index + 1
            )}
          </div>
          {index < steps.length - 1 && <div className={`w-12 h-0.5 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />}
        </div>
      );
    })}
  </div>
);

// Overall form completion indicator with inline validation summaries
const FormProgressIndicator: FC<FormProgressIndicatorProps> = ({
  completionPercentage = 0,
  requiredFieldsCompleted = 0,
  totalRequiredFields = 0,
  totalErrors = 0,
  isFormValid = false,
  showDetailedProgress = true,
  fieldValidationStates = {},
  className = '',
}) => {
  const states = Object.values(fieldValidationStates);
  const validFieldsCount = states.filter((state) => state.isValid && !state.error).length;
  const errorFieldsCount = states.filter((state) => state.error).length;
  const validatingFieldsCount = states.filter((state) => state.isValidating).length;

  const getProgressBarColor = (): string => {
    if (totalErrors > 0 || errorFieldsCount > 0) return 'bg-red-600';
    if (isFormValid && completionPercentage === 100) return 'bg-green-600';
    if (completionPercentage >= 50) return 'bg-blue-600';
    return 'bg-yellow-600';
  };

  const getStatusIcon = (): React.ReactElement => {
    if (totalErrors > 0 || errorFieldsCount > 0) {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    if (isFormValid && completionPercentage === 100) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (validatingFieldsCount > 0) {
      return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
    }
    return <HelpCircle className="w-5 h-5 text-gray-600" />;
  };

  const getStatusMessage = (): string => {
    if (totalErrors > 0 || errorFieldsCount > 0) {
      return `${errorFieldsCount} error${errorFieldsCount !== 1 ? 's' : ''} found`;
    }
    if (isFormValid && completionPercentage === 100) {
      return 'Form is ready to submit';
    }
    if (validatingFieldsCount > 0) {
      return `Validating ${validatingFieldsCount} field${validatingFieldsCount !== 1 ? 's' : ''}...`;
    }
    return `${requiredFieldsCompleted} of ${totalRequiredFields} required fields completed`;
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700">{getStatusMessage()}</span>
        </div>
        <span className="text-sm font-medium text-gray-600">{Math.round(completionPercentage)}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div className={`${getProgressBarColor()} h-2 rounded-full transition-all duration-300`} style={{ width: `${completionPercentage}%` }} />
      </div>

      {showDetailedProgress && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>{validFieldsCount} valid</span>
            </div>
            {errorFieldsCount > 0 && (
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-red-600" />
                <span>{errorFieldsCount} errors</span>
              </div>
            )}
            {validatingFieldsCount > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-blue-600" />
                <span>{validatingFieldsCount} validating</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormProgressIndicator;
