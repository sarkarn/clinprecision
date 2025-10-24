/**
 * Study Document Service (TypeScript)
 * 
 * Manages study document operations including upload, download, metadata management,
 * and document statistics. Connects to StudyDocumentController backend endpoints.
 * 
 * React Query Hooks:
 * - useStudyDocuments: Get all documents for a study
 * - useCurrentStudyDocuments: Get current (latest version) documents
 * - useDocument: Get a specific document by ID
 * - useDocumentStatistics: Get document statistics for a study
 * - useUploadDocument: Upload a new document (mutation)
 * - useUpdateDocument: Update document metadata (mutation)
 * - useDeleteDocument: Delete a document (mutation)
 * - useDownloadDocument: Download a document (mutation)
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '../ApiService';
import { DocumentType } from '../../types/domain/StudyDocument.types';
import type {
  StudyDocument,
  DocumentUploadRequest,
  DocumentUpdateRequest,
  DocumentStatistics,
  StudyDocumentsResponse,
  CurrentDocumentsResponse,
  DocumentUploadResponse,
  DocumentDeleteResponse,
  DocumentTypeOption,
  DocumentDownloadOptions,
  DocumentDisplayData
} from '../../types/domain/StudyDocument.types';

// ========== API Base URL Constants ==========
const STUDIES_BASE = '/api/studies';

// ========== Query Key Factory ==========
export const studyDocumentKeys = {
  all: ['study-documents'] as const,
  study: (studyId: number) => ['study-documents', 'study', studyId] as const,
  studyDocuments: (studyId: number) => ['study-documents', 'study', studyId, 'all'] as const,
  currentDocuments: (studyId: number) => ['study-documents', 'study', studyId, 'current'] as const,
  document: (studyId: number, documentId: number) => ['study-documents', 'study', studyId, 'document', documentId] as const,
  statistics: (studyId: number) => ['study-documents', 'study', studyId, 'statistics'] as const,
};

// ========== API Functions ==========

/**
 * Get all documents for a study
 * GET /api/studies/{studyId}/documents
 */
export async function fetchStudyDocuments(studyId: number): Promise<StudyDocumentsResponse> {
  try {
    const response = await ApiService.get(`${STUDIES_BASE}/${studyId}/documents`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching documents for study ${studyId}:`, error);
    throw error;
  }
}

/**
 * Get current documents for a study (latest versions only)
 * GET /api/studies/{studyId}/documents/current
 */
export async function fetchCurrentStudyDocuments(studyId: number): Promise<CurrentDocumentsResponse> {
  try {
    const response = await ApiService.get(`${STUDIES_BASE}/${studyId}/documents/current`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching current documents for study ${studyId}:`, error);
    throw error;
  }
}

/**
 * Get a specific document by ID
 * GET /api/studies/{studyId}/documents/{documentId}
 */
export async function fetchDocument(studyId: number, documentId: number): Promise<StudyDocument> {
  try {
    const response = await ApiService.get(`${STUDIES_BASE}/${studyId}/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching document ${documentId} for study ${studyId}:`, error);
    throw error;
  }
}

/**
 * Get document statistics for a study
 * GET /api/studies/{studyId}/documents/statistics
 */
export async function fetchDocumentStatistics(studyId: number): Promise<DocumentStatistics> {
  try {
    const response = await ApiService.get(`${STUDIES_BASE}/${studyId}/documents/statistics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching document statistics for study ${studyId}:`, error);
    throw error;
  }
}

/**
 * Upload a new document
 * POST /api/studies/{studyId}/documents
 */
export async function uploadDocument(
  studyId: number,
  uploadRequest: DocumentUploadRequest
): Promise<DocumentUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', uploadRequest.file);
    formData.append('documentType', uploadRequest.documentType);
    
    if (uploadRequest.description) {
      formData.append('description', uploadRequest.description);
    }
    
    formData.append('uploadedBy', String(uploadRequest.uploadedBy || 1));
    
    if (uploadRequest.version) {
      formData.append('version', String(uploadRequest.version));
    }
    
    if (uploadRequest.tags) {
      formData.append('tags', JSON.stringify(uploadRequest.tags));
    }
    
    if (uploadRequest.metadata) {
      formData.append('metadata', JSON.stringify(uploadRequest.metadata));
    }

    const response = await ApiService.post(
      `${STUDIES_BASE}/${studyId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error uploading document for study ${studyId}:`, error);
    throw error;
  }
}

/**
 * Update document metadata
 * PUT /api/studies/{studyId}/documents/{documentId}
 */
