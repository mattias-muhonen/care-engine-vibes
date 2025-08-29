import { PathwayTemplate, PathwayStep } from '../types/pathway'
import { LocalOverride } from './pathwayOverrides'

export interface NHGDeviation {
  id: string
  field: string
  stepId?: string
  stepName?: string
  deviationType: 'threshold' | 'timing' | 'step_removal' | 'step_addition' | 'step_modification'
  nhgValue: any
  localValue: any
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  impact: {
    patientSafety: 'minimal' | 'moderate' | 'significant' | 'critical'
    clinicalOutcome: 'minimal' | 'moderate' | 'significant' | 'critical'
    compliance: 'minor' | 'moderate' | 'major' | 'severe'
  }
  nhgReference: string
  rationale: { en: string; nl: string }
  recommendation: { en: string; nl: string }
}

// NHG Standard values and acceptable ranges
const NHG_STANDARDS = {
  T2DM: {
    thresholds: {
      hba1c_target: { value: 53, range: [42, 75], unit: 'mmol/mol', critical: true },
      hba1c_high_risk: { value: 75, range: [70, 85], unit: 'mmol/mol', critical: true },
      bp_systolic_target: { value: 140, range: [130, 150], unit: 'mmHg', critical: false },
      bp_diastolic_target: { value: 85, range: [80, 90], unit: 'mmHg', critical: false }
    },
    intervals: {
      hba1c_monitoring: { value: 90, range: [60, 180], unit: 'days', critical: false },
      annual_review: { value: 365, range: [350, 380], unit: 'days', critical: true },
      bp_monitoring: { value: 90, range: [60, 120], unit: 'days', critical: false },
      complications_screening: { value: 365, range: [350, 380], unit: 'days', critical: true }
    },
    requiredSteps: ['annual_review', 'hba1c_monitoring', 'complications_screening', 'medication_review']
  },
  Hypertension: {
    thresholds: {
      bp_systolic_target: { value: 140, range: [130, 150], unit: 'mmHg', critical: true },
      bp_diastolic_target: { value: 90, range: [85, 95], unit: 'mmHg', critical: true },
      cardiovascular_risk: { value: 10, range: [7.5, 15], unit: '%', critical: false }
    },
    intervals: {
      bp_monitoring: { value: 90, range: [60, 120], unit: 'days', critical: false },
      annual_review: { value: 365, range: [350, 380], unit: 'days', critical: true },
      cardiovascular_assessment: { value: 365, range: [350, 380], unit: 'days', critical: true }
    },
    requiredSteps: ['annual_review', 'bp_monitoring', 'cardiovascular_assessment', 'medication_review']
  },
  Respiratory: {
    thresholds: {
      pef_variability: { value: 20, range: [15, 25], unit: '%', critical: false },
      exacerbation_threshold: { value: 2, range: [2, 3], unit: 'per year', critical: true }
    },
    intervals: {
      lung_function_test: { value: 365, range: [350, 380], unit: 'days', critical: true },
      annual_review: { value: 365, range: [350, 380], unit: 'days', critical: true },
      inhaler_technique: { value: 180, range: [120, 240], unit: 'days', critical: false }
    },
    requiredSteps: ['annual_review', 'lung_function_test', 'inhaler_technique', 'exacerbation_plan']
  }
}

