import { 
  PatientPathwayAssignment, 
  PatientPathwayStep, 
  PatientPathwayAuditEntry,
  CriticalStepExclusionRequest
} from '../types/patientPathway'

export type { PatientPathwayAssignment, PatientPathwayAuditEntry }
import { PathwayTemplate, PathwayStep } from '../types/pathway'
import { isCriticalStep } from './pathwayOverrides'
import { logUserAction } from './storage'

export const calculateNextDueDate = (startDate: string, delay: number): string => {
  const start = new Date(startDate)
  start.setDate(start.getDate() + delay)
  return start.toISOString().split('T')[0]
}

export const createPatientPathwayAssignment = (
  patientId: string,
  template: PathwayTemplate,
  assignedBy: string,
  startDate: string = new Date().toISOString().split('T')[0],
  justification?: string
): PatientPathwayAssignment => {
  const assignmentId = `${patientId}-${template.id}-${Date.now()}`
  
  // Create patient-specific steps based on template
  const patientSteps: PatientPathwayStep[] = template.steps.map((step, index) => {
    const scheduledDate = index === 0 ? startDate : calculateNextDueDate(startDate, step.delay)
    
    return {
      stepId: step.id,
      originalStep: step,
      scheduledDate,
      nextDueDate: step.enabled ? scheduledDate : null,
      status: step.enabled ? 'pending' : 'excluded',
      excludedReason: !step.enabled ? 'Disabled in template' : undefined
    }
  })

  return {
    id: assignmentId,
    patientId,
    templateId: template.id,
    template,
    assignedBy,
    assignedDate: new Date().toISOString(),
    status: 'active',
    startDate,
    steps: patientSteps,
    overallJustification: justification,
    lastModified: new Date().toISOString(),
    modifiedBy: assignedBy
  }
}

export const adjustPatientPathwayStep = (
  assignment: PatientPathwayAssignment,
  stepId: string,
  adjustment: {
    customDelay?: number
    snoozeUntil?: string
    excludedReason?: string
    excludedBy?: string
    countersignedBy?: string
    notes?: string
  },
  adjustedBy: string
): PatientPathwayAssignment => {
  const updatedSteps = assignment.steps.map(step => {
    if (step.stepId === stepId) {
      const updatedStep = { ...step }
      
      // Handle scheduling adjustments
      if (adjustment.customDelay !== undefined) {
        updatedStep.customDelay = adjustment.customDelay
        updatedStep.nextDueDate = calculateNextDueDate(assignment.startDate, adjustment.customDelay)
      }
      
      // Handle snooze
      if (adjustment.snoozeUntil) {
        updatedStep.snoozeUntil = adjustment.snoozeUntil
        updatedStep.status = 'snoozed'
        updatedStep.nextDueDate = adjustment.snoozeUntil
      }
      
      // Handle exclusion
      if (adjustment.excludedReason) {
        updatedStep.excludedReason = adjustment.excludedReason
        updatedStep.excludedBy = adjustment.excludedBy
        updatedStep.excludedDate = new Date().toISOString()
        updatedStep.status = 'excluded'
        updatedStep.nextDueDate = null
        
        // Add countersign for critical steps
        if (adjustment.countersignedBy) {
          updatedStep.countersignedBy = adjustment.countersignedBy
        }
      }
      
      if (adjustment.notes) {
        updatedStep.notes = adjustment.notes
      }
      
      return updatedStep
    }
    return step
  })

  return {
    ...assignment,
    steps: updatedSteps,
    lastModified: new Date().toISOString(),
    modifiedBy: adjustedBy
  }
}

export const resumeSnoozeStep = (
  assignment: PatientPathwayAssignment,
  stepId: string,
  resumedBy: string
): PatientPathwayAssignment => {
  const updatedSteps = assignment.steps.map(step => {
    if (step.stepId === stepId && step.status === 'snoozed') {
      return {
        ...step,
        status: 'pending' as const,
        snoozeUntil: undefined,
        nextDueDate: step.scheduledDate
      }
    }
    return step
  })

  return {
    ...assignment,
    steps: updatedSteps,
    lastModified: new Date().toISOString(),
    modifiedBy: resumedBy
  }
}

export const completePatientPathwayStep = (
  assignment: PatientPathwayAssignment,
  stepId: string,
  completedBy: string,
  notes?: string
): PatientPathwayAssignment => {
  const updatedSteps = assignment.steps.map(step => {
    if (step.stepId === stepId) {
      return {
        ...step,
        status: 'completed' as const,
        completedDate: new Date().toISOString(),
        completedBy,
        notes: notes || step.notes
      }
    }
    return step
  })

  return {
    ...assignment,
    steps: updatedSteps,
    lastModified: new Date().toISOString(),
    modifiedBy: completedBy
  }
}

