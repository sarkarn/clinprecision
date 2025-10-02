import { useState, useCallback } from 'react';
import studyDatabaseBuildService from '../../../../../services/StudyDatabaseBuildService';

/**
 * Custom hook for managing build command operations
 * Provides methods for create, validate, cancel, and complete operations
 * 
 * @param {Function} onSuccess - Callback function on successful operation
 * @param {Function} onError - Callback function on error
 * @returns {Object} Command operations and state
 */
export const useBuildActions = (onSuccess, onError) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Build a study database
   */
  const buildDatabase = useCallback(async (buildRequest) => {
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
      setError(err);
      if (onError) {
        onError(err, 'BUILD_FAILED');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  /**
   * Validate a study database
   */
  const validateDatabase = useCallback(async (buildRequestId, validationOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const defaultOptions = {
        buildRequestId,
        strictValidation: true,
        complianceCheck: true,
        performanceCheck: false,
        ...validationOptions
      };
      
      console.log('Validating study database:', defaultOptions);
      const result = await studyDatabaseBuildService.validateStudyDatabase(
        buildRequestId,
        defaultOptions
      );
      
      console.log('Validation completed:', result);
      if (onSuccess) {
        onSuccess(result, 'VALIDATION_COMPLETED');
      }
      
      return result;
    } catch (err) {
      console.error('Error validating database:', err);
      setError(err);
      if (onError) {
        onError(err, 'VALIDATION_FAILED');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  /**
   * Cancel a study database build
   */
  const cancelBuild = useCallback(async (buildRequestId, cancellationReason) => {
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
      setError(err);
      if (onError) {
        onError(err, 'CANCEL_FAILED');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  /**
   * Complete a study database build
   */
  const completeBuild = useCallback(async (buildRequestId, completionData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Completing build:', buildRequestId, completionData);
      const result = await studyDatabaseBuildService.completeStudyDatabaseBuild(
        buildRequestId,
        completionData
      );
      
      console.log('Build completed successfully:', result);
      if (onSuccess) {
        onSuccess(result, 'BUILD_COMPLETED');
      }
      
      return result;
    } catch (err) {
      console.error('Error completing build:', err);
      setError(err);
      if (onError) {
        onError(err, 'COMPLETE_FAILED');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  /**
   * Check if study has active build
   */
  const checkActiveBuild = useCallback(async (studyId) => {
    try {
      setLoading(true);
      setError(null);
      
      const hasActive = await studyDatabaseBuildService.hasActiveBuild(studyId);
      return hasActive;
    } catch (err) {
      console.error('Error checking active build:', err);
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get build count for study
   */
  const getBuildCount = useCallback(async (studyId) => {
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