export class NHGDeviationAnalyzer {
  // Analyze deviations between NHG standard and local override
  analyzeDeviations(
    template: PathwayTemplate,
    override: LocalOverride
  ): NHGDeviation[] {
    const deviations: NHGDeviation[] = []
    const condition = template.condition as keyof typeof NHG_STANDARDS
    const nhgStandard = NHG_STANDARDS[condition]

    if (!nhgStandard) {
      console.warn(`No NHG standards defined for condition: ${condition}`)
      return deviations
    }

    // 1. Analyze threshold deviations
    if (override.overrides.thresholds) {
      Object.entries(override.overrides.thresholds).forEach(([key, localValue]) => {
        const nhgThreshold = nhgStandard.thresholds[key as keyof typeof nhgStandard.thresholds]
        if (nhgThreshold && typeof nhgThreshold === 'object' && 'value' in nhgThreshold) {
          const thresholdWithValue = nhgThreshold as { value: number; range: number[]; unit: string; critical: boolean }
          if (localValue !== thresholdWithValue.value) {
            const deviation = this.createThresholdDeviation(
              key,
              thresholdWithValue,
              localValue,
              template.condition
            )
            if (deviation) deviations.push(deviation)
          }
        }
      })
    }

    // 2. Analyze timing deviations
    if (override.overrides.steps) {
      override.overrides.steps.forEach((stepOverride, index) => {
        const originalStep = template.steps[index]
        if (!originalStep || !stepOverride) return

        // Check delay changes
        if (stepOverride.delay !== undefined && stepOverride.delay !== originalStep.delay) {
          const nhgInterval = nhgStandard.intervals[originalStep.id as keyof typeof nhgStandard.intervals]
          if (nhgInterval) {
            const deviation = this.createTimingDeviation(
              originalStep,
              nhgInterval,
              stepOverride.delay,
              template.condition
            )
            if (deviation) deviations.push(deviation)
          }
        }

        // Check step removal
        if (stepOverride.enabled === false && originalStep.enabled) {
          if (nhgStandard.requiredSteps.includes(originalStep.id)) {
            const deviation = this.createStepRemovalDeviation(
              originalStep,
              template.condition
            )
            deviations.push(deviation)
          }
        }

        // Check step modification
        if (stepOverride.action && typeof stepOverride.action === 'string' && 
            originalStep.action && typeof originalStep.action === 'object' && 
            stepOverride.action !== originalStep.action.en) {
          const deviation = this.createStepModificationDeviation(
            originalStep,
            originalStep.action.en || '',
            stepOverride.action,
            template.condition
          )
          deviations.push(deviation)
        }
      })
    }

    return deviations.sort((a, b) => {
      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
    })
  }

