import { useState, useCallback } from 'react';
import studyDatabaseBuildService from '../../../../../services/StudyDatabaseBuildService';
import { 
  StudyDatabaseBuild, 
  BuildRequest, 
  ValidationOptions as ServiceValidationOptions,
  CompletionData as ServiceCompletionData 
} from '../../../../../types/study/DatabaseBuild.types';

/**
 * Action type for callbacks
 */
export type BuildActionType = 
  | 'BUILD_CREATED' 
  | 'BUILD_FAILED' 
  | 'VALIDATION_COMPLETED' 
  | 'VALIDATION_FAILED' 
  | 'BUILD_CANCELLED' 
  | 'CANCEL_FAILED' 
  | 'BUILD_COMPLETED' 
  | 'COMPLETE_FAILED';

/**
 * Extended validation options (adds UI-specific options)
 */
export interface ValidationOptions extends ServiceValidationOptions {
  strictValidation?: boolean;
  complianceCheck?: boolean;
  performanceCheck?: boolean;
}

/**
 * Extended completion data (adds UI-specific fields)
 */
export interface CompletionData extends Omit<ServiceCompletionData, 'buildRequestId'> {
  notes?: string;
}

/**
 * Success callback type
 */
export type BuildSuccessCallback = (result: any, actionType: BuildActionType) => void;

/**
 * Error callback type
 */
export type BuildErrorCallback = (error: Error, actionType: BuildActionType) => void;

/**
 * Return type for useBuildActions hook
 */
export interface UseBuildActionsReturn {
  loading: boolean;
  error: Error | null;
  buildDatabase: (buildRequest: BuildRequest) => Promise<StudyDatabaseBuild>;
  validateDatabase: (buildRequestId: string, validationOptions?: ValidationOptions) => Promise<any>;
  cancelBuild: (buildRequestId: string, cancellationReason: string) => Promise<StudyDatabaseBuild>;
  completeBuild: (buildRequestId: string, completionData: CompletionData) => Promise<StudyDatabaseBuild>;
  checkActiveBuild: (studyId: number) => Promise<boolean>;
  getBuildCount: (studyId: number) => Promise<number>;
  clearError: () => void;
}

/**
 * Custom hook for managing build command operations
 * Provides methods for create, validate, cancel, and complete operations
 * 
 * @param onSuccess - Callback function on successful operation
 * @param onError - Callback function on error
 * @returns Command operations and state
 */
export const useBuildActions = (
  onSuccess?: BuildSuccessCallback,
  onError?: BuildErrorCallback
): UseBuildActionsReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Build a study database
   */
  const buildDatabase = useCallback(async (buildRequest: BuildRequest): Promise<StudyDatabaseBuild> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Building study database:', buildRequest);
      const result = await studyDatabaseBuildService.buildStudyDatabase(buildRequest);
      
      console.log('Build created successfully:', result);
      if (onSuccess) {
        onSuccess(result, 'BUILD_CREATED');
      }
      
      return result;
    } catch (err) {
      console.error('Error building database:', err);
      const error = err instanceof Error ? err : new Error('Failed to build database');
      setError(error);
      if (onError) {
        onError(error, 'BUILD_FAILED');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  /**
   * Validate a study database
   */
  const validateDatabase = useCallback(async (
    buildRequestId: string, 
    validationOptions: ValidationOptions = {}
  ): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      
      const serviceOptions: ServiceValidationOptions = {
        checkDataIntegrity: validationOptions.strictValidation !== false,
        validateSchemaStructure: validationOptions.complianceCheck !== false,
        checkBusinessRules: validationOptions.complianceCheck !== false,
        strictMode: validationOptions.strictValidation !== false
      };
      
      console.log('Validating study database:', serviceOptions);
      const result = await studyDatabaseBuildService.validateStudyDatabase(
        buildRequestId,
        serviceOptions
      );
      
      console.log('Validation completed:', result);
      if (onSuccess) {
        onSuccess(result, 'VALIDATION_COMPLETED');
      }
      
      return result;
    } catch (err) {
      console.error('Error validating database:', err);
      const error = err instanceof Error ? err : new Error('Failed to validate database');
      setError(error);
      if (onError) {
        onError(error, 'VALIDATION_FAILED');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  /**
   * Cancel a study database build
   */
  const cancelBuild = useCallback(async (
    buildRequestId: string, 
    cancellationReason: string
  ): Promise<StudyDatabaseBuild> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!cancellationReason || cancellationReason.trim() === '') {
        throw new Error('Cancellation reason is required');
      }
      
      console.log('Cancelling build:', buildRequestId, cancellationReason);
      const result = await studyDatabaseBuildService.cancelStudyDatabaseBuild(
        buildRequestId,
        cancellationReason
      );
      
      console.log('Build cancelled successfully:', result);
      if (onSuccess) {
        onSuccess(result, 'BUILD_CANCELLED');
      }
      
      return result;
    } catch (err) {
      console.error('Error cancelling build:', err);
      const error = err instanceof Error ? err : new Error('Failed to cancel build');
      setError(error);
      if (onError) {
        onError(error, 'CANCEL_FAILED');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  /**
   * Complete a study database build
   */
  const completeBuild = useCallback(async (
    buildRequestId: string, 
    completionData: CompletionData
  ): Promise<StudyDatabaseBuild> => {
    try {
      setLoading(true);
      setError(null);
      
      const serviceCompletionData: ServiceCompletionData = {
        buildRequestId,
        formsConfigured: completionData.formsConfigured,
        tablesCreated: completionData.tablesCreated,
        validationRulesSetup: completionData.validationRulesSetup,
        duration: completionData.duration,
        metadata: completionData.metadata || {}
      };
      
      console.log('Completing build:', buildRequestId, serviceCompletionData);
      const result = await studyDatabaseBuildService.completeStudyDatabaseBuild(
        buildRequestId,
        serviceCompletionData
      );
      
      console.log('Build completed successfully:', result);
      if (onSuccess) {
        onSuccess(result, 'BUILD_COMPLETED');
      }
      
      return result;
    } catch (err) {
      console.error('Error completing build:', err);
      const error = err instanceof Error ? err : new Error('Failed to complete build');
      setError(error);
      if (onError) {
        onError(error, 'COMPLETE_FAILED');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  /**
   * Check if study has active build
   */
  const checkActiveBuild = useCallback(async (studyId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const hasActive = await studyDatabaseBuildService.hasActiveBuild(studyId);
      return hasActive;
    } catch (err) {
      console.error('Error checking active build:', err);
      setError(err instanceof Error ? err : new Error('Failed to check active build'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get build count for study
   */
  const getBuildCount = useCallback(async (studyId: number): Promise<number> => {
    try {
      const count = await studyDatabaseBuildService.getBuildCountForStudy(studyId);
      return count;
    } catch (err) {
      console.error('Error getting build count:', err);
      return 0;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    
    // Command operations
    buildDatabase,
    validateDatabase,
    cancelBuild,
    completeBuild,
    
    // Query operations
    checkActiveBuild,
    getBuildCount,
    
    // Utilities
    clearError,
  };
};
