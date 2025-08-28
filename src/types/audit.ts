import type { ActionType } from './actions'
import type { RiskLevel } from './patient'

export type UserRole = 'GP' | 'POH-S' | 'Practice_Manager' | 'System'

export type AuditEventType = 
  | 'patient_viewed'
  | 'action_created'
  | 'action_approved'
  | 'action_rejected'
  | 'action_executed'
  | 'bulk_action_created'
  | 'bulk_action_approved'
  | 'configuration_changed'
  | 'threshold_updated'
  | 'pathway_modified'
  | 'user_login'
  | 'user_logout'
  | 'emergency_stop_activated'
  | 'emergency_stop_deactivated'
  | 'data_export'
  | 'system_error'

export interface User {
  id: string
  name: string
  role: UserRole
  email: string
  practiceId: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
}

export interface AuditEvent {
  id: string
  timestamp: Date
  eventType: AuditEventType
  userId: string
  userRole: UserRole
  
  // Context
  patientId?: string
  actionId?: string
  bulkActionId?: string
  
  // Event Details
  description: string
  metadata: Record<string, unknown>
  
  // Compliance
  ipAddress?: string
  userAgent?: string
  sessionId: string
  
  // Results
  success: boolean
  errorMessage?: string
}

export interface ComplianceReport {
  id: string
  generatedAt: Date
  generatedBy: string
  period: {
    startDate: Date
    endDate: Date
  }
  
  // Metrics
  totalPatients: number
  patientsTriaged: number
  actionsExecuted: number
  nhgComplianceRate: number // percentage
  
  // Breakdown by type
  actionsByType: Record<ActionType, number>
  riskDistribution: Record<RiskLevel, number>
  
  // Quality Metrics
  averageResponseTime: number // hours
  userEngagement: Record<UserRole, number>
  
  // Compliance Items
  auditTrailCompleteness: number // percentage
  consentCompliance: number // percentage
  dataRetentionCompliance: boolean
}

export interface SystemSettings {
  practiceId: string
  practiceName: string
  
  // Operational Limits
  dailyActionLimit: number
  maxBulkActionSize: number
  emergencyStopEnabled: boolean
  
  // Thresholds (NHG-based)
  hba1cThresholds: {
    good: number      // <53 mmol/mol
    acceptable: number // 53-63 mmol/mol
    actionNeeded: number // >64 mmol/mol
  }
  
  overdueThresholds: {
    hba1cMonths: number    // months before HbA1c is considered overdue
    visitMonths: number    // months before routine visit is overdue
    urgentDays: number     // days for urgent follow-up
  }
  
  // Automation Settings
  autoApprovalEnabled: boolean
  autoApprovalRiskLimit: RiskLevel
  businessHoursOnly: boolean
  weekendsEnabled: boolean
  
  // Notification Settings
  emailNotifications: boolean
  smsNotifications: boolean
  emergencyContactEmail: string
  
  // Compliance
  dataRetentionDays: number
  auditLogRetentionDays: number
  consentReminderDays: number
  
  createdAt: Date
  updatedAt: Date
}