  // Get deviation summary statistics
  getDeviationSummary(deviations: NHGDeviation[]) {
    const byRisk = deviations.reduce((acc, dev) => {
      acc[dev.riskLevel] = (acc[dev.riskLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byType = deviations.reduce((acc, dev) => {
      acc[dev.deviationType] = (acc[dev.deviationType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const criticalCount = deviations.filter(d => d.riskLevel === 'critical').length
    const highCount = deviations.filter(d => d.riskLevel === 'high').length

    return {
      total: deviations.length,
      byRisk,
      byType,
      criticalCount,
      highCount,
      requiresReview: criticalCount > 0 || highCount > 2,
      overallRisk: criticalCount > 0 ? 'critical' :
                   highCount > 0 ? 'high' :
                   deviations.length > 0 ? 'medium' : 'low'
    }
  }

  // Check if deviations are acceptable
  isAcceptableDeviation(deviation: NHGDeviation, justification?: string): boolean {
    // Critical deviations are never automatically acceptable
    if (deviation.riskLevel === 'critical') {
      return false
    }

    // High-risk deviations require strong justification
    if (deviation.riskLevel === 'high') {
      return Boolean(justification && justification.length > 100)
    }

    // Medium and low risk may be acceptable with basic justification
    return true
  }

  // Generate compliance report
  generateComplianceReport(
    template: PathwayTemplate,
    _override: LocalOverride,
    deviations: NHGDeviation[]
  ) {
    const summary = this.getDeviationSummary(deviations)
    
    return {
      templateName: template.name.en,
      condition: template.condition,
      analysisDate: new Date().toISOString(),
      nhgCompliance: {
        score: this.calculateComplianceScore(deviations),
        level: this.getComplianceLevel(deviations),
        deviationCount: deviations.length
      },
      deviations,
      summary,
      recommendations: this.generateRecommendations(deviations),
      actionRequired: summary.criticalCount > 0 || summary.highCount > 2
    }
  }

  // Private methods
  private createThresholdDeviation(
    field: string,
    nhgThreshold: any,
    localValue: any,
    condition: string
  ): NHGDeviation | null {
    const isOutOfRange = localValue < nhgThreshold.range[0] || localValue > nhgThreshold.range[1]
    const isCriticalField = nhgThreshold.critical
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (isOutOfRange && isCriticalField) {
      riskLevel = 'critical'
    } else if (isOutOfRange) {
      riskLevel = 'high'
    } else if (localValue !== nhgThreshold.value) {
      riskLevel = 'medium'
    }

    return {
      id: `threshold-${field}-${Date.now()}`,
      field,
      deviationType: 'threshold',
      nhgValue: `${nhgThreshold.value} ${nhgThreshold.unit}`,
      localValue: `${localValue} ${nhgThreshold.unit}`,
      riskLevel,
      impact: {
        patientSafety: isCriticalField && isOutOfRange ? 'critical' : 'moderate',
        clinicalOutcome: isCriticalField ? 'significant' : 'moderate',
        compliance: isOutOfRange ? 'major' : 'moderate'
      },
      nhgReference: `NHG-${condition}-${field}`,
      rationale: {
        en: `NHG guideline recommends ${nhgThreshold.value} ${nhgThreshold.unit} (acceptable range: ${nhgThreshold.range[0]}-${nhgThreshold.range[1]} ${nhgThreshold.unit})`,
        nl: `NHG richtlijn adviseert ${nhgThreshold.value} ${nhgThreshold.unit} (acceptabel bereik: ${nhgThreshold.range[0]}-${nhgThreshold.range[1]} ${nhgThreshold.unit})`
      },
      recommendation: {
        en: isOutOfRange ? 
          `Consider adjusting to within NHG recommended range (${nhgThreshold.range[0]}-${nhgThreshold.range[1]} ${nhgThreshold.unit})` :
          `Value differs from NHG standard but within acceptable range`,
        nl: isOutOfRange ?
          `Overweeg aanpassing naar NHG aanbevolen bereik (${nhgThreshold.range[0]}-${nhgThreshold.range[1]} ${nhgThreshold.unit})` :
          `Waarde wijkt af van NHG standaard maar binnen acceptabel bereik`
      }
    }
  }

  private createTimingDeviation(
    step: PathwayStep,
    nhgInterval: any,
    localDelay: number,
    condition: string
  ): NHGDeviation | null {
    const isOutOfRange = localDelay < nhgInterval.range[0] || localDelay > nhgInterval.range[1]
    const isCriticalTiming = nhgInterval.critical

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (isOutOfRange && isCriticalTiming) {
      riskLevel = 'critical'
    } else if (isOutOfRange) {
      riskLevel = 'high'
    } else if (localDelay !== nhgInterval.value) {
      riskLevel = 'medium'
    }

    return {
      id: `timing-${step.id}-${Date.now()}`,
      field: 'delay',
      stepId: step.id,
      stepName: step.name.en,
      deviationType: 'timing',
      nhgValue: `${nhgInterval.value} ${nhgInterval.unit}`,
      localValue: `${localDelay} ${nhgInterval.unit}`,
      riskLevel,
      impact: {
        patientSafety: isCriticalTiming && isOutOfRange ? 'critical' : 'moderate',
        clinicalOutcome: isCriticalTiming ? 'significant' : 'moderate',
        compliance: isOutOfRange ? 'major' : 'minor'
      },
      nhgReference: `NHG-${condition}-timing-${step.id}`,
      rationale: {
        en: `NHG guideline recommends ${nhgInterval.value} ${nhgInterval.unit} interval for ${step.name.en}`,
        nl: `NHG richtlijn adviseert ${nhgInterval.value} ${nhgInterval.unit} interval voor ${step.name.nl || step.name.en}`
      },
      recommendation: {
        en: isOutOfRange ?
          `Consider adjusting interval to ${nhgInterval.range[0]}-${nhgInterval.range[1]} ${nhgInterval.unit}` :
          `Timing differs from standard but within acceptable range`,
        nl: isOutOfRange ?
          `Overweeg interval aanpassing naar ${nhgInterval.range[0]}-${nhgInterval.range[1]} ${nhgInterval.unit}` :
          `Timing wijkt af van standaard maar binnen acceptabel bereik`
      }
    }
  }

  private createStepRemovalDeviation(
    step: PathwayStep,
    condition: string
  ): NHGDeviation {
    return {
      id: `removal-${step.id}-${Date.now()}`,
      field: 'enabled',
      stepId: step.id,
      stepName: step.name.en,
      deviationType: 'step_removal',
      nhgValue: 'Required',
      localValue: 'Disabled',
      riskLevel: 'critical',
      impact: {
        patientSafety: 'critical',
        clinicalOutcome: 'critical',
        compliance: 'severe'
      },
      nhgReference: `NHG-${condition}-required-${step.id}`,
      rationale: {
        en: `This step is mandatory according to NHG guidelines and cannot be removed without clinical justification`,
        nl: `Deze stap is verplicht volgens NHG richtlijnen en kan niet worden weggenomen zonder klinische onderbouwing`
      },
      recommendation: {
        en: `Re-enable this step or provide strong clinical justification for removal`,
        nl: `Schakel deze stap weer in of geef sterke klinische onderbouwing voor weglaten`
      }
    }
  }

  private createStepModificationDeviation(
    step: PathwayStep,
    nhgAction: string,
    localAction: string,
    condition: string
  ): NHGDeviation {
    return {
      id: `modification-${step.id}-${Date.now()}`,
      field: 'action',
      stepId: step.id,
      stepName: step.name.en,
      deviationType: 'step_modification',
      nhgValue: nhgAction,
      localValue: localAction,
      riskLevel: 'medium',
      impact: {
        patientSafety: 'moderate',
        clinicalOutcome: 'moderate',
        compliance: 'moderate'
      },
      nhgReference: `NHG-${condition}-action-${step.id}`,
      rationale: {
        en: `Step action has been modified from NHG standard`,
        nl: `Stap actie is gewijzigd ten opzichte van NHG standaard`
      },
      recommendation: {
        en: `Review modification against clinical evidence and local protocols`,
        nl: `Beoordeel wijziging tegen klinisch bewijs en lokale protocollen`
      }
    }
  }

  private calculateComplianceScore(deviations: NHGDeviation[]): number {
    if (deviations.length === 0) return 100

    const weights = { critical: 25, high: 15, medium: 5, low: 2 }
    const totalPenalty = deviations.reduce((sum, dev) => sum + weights[dev.riskLevel], 0)
    
    return Math.max(0, 100 - totalPenalty)
  }

  private getComplianceLevel(deviations: NHGDeviation[]): string {
    const score = this.calculateComplianceScore(deviations)
    
    if (score >= 90) return 'excellent'
    if (score >= 80) return 'good'
    if (score >= 70) return 'acceptable'
    if (score >= 60) return 'poor'
    return 'critical'
  }

  private generateRecommendations(deviations: NHGDeviation[]): Array<{ priority: string; action: string }> {
    const recommendations = []

    const criticalDeviations = deviations.filter(d => d.riskLevel === 'critical')
    if (criticalDeviations.length > 0) {
      recommendations.push({
        priority: 'urgent',
        action: `Address ${criticalDeviations.length} critical deviation(s) immediately`
      })
    }

    const highDeviations = deviations.filter(d => d.riskLevel === 'high')
    if (highDeviations.length > 2) {
      recommendations.push({
        priority: 'high',
        action: `Review ${highDeviations.length} high-risk deviations with clinical team`
      })
    }

    const thresholdDeviations = deviations.filter(d => d.deviationType === 'threshold')
    if (thresholdDeviations.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: `Validate clinical thresholds against latest NHG guidelines`
      })
    }

    return recommendations
  }
}

export const nhgDeviationAnalyzer = new NHGDeviationAnalyzer()