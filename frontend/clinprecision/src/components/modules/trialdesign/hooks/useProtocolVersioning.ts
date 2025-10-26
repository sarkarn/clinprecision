import { useState, useCallback, useEffect } from 'react';
import StudyVersioningService, {
  ProtocolVersion,
  ProtocolVersionStatus as ServiceProtocolVersionStatus,
  ProtocolVersionCreateData as ServiceProtocolVersionCreateData,
  ProtocolVersionUpdateData as ServiceProtocolVersionUpdateData
} from 'services/StudyVersioningService';
import {
  ProtocolVersionStatus,
  AmendmentType,
  ProtocolVersionStatusInfo,
  AmendmentTypeInfo,
  ProtocolVersionStatusConfig,
  AmendmentTypeConfig,
  ProtocolVersionCreateData,
  ProtocolVersionUpdateData
} from '../types/ProtocolVersioning.types';

/**
 * Hook return type for useProtocolVersioning
 */
export interface UseProtocolVersioningReturn {
  // State
  protocolVersions: ProtocolVersion[];
  currentProtocolVersion: ProtocolVersion | null;
  editingVersion: ProtocolVersion | null;
  loading: boolean;
  error: string | null;
  
  // Constants
  PROTOCOL_VERSION_STATUS: ProtocolVersionStatusConfig;
  AMENDMENT_TYPES: AmendmentTypeConfig;
  
  // Actions
  loadProtocolVersions: () => Promise<void>;
  createProtocolVersion: (versionData: Partial<ProtocolVersionCreateData>) => Promise<ProtocolVersion>;
  updateProtocolVersion: (versionId: string | number, updateData: ProtocolVersionUpdateData) => Promise<void>;
  deleteProtocolVersion: (versionId: string | number) => Promise<void>;
  submitForReview: (versionId: string | number) => Promise<void>;
  approveProtocolVersion: (versionId: string | number) => Promise<void>;
  activateProtocolVersion: (versionId: string | number) => Promise<void>;
  setEditingVersion: (version: ProtocolVersion | null) => void;
  
  // Utilities
  generateNextVersionNumber: () => string;
  compareVersionNumbers: (version1: string, version2: string) => number;
  getVersionsByStatus: (status: ProtocolVersionStatus | string) => ProtocolVersion[];
  canPerformAction: (version: ProtocolVersion | null, action: 'edit' | 'submit' | 'approve' | 'activate') => boolean;
  getActiveVersion: () => ProtocolVersion | null;
  getApprovedVersionsCount: () => number;
  clearError: () => void;
}

/**
 * Custom hook for Protocol Version Management
 * Handles CRUD operations for protocol versions with enhanced features
 * 
 * @param studyId - The ID of the study to manage protocol versions for
 * @returns Protocol versioning state and operations
 */
