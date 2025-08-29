import { PathwayTemplate, PathwayStep } from '../types/pathway'

export interface LocalOverride {
  id: string
  originalTemplateId: string
  name: {
    nl: string
    en: string
  }
  description: {
    nl: string
    en: string
  }
  version: string
  isNHGDefault: false
  isModified: true
  isLocalOverride: true
  lastModified: string
  createdBy: string
  approvedBy?: string[]
  justification: string
  riskLevel: 'low' | 'medium' | 'high'
  pendingApproval: boolean
  overrides: {
    steps: Partial<PathwayStep>[]
    thresholds?: Record<string, number>
    summary?: {
      totalSteps?: number
      avgDuration?: string
      priority?: 'low' | 'medium' | 'high'
    }
  }
  originalTemplate: PathwayTemplate
}

export interface FieldEditability {
  [key: string]: {
    editable: boolean
    riskLevel: 'low' | 'medium' | 'high'
    requiresApproval: boolean
    reason?: string
  }
}

// Define which fields are safely editable vs. risky
export const stepFieldEditability: FieldEditability = {
  'delay': {
    editable: true,
    riskLevel: 'low',
    requiresApproval: false
  },
  'enabled': {
    editable: true,
    riskLevel: 'medium',
    requiresApproval: true,
    reason: 'Disabling steps can affect patient care continuity'
  },
  'automated': {
    editable: true,
    riskLevel: 'low',
    requiresApproval: false
  },
  'action': {
    editable: false,
    riskLevel: 'high',
    requiresApproval: true,
    reason: 'Changing clinical actions requires medical oversight'
  },
  'trigger': {
    editable: false,
    riskLevel: 'high',
    requiresApproval: true,
    reason: 'Modifying triggers can affect patient identification'
  },
  'name': {
    editable: true,
    riskLevel: 'low',
    requiresApproval: false
  }
}

export const thresholdEditability: FieldEditability = {
  'hba1c': {
    editable: true,
    riskLevel: 'high',
    requiresApproval: true,
    reason: 'HbA1c thresholds directly impact patient safety'
  },
  'systolic': {
    editable: true,
    riskLevel: 'high',
    requiresApproval: true,
    reason: 'Blood pressure thresholds are critical for cardiovascular safety'
  },
  'diastolic': {
    editable: true,
    riskLevel: 'high',
    requiresApproval: true,
    reason: 'Blood pressure thresholds are critical for cardiovascular safety'
  },
  'bmi': {
    editable: true,
    riskLevel: 'medium',
    requiresApproval: false
  }
}

// Critical steps that should never be disabled without high-level approval
export const criticalSteps = [
  'annual_review',
  'spirometry_baseline',
  'bp_confirmation'
]

export const isCriticalStep = (stepId: string): boolean => {
  return criticalSteps.includes(stepId)
}

export const calculateRiskLevel = (
  originalTemplate: PathwayTemplate,
  overrides: LocalOverride['overrides']
): 'low' | 'medium' | 'high' => {
  let maxRisk: 'low' | 'medium' | 'high' = 'low'

  // Check step overrides
  overrides.steps.forEach((stepOverride, index) => {
    const originalStep = originalTemplate.steps[index]
    if (!originalStep) return

    Object.keys(stepOverride).forEach(field => {
      const fieldRisk = stepFieldEditability[field]
      if (fieldRisk && fieldRisk.riskLevel === 'high') {
        maxRisk = 'high'
      } else if (fieldRisk && fieldRisk.riskLevel === 'medium' && maxRisk !== 'high') {
        maxRisk = 'medium'
      }
    })

    // Special case: disabling critical steps
    if (stepOverride.enabled === false && isCriticalStep(originalStep.id)) {
      maxRisk = 'high'
    }
  })

  // Check threshold overrides
  if (overrides.thresholds) {
    Object.keys(overrides.thresholds).forEach(threshold => {
      const thresholdRisk = thresholdEditability[threshold]
      if (thresholdRisk && thresholdRisk.riskLevel === 'high') {
        maxRisk = 'high'
      } else if (thresholdRisk && thresholdRisk.riskLevel === 'medium' && maxRisk !== 'high') {
        maxRisk = 'medium'
      }
    })
  }

  return maxRisk
}

export const requiresDualApproval = (riskLevel: 'low' | 'medium' | 'high'): boolean => {
  return riskLevel === 'high'
}

export const generateOverrideId = (originalTemplateId: string): string => {
  return `${originalTemplateId}-override-${Date.now()}`
}

export const createLocalOverride = (
  originalTemplate: PathwayTemplate,
  createdBy: string,
  justification: string
): LocalOverride => {
  const overrideId = generateOverrideId(originalTemplate.id)
  
  return {
    id: overrideId,
    originalTemplateId: originalTemplate.id,
    name: {
      nl: `${originalTemplate.name.nl} (Lokale Aanpassing)`,
      en: `${originalTemplate.name.en} (Local Override)`
    },
    description: {
      nl: `Lokale aanpassing van ${originalTemplate.name.nl}`,
      en: `Local override of ${originalTemplate.name.en}`
    },
    version: `${originalTemplate.version}-local`,
    isNHGDefault: false,
    isModified: true,
    isLocalOverride: true,
    lastModified: new Date().toISOString(),
    createdBy,
    justification,
    riskLevel: 'low',
    pendingApproval: false,
    overrides: {
      steps: originalTemplate.steps.map(() => ({}))
    },
    originalTemplate
  }
}

// Storage utilities for local overrides
export const LocalOverrideStorage = {
  getOverrides: (): LocalOverride[] => {
    const stored = sessionStorage.getItem('pathwayOverrides')
    return stored ? JSON.parse(stored) : []
  },

  saveOverride: (override: LocalOverride): void => {
    const overrides = LocalOverrideStorage.getOverrides()
    const existingIndex = overrides.findIndex(o => o.id === override.id)
    
    if (existingIndex >= 0) {
      overrides[existingIndex] = override
    } else {
      overrides.push(override)
    }
    
    sessionStorage.setItem('pathwayOverrides', JSON.stringify(overrides))
  },

  deleteOverride: (overrideId: string): void => {
    const overrides = LocalOverrideStorage.getOverrides()
    const filtered = overrides.filter(o => o.id !== overrideId)
    sessionStorage.setItem('pathwayOverrides', JSON.stringify(filtered))
  },

  getOverrideByTemplateId: (templateId: string): LocalOverride | undefined => {
    const overrides = LocalOverrideStorage.getOverrides()
    return overrides.find(o => o.originalTemplateId === templateId)
  }
}