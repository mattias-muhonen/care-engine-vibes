export interface PathwayStep {
  id: string
  name: {
    nl: string
    en: string
  }
  trigger: {
    nl: string
    en: string
  }
  action: {
    nl: string
    en: string
  }
  delay: number
  enabled: boolean
  automated: boolean
}

export interface PathwayTemplate {
  id: string
  name: {
    nl: string
    en: string
  }
  description: {
    nl: string
    en: string
  }
  condition: string
  version: string
  isNHGDefault: boolean
  isModified: boolean
  isLocalOverride?: boolean
  lastModified: string | null
  createdBy: string
  summary: {
    totalSteps: number
    avgDuration: string
    priority: 'low' | 'medium' | 'high'
  }
  thresholds: Record<string, number>
  steps: PathwayStep[]
}