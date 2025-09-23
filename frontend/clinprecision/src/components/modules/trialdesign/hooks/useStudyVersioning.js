import { useState, useCallback } from 'react';

/**
 * Industry-standard study versioning hook
 * Follows clinical trial protocol versioning standards
 */
export const useStudyVersioning = () => {
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Amendment types following FDA guidelines
  const AMENDMENT_TYPES = {
    MAJOR: {
      value: 'major',
      label: 'Major Amendment',
      description: 'Protocol changes affecting safety/efficacy'
    },
    MINOR: {
      value: 'minor',
      label: 'Minor Amendment', 
      description: 'Administrative changes'
    },
    SAFETY: {
      value: 'safety',
      label: 'Safety Amendment',
      description: 'Safety-related changes'
    },
    ADMINISTRATIVE: {
      value: 'admin',
      label: 'Administrative Amendment',
      description: 'Non-substantial changes'
    }
  };

  // Version status types
  const VERSION_STATUS = {
    DRAFT: {
      value: 'draft',
      label: 'Draft',
      description: 'In development'
    },
    UNDER_REVIEW: {
      value: 'under-review',
      label: 'Under Review',
      description: 'Under internal review'
    },
    SUBMITTED: {
      value: 'submitted',
      label: 'Submitted',
      description: 'Submitted to regulatory'
    },
    APPROVED: {
      value: 'approved',
      label: 'Approved',
      description: 'Approved by regulatory'
    },
    ACTIVE: {
      value: 'active',
      label: 'Active',
      description: 'Currently active version'
    },
    SUPERSEDED: {
      value: 'superseded',
      label: 'Superseded',
      description: 'Replaced by newer version'
    },
    WITHDRAWN: {
      value: 'withdrawn',
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

  // Create new version
  const createVersion = useCallback(async (studyId, versionData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current versions to determine next version number
      const currentVersions = versions.filter(v => v.studyId === studyId);
      const latestVersion = getLatestVersion(currentVersions);
      
      const nextVersionNumber = latestVersion 
        ? generateNextVersion(latestVersion.version, versionData.amendmentType)
        : 'v1.0';

      const newVersion = {
        id: `version-${Date.now()}`, // Will be replaced by server ID
        studyId,
        version: nextVersionNumber,
        status: VERSION_STATUS.DRAFT.value,
        amendmentType: versionData.amendmentType || 'MINOR',
        amendmentReason: versionData.amendmentReason || '',
        description: versionData.description || '',
        createdBy: versionData.createdBy || 'current-user',
        createdDate: new Date().toISOString(),
        approvedBy: null,
        approvedDate: null,
        effectiveDate: versionData.effectiveDate || null,
        
        // Protocol-specific fields
        protocolChanges: versionData.protocolChanges || [],
        icfChanges: versionData.icfChanges || [],
        regulatorySubmissions: versionData.regulatorySubmissions || [],
        
        // Metadata
        metadata: {
          previousVersion: latestVersion?.version || null,
          changesSummary: versionData.changesSummary || '',
          impactAssessment: versionData.impactAssessment || '',
          reviewComments: []
        }
      };

      // In a real app, this would call the API
      // const response = await StudyVersionService.createVersion(newVersion);
      
      // Update local state
      setVersions(prev => [...prev, newVersion]);
      setCurrentVersion(newVersion);
      
      return newVersion;
    } catch (err) {
      setError(err.message || 'Failed to create version');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [versions, getLatestVersion, generateNextVersion]);

  // Update version status
  const updateVersionStatus = useCallback(async (versionId, newStatus, additionalData = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      setVersions(prev => prev.map(version => {
        if (version.id === versionId) {
          const updatedVersion = {
            ...version,
            status: newStatus,
            ...additionalData
          };

          // When approving a version
          if (newStatus === VERSION_STATUS.APPROVED.value) {
            updatedVersion.approvedBy = additionalData.approvedBy || 'current-user';
            updatedVersion.approvedDate = new Date().toISOString();
          }

          // When activating a version, mark others as superseded
          if (newStatus === VERSION_STATUS.ACTIVE.value) {
            updatedVersion.effectiveDate = updatedVersion.effectiveDate || new Date().toISOString();
          }

          return updatedVersion;
        }
        
        // Mark other versions as superseded when a new one becomes active
        if (newStatus === VERSION_STATUS.ACTIVE.value && version.studyId === 
            prev.find(v => v.id === versionId)?.studyId) {
          return {
            ...version,
            status: version.status === VERSION_STATUS.ACTIVE.value ? VERSION_STATUS.SUPERSEDED.value : version.status
          };
        }
        
        return version;
      }));
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update version status');
      throw err;
    } finally {
      setLoading(false);
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
    return version.status === VERSION_STATUS.DRAFT.value || version.status === VERSION_STATUS.UNDER_REVIEW.value;
  }, []);

  // Check if version can be submitted
  const canSubmitVersion = useCallback((version) => {
    return version.status === VERSION_STATUS.DRAFT.value || version.status === VERSION_STATUS.UNDER_REVIEW.value;
  }, []);

  // Get version history with changes
  const getVersionHistory = useCallback((studyId) => {
    const studyVersions = getStudyVersions(studyId);
    
    return studyVersions.map((version, index) => {
      const previousVersion = studyVersions[index + 1]; // Next in sorted array (older)
      
      return {
        ...version,
        changesSinceLastVersion: previousVersion ? {
          protocolChanges: version.protocolChanges?.filter(change => 
            !previousVersion.protocolChanges?.find(prevChange => 
              prevChange.id === change.id
            )
          ) || [],
          versionDiff: compareVersions(version.version, previousVersion.version)
        } : null
      };
    });
  }, [getStudyVersions, compareVersions]);

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