const useProtocolVersioning = (studyId: string | undefined): UseProtocolVersioningReturn => {
  const [protocolVersions, setProtocolVersions] = useState<ProtocolVersion[]>([]);
  const [currentProtocolVersion, setCurrentProtocolVersion] = useState<ProtocolVersion | null>(null);
  const [editingVersion, setEditingVersion] = useState<ProtocolVersion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Protocol Version Status definitions
  const PROTOCOL_VERSION_STATUS: ProtocolVersionStatusConfig = {
    [ProtocolVersionStatus.DRAFT]: {
      value: 'DRAFT',
      label: 'Initial Draft',
      description: 'Protocol version in development',
      color: 'bg-gray-100 text-gray-700',
      canEdit: true,
      canSubmit: true,
      canApprove: false,
      canActivate: false
    },
    [ProtocolVersionStatus.UNDER_REVIEW]: {
      value: 'UNDER_REVIEW',
      label: 'Submitted for Review',
      description: 'Submitted to IRB/EC for review',
      color: 'bg-yellow-100 text-yellow-700',
      canEdit: false,
      canSubmit: false,
      canApprove: false,
      canActivate: false
    },
    [ProtocolVersionStatus.AMENDMENT_REVIEW]: {
      value: 'AMENDMENT_REVIEW',
      label: 'Pending Approval',
      description: 'Under IRB/EC review for approval',
      color: 'bg-blue-100 text-blue-700',
      canEdit: false,
      canSubmit: false,
      canApprove: true,
      canActivate: false
    },
    [ProtocolVersionStatus.APPROVED]: {
      value: 'APPROVED',
      label: 'Approved',
      description: 'Approved by IRB/EC and regulatory bodies',
      color: 'bg-green-100 text-green-700',
      canEdit: false,
      canSubmit: false,
      canApprove: false,
      canActivate: true
    },
    [ProtocolVersionStatus.ACTIVE]: {
      value: 'ACTIVE',
      label: 'Active',
      description: 'Currently active protocol version',
      color: 'bg-emerald-100 text-emerald-700',
      canEdit: false,
      canSubmit: false,
      canApprove: false,
      canActivate: false
    },
    [ProtocolVersionStatus.SUPERSEDED]: {
      value: 'SUPERSEDED',
      label: 'Superseded',
      description: 'Replaced by newer version',
      color: 'bg-orange-100 text-orange-700',
      canEdit: false,
      canSubmit: false,
      canApprove: false,
      canActivate: false
    },
    [ProtocolVersionStatus.WITHDRAWN]: {
      value: 'WITHDRAWN',
      label: 'Withdrawn',
      description: 'Protocol version withdrawn',
      color: 'bg-red-100 text-red-700',
      canEdit: false,
      canSubmit: false,
      canApprove: false,
      canActivate: false
    }
  };

  // Amendment Types for protocol versions
  const AMENDMENT_TYPES: AmendmentTypeConfig = {
    [AmendmentType.INITIAL]: {
      value: 'INITIAL',
      label: 'Initial Protocol',
      description: 'Initial protocol version'
    },
    [AmendmentType.MAJOR]: {
      value: 'MAJOR',
      label: 'Major Amendment',
      description: 'Protocol changes affecting safety/efficacy'
    },
    [AmendmentType.MINOR]: {
      value: 'MINOR',
      label: 'Minor Amendment',
      description: 'Administrative changes'
    },
    [AmendmentType.SAFETY]: {
      value: 'SAFETY',
      label: 'Safety Amendment',
      description: 'Safety-related changes'
    },
    [AmendmentType.ADMINISTRATIVE]: {
      value: 'ADMINISTRATIVE',
      label: 'Administrative Amendment',
      description: 'Non-substantial changes'
    }
  };

  // Clear error helper
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Compare version numbers (e.g., "1.0", "1.1", "2.0")
  const compareVersionNumbers = useCallback((version1: string, version2: string): number => {
    const parts1 = version1.split('.').map(Number);
    const parts2 = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    return 0;
  }, []);

  // Helper function to reload versions (stable reference)
  const reloadVersions = useCallback(async (): Promise<void> => {
    if (!studyId || typeof studyId !== 'string') return;
    
    try {
      const versions = await StudyVersioningService.getVersionHistory(studyId);
      const transformedVersions = versions.map((version: any) => ({
        ...version,
        versionNumber: version.versionNumber || version.version,
        statusInfo: PROTOCOL_VERSION_STATUS[version.status as ProtocolVersionStatus] || PROTOCOL_VERSION_STATUS[ProtocolVersionStatus.DRAFT]
      })).sort((a: ProtocolVersion, b: ProtocolVersion) => {
        const versionCompare = compareVersionNumbers(b.versionNumber || '1.0', a.versionNumber || '1.0');
        if (versionCompare !== 0) return versionCompare;
        return new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime();
      });

      setProtocolVersions(transformedVersions);
      
      // Set current version (Service uses PUBLISHED instead of ACTIVE)
      const activeVersion = transformedVersions.find((v: ProtocolVersion) => v.status === 'PUBLISHED');
      const latestApproved = transformedVersions.find((v: ProtocolVersion) => v.status === 'APPROVED');
      const latestDraft = transformedVersions.find((v: ProtocolVersion) => 
        v.status === 'DRAFT' || v.status === 'UNDER_REVIEW'
      );
      
      setCurrentProtocolVersion(activeVersion || latestApproved || latestDraft || transformedVersions[0] || null);
    } catch (error) {
      console.error('Error reloading protocol versions:', error);
      throw error;
    }
  }, [studyId, compareVersionNumbers, PROTOCOL_VERSION_STATUS]);

  // Load protocol versions for a study
  const loadProtocolVersions = useCallback(async (): Promise<void> => {
    if (!studyId || typeof studyId !== 'string') {
      console.warn('Invalid studyId provided to loadProtocolVersions:', studyId);
      return;
    }

    try {
      setLoading(true);
      clearError();
      
      await reloadVersions();
      
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to load protocol versions';
      console.error('Error loading protocol versions:', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [studyId, clearError, reloadVersions]);

  // Generate next version number suggestion
  const generateNextVersionNumber = useCallback((): string => {
    if (protocolVersions.length === 0) {
      return '1.0';
    }

    const latestVersion = protocolVersions[0]; // Already sorted
    const parts = latestVersion.versionNumber.split('.').map(Number);
    
    // Increment minor version by default
    if (parts.length >= 2) {
      parts[1] += 1;
      return parts.join('.');
    }
    
    // Fallback for single digit versions
    return `${parts[0] || 1}.1`;
  }, [protocolVersions]);

  // Create new protocol version
  const createProtocolVersion = useCallback(async (versionData: Partial<ProtocolVersionCreateData>): Promise<ProtocolVersion> => {
    if (!studyId || typeof studyId !== 'string') {
      console.error('Invalid studyId provided to createProtocolVersion:', studyId);
      throw new Error('Invalid study ID');
    }

    try {
      setLoading(true);
      clearError();

      // Determine if this is the initial version
      const isInitialVersion = protocolVersions.length === 0;
      const amendmentType = versionData.amendmentType || (isInitialVersion ? 'INITIAL' : 'MINOR');
      
      // Provide default changesSummary based on amendment type
      let changesSummary: string | null = (versionData as any).changesSummary?.trim() || null;
      
      // If changesSummary is not provided, create a default based on amendment type
      if (!changesSummary) {
        if (isInitialVersion || amendmentType === 'INITIAL') {
          changesSummary = 'Initial protocol version';
        } else if (amendmentType === 'MAJOR') {
          changesSummary = 'Major protocol amendment';
        } else if (amendmentType === 'MINOR') {
          changesSummary = 'Minor protocol amendment';
        } else if (amendmentType === 'SAFETY') {
          changesSummary = 'Safety-related protocol amendment';
        } else if (amendmentType === 'ADMINISTRATIVE') {
          changesSummary = 'Administrative protocol amendment';
        } else {
          changesSummary = 'Protocol version update';
        }
      }
      
      const newVersionData: any = {
        studyId: parseInt(studyId, 10), // Convert string to number for service
        versionNumber: versionData.versionNumber || generateNextVersionNumber(),
        description: versionData.description || '',
        amendmentType: amendmentType,
        amendmentReason: (versionData as any).amendmentReason?.trim() || null,
        changesSummary: changesSummary,
        effectiveDate: versionData.effectiveDate || null,
        requiresRegulatoryApproval: (versionData as any).requiresRegulatoryApproval !== false,
        notifyStakeholders: (versionData as any).notifyStakeholders !== false,
        status: 'DRAFT',
        createdBy: 1 // TODO: Get from auth context
      };

      // Parse studyId to number for service call
      const numericStudyId = parseInt(studyId, 10);
      if (isNaN(numericStudyId)) {
        throw new Error('Invalid study ID format');
      }

      const createdVersion = await StudyVersioningService.createVersion(numericStudyId, newVersionData);
      
      // Reload versions to get updated state
      await reloadVersions();
      
      return createdVersion; // Service returns compatible ProtocolVersion type
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to create protocol version';
      console.error('Error creating protocol version:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [studyId, generateNextVersionNumber, protocolVersions.length, clearError, reloadVersions]);

  // Submit protocol version for review
  const submitForReview = useCallback(async (versionId: string | number): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      await StudyVersioningService.updateVersionStatus(
        versionId, 
        'UNDER_REVIEW',
        'Submitted for internal review'
      );
      await reloadVersions();
      
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to submit version for review';
      console.error('Error submitting version for review:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [reloadVersions, clearError]);

  // Approve protocol version
  const approveProtocolVersion = useCallback(async (versionId: string | number): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      await StudyVersioningService.updateVersionStatus(
        versionId, 
        'APPROVED',
        'Protocol version approved'
      );
      await reloadVersions();
      
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to approve protocol version';
      console.error('Error approving protocol version:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [reloadVersions, clearError]);

  // Activate protocol version (marks others as superseded)
  const activateProtocolVersion = useCallback(async (versionId: string | number): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      await StudyVersioningService.updateVersionStatus(
        versionId, 
        'PUBLISHED' as ServiceProtocolVersionStatus, // Service uses PUBLISHED for active state
        'Protocol version activated for use in trial'
      );
      await reloadVersions();
      
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to activate protocol version';
      console.error('Error activating protocol version:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [reloadVersions, clearError]);

  // Update protocol version
  const updateProtocolVersion = useCallback(async (versionId: string | number, updateData: ProtocolVersionUpdateData): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      await StudyVersioningService.updateVersion(versionId, updateData);
      await reloadVersions();
      
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to update protocol version';
      console.error('Error updating protocol version:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [reloadVersions, clearError]);

  // Delete protocol version (only if DRAFT)
  const deleteProtocolVersion = useCallback(async (versionId: string | number): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      await StudyVersioningService.deleteVersion(versionId);
      await reloadVersions();
      
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to delete protocol version';
      console.error('Error deleting protocol version:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [reloadVersions, clearError]);

  // Get versions by status
  const getVersionsByStatus = useCallback((status: ProtocolVersionStatus | string): ProtocolVersion[] => {
    return protocolVersions.filter(version => version.status === status);
  }, [protocolVersions]);

  // Check if version can perform action
  const canPerformAction = useCallback((version: ProtocolVersion | null, action: 'edit' | 'submit' | 'approve' | 'activate'): boolean => {
    const statusInfo = version?.status ? PROTOCOL_VERSION_STATUS[version.status as ProtocolVersionStatus] : null;
    if (!statusInfo) return false;
    
    switch (action) {
      case 'edit':
        return statusInfo.canEdit;
      case 'submit':
        return statusInfo.canSubmit;
      case 'approve':
        return statusInfo.canApprove;
      case 'activate':
        return statusInfo.canActivate;
      default:
        return false;
    }
  }, [PROTOCOL_VERSION_STATUS]);

  // Get active protocol version (Service uses PUBLISHED instead of ACTIVE)
  const getActiveVersion = useCallback((): ProtocolVersion | null => {
    return protocolVersions.find(version => version.status === 'PUBLISHED') || null;
  }, [protocolVersions]);

  // Get approved versions count
  const getApprovedVersionsCount = useCallback((): number => {
    return protocolVersions.filter(version => 
      version.status === 'APPROVED' || version.status === 'PUBLISHED' // PUBLISHED is the service's active state
    ).length;
  }, [protocolVersions]);

  // Load versions on mount and when studyId changes
  useEffect(() => {
    if (studyId) {
      loadProtocolVersions();
    }
  }, [studyId]); // Remove loadProtocolVersions from dependencies to prevent infinite loop

  return {
    // State
    protocolVersions,
    currentProtocolVersion,
    editingVersion,
    loading,
    error,
    
    // Constants
    PROTOCOL_VERSION_STATUS,
    AMENDMENT_TYPES,
    
    // Actions
    loadProtocolVersions,
    createProtocolVersion,
    updateProtocolVersion,
    deleteProtocolVersion,
    submitForReview,
    approveProtocolVersion,
    activateProtocolVersion,
    setEditingVersion,
    
    // Utilities
    generateNextVersionNumber,
    compareVersionNumbers,
    getVersionsByStatus,
    canPerformAction,
    getActiveVersion,
    getApprovedVersionsCount,
    clearError
  };
};

export default useProtocolVersioning;
