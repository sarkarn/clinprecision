/**
 * Visit Details
 * Complete details of a visit including all associated forms
 */

import type { VisitFormSummary} from './form.types';


export interface VisitDetails {
  id: string | number;
  visitId?: number;
  subjectId: string | number;
  visitName: string;
  description: string;
  visitDate: string;
  status: string;
  timepoint: number;
  forms: VisitFormSummary[];
  scheduledDate?: string;
  actualDate?: string;
  visitType?: string;
}

/**
 * Visit Status Update Request
 * Data required to update visit status
 */
export interface VisitStatusUpdate {
  newStatus: string;
  updatedBy: string;
  notes?: string;
}