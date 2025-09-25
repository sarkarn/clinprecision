import { useState, useCallback } from 'react';
import StudyVersioningService from '../../../../services/StudyVersioningService';

/**
 * Industry-standard study versioning hook
 * Follows clinical trial protocol versioning standards
 * Now integrated with backend APIs
 */
export const useStudyVersioning = () => {
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Amendment types following FDA guidelines
  const AMENDMENT_TYPES = {
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

  // Version status types
  const VERSION_STATUS = {
    DRAFT: {
      value: 'DRAFT',
      label: 'Draft',
      description: 'In development'
    },
    PROTOCOL_REVIEW: {
      value: 'PROTOCOL_REVIEW',
      label: 'Protocol Review',
      description: 'Under protocol review'
    },
    SUBMITTED: {
      value: 'SUBMITTED',
      label: 'Submitted',
      description: 'Submitted to regulatory'
    },
    APPROVED: {
      value: 'APPROVED',
      label: 'Approved',
      description: 'Approved by regulatory'
    },
    ACTIVE: {
      value: 'ACTIVE',
      label: 'Active',
      description: 'Currently active version'
    },
    SUPERSEDED: {
      value: 'SUPERSEDED',
      label: 'Superseded',
      description: 'Replaced by newer version'
    },
    WITHDRAWN: {
      value: 'WITHDRAWN',
      label: 'Withdrawn',
      description: 'Withdrawn/cancelled'
    }
  };

  // Parse version string (e.g., "v2.1" -> { major: 2, minor: 1 })
  const parseVersion = useCallback((versionString) => {
    if (!versionString) return { major: 0, minor: 0 };
    
    const cleanVersion = versionString.replace(/^v/, '');
    const parts = cleanVersion.split('.');
    
    return {
      major: parseInt(parts[0]) || 0,
      minor: parseInt(parts[1]) || 0,
      patch: parseInt(parts[2]) || 0
    };
  }, []);

  // Generate next version number based on amendment type
  const generateNextVersion = useCallback((currentVersionString, amendmentType) => {
    const current = parseVersion(currentVersionString);
    
    switch (amendmentType) {
      case 'MAJOR':
      case 'SAFETY':
        // Major changes increment major version, reset minor
        return `v${current.major + 1}.0`;
      
      case 'MINOR':
      case 'ADMINISTRATIVE':
        // Minor changes increment minor version
        return `v${current.major}.${current.minor + 1}`;
      
      default:
        return `v${current.major}.${current.minor + 1}`;
    }
  }, [parseVersion]);

  // Compare two versions
  const compareVersions = useCallback((version1, version2) => {
    const v1 = parseVersion(version1);
    const v2 = parseVersion(version2);
    
    if (v1.major !== v2.major) return v1.major - v2.major;
    if (v1.minor !== v2.minor) return v1.minor - v2.minor;
    return (v1.patch || 0) - (v2.patch || 0);
  }, [parseVersion]);

  // Get the latest version
  const getLatestVersion = useCallback((versionsList) => {
    if (!versionsList || versionsList.length === 0) return null;
    
    return versionsList.reduce((latest, current) => {
      if (!latest) return current;
      return compareVersions(current.version, latest.version) > 0 ? current : latest;
    });
  }, [compareVersions]);

  // Load versions for a study from backend
  const loadStudyVersions = useCallback(async (studyId) => {
    setLoading(true);
    setError(null);
    
    try {
      const backendVersions = await StudyVersioningService.getStudyVersions(studyId);
      const transformedVersions = backendVersions.map(version => 
        StudyVersioningService.transformVersionForFrontend(version)
      );
      setVersions(transformedVersions);
      
      // Set current version to active version
      const activeVersion = transformedVersions.find(v => v.status === VERSION_STATUS.ACTIVE.value);
      if (activeVersion) {
        setCurrentVersion(activeVersion);
      }
      
      return transformedVersions;
    } catch (err) {
      setError(err.message || 'Failed to load study versions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new version (now calls backend API)
  const createVersion = useCallback(async (studyId, versionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const createdVersion = await StudyVersioningService.createVersion(studyId, versionData);
      const transformedVersion = StudyVersioningService.transformVersionForFrontend(createdVersion);
      
      // Update local state
      setVersions(prev => [transformedVersion, ...prev]);
      setCurrentVersion(transformedVersion);
      
      return transformedVersion;
    } catch (err) {
      setError(err.message || 'Failed to create version');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update version status (now calls backend API)
  const updateVersionStatus = useCallback(async (studyId, versionId, newStatus, additionalData = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData = {
        status: newStatus,
        ...additionalData
      };
      
      const updatedVersion = await StudyVersioningService.updateVersion(studyId, versionId, updateData);
      const transformedVersion = StudyVersioningService.transformVersionForFrontend(updatedVersion);
      
      // Update local state
      setVersions(prev => prev.map(version => 
        version.id === versionId ? transformedVersion : version
      ));
      
      if (currentVersion && currentVersion.id === versionId) {
        setCurrentVersion(transformedVersion);
      }
      
      return transformedVersion;
    } catch (err) {
      setError(err.message || 'Failed to update version status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentVersion]);

  // Get version history (now calls backend API)
  const getVersionHistory = useCallback(async (studyId) => {
    try {
      const history = await StudyVersioningService.getVersionHistory(studyId);
      return history.map(version => StudyVersioningService.transformVersionForFrontend(version));
    } catch (err) {
      setError(err.message || 'Failed to get version history');
      throw err;
    }
  }, []);

  // Get versions for a specific study
  const getStudyVersions = useCallback((studyId) => {
    return versions
      .filter(v => v.studyId === studyId)
      .sort((a, b) => compareVersions(b.version, a.version)); // Latest first
  }, [versions, compareVersions]);

  // Get active version for a study
  const getActiveVersion = useCallback((studyId) => {
    return versions.find(v => v.studyId === studyId && v.status === VERSION_STATUS.ACTIVE.value);
  }, [versions]);

  // Check if version can be edited
  const canEditVersion = useCallback((version) => {
    return version.status === VERSION_STATUS.DRAFT.value || version.status === VERSION_STATUS.PROTOCOL_REVIEW.value;
  }, []);

  // Check if version can be submitted
  const canSubmitVersion = useCallback((version) => {
    return version.status === VERSION_STATUS.DRAFT.value || version.status === VERSION_STATUS.PROTOCOL_REVIEW.value;
  }, []);

  return {
    // State
    versions,
    currentVersion,
    loading,
    error,
    
    // Constants
    AMENDMENT_TYPES,
    VERSION_STATUS,
    
    // Actions
    loadStudyVersions,
    createVersion,
    updateVersionStatus,
    setVersions,
    setCurrentVersion,
    
    // Utilities
    parseVersion,
    generateNextVersion,
    compareVersions,
    getLatestVersion,
    getStudyVersions,
    getActiveVersion,
    getVersionHistory,
    
    // Validation
    canEditVersion,
    canSubmitVersion
  };
};

export default useStudyVersioning;
