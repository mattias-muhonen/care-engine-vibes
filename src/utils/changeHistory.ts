import { ImpactPreviewData } from '../components/organisms/ImpactPreviewModal'

export interface ChangeLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  changeType: 'pathway_override' | 'configuration_change' | 'threshold_update'
  changeName: string
  changeDescription: string
  justification: string
  impactData: ImpactPreviewData
  beforeState: any
  afterState: any
  canUndo: boolean
  undoData?: any
  status: 'applied' | 'undone' | 'failed'
  undoneAt?: string
  undoneBy?: string
  undoneReason?: string
}

export interface ChangeHistoryFilter {
  userId?: string
  changeType?: string
  dateFrom?: string
  dateTo?: string
  status?: 'applied' | 'undone' | 'failed'
  searchText?: string
}

class ChangeHistoryManager {
  private storageKey = 'changeHistory'
  private maxEntries = 1000

  // Get all change log entries
  getChangeHistory(filter?: ChangeHistoryFilter): ChangeLogEntry[] {
    const entries = this.getAllEntries()
    
    if (!filter) return entries

    return entries.filter(entry => {
      if (filter.userId && entry.userId !== filter.userId) return false
      if (filter.changeType && entry.changeType !== filter.changeType) return false
      if (filter.status && entry.status !== filter.status) return false
      
      if (filter.dateFrom) {
        const entryDate = new Date(entry.timestamp)
        const filterDate = new Date(filter.dateFrom)
        if (entryDate < filterDate) return false
      }
      
      if (filter.dateTo) {
        const entryDate = new Date(entry.timestamp)
        const filterDate = new Date(filter.dateTo)
        if (entryDate > filterDate) return false
      }
      
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase()
        const searchableText = [
          entry.changeName,
          entry.changeDescription,
          entry.justification,
          entry.userName
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchLower)) return false
      }
      
      return true
    })
  }

  // Log a new change
  logChange(
    userId: string,
    userName: string,
    changeName: string,
    changeDescription: string,
    justification: string,
    impactData: ImpactPreviewData,
    beforeState: any,
    afterState: any,
    undoData?: any
  ): ChangeLogEntry {
    const entry: ChangeLogEntry = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      changeType: impactData.changeType,
      changeName,
      changeDescription,
      justification,
      impactData,
      beforeState,
      afterState,
      canUndo: !!undoData,
      undoData,
      status: 'applied'
    }

    this.addEntry(entry)
    return entry
  }

  // Undo a change
  undoChange(
    changeId: string,
    undoneBy: string,
    undoneReason: string
  ): boolean {
    const entries = this.getAllEntries()
    const entryIndex = entries.findIndex(e => e.id === changeId)
    
    if (entryIndex === -1) {
      throw new Error('Change entry not found')
    }

    const entry = entries[entryIndex]
    
    if (!entry.canUndo || entry.status !== 'applied') {
      throw new Error('Change cannot be undone')
    }

    if (!entry.undoData) {
      throw new Error('Undo data not available')
    }

    // Apply the undo operation
    try {
      this.executeUndo(entry.undoData)
      
      // Mark as undone
      entry.status = 'undone'
      entry.undoneAt = new Date().toISOString()
      entry.undoneBy = undoneBy
      entry.undoneReason = undoneReason
      
      entries[entryIndex] = entry
      this.saveEntries(entries)
      
      return true
    } catch (error) {
      // Mark as failed
      entry.status = 'failed'
      entries[entryIndex] = entry
      this.saveEntries(entries)
      
      throw error
    }
  }

  // Get changes that can be undone
  getUndoableChanges(userId?: string): ChangeLogEntry[] {
    return this.getAllEntries().filter(entry => {
      if (entry.status !== 'applied' || !entry.canUndo) return false
      if (userId && entry.userId !== userId) return false
      
      // Only allow undo within 24 hours
      const changeTime = new Date(entry.timestamp)
      const now = new Date()
      const hoursSinceChange = (now.getTime() - changeTime.getTime()) / (1000 * 60 * 60)
      
      return hoursSinceChange <= 24
    })
  }

  // Get change statistics
  getChangeStatistics(dateFrom?: string, dateTo?: string) {
    const entries = this.getChangeHistory({
      dateFrom,
      dateTo
    })

    const byType = entries.reduce((acc, entry) => {
      acc[entry.changeType] = (acc[entry.changeType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byUser = entries.reduce((acc, entry) => {
      acc[entry.userName] = (acc[entry.userName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byStatus = entries.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: entries.length,
      byType,
      byUser,
      byStatus,
      totalPatientsAffected: entries.reduce((sum, entry) => sum + entry.impactData.affectedPatients.total, 0),
      averageRiskLevel: this.calculateAverageRisk(entries)
    }
  }

  // Private methods
  private getAllEntries(): ChangeLogEntry[] {
    const stored = sessionStorage.getItem(this.storageKey)
    if (!stored) return []
    
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Error parsing change history:', error)
      return []
    }
  }

  private addEntry(entry: ChangeLogEntry): void {
    const entries = this.getAllEntries()
    entries.unshift(entry) // Add to beginning
    
    // Limit entries to prevent storage bloat
    if (entries.length > this.maxEntries) {
      entries.splice(this.maxEntries)
    }
    
    this.saveEntries(entries)
  }

  private saveEntries(entries: ChangeLogEntry[]): void {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(entries))
    } catch (error) {
      console.error('Error saving change history:', error)
    }
  }

  private executeUndo(undoData: any): void {
    // This would contain the actual undo logic
    // For now, we'll just simulate it
    console.log('Executing undo operation:', undoData)
    
    switch (undoData.type) {
      case 'pathway_override':
        // Restore original pathway template
        // Remove override from storage
        break
      case 'threshold_update':
        // Restore previous threshold value
        break
      case 'configuration_change':
        // Restore previous configuration
        break
      default:
        throw new Error('Unknown undo operation type')
    }
  }

  private calculateAverageRisk(entries: ChangeLogEntry[]): string {
    if (entries.length === 0) return 'low'
    
    const riskValues = { low: 1, medium: 2, high: 3, critical: 4 }
    const totalRisk = entries.reduce((sum, entry) => {
      return sum + (riskValues[entry.impactData.riskAssessment.level] || 1)
    }, 0)
    
    const avgRisk = totalRisk / entries.length
    
    if (avgRisk >= 3.5) return 'critical'
    if (avgRisk >= 2.5) return 'high'
    if (avgRisk >= 1.5) return 'medium'
    return 'low'
  }
}

export const changeHistoryManager = new ChangeHistoryManager()

// Helper functions for common operations
export const logPathwayOverrideChange = (
  userId: string,
  userName: string,
  templateName: string,
  justification: string,
  impactData: ImpactPreviewData,
  originalTemplate: any,
  override: any
) => {
  return changeHistoryManager.logChange(
    userId,
    userName,
    `Pathway Override: ${templateName}`,
    `Created local override for ${templateName}`,
    justification,
    impactData,
    originalTemplate,
    override,
    {
      type: 'pathway_override',
      templateId: originalTemplate.id,
      overrideId: override.id
    }
  )
}

export const logThresholdChange = (
  userId: string,
  userName: string,
  thresholdName: string,
  oldValue: any,
  newValue: any,
  justification: string,
  impactData: ImpactPreviewData
) => {
  return changeHistoryManager.logChange(
    userId,
    userName,
    `Threshold Change: ${thresholdName}`,
    `Changed ${thresholdName} from ${oldValue} to ${newValue}`,
    justification,
    impactData,
    { [thresholdName]: oldValue },
    { [thresholdName]: newValue },
    {
      type: 'threshold_update',
      thresholdName,
      oldValue,
      newValue
    }
  )
}

export const logConfigurationChange = (
  userId: string,
  userName: string,
  configName: string,
  description: string,
  justification: string,
  impactData: ImpactPreviewData,
  beforeState: any,
  afterState: any
) => {
  return changeHistoryManager.logChange(
    userId,
    userName,
    `Configuration: ${configName}`,
    description,
    justification,
    impactData,
    beforeState,
    afterState,
    {
      type: 'configuration_change',
      configName,
      beforeState,
      afterState
    }
  )
}