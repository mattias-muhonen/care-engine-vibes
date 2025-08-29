import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { X, Calendar, AlertTriangle, CheckCircle, User } from 'lucide-react'
import { useLocale } from '../../contexts/LocaleContext'
import { useUser } from '../../contexts/UserContext'
import { Patient } from '../../utils/patientFilters'
import { PathwayTemplate } from '../../types/pathway'
import { 
  PatientPathwayAssignment,
  createPatientPathwayAssignment,
  PatientPathwayStorage,
  PatientPathwayAuditStorage
} from '../../utils/patientPathways'
import pathwayTemplatesData from '../../mocks/pathwayTemplates.json'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'

interface PatientPathwayAssignmentModalProps {
  patient: Patient
  onClose: () => void
  onAssigned: (assignment: PatientPathwayAssignment) => void
}

function PatientPathwayAssignmentModal({ patient, onClose, onAssigned }: PatientPathwayAssignmentModalProps) {
  const { locale } = useLocale()
  const { user } = useUser()
  const [selectedTemplate, setSelectedTemplate] = useState<PathwayTemplate | null>(null)
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [justification, setJustification] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)

  const templates = pathwayTemplatesData as unknown as PathwayTemplate[]

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'T2DM': return '🩺'
      case 'Hypertension': return '❤️'
      case 'Respiratory': return '🫁'
      default: return '📋'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleAssignPathway = async () => {
    if (!selectedTemplate) return

    setIsAssigning(true)
    try {
      const assignment = createPatientPathwayAssignment(
        patient.id,
        selectedTemplate,
        `${user.name} (${user.role})`,
        startDate,
        justification
      )

      PatientPathwayStorage.saveAssignment(assignment)

      PatientPathwayAuditStorage.addAuditEntry({
        patientId: patient.id,
        pathwayAssignmentId: assignment.id,
        userId: user.id,
        userName: user.name,
        adjustmentType: 'pathway_assignment',
        details: {
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name.en,
          startDate,
          justification,
          reason: 'Pathway assigned to patient'
        }
      })

      onAssigned(assignment)
      onClose()
    } catch (error) {
      console.error('Error assigning pathway:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                <FormattedMessage id="patientPathway.assignModal.title" />
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                <FormattedMessage id="patientPathway.assignModal.subtitle" values={{ patientName: patient.name }} />
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

        {/* Content */}
        <div className="p-6">
          {!selectedTemplate ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  <FormattedMessage id="patientPathway.assignModal.selectTemplate" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getConditionIcon(template.condition)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {template.name[locale]}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {template.condition} • v{template.version}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default" className="text-xs">
                          NHG Default
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description[locale]}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{template.summary.totalSteps} steps</span>
                        <div className={`px-2 py-1 rounded-full ${getPriorityColor(template.summary.priority)}`}>
                          <FormattedMessage id={`pathwayLibrary.priority.${template.summary.priority}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Template Summary */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getConditionIcon(selectedTemplate.condition)}</span>
                    <div>
                      <h4 className="font-medium text-primary-900">
                        {selectedTemplate.name[locale]}
                      </h4>
                      <p className="text-sm text-primary-700">
                        {selectedTemplate.summary.totalSteps} steps • {selectedTemplate.summary.avgDuration} duration
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    <FormattedMessage id="patientPathway.assignModal.changeTemplate" />
                  </Button>
                </div>
              </div>

              {/* Assignment Configuration */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">
                  <FormattedMessage id="patientPathway.assignModal.configuration" />
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      <FormattedMessage id="patientPathway.assignModal.startDate" />
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      <FormattedMessage id="patientPathway.assignModal.assignedBy" />
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                      {user.name} ({user.role})
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FormattedMessage id="patientPathway.assignModal.justification" />
                  </label>
                  <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Enter clinical justification for pathway assignment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Pathway Steps Preview */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">
                  <FormattedMessage id="patientPathway.assignModal.stepsPreview" />
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTemplate.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{step.name[locale]}</p>
                        <p className="text-xs text-gray-500">
                          {step.delay === 0 ? 'Immediate' : `Day ${step.delay}`} • {step.action[locale]}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {step.enabled ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose}>
              <FormattedMessage id="common.cancel" />
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignPathway}
              disabled={!selectedTemplate || isAssigning}
            >
              {isAssigning ? (
                <FormattedMessage id="patientPathway.assignModal.assigning" />
              ) : (
                <FormattedMessage id="patientPathway.assignModal.assign" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientPathwayAssignmentModal