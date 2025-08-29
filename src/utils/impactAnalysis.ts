import { PathwayTemplate } from '../types/pathway'
import { LocalOverride } from './pathwayOverrides'
import { Patient } from './patientFilters'
import { PatientPathwayStorage } from './patientPathways'
import { ImpactPreviewData } from '../components/organisms/ImpactPreviewModal'

// Mock patient data for analysis
const getMockPatients = (): Patient[] => {
  // In a real app, this would fetch from your patient data store
  return [
    { id: 'p1', riskLevel: 'high', pathwayStatus: 'active' },
    { id: 'p2', riskLevel: 'medium', pathwayStatus: 'active' },
    { id: 'p3', riskLevel: 'low', pathwayStatus: 'monitoring' }
  ] as Patient[]
}

// Mock cohorts for analysis
const getMockCohorts = () => {
  return [
    { id: 'c1', name: 'T2DM High Risk', currentSize: 45, condition: 'T2DM' },
    { id: 'c2', name: 'Hypertension Monitoring', currentSize: 32, condition: 'Hypertension' },
    { id: 'c3', name: 'Respiratory Follow-up', currentSize: 28, condition: 'Respiratory' }
  ]
}

export const calculatePathwayOverrideImpact = (
  originalTemplate: PathwayTemplate,
  override: LocalOverride
): ImpactPreviewData => {
  const cohorts = getMockCohorts()
  
  // Calculate affected patients
  const existingAssignments = PatientPathwayStorage.getAssignments()
  const affectedAssignments = existingAssignments.filter(assignment => assignment.templateId === originalTemplate.id)
  
  const affectedPatients = {
    total: affectedAssignments.length,
    byRiskLevel: affectedAssignments.reduce((acc, _assignment) => {
      // In real app, get patient risk level from patient data
      const riskLevel = 'medium' // Mock
      acc[riskLevel] = (acc[riskLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byPathway: {
      [originalTemplate.id]: affectedAssignments.length
    }
  }

  // Calculate step changes
  const originalSteps = originalTemplate.steps
  const overrideSteps = override.overrides.steps || []
  
  let accelerated = 0
  let delayed = 0
  let newSteps = 0
  let removedSteps = 0

  originalSteps.forEach((originalStep, index) => {
    const stepOverride = overrideSteps[index]
    if (stepOverride) {
      if (stepOverride.delay !== undefined && stepOverride.delay < originalStep.delay) {
        accelerated++
      } else if (stepOverride.delay !== undefined && stepOverride.delay > originalStep.delay) {
        delayed++
      }
      if (stepOverride.enabled === false && originalStep.enabled) {
        removedSteps++
      }
      if (stepOverride.enabled === true && !originalStep.enabled) {
        newSteps++
      }
    }
  })

  // Calculate workload impact
  const immediateActions = Math.floor(affectedPatients.total * 0.3) // 30% need immediate attention
  const weeklyActions = Math.floor(affectedPatients.total * 0.8)
  const monthlyActions = Math.floor(affectedPatients.total * 1.5)
  const estimatedHours = Math.floor((immediateActions * 0.5) + (weeklyActions * 0.25))

  // Risk assessment
  const riskFactors: string[] = []
  const warnings: string[] = []
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

  if (removedSteps > 0) {
    riskFactors.push('Steps being removed from pathway')
    riskLevel = 'medium'
  }

  if (accelerated > 3) {
    riskFactors.push('Multiple steps accelerated significantly')
    warnings.push('Accelerated timeline may increase patient burden')
    riskLevel = 'high'
  }

  if (affectedPatients.total > 50) {
    riskFactors.push('Large number of patients affected')
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
  }

  if (override.riskLevel === 'high') {
    riskLevel = 'critical'
    warnings.push('High-risk override requiring dual approval')
  }

  // Calculate cohort impact
  const cohortSizeChanges = cohorts
    .filter(cohort => cohort.condition === originalTemplate.condition)
    .map(cohort => ({
      cohortId: cohort.id,
      cohortName: cohort.name,
      currentSize: cohort.currentSize,
      newSize: cohort.currentSize + Math.floor(Math.random() * 10 - 5), // Mock change
      change: Math.floor(Math.random() * 10 - 5)
    }))

  return {
    changeType: 'pathway_override',
    changeName: `Local Override: ${originalTemplate.name.en}`,
    changeDescription: `Modifying ${originalSteps.length} pathway steps with ${overrideSteps.length} overrides`,
    affectedPatients,
    cohortImpact: { cohortSizeChanges },
    workloadImpact: {
      immediateActions,
      weeklyActions,
      monthlyActions,
      estimatedHours
    },
    dueDateChanges: {
      accelerated,
      delayed,
      newSteps,
      removedSteps
    },
    riskAssessment: {
      level: riskLevel,
      factors: riskFactors,
      warnings
    }
  }
}

export const calculateThresholdChangeImpact = (
  thresholdName: string,
  currentValue: any,
  newValue: any,
  affectedTemplates: PathwayTemplate[]
): ImpactPreviewData => {
  const patients = getMockPatients()
  
  // Estimate patients affected by threshold change
  const affectedPatients = {
    total: Math.floor(patients.length * 0.6), // Mock: 60% affected
    byRiskLevel: {
      'high': Math.floor(patients.length * 0.2),
      'medium': Math.floor(patients.length * 0.25),
      'low': Math.floor(patients.length * 0.15)
    },
    byPathway: affectedTemplates.reduce((acc, template) => {
      acc[template.id] = Math.floor(Math.random() * 20 + 5)
      return acc
    }, {} as Record<string, number>)
  }

  // Determine risk level based on threshold type and change magnitude
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  const riskFactors: string[] = []
  const warnings: string[] = []

  if (thresholdName.toLowerCase().includes('hba1c') || thresholdName.toLowerCase().includes('bp')) {
    riskLevel = 'medium'
    riskFactors.push('Clinical threshold change affecting care decisions')
  }

  const changePercent = Math.abs((newValue - currentValue) / currentValue * 100)
  if (changePercent > 20) {
    riskLevel = 'high'
    warnings.push('Significant threshold change may affect many patients')
  }

  return {
    changeType: 'threshold_update',
    changeName: `Threshold Update: ${thresholdName}`,
    changeDescription: `Changing ${thresholdName} from ${currentValue} to ${newValue}`,
    affectedPatients,
    cohortImpact: {
      cohortSizeChanges: [] // Threshold changes don't directly affect cohort sizes
    },
    workloadImpact: {
      immediateActions: Math.floor(affectedPatients.total * 0.1),
      weeklyActions: Math.floor(affectedPatients.total * 0.3),
      monthlyActions: Math.floor(affectedPatients.total * 0.5),
      estimatedHours: Math.floor(affectedPatients.total * 0.1)
    },
    dueDateChanges: {
      accelerated: 0,
      delayed: 0,
      newSteps: 0,
      removedSteps: 0
    },
    riskAssessment: {
      level: riskLevel,
      factors: riskFactors,
      warnings
    }
  }
}

export const calculateConfigurationChangeImpact = (
  changeName: string,
  changeDescription: string,
  scope: 'global' | 'pathway' | 'cohort' = 'global'
): ImpactPreviewData => {
  const patients = getMockPatients()
  
  const baseAffected = scope === 'global' ? patients.length : 
                       scope === 'pathway' ? Math.floor(patients.length * 0.4) :
                       Math.floor(patients.length * 0.2)

  const affectedPatients = {
    total: baseAffected,
    byRiskLevel: {
      'high': Math.floor(baseAffected * 0.3),
      'medium': Math.floor(baseAffected * 0.4),
      'low': Math.floor(baseAffected * 0.3)
    },
    byPathway: {
      'global': baseAffected
    }
  }

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (scope === 'global') riskLevel = 'medium'

  return {
    changeType: 'configuration_change',
    changeName,
    changeDescription,
    affectedPatients,
    cohortImpact: { cohortSizeChanges: [] },
    workloadImpact: {
      immediateActions: Math.floor(baseAffected * 0.05),
      weeklyActions: Math.floor(baseAffected * 0.2),
      monthlyActions: Math.floor(baseAffected * 0.4),
      estimatedHours: Math.floor(baseAffected * 0.08)
    },
    dueDateChanges: {
      accelerated: 0,
      delayed: 0,
      newSteps: 0,
      removedSteps: 0
    },
    riskAssessment: {
      level: riskLevel,
      factors: scope === 'global' ? ['Global configuration change'] : [],
      warnings: []
    }
  }
}