export async function updateDocument(
  studyId: number,
  documentId: number,
  updateRequest: DocumentUpdateRequest
): Promise<StudyDocument> {
  try {
    const updatedBy = updateRequest.updatedBy || 1;
    const response = await ApiService.put(
      `${STUDIES_BASE}/${studyId}/documents/${documentId}?updatedBy=${updatedBy}`,
      updateRequest
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating document ${documentId} for study ${studyId}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 * DELETE /api/studies/{studyId}/documents/{documentId}
 */
export async function deleteDocument(
  studyId: number,
  documentId: number,
  deletedBy: number = 1
): Promise<DocumentDeleteResponse> {
  try {
    const response = await ApiService.delete(
      `${STUDIES_BASE}/${studyId}/documents/${documentId}?deletedBy=${deletedBy}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting document ${documentId} for study ${studyId}:`, error);
    throw error;
  }
}

/**
 * Download a document
 * GET /api/studies/{studyId}/documents/{documentId}/download
 */
export async function downloadDocument(
  studyId: number,
  documentId: number,
  options: DocumentDownloadOptions = {}
): Promise<Blob> {
  try {
    const response = await ApiService.get(
      `${STUDIES_BASE}/${studyId}/documents/${documentId}/download`,
      {
        responseType: options.responseType || 'blob',
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error downloading document ${documentId} for study ${studyId}:`, error);
    throw error;
  }
}

// ========== React Query Hooks ==========

/**
 * Hook to fetch all documents for a study
 */
export function useStudyDocuments(
  studyId: number,
  options?: Omit<UseQueryOptions<StudyDocumentsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StudyDocumentsResponse, Error>({
    queryKey: studyDocumentKeys.studyDocuments(studyId),
    queryFn: () => fetchStudyDocuments(studyId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!studyId,
    ...options,
  });
}

/**
 * Hook to fetch current (latest version) documents for a study
 */
export function useCurrentStudyDocuments(
  studyId: number,
  options?: Omit<UseQueryOptions<CurrentDocumentsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CurrentDocumentsResponse, Error>({
    queryKey: studyDocumentKeys.currentDocuments(studyId),
    queryFn: () => fetchCurrentStudyDocuments(studyId),
    staleTime: 2 * 60 * 1000,
    enabled: !!studyId,
    ...options,
  });
}

/**
 * Hook to fetch a specific document by ID
 */
export function useDocument(
  studyId: number,
  documentId: number,
  options?: Omit<UseQueryOptions<StudyDocument, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StudyDocument, Error>({
    queryKey: studyDocumentKeys.document(studyId, documentId),
    queryFn: () => fetchDocument(studyId, documentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!studyId && !!documentId,
    ...options,
  });
}

/**
 * Hook to fetch document statistics for a study
 */
export function useDocumentStatistics(
  studyId: number,
  options?: Omit<UseQueryOptions<DocumentStatistics, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DocumentStatistics, Error>({
    queryKey: studyDocumentKeys.statistics(studyId),
    queryFn: () => fetchDocumentStatistics(studyId),
    staleTime: 5 * 60 * 1000,
    enabled: !!studyId,
    ...options,
  });
}

/**
 * Hook to upload a new document
 */
export function useUploadDocument(
  options?: UseMutationOptions<
    DocumentUploadResponse,
    Error,
    { studyId: number; uploadRequest: DocumentUploadRequest }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    DocumentUploadResponse,
    Error,
    { studyId: number; uploadRequest: DocumentUploadRequest }
  >({
    mutationFn: ({ studyId, uploadRequest }) => uploadDocument(studyId, uploadRequest),
    onSuccess: (_, variables) => {
      // Invalidate all document queries for the study
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.studyDocuments(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.currentDocuments(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.statistics(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.study(variables.studyId) });
    },
    ...options,
  });
}

/**
 * Hook to update document metadata
 */
export function useUpdateDocument(
  options?: UseMutationOptions<
    StudyDocument,
    Error,
    { studyId: number; documentId: number; updateRequest: DocumentUpdateRequest }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    StudyDocument,
    Error,
    { studyId: number; documentId: number; updateRequest: DocumentUpdateRequest }
  >({
    mutationFn: ({ studyId, documentId, updateRequest }) => 
      updateDocument(studyId, documentId, updateRequest),
    onSuccess: (_, variables) => {
      // Invalidate specific document and list queries
      queryClient.invalidateQueries({ 
        queryKey: studyDocumentKeys.document(variables.studyId, variables.documentId) 
      });
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.studyDocuments(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.currentDocuments(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.statistics(variables.studyId) });
    },
    ...options,
  });
}

/**
 * Hook to delete a document
 */
export function useDeleteDocument(
  options?: UseMutationOptions<
    DocumentDeleteResponse,
    Error,
    { studyId: number; documentId: number; deletedBy?: number }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    DocumentDeleteResponse,
    Error,
    { studyId: number; documentId: number; deletedBy?: number }
  >({
    mutationFn: ({ studyId, documentId, deletedBy }) => 
      deleteDocument(studyId, documentId, deletedBy),
    onSuccess: (_, variables) => {
      // Invalidate all document queries for the study
      queryClient.invalidateQueries({ 
        queryKey: studyDocumentKeys.document(variables.studyId, variables.documentId) 
      });
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.studyDocuments(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.currentDocuments(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.statistics(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: studyDocumentKeys.study(variables.studyId) });
    },
    ...options,
  });
}

/**
 * Hook to download a document
 * Note: This is a mutation because downloads are intentional user actions
 */
export function useDownloadDocument(
  options?: UseMutationOptions<
    Blob,
    Error,
    { studyId: number; documentId: number; fileName: string; downloadOptions?: DocumentDownloadOptions }
  >
) {
  return useMutation<
    Blob,
    Error,
    { studyId: number; documentId: number; fileName: string; downloadOptions?: DocumentDownloadOptions }
  >({
    mutationFn: ({ studyId, documentId, downloadOptions }) => 
      downloadDocument(studyId, documentId, downloadOptions),
    onSuccess: (blob, variables) => {
      // Automatically trigger browser download
      triggerBrowserDownload(blob, variables.fileName);
    },
    ...options,
  });
}

// ========== Utility Functions ==========

/**
 * Trigger file download in browser
 * Creates a temporary download link and clicks it
 */
export function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Get available document types for UI selection
 */
export function getDocumentTypes(): DocumentTypeOption[] {
  return [
    { value: DocumentType.PROTOCOL, label: 'Protocol' },
    { value: DocumentType.ICF, label: 'Informed Consent Form' },
    { value: DocumentType.IRB, label: 'IRB Approval Documents' },
    { value: DocumentType.REGULATORY, label: 'Regulatory Document' },
    { value: DocumentType.CLINICAL, label: 'Clinical Document' },
    { value: DocumentType.STATISTICAL, label: 'Statistical Document' },
    { value: DocumentType.SAFETY, label: 'Safety Document' },
    { value: DocumentType.MONITORING, label: 'Monitoring Report' },
    { value: DocumentType.OTHER, label: 'Other' }
  ];
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get document type label
 */
export function getDocumentTypeLabel(documentType: DocumentType | string): string {
  const types = getDocumentTypes();
  const found = types.find(t => t.value === documentType);
  return found ? found.label : documentType;
}

/**
 * Format document for display
 */
export function formatDocumentForDisplay(document: StudyDocument): DocumentDisplayData {
  return {
    id: document.id,
    name: document.fileName,
    type: document.documentType,
    typeLabel: getDocumentTypeLabel(document.documentType),
    size: formatFileSize(document.fileSize),
    sizeBytes: document.fileSize,
    uploadedBy: document.uploadedByName || `User ${document.uploadedBy}`,
    uploadedDate: new Date(document.uploadedAt).toLocaleDateString(),
    version: document.version ? `v${document.version}` : 'v1',
    isCurrent: document.isCurrentVersion !== false,
    description: document.description || '',
    canDownload: true,
    canDelete: !document.isDeleted,
    canUpdate: !document.isDeleted,
  };
}

/**
 * Validate file for upload
 */
export function validateFileForUpload(
  file: File,
  maxSizeMB: number = 50
): { valid: boolean; error?: string } {
  // Check file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { 
      valid: false, 
      error: `File size exceeds ${maxSizeMB}MB limit. Selected file is ${formatFileSize(file.size)}.` 
    };
  }

  // Check file name
  if (!file.name || file.name.trim().length === 0) {
    return { valid: false, error: 'File name is required' };
  }

  return { valid: true };
}

// ========== Legacy Compatibility Exports ==========

/**
 * Legacy class-based API (for backward compatibility)
 * @deprecated Use React Query hooks or exported functions instead
 */
const StudyDocumentService = {
  // Query functions
  getStudyDocuments: fetchStudyDocuments,
  getCurrentStudyDocuments: fetchCurrentStudyDocuments,
  getDocument: fetchDocument,
  getDocumentStatistics: fetchDocumentStatistics,

  // Mutation functions
  uploadDocument: async (
    studyId: number,
    file: File,
    documentType: DocumentType | string,
    description: string = '',
    uploadedBy: number = 1
  ) => {
    return uploadDocument(studyId, {
      file,
      documentType,
      description,
      uploadedBy,
    });
  },
  
  updateDocument: async (
    studyId: number,
    documentId: number,
    updateData: DocumentUpdateRequest,
    updatedBy: number = 1
  ) => {
    return updateDocument(studyId, documentId, { ...updateData, updatedBy });
  },

  deleteDocument,
  downloadDocument,

  // Utility functions
  downloadFile: triggerBrowserDownload,
  getDocumentTypes,
};

export default StudyDocumentService;
