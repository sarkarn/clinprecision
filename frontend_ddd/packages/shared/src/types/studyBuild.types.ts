/**
 * Protocol and Database Build Type Definitions
 * Types for protocol version management and database build operations
 */

import type { ValidationError, ValidationWarning } from './common.types';


// ============================================================================
// Database Build Enums
// ============================================================================

/**
 * Build status enumeration
 */
export enum BuildStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// ============================================================================
// Database Build Types
// ============================================================================

/**
 * Build request configuration
 */
export interface BuildRequest {
  studyId: number;
  versionId?: string;
  buildType?: string;
  options?: BuildOptions;
  requestedBy?: number;
  description?: string;
}

/**
 * Build options
 */
export interface BuildOptions {
  includeHistoricalData?: boolean;
  validateBeforeBuild?: boolean;
  cleanExistingData?: boolean;
  buildTimeout?: number;
  parallelProcessing?: boolean;
  customOptions?: Record<string, any>;
}

/**
 * Validation options
 */
export interface ValidationOptions {
  checkDataIntegrity?: boolean;
  validateSchemaStructure?: boolean;
  checkBusinessRules?: boolean;
  strictMode?: boolean;
}

/**
 * Study database build entity
 */
export interface StudyDatabaseBuild {
  id: number;
  aggregateUuid: string;
  buildRequestId: string;
  studyId: number;
  buildStatus: BuildStatus | string;
  buildType?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  formsConfigured?: number;
  tablesCreated?: number;
  validationRulesSetup?: number;
  requestedBy?: number;
  completedBy?: number;
  cancellationReason?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Build validation result
 */
export interface BuildValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  timestamp: string;
}

/**
 * Cancellation data
 */
export interface CancellationData {
  buildRequestId: string;
  cancellationReason: string;
}

/**
 * Completion data
 */
export interface CompletionData {
  buildRequestId: string;
  formsConfigured?: number;
  tablesCreated?: number;
  validationRulesSetup?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Has active build response
 */
export interface HasActiveBuildResponse {
  hasActiveBuild: boolean;
}

/**
 * Build count response
 */
export interface BuildCountResponse {
  count: number;
}

// ============================================================================
// Database Build Service Interface
// ============================================================================

/**
 * Study Database Build Service interface
 */
export interface IStudyDatabaseBuildService {
  // Command operations
  buildStudyDatabase: (buildRequest: BuildRequest) => Promise<StudyDatabaseBuild>;
  validateStudyDatabase: (buildRequestId: string, validationOptions: ValidationOptions) => Promise<BuildValidationResult>;
  cancelStudyDatabaseBuild: (buildRequestId: string, cancellationReason: string) => Promise<StudyDatabaseBuild>;
  completeStudyDatabaseBuild: (buildRequestId: string, completionData: CompletionData) => Promise<StudyDatabaseBuild>;
  
  // Query operations
  getBuildById: (id: number) => Promise<StudyDatabaseBuild>;
  getBuildByUuid: (aggregateUuid: string) => Promise<StudyDatabaseBuild>;
  getBuildByRequestId: (buildRequestId: string) => Promise<StudyDatabaseBuild>;
  getBuildsByStudyId: (studyId: number) => Promise<StudyDatabaseBuild[]>;
  getLatestBuildForStudy: (studyId: number) => Promise<StudyDatabaseBuild>;
  getBuildsByStatus: (status: BuildStatus) => Promise<StudyDatabaseBuild[]>;
  getInProgressBuilds: () => Promise<StudyDatabaseBuild[]>;
  getFailedBuilds: () => Promise<StudyDatabaseBuild[]>;
  getCancelledBuilds: () => Promise<StudyDatabaseBuild[]>;
  getRecentBuilds: (days?: number) => Promise<StudyDatabaseBuild[]>;
  getBuildsByUserId: (userId: number) => Promise<StudyDatabaseBuild[]>;
  hasActiveBuild: (studyId: number) => Promise<boolean>;
  getBuildCountForStudy: (studyId: number) => Promise<number>;
  
  // Utility methods
  handleError: (error: any) => Error;
  formatDuration: (seconds: number) => string;
  getStatusColor: (status: BuildStatus) => string;
  calculateProgress: (build: StudyDatabaseBuild) => number;
}
