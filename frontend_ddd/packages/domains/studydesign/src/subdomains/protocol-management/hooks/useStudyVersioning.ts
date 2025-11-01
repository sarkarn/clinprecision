// Bridge to domain-level useStudyVersioning hook
export { default as useStudyVersioning } from '../../../hooks/useStudyVersioning';
export type { UseStudyVersioningReturn } from '../../../hooks/useStudyVersioning';

// Re-export StudyVersion type (assuming it's from the types)
export type { ProtocolVersion as StudyVersion } from '../ProtocolVersioning.types';
