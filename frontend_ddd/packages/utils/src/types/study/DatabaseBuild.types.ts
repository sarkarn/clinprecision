// src/types/study/DatabaseBuild.types.ts

/**
 * Build status enumeration
 */
export enum BuildStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

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
 * Study database build model
 */
export interface StudyDatabaseBuild {
  id: number;
  aggregateUuid: string;
  buildRequestId: string;
  studyId: number;
  buildStatus: BuildStatus;
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
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  timestamp: string;
}

/**
 * Validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'ERROR' | 'CRITICAL';
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
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

/**
 * Service health response
 */
export interface ServiceHealthResponse {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  timestamp: string;
  version?: string;
  details?: Record<string, any>;
}

/**
 * Study Database Build Service interface
 */
export interface IStudyDatabaseBuildService {
  // Command operations
  buildStudyDatabase: (buildRequest: BuildRequest) => Promise<StudyDatabaseBuild>;
  validateStudyDatabase: (buildRequestId: string, validationOptions: ValidationOptions) => Promise<ValidationResult>;
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
  healthCheck: () => Promise<ServiceHealthResponse>;
  
  // Utility methods
  handleError: (error: any) => Error;
  formatDuration: (seconds: number) => string;
  getStatusColor: (status: BuildStatus) => string;
  calculateProgress: (build: StudyDatabaseBuild) => number;
}
