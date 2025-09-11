import { useState, useCallback } from 'react';

/**
 * Custom hook for managing multi-step wizard navigation
 */
export const useWizardNavigation = (totalSteps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepErrors, setStepErrors] = useState({});

  // Navigate to a specific step
  const goToStep = useCallback((stepIndex) => {
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
  const markStepCompleted = useCallback((stepIndex = currentStep) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    setStepErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[stepIndex];
      return newErrors;
    });
  }, [currentStep]);

  // Mark a step as incomplete
  const markStepIncomplete = useCallback((stepIndex = currentStep) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepIndex);
      return newSet;
    });
  }, [currentStep]);

  // Set error for a step
  const setStepError = useCallback((stepIndex, error) => {
    setStepErrors(prev => ({
      ...prev,
      [stepIndex]: error
    }));
  }, []);

  // Clear error for a step
  const clearStepError = useCallback((stepIndex) => {
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
  const isStepCompleted = useCallback((stepIndex) => {
    return completedSteps.has(stepIndex);
  }, [completedSteps]);

  // Check if a specific step has errors
  const hasStepError = useCallback((stepIndex) => {
    return Boolean(stepErrors[stepIndex]);
  }, [stepErrors]);

  // Get error for a specific step
  const getStepError = useCallback((stepIndex) => {
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
