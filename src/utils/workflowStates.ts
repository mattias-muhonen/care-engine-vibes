import { LocalOverride } from './pathwayOverrides'

export type WorkflowState = 'draft' | 'review' | 'published' | 'archived'

export interface WorkflowTransition {
  id: string
  timestamp: string
  fromState: WorkflowState
  toState: WorkflowState
  userId: string
  userName: string
  comment?: string
  reviewNotes?: string
  approvedBy?: string
  approvedAt?: string
}

export interface WorkflowMetadata {
  currentState: WorkflowState
  version: number
  transitions: WorkflowTransition[]
  lastModified: string
  modifiedBy: string
  reviewers?: string[]
  publishedBy?: string
  publishedAt?: string
  scheduledPublishAt?: string
}

export interface WorkflowCapabilities {
  canEdit: boolean
  canSaveDraft: boolean
  canRequestReview: boolean
  canApproveReview: boolean
  canRejectReview: boolean
  canPublish: boolean
  canArchive: boolean
  canSchedulePublish: boolean
}

// Enhanced LocalOverride with workflow state
export interface WorkflowAwareOverride extends LocalOverride {
  workflow: WorkflowMetadata
}

class WorkflowStateManager {
  private storageKey = 'pathwayWorkflows'

  // Get workflow metadata for an override
  getWorkflowMetadata(overrideId: string): WorkflowMetadata | null {
    const workflows = this.getAllWorkflows()
    return workflows[overrideId] || null
  }

