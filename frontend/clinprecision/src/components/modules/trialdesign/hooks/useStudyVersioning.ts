import { useState, useCallback } from 'react';
import StudyVersioningService, { ProtocolVersion } from '../../../../services/StudyVersioningService';

// ============================================================================
// Types
// ============================================================================

export interface AmendmentTypeInfo {
  value: string;
  label: string;
  description: string;
}

export interface VersionStatusInfo {
  value: string;
  label: string;
  description: string;
}

export interface AmendmentTypes {
  MAJOR: AmendmentTypeInfo;
  MINOR: AmendmentTypeInfo;
  SAFETY: AmendmentTypeInfo;
  ADMINISTRATIVE: AmendmentTypeInfo;
}

export interface VersionStatuses {
  DRAFT: VersionStatusInfo;
  PROTOCOL_REVIEW: VersionStatusInfo;
  SUBMITTED: VersionStatusInfo;
  APPROVED: VersionStatusInfo;
  ACTIVE: VersionStatusInfo;
  SUPERSEDED: VersionStatusInfo;
  WITHDRAWN: VersionStatusInfo;
}

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface StudyVersion extends ProtocolVersion {
  version: string; // Required for this hook
}

export interface UseStudyVersioningReturn {
  // State
  versions: StudyVersion[];
  currentVersion: StudyVersion | null;
  loading: boolean;
  error: string | null;
  
  // Constants
  AMENDMENT_TYPES: AmendmentTypes;
  VERSION_STATUS: VersionStatuses;
  
  // Actions
  loadStudyVersions: (studyId: number | string) => Promise<StudyVersion[]>;
  createVersion: (studyId: number, versionData: any) => Promise<StudyVersion>;
  updateVersionStatus: (studyId: number | string, versionId: number | string, newStatus: string, additionalData?: any) => Promise<StudyVersion>;
  setVersions: (versions: StudyVersion[] | ((prev: StudyVersion[]) => StudyVersion[])) => void;
  setCurrentVersion: (version: StudyVersion | null) => void;
  
  // Utilities
  parseVersion: (versionString: string) => ParsedVersion;
  generateNextVersion: (currentVersionString: string, amendmentType: string) => string;
  compareVersions: (version1: string, version2: string) => number;
  getLatestVersion: (versionsList: StudyVersion[]) => StudyVersion | null;
  getStudyVersions: (studyId: number | string) => StudyVersion[];
  getActiveVersion: (studyId: number | string) => StudyVersion | undefined;
  getVersionHistory: (studyId: number | string) => Promise<StudyVersion[]>;
  
