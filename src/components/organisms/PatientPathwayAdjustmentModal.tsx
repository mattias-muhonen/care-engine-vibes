import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { X, Calendar, Clock, Ban, CheckCircle, AlertTriangle, User } from 'lucide-react'
import { useLocale } from '../../contexts/LocaleContext'
import { useUser } from '../../contexts/UserContext'
import { 
  PatientPathwayAssignment,
  adjustPatientPathwayStep,
  resumeSnoozeStep,
  completePatientPathwayStep,
  PatientPathwayStorage,
  PatientPathwayAuditStorage
} from '../../utils/patientPathways'
import { getPathwayStepStatus } from '../../utils/patientPathways'
import { isCriticalStep } from '../../utils/pathwayOverrides'
import { PatientPathwayAdjustmentReasons } from '../../types/patientPathway'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'

interface PatientPathwayAdjustmentModalProps {
  assignment: PatientPathwayAssignment
  onClose: () => void
  onUpdated: (assignment: PatientPathwayAssignment) => void
}

function PatientPathwayAdjustmentModal({ assignment, onClose, onUpdated }: PatientPathwayAdjustmentModalProps) {
  const { locale } = useLocale()
  const { user } = useUser()
  const [selectedStep, setSelectedStep] = useState<any>(null)
  const [adjustmentType, setAdjustmentType] = useState<'schedule' | 'snooze' | 'exclude' | 'complete' | null>(null)
  const [customDelay, setCustomDelay] = useState<string>('')
  const [snoozeUntil, setSnoozeUntil] = useState<string>('')
  const [excludeReason, setExcludeReason] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [requiresCountersign, setRequiresCountersign] = useState(false)
  const [countersignedBy, setCountersignedBy] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStepSelect = (step: any) => {
    setSelectedStep(step)
    setAdjustmentType(null)
    setCustomDelay('')
    setSnoozeUntil('')
    setExcludeReason('')
    setNotes('')
    setRequiresCountersign(false)
    setCountersignedBy('')
  }

  const handleAdjustmentTypeChange = (type: 'schedule' | 'snooze' | 'exclude' | 'complete') => {
    setAdjustmentType(type)
    
    // Check if this is a critical step exclusion
    if (type === 'exclude' && selectedStep && isCriticalStep(selectedStep.stepId)) {
      setRequiresCountersign(true)
    } else {
      setRequiresCountersign(false)
    }
  }

  const handleApplyAdjustment = async () => {
    if (!selectedStep || !adjustmentType) return

    setIsProcessing(true)
    try {
      let updatedAssignment = assignment

      if (adjustmentType === 'schedule' && customDelay) {
        updatedAssignment = adjustPatientPathwayStep(
          assignment,
          selectedStep.stepId,
          { customDelay: parseInt(customDelay), notes },
          `${user.name} (${user.role})`
        )
      } else if (adjustmentType === 'snooze' && snoozeUntil) {
        updatedAssignment = adjustPatientPathwayStep(
          assignment,
          selectedStep.stepId,
          { snoozeUntil, notes },
          `${user.name} (${user.role})`
        )
      } else if (adjustmentType === 'exclude' && excludeReason) {
        updatedAssignment = adjustPatientPathwayStep(
          assignment,
          selectedStep.stepId,
          { 
            excludedReason: excludeReason, 
            excludedBy: `${user.name} (${user.role})`,
            countersignedBy: requiresCountersign ? countersignedBy : undefined,
            notes 
          },
          `${user.name} (${user.role})`
        )
      } else if (adjustmentType === 'complete') {
        updatedAssignment = completePatientPathwayStep(
          assignment,
          selectedStep.stepId,
          `${user.name} (${user.role})`,
          notes
        )
      }

      PatientPathwayStorage.saveAssignment(updatedAssignment)

      // Add audit entry
      PatientPathwayAuditStorage.addAuditEntry({
        patientId: assignment.patientId,
        pathwayAssignmentId: assignment.id,
        userId: user.id,
        userName: user.name,
        adjustmentType: adjustmentType === 'schedule' ? 'schedule_change' : 
                      adjustmentType === 'snooze' ? 'snooze' :
                      adjustmentType === 'exclude' ? 'clinical_exclusion' :
                      'step_completion',
        stepId: selectedStep.stepId,
        stepName: selectedStep.originalStep.name.en,
        details: {
          before: selectedStep,
          after: updatedAssignment.steps.find(s => s.stepId === selectedStep.stepId),
          reason: excludeReason || notes || 'Step adjustment',
          countersignedBy: requiresCountersign ? countersignedBy : undefined,
          riskLevel: requiresCountersign ? 'high' : 'low'
        }
      })

      onUpdated(updatedAssignment)
      onClose()
    } catch (error) {
      console.error('Error applying adjustment:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResumeSnooze = async (step: any) => {
    setIsProcessing(true)
    try {
      const updatedAssignment = resumeSnoozeStep(
        assignment,
        step.stepId,
        `${user.name} (${user.role})`
      )

      PatientPathwayStorage.saveAssignment(updatedAssignment)

      PatientPathwayAuditStorage.addAuditEntry({
        patientId: assignment.patientId,
        pathwayAssignmentId: assignment.id,
        userId: user.id,
        userName: user.name,
        adjustmentType: 'pathway_resume',
        stepId: step.stepId,
        stepName: step.originalStep.name.en,
        details: {
          before: step,
          after: updatedAssignment.steps.find(s => s.stepId === step.stepId),
          reason: 'Step resumed from snooze'
        }
      })

      onUpdated(updatedAssignment)
    } catch (error) {
      console.error('Error resuming snooze:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStepStatusInfo = (step: any) => {
    return getPathwayStepStatus(step)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                <FormattedMessage id="patientPathway.adjustModal.title" />
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {assignment.template.name[locale]} • {assignment.patientId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Steps List */}
          <div className="w-1/2 border-r border-gray-200 p-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">
              <FormattedMessage id="patientPathway.adjustModal.pathwaySteps" />
            </h3>
            <div className="space-y-3">
              {assignment.steps.map((step, index) => {
                const statusInfo = getStepStatusInfo(step)
                const isSelected = selectedStep?.stepId === step.stepId
                
                return (
                  <div
                    key={step.stepId}
                    onClick={() => handleStepSelect(step)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {step.originalStep.name[locale]}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {step.originalStep.action[locale]}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.status}
                        </Badge>
                        {step.status === 'snoozed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleResumeSnooze(step)
                            }}
                            disabled={isProcessing}
                            className="text-xs text-primary-600 hover:text-primary-800 underline"
                          >
                            <FormattedMessage id="patientPathway.adjustModal.resumeSnooze" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {step.nextDueDate && (
                      <div className="text-xs text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Due: {step.nextDueDate}
                      </div>
                    )}
                    
                    {step.notes && (
                      <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                        {step.notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Adjustment Panel */}
          <div className="w-1/2 p-6">
            {selectedStep ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-2">
                    <FormattedMessage id="patientPathway.adjustModal.adjustStep" />
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedStep.originalStep.name[locale]}
                  </p>
                </div>

                {/* Adjustment Type Selection */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    <FormattedMessage id="patientPathway.adjustModal.adjustmentType" />
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAdjustmentTypeChange('schedule')}
                      className={`p-3 border rounded-lg text-sm flex items-center space-x-2 ${
                        adjustmentType === 'schedule' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={selectedStep.status === 'completed' || selectedStep.status === 'excluded'}
                    >
                      <Calendar className="w-4 h-4" />
                      <span><FormattedMessage id="patientPathway.adjustModal.reschedule" /></span>
                    </button>
                    <button
                      onClick={() => handleAdjustmentTypeChange('snooze')}
                      className={`p-3 border rounded-lg text-sm flex items-center space-x-2 ${
                        adjustmentType === 'snooze' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={selectedStep.status === 'completed' || selectedStep.status === 'excluded' || selectedStep.status === 'snoozed'}
                    >
                      <Clock className="w-4 h-4" />
                      <span><FormattedMessage id="patientPathway.adjustModal.snooze" /></span>
                    </button>
                    <button
                      onClick={() => handleAdjustmentTypeChange('exclude')}
                      className={`p-3 border rounded-lg text-sm flex items-center space-x-2 ${
                        adjustmentType === 'exclude' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={selectedStep.status === 'completed' || selectedStep.status === 'excluded'}
                    >
                      <Ban className="w-4 h-4" />
                      <span><FormattedMessage id="patientPathway.adjustModal.exclude" /></span>
                    </button>
                    <button
                      onClick={() => handleAdjustmentTypeChange('complete')}
                      className={`p-3 border rounded-lg text-sm flex items-center space-x-2 ${
                        adjustmentType === 'complete' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={selectedStep.status === 'completed' || selectedStep.status === 'excluded'}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span><FormattedMessage id="patientPathway.adjustModal.markComplete" /></span>
                    </button>
                  </div>
                </div>

                {/* Adjustment Details */}
                {adjustmentType === 'schedule' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FormattedMessage id="patientPathway.adjustModal.newInterval" />
                    </label>
                    <input
                      type="number"
                      value={customDelay}
                      onChange={(e) => setCustomDelay(e.target.value)}
                      placeholder="Days from start date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {adjustmentType === 'snooze' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FormattedMessage id="patientPathway.adjustModal.snoozeUntil" />
                    </label>
                    <input
                      type="date"
                      value={snoozeUntil}
                      onChange={(e) => setSnoozeUntil(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {adjustmentType === 'exclude' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FormattedMessage id="patientPathway.adjustModal.exclusionReason" />
                      </label>
                      <select
                        value={excludeReason}
                        onChange={(e) => setExcludeReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select reason...</option>
                        {Object.entries(PatientPathwayAdjustmentReasons).map(([key, value]) => (
                          <option key={key} value={value}>
                            {key.replace(/_/g, ' ').toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {requiresCountersign && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div className="space-y-3 flex-1">
                            <p className="text-sm text-yellow-800">
                              <FormattedMessage id="patientPathway.adjustModal.criticalStepWarning" />
                            </p>
                            <div>
                              <label className="block text-sm font-medium text-yellow-800 mb-2">
                                <FormattedMessage id="patientPathway.adjustModal.countersignedBy" />
                              </label>
                              <input
                                type="text"
                                value={countersignedBy}
                                onChange={(e) => setCountersignedBy(e.target.value)}
                                placeholder="Dr. John Smith"
                                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FormattedMessage id="patientPathway.adjustModal.notes" />
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    <FormattedMessage id="patientPathway.adjustModal.selectStepPrompt" />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {selectedStep && adjustmentType && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={onClose}>
                <FormattedMessage id="common.cancel" />
              </Button>
              <Button
                variant="primary"
                onClick={handleApplyAdjustment}
                disabled={
                  isProcessing || 
                  (adjustmentType === 'schedule' && !customDelay) ||
                  (adjustmentType === 'snooze' && !snoozeUntil) ||
                  (adjustmentType === 'exclude' && (!excludeReason || (requiresCountersign && !countersignedBy)))
                }
              >
                {isProcessing ? (
                  <FormattedMessage id="patientPathway.adjustModal.applying" />
                ) : (
                  <FormattedMessage id="patientPathway.adjustModal.applyAdjustment" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientPathwayAdjustmentModal