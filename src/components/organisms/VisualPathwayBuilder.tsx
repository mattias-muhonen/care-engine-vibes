import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  RotateCcw,
  Eye,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { PathwayTemplate, PathwayStep } from '../../types/pathway'
import { LocalOverride } from '../../utils/pathwayOverrides'
import { nhgDeviationAnalyzer, NHGDeviation } from '../../utils/nhgDeviationAnalysis'
import { validatePathwayTemplate, ValidationResult } from '../../utils/pathwayValidation'
import { useLocale } from '../../contexts/LocaleContext'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'
import ClinicalTooltip from '../atoms/ClinicalTooltip'

interface VisualPathwayBuilderProps {
  template: PathwayTemplate
  override?: LocalOverride | null
  onStepEdit: (stepIndex: number, field: keyof PathwayStep, value: any) => void
  onRevertStep: (stepIndex: number) => void
  onRevertAll: () => void
  readonly?: boolean
}

interface StepCardProps {
  step: PathwayStep
  stepIndex: number
  originalStep: PathwayStep
  hasOverride: boolean
  deviations: NHGDeviation[]
  validationErrors: any[]
  isRequired: boolean
  onEdit: (field: keyof PathwayStep, value: any) => void
  onRevert: () => void
  readonly: boolean
  locale: 'en' | 'nl'
}

