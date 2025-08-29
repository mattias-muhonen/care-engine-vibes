import { PathwayTemplate } from '../types/pathway'
import { LocalOverride } from './pathwayOverrides'

export interface ValidationError {
  field: string
  stepId?: string
  severity: 'error' | 'warning'
  message: { en: string; nl: string }
  nhgReference?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  canSaveDraft: boolean
  canRequestReview: boolean
  canPublish: boolean
  missingRequiredSteps: string[]
  missingNotificationChannels: string[]
}

// Required steps that cannot be removed from pathways
const REQUIRED_STEPS = {
  T2DM: [
    'annual_review',
    'hba1c_monitoring', 
    'complications_screening',
    'medication_review'
  ],
  Hypertension: [
    'annual_review',
    'bp_monitoring',
    'cardiovascular_assessment',
    'medication_review'
  ],
  Respiratory: [
    'annual_review',
    'lung_function_test',
    'inhaler_technique',
    'exacerbation_plan'
  ]
}

// Required notification channels for different step types
const REQUIRED_NOTIFICATION_CHANNELS = {
  'lab_results': ['sms', 'portal'], // Critical results need immediate notification
  'appointment_reminder': ['sms', 'email'],
  'medication_change': ['phone', 'portal'],
  'urgent_follow_up': ['phone', 'sms'],
  'routine_follow_up': ['email', 'portal']
}

