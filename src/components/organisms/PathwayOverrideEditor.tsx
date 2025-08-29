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
  LocalOverrideStorage
} from '../../utils/pathwayOverrides'
import { useUser, getUserRolePermissions } from '../../contexts/UserContext'
import { useLocale } from '../../contexts/LocaleContext'
import { logUserAction } from '../../utils/storage'
import { calculatePathwayOverrideImpact } from '../../utils/impactAnalysis'
import { logPathwayOverrideChange } from '../../utils/changeHistory'
import { validatePathwayTemplate, ValidationResult } from '../../utils/pathwayValidation'
import { workflowStateManager, WorkflowMetadata, WorkflowCapabilities } from '../../utils/workflowStates'
import { notificationManager } from '../../utils/notificationSystem'
import { nhgDeviationAnalyzer, NHGDeviation } from '../../utils/nhgDeviationAnalysis'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'
import Toast from '../atoms/Toast'
import ImpactPreviewModal from './ImpactPreviewModal'
import VisualPathwayBuilder from './VisualPathwayBuilder'

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
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [workflow, setWorkflow] = useState<WorkflowMetadata | null>(null)
  const [capabilities, setCapabilities] = useState<WorkflowCapabilities | null>(null)
  const [deviations, setDeviations] = useState<NHGDeviation[]>([])
  const [workflowAction, setWorkflowAction] = useState<'draft' | 'review' | 'publish' | null>(null)

  const riskLevel = calculateRiskLevel(originalTemplate, override.overrides)
  const needsApproval = requiresDualApproval(riskLevel)

  useEffect(() => {
    setOverride(prev => ({
      ...prev,
      riskLevel,
      pendingApproval: needsApproval && !prev.approvedBy?.length
    }))
  }, [riskLevel, needsApproval])

  useEffect(() => {
    // Update validation
    const validationResult = validatePathwayTemplate(originalTemplate, override)
    setValidation(validationResult)

    // Update deviations
    const nhgDeviations = nhgDeviationAnalyzer.analyzeDeviations(originalTemplate, override)
    setDeviations(nhgDeviations)

    // Initialize or update workflow
    let workflowMetadata = workflowStateManager.getWorkflowMetadata(override.id)
    if (!workflowMetadata) {
      workflowMetadata = workflowStateManager.initializeWorkflow(
        override.id,
        user.id,
        user.name,
        'draft'
      )
    }
    setWorkflow(workflowMetadata)

    // Update capabilities
    const workflowCapabilities = workflowStateManager.getWorkflowCapabilities(
      workflowMetadata.currentState,
      user.role,
      user.id,
      workflowMetadata
    )
    setCapabilities(workflowCapabilities)
  }, [override, originalTemplate, user])

  // const canEdit = permissions.canConfigureThresholds
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

  const handleWorkflowAction = async (action: 'draft' | 'review' | 'publish') => {
    if (!validation?.canSaveDraft && action === 'draft') {
      setToast({ message: 'Cannot save draft due to validation errors', type: 'error' })
      return
    }
    
    if (!validation?.canRequestReview && action === 'review') {
      setToast({ message: 'Cannot request review due to validation errors', type: 'error' })
      return
    }

    if (!validation?.canPublish && action === 'publish') {
      setToast({ message: 'Cannot publish due to validation errors', type: 'error' })
      return
    }

    if (!justification.trim()) {
      setToast({
        message: intl.formatMessage({ id: 'pathwayOverride.justificationRequired' }),
        type: 'error'
      })
      return
    }

    setWorkflowAction(action)

    const finalOverride = {
      ...override,
      justification: justification.trim()
    }

    // For draft, save directly. For review/publish, show impact preview
    if (action === 'draft') {
      await handleConfirmSave(justification, 'draft')
    } else {
      // Calculate impact and show preview
      const impact = calculatePathwayOverrideImpact(originalTemplate, finalOverride)
      setImpactData(impact)
      setShowImpactPreview(true)
    }
  }

  // Legacy save function for backwards compatibility - unused but kept for reference
  // const handleSave = () => handleWorkflowAction('draft')

  const handleConfirmSave = async (impactJustification: string, workflowState?: 'draft' | 'review' | 'publish') => {
    const finalOverride = {
      ...override,
      justification: justification.trim()
    }

    const targetState = workflowState || workflowAction || 'draft'

    try {
      // Update workflow state
      if (workflow) {
        const updatedWorkflow = workflowStateManager.transitionState(
          override.id,
          targetState === 'publish' ? 'published' : targetState,
          user.id,
          user.name,
          impactJustification
        )
        setWorkflow(updatedWorkflow)
      }

      // Save override
      LocalOverrideStorage.saveOverride(finalOverride)
      
      // Log the change with full impact data
      logPathwayOverrideChange(
        user.id,
        user.name,
        originalTemplate.name.en,
        impactJustification,
        impactData || {},
        originalTemplate,
        finalOverride
      )
      
      logUserAction('pathway_override_created', {
        templateId: originalTemplate.id,
        overrideId: finalOverride.id,
        riskLevel: finalOverride.riskLevel,
        workflowState: targetState
      })

      // Handle notifications based on workflow state
      if (targetState === 'review') {
        notificationManager.notifyReviewRequested(
          finalOverride,
          originalTemplate,
          user.name
        )
      } else if (targetState === 'publish') {
        notificationManager.notifyPathwayPublished(
          finalOverride,
          originalTemplate,
          workflow!
        )

        // Send NHG deviation notification if there are deviations
        if (deviations.length > 0) {
          notificationManager.notifyNHGDeviations(
            finalOverride,
            originalTemplate,
            deviations.map(d => ({
              field: d.field,
              nhgValue: d.nhgValue,
              localValue: d.localValue,
              riskLevel: d.riskLevel
            }))
          )
        }
      }

      onSave(finalOverride)
      
      const messages = {
        draft: 'pathwayOverride.savedDraft',
        review: 'pathwayOverride.reviewRequested', 
        publish: 'pathwayOverride.published'
      }
      
      setToast({
        message: intl.formatMessage({ id: messages[targetState] || 'pathwayOverride.saved' }),
        type: 'success'
      })
      
      setShowImpactPreview(false)
      setWorkflowAction(null)
      
    } catch (error) {
      console.error('Error saving override:', error)
      setToast({
        message: 'Error saving override: ' + (error as Error).message,
        type: 'error'
      })
    }
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

  const renderWorkflowStatusSection = () => {
    if (!workflow) return null

    const workflowColors = {
      draft: 'bg-gray-100 border-gray-300 text-gray-800',
      review: 'bg-yellow-100 border-yellow-300 text-yellow-800', 
      published: 'bg-green-100 border-green-300 text-green-800',
      archived: 'bg-red-100 border-red-300 text-red-800'
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h4 className="font-medium text-gray-900">
              <FormattedMessage id="pathwayOverride.workflowStatus" />
            </h4>
            <Badge className={workflowColors[workflow.currentState]}>
              <FormattedMessage id={`pathwayOverride.workflow.${workflow.currentState}`} />
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            v{workflow.version} • {workflow.modifiedBy}
          </div>
        </div>
        
        {workflow.publishedAt && (
          <div className="mt-2 text-sm text-gray-600">
            <FormattedMessage 
              id="pathwayOverride.publishedAt" 
              values={{ 
                date: new Date(workflow.publishedAt).toLocaleDateString(locale),
                publisher: workflow.publishedBy
              }}
            />
          </div>
        )}
      </div>
    )
  }

  const renderValidationSection = () => {
    if (!validation) return null

    const hasErrors = validation.errors.length > 0
    const hasWarnings = validation.warnings.length > 0

    if (!hasErrors && !hasWarnings) return null

    return (
      <div className={`border rounded-lg p-4 mb-6 ${
        hasErrors ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${
            hasErrors ? 'text-red-600' : 'text-yellow-600'
          }`} />
          <div className="flex-1">
            <h4 className={`font-medium mb-2 ${
              hasErrors ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {hasErrors ? (
                <FormattedMessage id="pathwayOverride.validationErrors" />
              ) : (
                <FormattedMessage id="pathwayOverride.validationWarnings" />
              )}
            </h4>
            
            {hasErrors && (
              <div className="space-y-2 mb-3">
                {validation.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-800">
                    • {error.message[locale]}
                    {error.nhgReference && (
                      <span className="ml-2 text-xs text-red-600">({error.nhgReference})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {hasWarnings && (
              <div className="space-y-2">
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-800">
                    • {warning.message[locale]}
                    {warning.nhgReference && (
                      <span className="ml-2 text-xs text-yellow-600">({warning.nhgReference})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderNHGDeviationsSection = () => {
    if (!deviations.length) return null

    const criticalDeviations = deviations.filter(d => d.riskLevel === 'critical')
    const highDeviations = deviations.filter(d => d.riskLevel === 'high')

    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-orange-900 mb-2">
              <FormattedMessage 
                id="pathwayOverride.nhgDeviations" 
                values={{ count: deviations.length }}
              />
            </h4>
            
            {criticalDeviations.length > 0 && (
              <div className="mb-3">
                <Badge className="bg-red-100 text-red-800 mb-2">
                  <FormattedMessage 
                    id="pathwayOverride.criticalDeviations" 
                    values={{ count: criticalDeviations.length }}
                  />
                </Badge>
                <div className="space-y-1">
                  {criticalDeviations.map((deviation, index) => (
                    <div key={index} className="text-sm text-red-800">
                      • <strong>{deviation.field}:</strong> {deviation.localValue} 
                      <span className="text-red-600"> (NHG: {deviation.nhgValue})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {highDeviations.length > 0 && criticalDeviations.length === 0 && (
              <div className="space-y-1">
                {deviations.slice(0, 3).map((deviation, index) => (
                  <div key={index} className="text-sm text-orange-800">
                    • <strong>{deviation.field}:</strong> {deviation.localValue} 
                    <span className="text-orange-600"> (NHG: {deviation.nhgValue})</span>
                  </div>
                ))}
                {deviations.length > 3 && (
                  <div className="text-sm text-orange-600">
                    <FormattedMessage 
                      id="pathwayOverride.moreDeviations" 
                      values={{ count: deviations.length - 3 }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
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

  // Legacy step editor - replaced by VisualPathwayBuilder
  /*
  const renderStepEditor = () => (
    // ... implementation commented out as it's replaced by VisualPathwayBuilder
  )
  */

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

      {renderWorkflowStatusSection()}
      {renderValidationSection()}
      {renderNHGDeviationsSection()}
      {renderApprovalSection()}
      {renderDiffView()}
      
      {/* Visual Pathway Builder */}
      <VisualPathwayBuilder
        template={originalTemplate}
        override={override}
        onStepEdit={updateStepOverride}
        onRevertStep={revertStep}
        onRevertAll={revertAllToDefault}
        readonly={!capabilities?.canEdit}
      />
      
      {renderJustificationSection()}

      {/* Workflow Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={revertAllToDefault}>
          <RotateCcw className="w-4 h-4 mr-2" />
          <FormattedMessage id="pathwayOverride.revertAll" />
        </Button>
        
        <div className="flex items-center space-x-3">
          {/* Save Draft */}
          {capabilities?.canSaveDraft && (
            <Button 
              variant="outline"
              onClick={() => handleWorkflowAction('draft')}
              disabled={!hasChanges() || !justification.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              <FormattedMessage id="pathwayOverride.saveDraft" />
            </Button>
          )}
          
          {/* Request Review */}
          {capabilities?.canRequestReview && (
            <Button 
              onClick={() => handleWorkflowAction('review')}
              disabled={!hasChanges() || !justification.trim() || !validation?.canRequestReview}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Users className="w-4 h-4 mr-2" />
              <FormattedMessage id="pathwayOverride.requestReview" />
            </Button>
          )}
          
          {/* Publish */}
          {capabilities?.canPublish && (
            <Button 
              onClick={() => handleWorkflowAction('publish')}
              disabled={!hasChanges() || !justification.trim() || !validation?.canPublish}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              <FormattedMessage id="pathwayOverride.publish" />
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