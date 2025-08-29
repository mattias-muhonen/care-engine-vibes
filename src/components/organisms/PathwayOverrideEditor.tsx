import { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  ArrowLeft,
  Save,
  RotateCcw,
  AlertTriangle,
  Shield,
  Users,
  EyeOff,
  CheckCircle,
  Diff
} from 'lucide-react'
import { PathwayTemplate, PathwayStep } from '../../types/pathway'
import { 
  LocalOverride, 
  createLocalOverride,
  calculateRiskLevel,
  requiresDualApproval,
  isCriticalStep,
  LocalOverrideStorage
} from '../../utils/pathwayOverrides'
import { useUser, getUserRolePermissions } from '../../contexts/UserContext'
import { useLocale } from '../../contexts/LocaleContext'
import { logUserAction } from '../../utils/storage'
import { calculatePathwayOverrideImpact } from '../../utils/impactAnalysis'
import { logPathwayOverrideChange } from '../../utils/changeHistory'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'
import Toast from '../atoms/Toast'
import ImpactPreviewModal from './ImpactPreviewModal'

interface PathwayOverrideEditorProps {
  originalTemplate: PathwayTemplate
  existingOverride?: LocalOverride | null
  onClose: () => void
  onSave: (override: LocalOverride) => void
}

function PathwayOverrideEditor({
  originalTemplate,
  existingOverride,
  onClose,
  onSave
}: PathwayOverrideEditorProps) {
  const intl = useIntl()
  const { locale } = useLocale()
  const { user } = useUser()
  const permissions = getUserRolePermissions(user.role)

  const [override, setOverride] = useState<LocalOverride>(() => 
    existingOverride || createLocalOverride(originalTemplate, user.name, '')
  )
  const [justification, setJustification] = useState(existingOverride?.justification || '')
  const [showDiff, setShowDiff] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showImpactPreview, setShowImpactPreview] = useState(false)
  const [impactData, setImpactData] = useState<any>(null)

  const riskLevel = calculateRiskLevel(originalTemplate, override.overrides)
  const needsApproval = requiresDualApproval(riskLevel)

  useEffect(() => {
    setOverride(prev => ({
      ...prev,
      riskLevel,
      pendingApproval: needsApproval && !prev.approvedBy?.length
    }))
  }, [riskLevel, needsApproval])

  const canEdit = permissions.canConfigureThresholds
  const canApprove = permissions.canApproveMassActions // GPs can approve high-risk changes

  const updateStepOverride = (stepIndex: number, field: keyof PathwayStep, value: any) => {
    setOverride(prev => {
      const newSteps = [...prev.overrides.steps]
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        [field]: value
      }
      
      return {
        ...prev,
        overrides: {
          ...prev.overrides,
          steps: newSteps
        },
        lastModified: new Date().toISOString()
      }
    })
  }


  const revertStep = (stepIndex: number) => {
    setOverride(prev => {
      const newSteps = [...prev.overrides.steps]
      newSteps[stepIndex] = {}
      
      return {
        ...prev,
        overrides: {
          ...prev.overrides,
          steps: newSteps
        },
        lastModified: new Date().toISOString()
      }
    })
  }

  const revertAllToDefault = () => {
    setOverride(prev => ({
      ...prev,
      overrides: {
        steps: originalTemplate.steps.map(() => ({}))
      },
      lastModified: new Date().toISOString()
    }))
    setJustification('')
  }

  const handleSave = async () => {
    if (!justification.trim()) {
      setToast({
        message: intl.formatMessage({ id: 'pathwayOverride.justificationRequired' }),
        type: 'error'
      })
      return
    }

    const finalOverride = {
      ...override,
      justification: justification.trim()
    }

    // Calculate impact and show preview
    const impact = calculatePathwayOverrideImpact(originalTemplate, finalOverride)
    setImpactData(impact)
    setShowImpactPreview(true)
  }

  const handleConfirmSave = async (impactJustification: string) => {
    const finalOverride = {
      ...override,
      justification: justification.trim()
    }

    if (needsApproval && !finalOverride.approvedBy?.length) {
      setToast({
        message: intl.formatMessage({ id: 'pathwayOverride.approvalRequested' }),
        type: 'info'
      })
    }

    LocalOverrideStorage.saveOverride(finalOverride)
    
    // Log the change with full impact data
    logPathwayOverrideChange(
      user.id,
      user.name,
      originalTemplate.name.en,
      impactJustification,
      impactData,
      originalTemplate,
      finalOverride
    )
    
    logUserAction('pathway_override_created', {
      templateId: originalTemplate.id,
      overrideId: finalOverride.id,
      riskLevel: finalOverride.riskLevel,
      needsApproval
    })

    onSave(finalOverride)
    setToast({
      message: intl.formatMessage({ id: 'pathwayOverride.saved' }),
      type: 'success'
    })
    setShowImpactPreview(false)
  }

  const handleApproval = () => {
    if (!canApprove) return

    const approvedOverride = {
      ...override,
      approvedBy: [...(override.approvedBy || []), user.name],
      pendingApproval: false
    }

    setOverride(approvedOverride)
    LocalOverrideStorage.saveOverride(approvedOverride)

    logUserAction('pathway_override_approved', {
      overrideId: override.id,
      approvedBy: user.name
    })

    setToast({
      message: intl.formatMessage({ id: 'pathwayOverride.approved' }),
      type: 'success'
    })
  }

  const getEffectiveStep = (stepIndex: number): PathwayStep => {
    const originalStep = originalTemplate.steps[stepIndex]
    const overrideStep = override.overrides.steps[stepIndex]
    
    return {
      ...originalStep,
      ...overrideStep
    }
  }


  const hasChanges = () => {
    return override.overrides.steps.some(step => Object.keys(step).length > 0) ||
           (override.overrides.thresholds && Object.keys(override.overrides.thresholds).length > 0)
  }

  const renderRiskBadge = () => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      high: 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={colors[riskLevel]}>
        {riskLevel === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
        {riskLevel === 'medium' && <Shield className="w-3 h-3 mr-1" />}
        <FormattedMessage id={`pathwayOverride.risk.${riskLevel}`} />
      </Badge>
    )
  }

  const renderApprovalSection = () => {
    if (!needsApproval) return null

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-amber-900 mb-2">
              <FormattedMessage id="pathwayOverride.approvalRequired" />
            </h4>
            <p className="text-sm text-amber-800 mb-3">
              <FormattedMessage id="pathwayOverride.approvalReason" />
            </p>
            
            {override.pendingApproval ? (
              <div className="flex items-center space-x-2">
                <Badge variant="warning">
                  <FormattedMessage id="pathwayOverride.pendingApproval" />
                </Badge>
                {canApprove && (
                  <Button size="sm" onClick={handleApproval}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <FormattedMessage id="pathwayOverride.approve" />
                  </Button>
                )}
              </div>
            ) : override.approvedBy?.length ? (
              <div className="flex items-center space-x-2">
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <FormattedMessage id="pathwayOverride.approved" />
                </Badge>
                <span className="text-sm text-amber-800">
                  <FormattedMessage 
                    id="pathwayOverride.approvedBy" 
                    values={{ approver: override.approvedBy.join(', ') }}
                  />
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  const renderDiffView = () => {
    if (!showDiff) return null

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <FormattedMessage id="pathwayOverride.diffView" />
          </h3>
          <Button variant="outline" onClick={() => setShowDiff(false)}>
            <EyeOff className="w-4 h-4 mr-2" />
            <FormattedMessage id="pathwayOverride.hideDiff" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Template */}
          <div>
            <div className="flex items-center mb-3">
              <Badge variant="default" className="mr-2">NHG Default</Badge>
              <h4 className="font-medium text-gray-900">
                {originalTemplate.name[locale]}
              </h4>
            </div>
            <div className="space-y-3">
              {originalTemplate.steps.map((step) => (
                <div key={step.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm text-gray-900">
                    {step.name[locale]}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <FormattedMessage id="pathwayOverride.delay" />: {step.delay === 0 ? 
                      intl.formatMessage({ id: 'pathwayOverride.immediate' }) :
                      intl.formatMessage({ id: 'pathwayOverride.days' }, { count: step.delay })
                    }
                  </div>
                  <div className="text-xs text-gray-600">
                    {step.enabled ? '✓' : '✗'} {step.automated ? 
                      intl.formatMessage({ id: 'pathwayOverride.automated' }) :
                      intl.formatMessage({ id: 'pathwayOverride.manual' })
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Local Override */}
          <div>
            <div className="flex items-center mb-3">
              <Badge variant="warning" className="mr-2">
                <FormattedMessage id="pathwayOverride.localOverride" />
              </Badge>
              <h4 className="font-medium text-gray-900">
                {override.name[locale]}
              </h4>
            </div>
            <div className="space-y-3">
              {originalTemplate.steps.map((step, stepIndex) => {
                const effectiveStep = getEffectiveStep(stepIndex)
                const hasOverride = Object.keys(override.overrides.steps[stepIndex] || {}).length > 0
                
                return (
                  <div 
                    key={step.id} 
                    className={`p-3 rounded-lg ${hasOverride ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {effectiveStep.name[locale]}
                      {hasOverride && <span className="ml-2 text-yellow-600">*</span>}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      <FormattedMessage id="pathwayOverride.delay" />: {effectiveStep.delay === 0 ? 
                        intl.formatMessage({ id: 'pathwayOverride.immediate' }) :
                        intl.formatMessage({ id: 'pathwayOverride.days' }, { count: effectiveStep.delay })
                      }
                      {step.delay !== effectiveStep.delay && 
                        <span className="text-yellow-600"> (was {step.delay})</span>
                      }
                    </div>
                    <div className="text-xs text-gray-600">
                      {effectiveStep.enabled ? '✓' : '✗'} {effectiveStep.automated ? 
                        intl.formatMessage({ id: 'pathwayOverride.automated' }) :
                        intl.formatMessage({ id: 'pathwayOverride.manual' })
                      }
                      {(step.enabled !== effectiveStep.enabled || step.automated !== effectiveStep.automated) && 
                        <span className="text-yellow-600"> (changed)</span>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStepEditor = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        <FormattedMessage id="pathwayOverride.stepEditor" />
      </h3>

      <div className="space-y-6">
        {originalTemplate.steps.map((originalStep, index) => {
          const effectiveStep = getEffectiveStep(index)
          const hasOverrides = Object.keys(override.overrides.steps[index] || {}).length > 0
          const isCritical = isCriticalStep(originalStep.id)

          return (
            <div 
              key={originalStep.id} 
              className={`border rounded-lg p-4 ${hasOverrides ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {originalStep.name[locale]}
                    </h4>
                    {isCritical && (
                      <Badge variant="critical" className="text-xs mt-1">
                        <Shield className="w-3 h-3 mr-1" />
                        <FormattedMessage id="pathwayOverride.criticalStep" />
                      </Badge>
                    )}
                  </div>
                </div>
                
                {hasOverrides && (
                  <Button variant="outline" size="sm" onClick={() => revertStep(index)}>
                    <RotateCcw className="w-3 h-3 mr-1" />
                    <FormattedMessage id="pathwayOverride.revert" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Delay - Safe to edit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FormattedMessage id="pathwayOverride.delay" />
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={effectiveStep.delay}
                    onChange={(e) => updateStepOverride(index, 'delay', parseInt(e.target.value) || 0)}
                    disabled={!canEdit}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      originalStep.delay !== effectiveStep.delay 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : 'border-gray-300'
                    } ${!canEdit ? 'bg-gray-50 text-gray-500' : ''}`}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    <FormattedMessage id="pathwayOverride.originalValue" />: {originalStep.delay}
                  </div>
                </div>

                {/* Enabled - Medium risk */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FormattedMessage id="pathwayOverride.enabled" />
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={effectiveStep.enabled}
                      onChange={(e) => updateStepOverride(index, 'enabled', e.target.checked)}
                      disabled={!canEdit || (isCritical && !canApprove)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {effectiveStep.enabled ? 
                        <FormattedMessage id="pathwayOverride.stepEnabled" /> :
                        <FormattedMessage id="pathwayOverride.stepDisabled" />
                      }
                    </span>
                    {isCritical && !effectiveStep.enabled && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {originalStep.enabled !== effectiveStep.enabled && (
                    <div className="text-xs text-yellow-600 mt-1">
                      <FormattedMessage 
                        id="pathwayOverride.originalValue" 
                      />: {originalStep.enabled ? 
                        intl.formatMessage({ id: 'pathwayOverride.enabled' }) :
                        intl.formatMessage({ id: 'pathwayOverride.disabled' })
                      }
                    </div>
                  )}
                </div>

                {/* Automated - Safe to edit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FormattedMessage id="pathwayOverride.automated" />
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={effectiveStep.automated}
                      onChange={(e) => updateStepOverride(index, 'automated', e.target.checked)}
                      disabled={!canEdit}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {effectiveStep.automated ? 
                        <FormattedMessage id="pathwayOverride.automatic" /> :
                        <FormattedMessage id="pathwayOverride.manual" />
                      }
                    </span>
                  </div>
                  {originalStep.automated !== effectiveStep.automated && (
                    <div className="text-xs text-yellow-600 mt-1">
                      <FormattedMessage 
                        id="pathwayOverride.originalValue" 
                      />: {originalStep.automated ? 
                        intl.formatMessage({ id: 'pathwayOverride.automatic' }) :
                        intl.formatMessage({ id: 'pathwayOverride.manual' })
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Read-only fields */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <strong><FormattedMessage id="pathwayOverride.trigger" />:</strong> {originalStep.trigger[locale]}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <strong><FormattedMessage id="pathwayOverride.action" />:</strong> {originalStep.action[locale]}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <FormattedMessage id="pathwayOverride.readOnlyFields" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderJustificationSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        <FormattedMessage id="pathwayOverride.justification" />
      </h3>
      <textarea
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        placeholder={intl.formatMessage({ id: 'pathwayOverride.justificationPlaceholder' })}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        required
      />
      <p className="text-xs text-gray-500 mt-2">
        <FormattedMessage id="pathwayOverride.justificationRequired" />
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            <FormattedMessage id="pathwayOverride.back" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              <FormattedMessage id="pathwayOverride.editTitle" />
            </h1>
            <p className="text-sm text-gray-600">
              {originalTemplate.name[locale]} • v{originalTemplate.version}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {renderRiskBadge()}
          <Button 
            variant="outline" 
            onClick={() => setShowDiff(!showDiff)}
            disabled={!hasChanges()}
          >
            <Diff className="w-4 h-4 mr-2" />
            {showDiff ? 
              <FormattedMessage id="pathwayOverride.hideDiff" /> :
              <FormattedMessage id="pathwayOverride.showDiff" />
            }
          </Button>
        </div>
      </div>

      {renderApprovalSection()}
      {renderDiffView()}
      {renderStepEditor()}
      {renderJustificationSection()}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={revertAllToDefault}>
          <RotateCcw className="w-4 h-4 mr-2" />
          <FormattedMessage id="pathwayOverride.revertAll" />
        </Button>
        
        <div className="flex items-center space-x-3">
          {(!needsApproval || override.approvedBy?.length) && (
            <Button onClick={handleSave} disabled={!hasChanges() || !justification.trim()}>
              <Save className="w-4 h-4 mr-2" />
              <FormattedMessage id="pathwayOverride.save" />
            </Button>
          )}
          
          {needsApproval && !override.approvedBy?.length && (
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges() || !justification.trim()}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Users className="w-4 h-4 mr-2" />
              <FormattedMessage id="pathwayOverride.requestApproval" />
            </Button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Impact Preview Modal */}
      {showImpactPreview && impactData && (
        <ImpactPreviewModal
          isOpen={showImpactPreview}
          impactData={impactData}
          originalItem={originalTemplate}
          proposedChanges={override}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowImpactPreview(false)}
        />
      )}
    </div>
  )
}

export default PathwayOverrideEditor