function StepCard({
  step,
  stepIndex,
  originalStep,
  hasOverride,
  deviations,
  validationErrors,
  isRequired,
  onEdit,
  onRevert,
  readonly,
  locale
}: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getNotificationIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'sms': return <MessageSquare className="w-4 h-4" />
      case 'phone': return <Phone className="w-4 h-4" />
      case 'portal': return <Users className="w-4 h-4" />
      default: return null
    }
  }

  const getDeviationSeverity = () => {
    const stepDeviations = deviations.filter(d => 
      d.field === step.id || d.field.includes(step.id)
    )
    if (stepDeviations.some(d => d.riskLevel === 'critical')) return 'critical'
    if (stepDeviations.some(d => d.riskLevel === 'high')) return 'high'
    if (stepDeviations.some(d => d.riskLevel === 'medium')) return 'medium'
    if (stepDeviations.length > 0) return 'low'
    return null
  }

  const severity = getDeviationSeverity()
  const hasErrors = validationErrors.length > 0

  return (
    <div className={`relative bg-white rounded-lg border-2 p-4 transition-all ${
      hasOverride ? 'border-orange-400 shadow-md' : 'border-gray-200'
    } ${hasErrors ? 'border-red-400' : ''}`}>
      {/* Step Number and Timeline */}
      <div className="absolute -left-12 top-4 flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          step.enabled ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
        }`}>
          {stepIndex + 1}
        </div>
        {stepIndex < 10 && (
          <div className="w-0.5 h-24 bg-gray-300 mt-2" />
        )}
      </div>

      {/* NHG Default Badge */}
      {!hasOverride && (
        <Badge variant="success" size="sm" className="absolute -top-2 -right-2">
          <Shield className="w-3 h-3 mr-1" />
          NHG Default
        </Badge>
      )}

      {/* Deviation Indicator */}
      {hasOverride && severity && (
        <Badge 
          variant={severity === 'critical' || severity === 'high' ? 'critical' : 'warning'}
          size="sm"
          className="absolute -top-2 -right-2"
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          {severity === 'critical' ? 'Critical' : severity === 'high' ? 'High Risk' : 'Modified'}
        </Badge>
      )}

      <div className="space-y-3">
        {/* Step Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              {step.name[locale]}
              {isRequired && (
                <Badge variant="critical" size="sm">
                  <FormattedMessage id="pathway.required" />
                </Badge>
              )}
              {!step.enabled && (
                <Badge variant="default" size="sm">
                  <FormattedMessage id="pathway.disabled" />
                </Badge>
              )}
            </h4>
            
            {/* Timing Display */}
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {step.delay === 0 ? (
                    <FormattedMessage id="pathway.immediate" />
                  ) : (
                    <FormattedMessage 
                      id="pathway.afterDays" 
                      values={{ days: step.delay }}
                    />
                  )}
                </span>
                {hasOverride && originalStep.delay !== step.delay && (
                  <span className="text-orange-600 font-medium">
                    (was {originalStep.delay} days)
                  </span>
                )}
              </div>

              {/* Notification Channels */}
              <div className="flex items-center gap-2">
                {['email', 'sms', 'phone', 'portal'].map(channel => (
                  <div
                    key={channel}
                    className={`p-1 rounded ${
                      (step as any).notificationChannels?.includes(channel)
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {getNotificationIcon(channel)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {/* Validation Errors */}
        {hasErrors && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            {validationErrors.map((error, idx) => (
              <div key={idx} className="text-sm text-red-700 flex items-start gap-1">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error.message[locale]}</span>
              </div>
            ))}
          </div>
        )}

        {/* Deviations Display */}
        {hasOverride && deviations.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded p-2">
            {deviations.map((deviation, idx) => (
              <div key={idx} className="text-sm text-orange-800 flex items-start gap-1">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  {deviation.field}: {deviation.localValue} 
                  <span className="text-orange-600"> (NHG: {deviation.nhgValue})</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            {/* Trigger and Action */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-700">
                  <FormattedMessage id="pathway.trigger" />
                </label>
                <p className="text-gray-600 mt-1">{step.trigger[locale]}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">
                  <FormattedMessage id="pathway.action" />
                </label>
                <p className="text-gray-600 mt-1">{step.action[locale]}</p>
              </div>
            </div>

            {/* Editable Fields */}
            {!readonly && (
              <div className="grid grid-cols-3 gap-4">
                {/* Delay */}
                <div>
                  <ClinicalTooltip field={`${step.id}_delay`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FormattedMessage id="pathway.delay" />
                    </label>
                  </ClinicalTooltip>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={step.delay}
                    onChange={(e) => onEdit('delay', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      step.delay !== originalStep.delay
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Enabled */}
                <div>
                  <ClinicalTooltip field={`${step.id}_enabled`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FormattedMessage id="pathway.enabled" />
                    </label>
                  </ClinicalTooltip>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      checked={step.enabled}
                      onChange={(e) => onEdit('enabled', e.target.checked)}
                      disabled={isRequired}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {step.enabled ? (
                        <FormattedMessage id="pathway.stepEnabled" />
                      ) : (
                        <FormattedMessage id="pathway.stepDisabled" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Automated */}
                <div>
                  <ClinicalTooltip field={`${step.id}_automated`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FormattedMessage id="pathway.automated" />
                    </label>
                  </ClinicalTooltip>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      checked={step.automated}
                      onChange={(e) => onEdit('automated', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {step.automated ? (
                        <FormattedMessage id="pathway.automatic" />
                      ) : (
                        <FormattedMessage id="pathway.manual" />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Revert Button */}
            {hasOverride && !readonly && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={onRevert}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <FormattedMessage id="pathway.revertToNHG" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function VisualPathwayBuilder({
  template,
  override,
  onStepEdit,
  onRevertStep,
  onRevertAll,
  readonly = false
}: VisualPathwayBuilderProps) {
  const { locale } = useLocale()
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [deviations, setDeviations] = useState<NHGDeviation[]>([])
  const [showTimeline, setShowTimeline] = useState(true)

  useEffect(() => {
    if (override) {
      const validationResult = validatePathwayTemplate(template, override)
      setValidation(validationResult)
      
      const nhgDeviations = nhgDeviationAnalyzer.analyzeDeviations(template, override)
      setDeviations(nhgDeviations)
    }
  }, [template, override])

  const getEffectiveStep = (stepIndex: number): PathwayStep => {
    const originalStep = template.steps[stepIndex]
    const overrideStep = override?.overrides.steps[stepIndex]
    
    return {
      ...originalStep,
      ...overrideStep
    }
  }

  const hasAnyOverrides = override?.overrides.steps.some(step => 
    Object.keys(step).length > 0
  ) || false

  const criticalDeviations = deviations.filter(d => d.riskLevel === 'critical')
  const highDeviations = deviations.filter(d => d.riskLevel === 'high')

  return (
    <div className="space-y-6">
      {/* Header with NHG Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {template.name[locale]}
              </h3>
              <p className="text-sm text-gray-600">
                <FormattedMessage 
                  id="pathway.nhgVersion" 
                  values={{ version: template.version }}
                />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!hasAnyOverrides ? (
              <Badge variant="success">
                <CheckCircle className="w-4 h-4 mr-1" />
                <FormattedMessage id="pathway.fullyCompliant" />
              </Badge>
            ) : (
              <>
                {criticalDeviations.length > 0 && (
                  <Badge variant="critical">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {criticalDeviations.length} Critical
                  </Badge>
                )}
                {highDeviations.length > 0 && (
                  <Badge variant="warning">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {highDeviations.length} High Risk
                  </Badge>
                )}
                {hasAnyOverrides && (
                  <Button variant="outline" size="sm" onClick={onRevertAll}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    <FormattedMessage id="pathway.revertAllToNHG" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Toggle */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">
          <FormattedMessage id="pathway.steps" />
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTimeline(!showTimeline)}
        >
          <Eye className="w-4 h-4 mr-2" />
          {showTimeline ? (
            <FormattedMessage id="pathway.hideTimeline" />
          ) : (
            <FormattedMessage id="pathway.showTimeline" />
          )}
        </Button>
      </div>

      {/* Visual Step Timeline */}
      <div className="relative pl-12">
        {template.steps.map((originalStep, index) => {
          const effectiveStep = getEffectiveStep(index)
          const stepOverride = override?.overrides.steps[index]
          const hasOverride = stepOverride && Object.keys(stepOverride).length > 0
          
          const stepDeviations = deviations.filter(d => 
            d.field === originalStep.id || 
            d.field.includes(originalStep.id)
          )
          
          const stepErrors = validation?.errors.filter(e => 
            e.stepId === originalStep.id
          ) || []

          const isRequired = validation?.missingRequiredSteps.includes(originalStep.id) || false

          return (
            <div key={originalStep.id} className="mb-6">
              {showTimeline && index > 0 && (
                <div className="flex items-center gap-2 ml-4 mb-2 text-sm text-gray-500">
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    {effectiveStep.delay - template.steps[index - 1].delay} days
                  </span>
                </div>
              )}
              
              <StepCard
                step={effectiveStep}
                stepIndex={index}
                originalStep={originalStep}
                hasOverride={hasOverride || false}
                deviations={stepDeviations}
                validationErrors={stepErrors}
                isRequired={isRequired}
                onEdit={(field, value) => onStepEdit(index, field, value)}
                onRevert={() => onRevertStep(index)}
                readonly={readonly}
                locale={locale}
              />
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {validation && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            <FormattedMessage id="pathway.validationSummary" />
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                validation.canPublish ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-gray-700">
                {validation.canPublish ? (
                  <FormattedMessage id="pathway.readyToPublish" />
                ) : (
                  <FormattedMessage id="pathway.cannotPublish" />
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-700">
                <FormattedMessage 
                  id="pathway.errorsCount" 
                  values={{ count: validation.errors.length }}
                />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-700">
                <FormattedMessage 
                  id="pathway.warningsCount" 
                  values={{ count: validation.warnings.length }}
                />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisualPathwayBuilder