export type ActionType = 'sms_reminder' | 'email_reminder' | 'phone_call' | 'letter' | 'book_appointment' | 'escalate_to_gp'

export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled'

export type MessageTemplate = 'hba1c_reminder' | 'appointment_reminder' | 'lab_results_overdue' | 'annual_checkup' | 'urgent_review'

export interface ActionItem {
  id: string
  patientId: string
  type: ActionType
  status: ActionStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Action Details
  title: string
  description: string
  messageTemplate?: MessageTemplate
  scheduledFor?: Date
  
  // Approval Workflow
  createdBy: 'system' | string // user ID if manual
  createdAt: Date
  approvedBy?: string // user ID
  approvedAt?: Date
  rejectedBy?: string // user ID
  rejectedAt?: Date
  rejectionReason?: string
  
  // Execution
  executedAt?: Date
  executionResult?: {
    success: boolean
    message: string
    details?: Record<string, unknown>
  }
  
  // Metadata
  estimatedDuration?: number // minutes
  cost?: number // euros
}

export interface BulkAction {
  id: string
  name: string
  description: string
  actionType: ActionType
  patientIds: string[]
  template?: MessageTemplate
  scheduledFor?: Date
  createdBy: string
  createdAt: Date
  status: 'draft' | 'pending_approval' | 'approved' | 'executing' | 'completed' | 'failed'
  
  // Results
  individualActions: ActionItem[]
  summary?: {
    total: number
    successful: number
    failed: number
    pending: number
  }
}

export interface MessageTemplateConfig {
  id: MessageTemplate
  name: string
  subject?: string // for emails
  content: string
  variables: string[] // Available template variables
  language: 'nl' | 'en'
  category: 'reminder' | 'booking' | 'results' | 'urgent'
}

export interface Pathway {
  id: string
  name: string
  description: string
  triggers: {
    conditions: Array<{
      field: string | 'lab_result'
      operator: '>' | '<' | '==' | '>=' | '<=' | 'overdue_by'
      value: string | number | boolean
      unit?: string
    }>
    combinedWith: 'AND' | 'OR'
  }
  actions: Array<{
    actionType: ActionType
    delay: number // days
    template?: MessageTemplate
    requiresApproval: boolean
  }>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}