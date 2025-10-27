export interface CodeListEndpoints {
  REGULATORY_STATUS: string;
  STUDY_PHASE: string;
  STUDY_STATUS: string;
  AMENDMENT_TYPE: string;
  VISIT_TYPE: string;
}

export interface CodeListItem {
  code?: string;
  value?: string;
  id?: string;
  displayName?: string;
  name?: string;
  label?: string;
  description?: string;
  displayOrder?: number;
  order?: number;
  [key: string]: any;
}

