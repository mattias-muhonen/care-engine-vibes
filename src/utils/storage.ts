export interface AuditEntry {
  id: string
  timestamp: string
  user: string
  actionType: string
  details: Record<string, any>
}

const AUDIT_STORAGE_KEY = 'care-engine-audit-log'
const SETTINGS_STORAGE_KEY = 'care-engine-settings'

export class AuditLogger {
  static generateId(): string {
    return `A${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  static getCurrentUser(): string {
    // In a real app, this would come from authentication context
    return 'Martine van der Berg (POH-S)'
  }

  static addEntry(actionType: string, details: Record<string, any>): AuditEntry {
    const entry: AuditEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      user: this.getCurrentUser(),
      actionType,
      details
    }

    try {
      const existingEntries = this.getAllEntries()
      const updatedEntries = [entry, ...existingEntries] // New entries first
      
      sessionStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedEntries))
      
      return entry
    } catch (error) {
      console.error('Failed to add audit entry:', error)
      return entry
    }
  }

  static getAllEntries(): AuditEntry[] {
    try {
      const stored = sessionStorage.getItem(AUDIT_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to retrieve audit entries:', error)
      return []
    }
  }

  static clearEntries(): void {
    try {
      sessionStorage.removeItem(AUDIT_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear audit entries:', error)
    }
  }

  static getEntriesByType(actionType: string): AuditEntry[] {
    return this.getAllEntries().filter(entry => entry.actionType === actionType)
  }

  static getEntriesByUser(user: string): AuditEntry[] {
    return this.getAllEntries().filter(entry => entry.user === user)
  }
}

export interface AppSettings {
  killSwitchActive: boolean
  hba1cThreshold: number
  maxDailyActions: number
  autoBookingEnabled: boolean
  outreachChannels: string[]
}

export class SettingsStorage {
  static getDefaultSettings(): AppSettings {
    return {
      killSwitchActive: false,
      hba1cThreshold: 70,
      maxDailyActions: 10,
      autoBookingEnabled: true,
      outreachChannels: ['sms', 'email', 'phone']
    }
  }

  static getSettings(): AppSettings {
    try {
      const stored = sessionStorage.getItem(SETTINGS_STORAGE_KEY)
      return stored ? { ...this.getDefaultSettings(), ...JSON.parse(stored) } : this.getDefaultSettings()
    } catch (error) {
      console.error('Failed to retrieve settings:', error)
      return this.getDefaultSettings()
    }
  }

  static saveSettings(settings: Partial<AppSettings>): void {
    try {
      const currentSettings = this.getSettings()
      const updatedSettings = { ...currentSettings, ...settings }
      
      sessionStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings))
      
      // Log settings change
      AuditLogger.addEntry('settings_updated', {
        changedSettings: Object.keys(settings),
        newValues: settings
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  static resetSettings(): void {
    try {
      sessionStorage.removeItem(SETTINGS_STORAGE_KEY)
      AuditLogger.addEntry('settings_reset', {
        action: 'All settings reset to defaults'
      })
    } catch (error) {
      console.error('Failed to reset settings:', error)
    }
  }

  static toggleKillSwitch(): boolean {
    const currentSettings = this.getSettings()
    const newKillSwitchState = !currentSettings.killSwitchActive
    
    this.saveSettings({ killSwitchActive: newKillSwitchState })
    
    AuditLogger.addEntry('kill_switch_toggled', {
      action: newKillSwitchState ? 'activated' : 'deactivated',
      previousState: currentSettings.killSwitchActive,
      newState: newKillSwitchState
    })
    
    return newKillSwitchState
  }
}

// Utility functions for common storage operations
export function initializeAuditLog(): void {
  // Check if we have any entries, if not, seed with initial data
  const existingEntries = AuditLogger.getAllEntries()
  
  if (existingEntries.length === 0) {
    // Add a welcome entry to show the system is working
    AuditLogger.addEntry('system_initialized', {
      message: 'Zorgautomatisering systeem geïnitialiseerd',
      version: '1.0.0-poc'
    })
  }
}

export function logUserAction(actionType: string, details: Record<string, any>): void {
  AuditLogger.addEntry(actionType, details)
}

export function exportAuditLog(): string {
  const entries = AuditLogger.getAllEntries()
  return JSON.stringify(entries, null, 2)
}