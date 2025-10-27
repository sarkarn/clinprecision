/**
 * Study Document Domain Types
 * 
 * Type definitions for study document management, including document types,
 * upload/download operations, and document metadata.
 */

/**
 * Document Type Enum
 * Supported document categories in the system
 */
export enum DocumentType {
  PROTOCOL = 'PROTOCOL',
  ICF = 'ICF',
  IRB = 'IRB',
  REGULATORY = 'REGULATORY',
  CLINICAL = 'CLINICAL',
  STATISTICAL = 'STATISTICAL',
  SAFETY = 'SAFETY',
  MONITORING = 'MONITORING',
  OTHER = 'OTHER'
}

/**
 * Document Type Option
 * For UI dropdowns and selection
 */
export interface DocumentTypeOption {
  value: DocumentType | string;
  label: string;
}

/**
 * Study Document
 * Core document entity with metadata
 */
export interface StudyDocument {
  id: number;
  documentId?: number;
  studyId: number;
  documentType: DocumentType | string;
  fileName: string;
  fileSize: number;
  filePath?: string;
  description?: string;
  version?: number;
  versionNumber?: number;
  isCurrentVersion?: boolean;
  uploadedBy: number;
  uploadedByName?: string;
  uploadedAt: string;
  updatedBy?: number;
  updatedByName?: string;
  updatedAt?: string;
  deletedBy?: number;
  deletedAt?: string;
  isDeleted?: boolean;
  contentType?: string;
  mimeType?: string;
  checksum?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Document Upload Request
 * Data required to upload a new document
 */
export interface DocumentUploadRequest {
  file: File;
  documentType: DocumentType | string;
  description?: string;
  uploadedBy?: number;
  version?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Document Update Request
 * Data for updating document metadata
 */
export interface DocumentUpdateRequest {
  documentType?: DocumentType | string;
  description?: string;
  updatedBy?: number;
  version?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Document Statistics
 * Aggregate statistics for study documents
 */
export interface DocumentStatistics {
  totalDocuments: number;
  totalSize: number;
  documentsByType: Record<DocumentType | string, number>;
  recentUploads: number;
  lastUploadDate?: string;
  averageFileSize?: number;
}

/**
 * Study Documents Response
 * Response containing documents and statistics
 */
export interface StudyDocumentsResponse {
  documents: StudyDocument[];
  statistics: DocumentStatistics;
  totalCount: number;
  currentDocuments?: StudyDocument[];
}

/**
 * Current Documents Response
 * Response for current (latest version) documents
 */
export interface CurrentDocumentsResponse {
  currentDocuments: StudyDocument[];
  totalCount: number;
}

/**
 * Document Upload Response
 * Response after successful document upload
 */
export interface DocumentUploadResponse {
  success: boolean;
  documentId: number;
  fileName: string;
  fileSize: number;
  message?: string;
  document?: StudyDocument;
}

/**
 * Document Delete Response
 * Response after document deletion
 */
export interface DocumentDeleteResponse {
  success: boolean;
  documentId: number;
  message?: string;
}

/**
 * Document Download Options
 * Options for document download
 */
export interface DocumentDownloadOptions {
  responseType?: 'blob' | 'arraybuffer';
  onProgress?: (progress: number) => void;
}

/**
 * Document Filter Options
 * Options for filtering documents
 */
export interface DocumentFilterOptions {
  documentType?: DocumentType | string;
  uploadedBy?: number;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
  includeDeleted?: boolean;
  currentVersionOnly?: boolean;
}

/**
 * Document Sort Options
 * Options for sorting documents
 */
export interface DocumentSortOptions {
  field: 'uploadedAt' | 'fileName' | 'fileSize' | 'documentType' | 'version';
  order: 'asc' | 'desc';
}

/**
 * Document Display Data
 * Formatted data for UI display
 */
export interface DocumentDisplayData {
  id: number;
  name: string;
  type: string;
  typeLabel: string;
  size: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedDate: string;
  version: string;
  isCurrent: boolean;
  description: string;
  canDownload: boolean;
  canDelete: boolean;
  canUpdate: boolean;
}