export const validateCriticalStepExclusion = (
  step: PathwayStep,
  reason: string
): CriticalStepExclusionRequest | null => {
  if (!isCriticalStep(step.id)) {
    return null
  }

  return {
    stepId: step.id,
    stepName: step.name.en, // Using English for system validation
    reason,
    requestedBy: '', // Will be filled by caller
    riskLevel: 'high',
    requiresCountersign: true
  }
}

export const getPathwayStepStatus = (step: PatientPathwayStep): {
  status: string
  variant: 'success' | 'warning' | 'critical' | 'default'
  daysUntilDue?: number
} => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (step.status === 'completed') {
    return { status: 'Completed', variant: 'success' }
  }
  
  if (step.status === 'excluded') {
    return { status: 'Excluded', variant: 'default' }
  }
  
  if (step.status === 'snoozed') {
    return { status: 'Snoozed', variant: 'warning' }
  }

  if (!step.nextDueDate) {
    return { status: 'Not scheduled', variant: 'default' }
  }

  const dueDate = new Date(step.nextDueDate)
  dueDate.setHours(0, 0, 0, 0)
  
  const timeDiff = dueDate.getTime() - today.getTime()
  const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24))

  if (daysUntilDue < 0) {
    return { status: 'Overdue', variant: 'critical', daysUntilDue: Math.abs(daysUntilDue) }
  } else if (daysUntilDue === 0) {
    return { status: 'Due today', variant: 'warning', daysUntilDue: 0 }
  } else if (daysUntilDue <= 7) {
    return { status: 'Due soon', variant: 'warning', daysUntilDue }
  } else {
    return { status: 'Scheduled', variant: 'default', daysUntilDue }
  }
}

// Storage utilities for patient pathway assignments
export const PatientPathwayStorage = {
  getAssignments: (): PatientPathwayAssignment[] => {
    const stored = sessionStorage.getItem('patientPathwayAssignments')
    return stored ? JSON.parse(stored) : []
  },

  saveAssignment: (assignment: PatientPathwayAssignment): void => {
    const assignments = PatientPathwayStorage.getAssignments()
    const existingIndex = assignments.findIndex(a => a.id === assignment.id)
    
    if (existingIndex >= 0) {
      assignments[existingIndex] = assignment
    } else {
      assignments.push(assignment)
    }
    
    sessionStorage.setItem('patientPathwayAssignments', JSON.stringify(assignments))
    
    // Log to general audit
    logUserAction('patient_pathway_updated', {
      assignmentId: assignment.id,
      patientId: assignment.patientId,
      templateId: assignment.templateId
    })
  },

  getAssignmentsByPatient: (patientId: string): PatientPathwayAssignment[] => {
    return PatientPathwayStorage.getAssignments().filter(a => a.patientId === patientId)
  },

  getActiveAssignmentsByPatient: (patientId: string): PatientPathwayAssignment[] => {
    return PatientPathwayStorage.getAssignmentsByPatient(patientId).filter(a => a.status === 'active')
  },

  deleteAssignment: (assignmentId: string): void => {
    const assignments = PatientPathwayStorage.getAssignments()
    const filtered = assignments.filter(a => a.id !== assignmentId)
    sessionStorage.setItem('patientPathwayAssignments', JSON.stringify(filtered))
  }
}

// Patient pathway audit trail utilities
export const PatientPathwayAuditStorage = {
  getAuditEntries: (): PatientPathwayAuditEntry[] => {
    const stored = sessionStorage.getItem('patientPathwayAudit')
    return stored ? JSON.parse(stored) : []
  },

  addAuditEntry: (entry: Omit<PatientPathwayAuditEntry, 'id' | 'timestamp'>): void => {
    const auditEntry: PatientPathwayAuditEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }
    
    const entries = PatientPathwayAuditStorage.getAuditEntries()
    entries.push(auditEntry)
    sessionStorage.setItem('patientPathwayAudit', JSON.stringify(entries))
  },

  getPatientAuditEntries: (patientId: string): PatientPathwayAuditEntry[] => {
    return PatientPathwayAuditStorage.getAuditEntries()
      .filter(entry => entry.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  getAssignmentAuditEntries: (assignmentId: string): PatientPathwayAuditEntry[] => {
    return PatientPathwayAuditStorage.getAuditEntries()
      .filter(entry => entry.pathwayAssignmentId === assignmentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
}