  // Validation
  canEditVersion: (version: StudyVersion) => boolean;
  canSubmitVersion: (version: StudyVersion) => boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Industry-standard study versioning hook
 * Follows clinical trial protocol versioning standards
 * Now integrated with backend APIs
 * 
 * @returns Study versioning state and methods
 */
export const useStudyVersioning = (): UseStudyVersioningReturn => {
  const [versions, setVersions] = useState<StudyVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<StudyVersion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Amendment types following FDA guidelines
  const AMENDMENT_TYPES: AmendmentTypes = {
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
  const VERSION_STATUS: VersionStatuses = {
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
  const parseVersion = useCallback((versionString: string): ParsedVersion => {
    if (!versionString) return { major: 0, minor: 0, patch: 0 };
    
    const cleanVersion = versionString.replace(/^v/, '');
    const parts = cleanVersion.split('.');
    
    return {
      major: parseInt(parts[0]) || 0,
      minor: parseInt(parts[1]) || 0,
      patch: parseInt(parts[2]) || 0
    };
  }, []);

  // Generate next version number based on amendment type
  const generateNextVersion = useCallback((currentVersionString: string, amendmentType: string): string => {
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
  const compareVersions = useCallback((version1: string, version2: string): number => {
    const v1 = parseVersion(version1);
    const v2 = parseVersion(version2);
    
    if (v1.major !== v2.major) return v1.major - v2.major;
    if (v1.minor !== v2.minor) return v1.minor - v2.minor;
    return (v1.patch || 0) - (v2.patch || 0);
  }, [parseVersion]);

  // Get the latest version
  const getLatestVersion = useCallback((versionsList: StudyVersion[]): StudyVersion | null => {
    if (!versionsList || versionsList.length === 0) return null;
    
    return versionsList.reduce<StudyVersion | null>((latest, current) => {
      if (!latest) return current;
      return compareVersions(current.version, latest.version) > 0 ? current : latest;
    }, null);
  }, [compareVersions]);

  // Load versions for a study from backend
  const loadStudyVersions = useCallback(async (studyId: number | string): Promise<StudyVersion[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const backendVersions = await StudyVersioningService.getStudyVersions(studyId);
      // Map to StudyVersion (add version property from versionNumber if needed)
      const studyVersions: StudyVersion[] = backendVersions.map(v => ({
        ...v,
        version: v.versionNumber || v.versionName || 'v1.0'
      })) as StudyVersion[];
      
      setVersions(studyVersions);
      
      // Set current version to active version
      const activeVersion = studyVersions.find(v => v.status === VERSION_STATUS.ACTIVE.value);
      if (activeVersion) {
        setCurrentVersion(activeVersion);
      }
      
      return studyVersions;
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to load study versions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [VERSION_STATUS.ACTIVE.value]);

  // Create new version (now calls backend API)
  const createVersion = useCallback(async (studyId: number, versionData: any): Promise<StudyVersion> => {
    setLoading(true);
    setError(null);
    
    try {
      const createdVersion = await StudyVersioningService.createVersion(studyId, versionData);
      const studyVersion: StudyVersion = {
        ...createdVersion,
        version: createdVersion.versionNumber || createdVersion.versionName || 'v1.0'
      } as StudyVersion;
      
      // Update local state
      setVersions(prev => [studyVersion, ...prev]);
      setCurrentVersion(studyVersion);
      
      return studyVersion;
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to create version';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update version status (now calls backend API)
  const updateVersionStatus = useCallback(async (
    studyId: number | string,
    versionId: number | string,
    newStatus: string,
    additionalData: any = {}
  ): Promise<StudyVersion> => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData = {
        status: newStatus,
        ...additionalData
      };
      
      // Use updateVersionStatus from service (not updateVersion)
      const updatedVersion = await StudyVersioningService.updateVersionStatus(versionId, newStatus as any, updateData.reason);
      const studyVersion: StudyVersion = {
        ...updatedVersion,
        version: updatedVersion.versionNumber || updatedVersion.versionName || 'v1.0'
      } as StudyVersion;
      
      // Update local state
      setVersions(prev => prev.map(version => 
        version.id === versionId ? studyVersion : version
      ));
      
      if (currentVersion && currentVersion.id === versionId) {
        setCurrentVersion(studyVersion);
      }
      
      return studyVersion;
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to update version status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentVersion]);

  // Get version history (now calls backend API)
  const getVersionHistory = useCallback(async (studyId: number | string): Promise<StudyVersion[]> => {
    try {
      const history = await StudyVersioningService.getVersionHistory(studyId);
      return history.map(v => ({
        ...v,
        version: v.versionNumber || v.versionName || 'v1.0'
      })) as StudyVersion[];
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to get version history';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Get versions for a specific study
  const getStudyVersions = useCallback((studyId: number | string): StudyVersion[] => {
    return versions
      .filter(v => v.studyId === studyId)
      .sort((a, b) => compareVersions(b.version, a.version)); // Latest first
  }, [versions, compareVersions]);

  // Get active version for a study
  const getActiveVersion = useCallback((studyId: number | string): StudyVersion | undefined => {
    return versions.find(v => v.studyId === studyId && v.status === VERSION_STATUS.ACTIVE.value);
  }, [versions, VERSION_STATUS.ACTIVE.value]);

  // Check if version can be edited
  const canEditVersion = useCallback((version: StudyVersion): boolean => {
    return version.status === VERSION_STATUS.DRAFT.value || version.status === VERSION_STATUS.PROTOCOL_REVIEW.value;
  }, [VERSION_STATUS.DRAFT.value, VERSION_STATUS.PROTOCOL_REVIEW.value]);

  // Check if version can be submitted
  const canSubmitVersion = useCallback((version: StudyVersion): boolean => {
    return version.status === VERSION_STATUS.DRAFT.value || version.status === VERSION_STATUS.PROTOCOL_REVIEW.value;
  }, [VERSION_STATUS.DRAFT.value, VERSION_STATUS.PROTOCOL_REVIEW.value]);

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