  // Initialize workflow for new override
  initializeWorkflow(
    overrideId: string,
    userId: string,
    userName: string,
    initialState: WorkflowState = 'draft'
  ): WorkflowMetadata {
    const workflows = this.getAllWorkflows()
    
    const workflow: WorkflowMetadata = {
      currentState: initialState,
      version: 1,
      transitions: [{
        id: `${overrideId}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        fromState: 'draft', // Initial state
        toState: initialState,
        userId,
        userName,
        comment: 'Workflow initialized'
      }],
      lastModified: new Date().toISOString(),
      modifiedBy: userName
    }

    workflows[overrideId] = workflow
    this.saveWorkflows(workflows)
    return workflow
  }

  // Transition workflow state
  transitionState(
    overrideId: string,
    toState: WorkflowState,
    userId: string,
    userName: string,
    comment?: string,
    reviewNotes?: string,
    approvedBy?: string
  ): WorkflowMetadata {
    const workflows = this.getAllWorkflows()
    const workflow = workflows[overrideId]
    
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    // Validate transition
    if (!this.isValidTransition(workflow.currentState, toState)) {
      throw new Error(`Invalid transition from ${workflow.currentState} to ${toState}`)
    }

    const transition: WorkflowTransition = {
      id: `${overrideId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromState: workflow.currentState,
      toState,
      userId,
      userName,
      comment,
      reviewNotes,
      approvedBy,
      approvedAt: approvedBy ? new Date().toISOString() : undefined
    }

    // Update workflow
    workflow.currentState = toState
    workflow.version++
    workflow.transitions.push(transition)
    workflow.lastModified = new Date().toISOString()
    workflow.modifiedBy = userName

    // Set publish metadata if publishing
    if (toState === 'published') {
      workflow.publishedBy = userName
      workflow.publishedAt = new Date().toISOString()
    }

    workflows[overrideId] = workflow
    this.saveWorkflows(workflows)
    return workflow
  }

  // Get workflow capabilities for a user
  getWorkflowCapabilities(
    currentState: WorkflowState,
    userRole: string,
    userId: string,
    workflowMetadata?: WorkflowMetadata
  ): WorkflowCapabilities {
    const isAuthor = workflowMetadata?.modifiedBy === userId
    const canApprove = userRole === 'gp' || userRole === 'practice-manager'
    const canEdit = userRole === 'poh-s' || userRole === 'practice-manager'

    return {
      canEdit: (currentState === 'draft' && canEdit) || currentState === 'review',
      canSaveDraft: canEdit,
      canRequestReview: currentState === 'draft' && isAuthor,
      canApproveReview: currentState === 'review' && canApprove && !isAuthor,
      canRejectReview: currentState === 'review' && canApprove && !isAuthor,
      canPublish: currentState === 'review' && canApprove,
      canArchive: currentState === 'published' && canApprove,
      canSchedulePublish: currentState === 'review' && canApprove
    }
  }

  // Check if transition is valid
  private isValidTransition(from: WorkflowState, to: WorkflowState): boolean {
    const validTransitions: Record<WorkflowState, WorkflowState[]> = {
      draft: ['review', 'archived'],
      review: ['draft', 'published', 'archived'],
      published: ['archived'],
      archived: ['draft'] // Can restore from archive
    }

    return validTransitions[from]?.includes(to) ?? false
  }

  // Get all overrides in a specific state
  getOverridesByState(state: WorkflowState): string[] {
    const workflows = this.getAllWorkflows()
    return Object.keys(workflows).filter(id => workflows[id].currentState === state)
  }

  // Get pending reviews
  getPendingReviews(): Array<{ overrideId: string; workflow: WorkflowMetadata }> {
    const workflows = this.getAllWorkflows()
    return Object.entries(workflows)
      .filter(([_, workflow]) => workflow.currentState === 'review')
      .map(([overrideId, workflow]) => ({ overrideId, workflow }))
  }

  // Get recently published overrides
  getRecentlyPublished(daysBefore: number = 7): Array<{ overrideId: string; workflow: WorkflowMetadata }> {
    const workflows = this.getAllWorkflows()
    const cutoffDate = new Date(Date.now() - daysBefore * 24 * 60 * 60 * 1000)
    
    return Object.entries(workflows)
      .filter(([_, workflow]) => {
        if (workflow.currentState !== 'published' || !workflow.publishedAt) return false
        return new Date(workflow.publishedAt) > cutoffDate
      })
      .map(([overrideId, workflow]) => ({ overrideId, workflow }))
      .sort((a, b) => new Date(b.workflow.publishedAt!).getTime() - new Date(a.workflow.publishedAt!).getTime())
  }

  // Get workflow statistics
  getWorkflowStatistics() {
    const workflows = this.getAllWorkflows()
    const stats = Object.values(workflows).reduce((acc, workflow) => {
      acc[workflow.currentState] = (acc[workflow.currentState] || 0) + 1
      return acc
    }, {} as Record<WorkflowState, number>)

    return {
      draft: stats.draft || 0,
      review: stats.review || 0,
      published: stats.published || 0,
      archived: stats.archived || 0,
      total: Object.values(stats).reduce((sum, count) => sum + count, 0)
    }
  }

  // Schedule publication
  schedulePublication(
    overrideId: string,
    scheduledDate: Date,
    _userId: string,
    userName: string
  ): WorkflowMetadata {
    const workflows = this.getAllWorkflows()
    const workflow = workflows[overrideId]
    
    if (!workflow || workflow.currentState !== 'review') {
      throw new Error('Can only schedule publication for overrides in review state')
    }

    workflow.scheduledPublishAt = scheduledDate.toISOString()
    workflow.lastModified = new Date().toISOString()
    workflow.modifiedBy = userName

    workflows[overrideId] = workflow
    this.saveWorkflows(workflows)
    return workflow
  }

  // Process scheduled publications
  processScheduledPublications(): Array<{ overrideId: string; workflow: WorkflowMetadata }> {
    const workflows = this.getAllWorkflows()
    const now = new Date()
    const published: Array<{ overrideId: string; workflow: WorkflowMetadata }> = []

    Object.entries(workflows).forEach(([overrideId, workflow]) => {
      if (
        workflow.currentState === 'review' && 
        workflow.scheduledPublishAt && 
        new Date(workflow.scheduledPublishAt) <= now
      ) {
        try {
          const updatedWorkflow = this.transitionState(
            overrideId,
            'published',
            'system',
            'Automated Publication',
            'Scheduled publication executed'
          )
          published.push({ overrideId, workflow: updatedWorkflow })
        } catch (error) {
          console.error(`Failed to publish scheduled override ${overrideId}:`, error)
        }
      }
    })

    return published
  }

  // Private methods
  private getAllWorkflows(): Record<string, WorkflowMetadata> {
    const stored = sessionStorage.getItem(this.storageKey)
    if (!stored) return {}
    
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Error parsing workflows:', error)
      return {}
    }
  }

  private saveWorkflows(workflows: Record<string, WorkflowMetadata>): void {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(workflows))
    } catch (error) {
      console.error('Error saving workflows:', error)
    }
  }
}

export const workflowStateManager = new WorkflowStateManager()

// Helper functions
export const getWorkflowStateColor = (state: WorkflowState) => {
  switch (state) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'review': return 'bg-yellow-100 text-yellow-800'
    case 'published': return 'bg-green-100 text-green-800'
    case 'archived': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getWorkflowStateIcon = (state: WorkflowState) => {
  switch (state) {
    case 'draft': return '📝'
    case 'review': return '👁️'
    case 'published': return '✅'
    case 'archived': return '📦'
    default: return '❓'
  }
}