export const validatePathwayTemplate = (
  template: PathwayTemplate, 
  override?: LocalOverride
): ValidationResult => {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const missingRequiredSteps: string[] = []
  const missingNotificationChannels: string[] = []

  // Use override steps if available, otherwise use template steps
  const effectiveSteps = override?.overrides.steps || template.steps
  
  // 1. Check for required steps
  const requiredSteps = REQUIRED_STEPS[template.condition as keyof typeof REQUIRED_STEPS] || []
  const enabledStepIds = effectiveSteps
    .map((step, index) => {
      const stepOverride = override?.overrides.steps[index]
      const isEnabled = stepOverride?.enabled !== undefined ? stepOverride.enabled : step.enabled
      return isEnabled ? step.id : null
    })
    .filter(Boolean)

  requiredSteps.forEach(requiredStepId => {
    if (!enabledStepIds.includes(requiredStepId)) {
      missingRequiredSteps.push(requiredStepId)
      errors.push({
        field: 'steps',
        stepId: requiredStepId,
        severity: 'error',
        message: {
          en: `Required step "${requiredStepId}" is missing or disabled. This step is mandatory per NHG guidelines.`,
          nl: `Vereiste stap "${requiredStepId}" ontbreekt of is uitgeschakeld. Deze stap is verplicht volgens NHG richtlijnen.`
        },
        nhgReference: `NHG-${template.condition}-${requiredStepId}`
      })
    }
  })

  // 2. Check for notification channels
  effectiveSteps.forEach((step, index) => {
    const stepOverride = override?.overrides.steps[index]
    const isEnabled = stepOverride?.enabled !== undefined ? stepOverride.enabled : step.enabled
    
    if (!isEnabled) return

    // Check if step has required notification channels
    const stepType = step.action?.en?.toLowerCase() || ''
    let requiredChannels: string[] = []

    // Determine required channels based on step type
    if (stepType.includes('lab') || stepType.includes('result')) {
      requiredChannels = REQUIRED_NOTIFICATION_CHANNELS['lab_results']
    } else if (stepType.includes('appointment')) {
      requiredChannels = REQUIRED_NOTIFICATION_CHANNELS['appointment_reminder']
    } else if (stepType.includes('medication')) {
      requiredChannels = REQUIRED_NOTIFICATION_CHANNELS['medication_change']
    } else if (stepType.includes('urgent') || step.id?.includes('urgent')) {
      requiredChannels = REQUIRED_NOTIFICATION_CHANNELS['urgent_follow_up']
    } else {
      requiredChannels = REQUIRED_NOTIFICATION_CHANNELS['routine_follow_up']
    }

    // Check if step has notification channels configured
    const stepNotificationChannels = (step as any).notificationChannels || []
    const missingChannels = requiredChannels.filter(channel => 
      !stepNotificationChannels.includes(channel)
    )

    if (missingChannels.length > 0) {
      missingNotificationChannels.push(...missingChannels)
      errors.push({
        field: 'notificationChannels',
        stepId: step.id,
        severity: 'error',
        message: {
          en: `Step "${step.name?.en || 'unknown'}" is missing required notification channels: ${missingChannels.join(', ')}`,
          nl: `Stap "${step.name?.nl || step.name?.en || 'onbekend'}" mist vereiste notificatiekanalen: ${missingChannels.join(', ')}`
        }
      })
    }
  })

  // 3. Check for pathway integrity
  const hasInitialStep = effectiveSteps.some((step, index) => {
    const stepOverride = override?.overrides.steps[index]
    const delay = stepOverride?.delay !== undefined ? stepOverride.delay : step.delay
    const isEnabled = stepOverride?.enabled !== undefined ? stepOverride.enabled : step.enabled
    return isEnabled && delay === 0
  })

  if (!hasInitialStep) {
    errors.push({
      field: 'steps',
      severity: 'error',
      message: {
        en: 'Pathway must have at least one initial step (delay = 0)',
        nl: 'Zorgpad moet minstens één initiële stap hebben (vertraging = 0)'
      }
    })
  }

  // 4. Check for dangerous interval changes
  effectiveSteps.forEach((step, index) => {
    const stepOverride = override?.overrides.steps[index]
    if (!stepOverride) return

    const originalDelay = step.delay
    const newDelay = stepOverride.delay

    if (newDelay !== undefined && originalDelay !== undefined) {
      // Check if delay is significantly increased for critical steps
      if (step.id && requiredSteps.includes(step.id) && newDelay > originalDelay * 2) {
        warnings.push({
          field: 'delay',
          stepId: step.id,
          severity: 'warning',
          message: {
            en: `Delay for critical step "${step.name?.en || 'unknown'}" increased significantly (${originalDelay} → ${newDelay} days). Consider clinical impact.`,
            nl: `Vertraging voor kritieke stap "${step.name?.nl || step.name?.en || 'onbekend'}" significant toegenomen (${originalDelay} → ${newDelay} dagen). Overweeg klinische impact.`
          },
          nhgReference: `NHG-timing-${step.id}`
        })
      }

      // Check if delay is too short for certain steps
      if (step.id?.includes('annual') && newDelay < 350) {
        errors.push({
          field: 'delay',
          stepId: step.id,
          severity: 'error',
          message: {
            en: `Annual review cannot be scheduled more frequently than yearly (minimum 350 days)`,
            nl: `Jaarlijkse controle kan niet vaker dan jaarlijks worden gepland (minimum 350 dagen)`
          },
          nhgReference: 'NHG-annual-frequency'
        })
      }
    }
  })

  // 5. Check thresholds
  if (template.thresholds) {
    Object.entries(template.thresholds).forEach(([key, value]) => {
      if (key.includes('hba1c') && typeof value === 'number') {
        if (value > 75) {
          warnings.push({
            field: 'thresholds',
            severity: 'warning',
            message: {
              en: `HbA1c threshold ${value} mmol/mol is above NHG recommended maximum (75 mmol/mol)`,
              nl: `HbA1c drempelwaarde ${value} mmol/mol ligt boven NHG aanbevolen maximum (75 mmol/mol)`
            },
            nhgReference: 'NHG-M01-HbA1c'
          })
        }
        if (value < 42) {
          errors.push({
            field: 'thresholds',
            severity: 'error',
            message: {
              en: `HbA1c threshold ${value} mmol/mol is dangerously low (minimum safe threshold: 42 mmol/mol)`,
              nl: `HbA1c drempelwaarde ${value} mmol/mol is gevaarlijk laag (minimum veilige drempel: 42 mmol/mol)`
            },
            nhgReference: 'NHG-M01-HbA1c-safety'
          })
        }
      }

      if (key.includes('bp_systolic') && typeof value === 'number') {
        if (value < 110) {
          errors.push({
            field: 'thresholds',
            severity: 'error',
            message: {
              en: `Systolic BP threshold ${value} mmHg is too low (minimum safe threshold: 110 mmHg)`,
              nl: `Systolische BD drempel ${value} mmHg is te laag (minimum veilige drempel: 110 mmHg)`
            },
            nhgReference: 'NHG-M84-BP-safety'
          })
        }
        if (value > 180) {
          warnings.push({
            field: 'thresholds',
            severity: 'warning',
            message: {
              en: `Systolic BP threshold ${value} mmHg is above NHG target range`,
              nl: `Systolische BD drempel ${value} mmHg ligt boven NHG streefgebied`
            },
            nhgReference: 'NHG-M84-BP-target'
          })
        }
      }
    })
  }

  // Determine what actions are allowed
  const hasErrors = errors.length > 0
  // const hasOnlyWarnings = warnings.length > 0 && errors.length === 0

  return {
    isValid: !hasErrors,
    errors,
    warnings,
    canSaveDraft: true, // Can always save draft
    canRequestReview: !hasErrors, // Can request review if no errors
    canPublish: !hasErrors && missingRequiredSteps.length === 0 && missingNotificationChannels.length === 0,
    missingRequiredSteps,
    missingNotificationChannels
  }
}

export const getValidationSummary = (result: ValidationResult, locale: 'en' | 'nl' = 'en') => {
  if (result.canPublish) {
    return {
      status: 'valid' as const,
      message: locale === 'en' 
        ? 'Pathway is valid and ready to publish'
        : 'Zorgpad is geldig en klaar om te publiceren'
    }
  }
  
  if (result.canRequestReview) {
    return {
      status: 'warning' as const,
      message: locale === 'en'
        ? `${result.warnings.length} warning(s) found. Review recommended before publishing.`
        : `${result.warnings.length} waarschuwing(en) gevonden. Beoordeling aanbevolen voor publicatie.`
    }
  }

  return {
    status: 'error' as const,
    message: locale === 'en'
      ? `${result.errors.length} error(s) must be fixed before publishing`
      : `${result.errors.length} fout(en) moeten worden opgelost voor publicatie`
  }
}