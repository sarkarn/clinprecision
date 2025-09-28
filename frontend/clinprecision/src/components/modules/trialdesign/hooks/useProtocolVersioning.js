import { useState, useCallback, useEffect } from 'react';
import StudyVersioningService from '../../../../services/StudyVersioningService';

/**
 * Custom hook for Protocol Version Management
 * Handles CRUD operations for protocol versions with enhanced features
 */
const useProtocolVersioning = (studyId) => {
  const [protocolVersions, setProtocolVersions] = useState([]);
  const [currentProtocolVersion, setCurrentProtocolVersion] = useState(null);
  const [editingVersion, setEditingVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Protocol Version Status definitions
  const PROTOCOL_VERSION_STATUS = {
    DRAFT: {
      value: 'DRAFT',
      label: 'Initial Draft',
      description: 'Protocol version in development',
      color: 'bg-gray-100 text-gray-700',
      canEdit: true,
      canSubmit: true,
      canApprove: false,
      canActivate: false
    },
    UNDER_REVIEW: {
      value: 'UNDER_REVIEW',
      label: 'Submitted for Review',
      description: 'Submitted to IRB/EC for review',
      color: 'bg-yellow-100 text-yellow-700',
      canEdit: false,
      canSubmit: false,
      canApprove: false,
      canActivate: false
    },
    AMENDMENT_REVIEW: {
      value: 'AMENDMENT_REVIEW',
      label: 'Pending Approval',
      description: 'Under IRB/EC review for approval',
      color: 'bg-blue-100 text-blue-700',
      canEdit: false,
      canSubmit: false,
      canApprove: true,
      canActivate: false
    },
    APPROVED: {
      value: 'APPROVED',
      label: 'Approved',
      description: 'Approved by IRB/EC and regulatory bodies',
      color: 'bg-green-100 text-green-700',
      canEdit: false,
      canSubmit: false,
      canApprove: false,
      canActivate: true
    },
    ACTIVE: {
      value: 'ACTIVE',
      label: 'Active',
      description: 'Currently active protocol version',
      color: 'bg-emerald-100 text-emerald-700',
      canEdit: false,
      canSubmit: false,
      canApprove: false,
      canActivate: false
    },
    SUPERSEDED: {
      value: 'SUPERSEDED',
      label: 'Superseded',
      description: 'Replaced by newer version',
      color: 'bg-orange-100 text-orange-700',
      canEdit: false,
      canSubmit: false,
      canApprove: false,
      canActivate: false
    },
    WITHDRAWN: {
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
  const AMENDMENT_TYPES = {
    INITIAL: {
      value: 'INITIAL',
      label: 'Initial Protocol',
      description: 'Initial protocol version'
    },
    MAJOR: {
      value: 'MAJOR',
      label: 'Major Amendment',
      description: 'Protocol changes affecting safety/efficacy'
    },
    MINOR: {
      value: 'MINOR',
      label: 'Minor Amendment',
      description: 'Administrative changes'
    },
    SAFETY: {
      value: 'SAFETY',
      label: 'Safety Amendment',
      description: 'Safety-related changes'
    },
    ADMINISTRATIVE: {
      value: 'ADMINISTRATIVE',
      label: 'Administrative Amendment',
      description: 'Non-substantial changes'
    }
  };

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Compare version numbers (e.g., "1.0", "1.1", "2.0")
  const compareVersionNumbers = useCallback((version1, version2) => {
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
  const reloadVersions = useCallback(async () => {
    if (!studyId || typeof studyId !== 'string') return;
    
    try {
      const versions = await StudyVersioningService.getVersionHistory(studyId);
      const transformedVersions = versions.map(version => ({
        ...version,
        versionNumber: version.versionNumber || version.version,
        statusInfo: PROTOCOL_VERSION_STATUS[version.status] || PROTOCOL_VERSION_STATUS.DRAFT
      })).sort((a, b) => {
        const versionCompare = compareVersionNumbers(b.versionNumber || '1.0', a.versionNumber || '1.0');
        if (versionCompare !== 0) return versionCompare;
        return new Date(b.createdDate || b.createdAt) - new Date(a.createdDate || a.createdAt);
      });

      setProtocolVersions(transformedVersions);
      
      // Set current version
      const activeVersion = transformedVersions.find(v => v.status === 'ACTIVE');
      const latestApproved = transformedVersions.find(v => v.status === 'APPROVED');
      const latestDraft = transformedVersions.find(v => v.status === 'DRAFT' || v.status === 'UNDER_REVIEW' || v.status === 'AMENDMENT_REVIEW');
      
      setCurrentProtocolVersion(activeVersion || latestApproved || latestDraft || transformedVersions[0] || null);
    } catch (error) {
      console.error('Error reloading protocol versions:', error);
      throw error;
    }
  }, [studyId, compareVersionNumbers, PROTOCOL_VERSION_STATUS]);

  // Load protocol versions for a study
  const loadProtocolVersions = useCallback(async () => {
    if (!studyId || typeof studyId !== 'string') {
      console.warn('Invalid studyId provided to loadProtocolVersions:', studyId);
      return;
    }

    try {
      setLoading(true);
      clearError();
      
      await reloadVersions();
      
    } catch (error) {
      console.error('Error loading protocol versions:', error);
      setError(error.message || 'Failed to load protocol versions');
    } finally {
      setLoading(false);
    }
  }, [studyId, clearError, reloadVersions]);

  // Generate next version number suggestion
  const generateNextVersionNumber = useCallback(() => {
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
  const createProtocolVersion = useCallback(async (versionData) => {
    if (!studyId || typeof studyId !== 'string') {
      console.error('Invalid studyId provided to createProtocolVersion:', studyId);
      throw new Error('Invalid study ID');
    }

    try {
      setLoading(true);
      clearError();

      const newVersionData = {
        studyId: studyId,
        versionNumber: versionData.versionNumber || generateNextVersionNumber(),
        description: versionData.description || '',
        amendmentType: versionData.amendmentType || (protocolVersions.length === 0 ? 'MINOR' : 'MINOR'), // Use MINOR instead of INITIAL until backend supports it
        amendmentReason: versionData.amendmentReason && versionData.amendmentReason.trim() ? versionData.amendmentReason.trim() : null, // Send null instead of empty string
        changesSummary: versionData.changesSummary && versionData.changesSummary.trim() ? versionData.changesSummary.trim() : null, // Send null instead of empty string
        effectiveDate: versionData.effectiveDate || null,
        requiresRegulatoryApproval: versionData.requiresRegulatoryApproval || false,
        notifyStakeholders: versionData.notifyStakeholders !== false, // Default true
        status: 'DRAFT',
        createdBy: 1 // TODO: Get from auth context
      };

      const createdVersion = await StudyVersioningService.createVersion(studyId, newVersionData);
      
      // Reload versions to get updated state
      await reloadVersions();
      
      return createdVersion;
    } catch (error) {
      console.error('Error creating protocol version:', error);
      setError(error.message || 'Failed to create protocol version');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [studyId, generateNextVersionNumber, protocolVersions.length, clearError, reloadVersions]);

  // Submit protocol version for review
  const submitForReview = useCallback(async (versionId) => {
    try {
      setLoading(true);
      clearError();

      await StudyVersioningService.updateVersionStatus(versionId, 'UNDER_REVIEW');
      await reloadVersions();
      
    } catch (error) {
      console.error('Error submitting version for review:', error);
      setError(error.message || 'Failed to submit version for review');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [reloadVersions, clearError]);

  // Approve protocol version
  const approveProtocolVersion = useCallback(async (versionId) => {
    try {
      setLoading(true);
      clearError();

      await StudyVersioningService.updateVersionStatus(versionId, 'APPROVED');
      await reloadVersions();
      
    } catch (error) {
      console.error('Error approving protocol version:', error);
      setError(error.message || 'Failed to approve protocol version');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [reloadVersions, clearError]);

  // Activate protocol version (marks others as superseded)
  const activateProtocolVersion = useCallback(async (versionId) => {
    try {
      setLoading(true);
      clearError();

      await StudyVersioningService.updateVersionStatus(versionId, 'ACTIVE');
      await reloadVersions();
      
    } catch (error) {
      console.error('Error activating protocol version:', error);
      setError(error.message || 'Failed to activate protocol version');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [reloadVersions, clearError]);

  // Update protocol version
  const updateProtocolVersion = useCallback(async (versionId, updateData) => {
    try {
      setLoading(true);
      clearError();

      await StudyVersioningService.updateVersion(versionId, updateData);
      await reloadVersions();
      
    } catch (error) {
      console.error('Error updating protocol version:', error);
      setError(error.message || 'Failed to update protocol version');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [reloadVersions, clearError]);

  // Delete protocol version (only if DRAFT)
  const deleteProtocolVersion = useCallback(async (versionId) => {
    try {
      setLoading(true);
      clearError();

      await StudyVersioningService.deleteVersion(versionId);
      await reloadVersions();
      
    } catch (error) {
      console.error('Error deleting protocol version:', error);
      setError(error.message || 'Failed to delete protocol version');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [reloadVersions, clearError]);

  // Get versions by status
  const getVersionsByStatus = useCallback((status) => {
    return protocolVersions.filter(version => version.status === status);
  }, [protocolVersions]);

  // Check if version can perform action
  const canPerformAction = useCallback((version, action) => {
    const statusInfo = PROTOCOL_VERSION_STATUS[version?.status];
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
  }, []);

  // Get active protocol version
  const getActiveVersion = useCallback(() => {
    return protocolVersions.find(version => version.status === 'ACTIVE') || null;
  }, [protocolVersions]);

  // Get approved versions count
  const getApprovedVersionsCount = useCallback(() => {
    return protocolVersions.filter(version => 
      version.status === 'APPROVED' || version.status === 'ACTIVE'
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