import { useState, useCallback } from 'react';

/**
 * Step errors map
 */
export interface StepErrors {
  [stepIndex: number]: string;
}

/**
 * Return type for useWizardNavigation hook
 */
export interface UseWizardNavigationReturn {
  // Current state
  currentStep: number;
  completedSteps: number[];
  stepErrors: StepErrors;
  
  // Navigation
  goToStep: (stepIndex: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Step management
  markStepCompleted: (stepIndex?: number) => void;
  markStepIncomplete: (stepIndex?: number) => void;
  setStepError: (stepIndex: number, error: string) => void;
  clearStepError: (stepIndex: number) => void;
  
  // Computed states
  canGoNext: boolean;
  canGoPrevious: boolean;
  isCurrentStepCompleted: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  progressPercentage: number;
  
  // Helpers
  isStepCompleted: (stepIndex: number) => boolean;
  hasStepError: (stepIndex: number) => boolean;
  getStepError: (stepIndex: number) => string | undefined;
  resetWizard: () => void;
}

/**
 * Custom hook for managing multi-step wizard navigation
 */
export const useWizardNavigation = (totalSteps: number): UseWizardNavigationReturn => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepErrors, setStepErrors] = useState<StepErrors>({});

  // Navigate to a specific step
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStep(stepIndex);
    }
  }, [totalSteps]);

  // Go to next step
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  // Go to previous step
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Mark a step as completed
  const markStepCompleted = useCallback((stepIndex: number = currentStep) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    setStepErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[stepIndex];
      return newErrors;
    });
  }, [currentStep]);

  // Mark a step as incomplete
  const markStepIncomplete = useCallback((stepIndex: number = currentStep) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepIndex);
      return newSet;
    });
  }, [currentStep]);

  // Set error for a step
  const setStepError = useCallback((stepIndex: number, error: string) => {
    setStepErrors(prev => ({
      ...prev,
      [stepIndex]: error
    }));
  }, []);

  // Clear error for a step
  const clearStepError = useCallback((stepIndex: number) => {
    setStepErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[stepIndex];
      return newErrors;
    });
  }, []);

  // Check if we can navigate to next step
  const canGoNext = currentStep < totalSteps - 1;

  // Check if we can navigate to previous step
  const canGoPrevious = currentStep > 0;

  // Check if current step is completed
  const isCurrentStepCompleted = completedSteps.has(currentStep);

  // Check if a specific step is completed
  const isStepCompleted = useCallback((stepIndex: number): boolean => {
    return completedSteps.has(stepIndex);
  }, [completedSteps]);

  // Check if a specific step has errors
  const hasStepError = useCallback((stepIndex: number): boolean => {
    return Boolean(stepErrors[stepIndex]);
  }, [stepErrors]);

  // Get error for a specific step
  const getStepError = useCallback((stepIndex: number): string | undefined => {
    return stepErrors[stepIndex];
  }, [stepErrors]);

  // Check if we're on the first step
  const isFirstStep = currentStep === 0;

  // Check if we're on the last step
  const isLastStep = currentStep === totalSteps - 1;

  // Get progress percentage
  const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  // Reset wizard to initial state
  const resetWizard = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setStepErrors({});
  }, []);

  return {
    // Current state
    currentStep,
    completedSteps: Array.from(completedSteps),
    stepErrors,
    
    // Navigation
    goToStep,
    nextStep,
    previousStep,
    
    // Step management
    markStepCompleted,
    markStepIncomplete,
    setStepError,
    clearStepError,
    
    // Computed states
    canGoNext,
    canGoPrevious,
    isCurrentStepCompleted,
    isFirstStep,
    isLastStep,
    progressPercentage,
    
    // Helpers
    isStepCompleted,
    hasStepError,
    getStepError,
    resetWizard
  };
};

export default useWizardNavigation;
