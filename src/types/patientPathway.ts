import { PathwayTemplate, PathwayStep } from './pathway'

export interface PatientPathwayStep {
  stepId: string
  originalStep: PathwayStep
  scheduledDate: string | null
  nextDueDate: string | null
  status: 'pending' | 'completed' | 'overdue' | 'snoozed' | 'excluded'
  customDelay?: number // Custom interval override
  snoozeUntil?: string // Temporary snooze date
  excludedReason?: string // Clinical exclusion justification
  excludedBy?: string // Who excluded the step
  excludedDate?: string // When excluded
  countersignedBy?: string // For critical step exclusions
  completedDate?: string | null
  completedBy?: string | null
  notes?: string
}

export interface PatientPathwayAssignment {
  id: string
  patientId: string
  templateId: string
  template: PathwayTemplate
  assignedBy: string
  assignedDate: string
  status: 'active' | 'paused' | 'completed' | 'discontinued'
  startDate: string
  endDate?: string
  steps: PatientPathwayStep[]
  overallJustification?: string // Why assigned to this pathway
  lastModified: string
  modifiedBy: string
}

export type PatientPathwayAdjustmentType = 
  | 'schedule_change' 
  | 'snooze' 
  | 'clinical_exclusion' 
  | 'step_completion'
  | 'pathway_pause'
  | 'pathway_resume'
  | 'pathway_assignment'

export interface PatientPathwayAuditEntry {
  id: string
  patientId: string
  pathwayAssignmentId: string
  timestamp: string
  userId: string
  userName: string
  adjustmentType: PatientPathwayAdjustmentType
  stepId?: string
  stepName?: string
  details: {
    before?: any
    after?: any
    reason?: string
    countersignedBy?: string
    riskLevel?: 'low' | 'medium' | 'high'
    templateId?: string
    templateName?: string
    startDate?: string
    justification?: string
  }
}

export interface CriticalStepExclusionRequest {
  stepId: string
  stepName: string
  reason: string
  requestedBy: string
  riskLevel: 'high'
  requiresCountersign: true
}

export const PatientPathwayAdjustmentReasons = {
  MEDICAL_CONTRAINDICATION: 'medical_contraindication',
  PATIENT_PREFERENCE: 'patient_preference', 
  CLINICAL_JUDGMENT: 'clinical_judgment',
  SCHEDULING_CONFLICT: 'scheduling_conflict',
  RESOURCE_UNAVAILABLE: 'resource_unavailable',
  COMPLETED_ELSEWHERE: 'completed_elsewhere',
  NO_LONGER_INDICATED: 'no_longer_indicated'
} as const

export type PatientPathwayAdjustmentReason = typeof PatientPathwayAdjustmentReasons[keyof typeof PatientPathwayAdjustmentReasons]