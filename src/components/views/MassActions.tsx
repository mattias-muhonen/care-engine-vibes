import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Users, ArrowRight, Send, Lock } from 'lucide-react'
import patientsData from '../../mocks/patients.json'
import cohortsData from '../../mocks/cohorts.json'
import { Patient, Cohort, getPatientsByIds } from '../../utils/patientFilters'
import { formatDate } from '../../utils/formatDate'
import { useLocale } from '../../contexts/LocaleContext'
import { useUser, getUserRolePermissions } from '../../contexts/UserContext'
import { logUserAction } from '../../utils/storage'
import Button from '../atoms/Button'
import TranslatableSelect from '../atoms/TranslatableSelect'
import Badge from '../atoms/Badge'
import Toast from '../atoms/Toast'

type ActionType = 'outreach' | 'appointment' | 'reminder'
type Step = 'selectCohort' | 'configureAction' | 'preview' | 'confirm'

interface AppointmentSlot {
  id: string
  date: string
  time: string
  available: boolean
}

function MassActions() {
  const intl = useIntl()
  const { locale } = useLocale()
  const { user } = useUser()
  const permissions = getUserRolePermissions(user.role)
  const [currentStep, setCurrentStep] = useState<Step>('selectCohort')
  const [selectedCohort, setSelectedCohort] = useState<string>('')
  const [actionType, setActionType] = useState<ActionType>('outreach')
  const [message, setMessage] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const patients = patientsData as Patient[]
  const cohorts = cohortsData as Cohort[]

  // Mock appointment slots
  const appointmentSlots: AppointmentSlot[] = [
    { id: '1', date: '2024-09-02', time: '09:00', available: true },
    { id: '2', date: '2024-09-02', time: '10:30', available: true },
    { id: '3', date: '2024-09-02', time: '14:00', available: true },
    { id: '4', date: '2024-09-03', time: '11:00', available: true },
    { id: '5', date: '2024-09-03', time: '15:30', available: true },
  ]

  const actionTypeOptions = [
    { value: 'outreach', labelId: 'massActions.actionType.outreach' },
    { value: 'appointment', labelId: 'massActions.actionType.appointment' },
    { value: 'reminder', labelId: 'massActions.actionType.reminder' }
  ]

  const getSelectedCohort = () => {
    return cohorts.find(c => c.cohortId === selectedCohort)
  }

  const getAffectedPatients = () => {
    const cohort = getSelectedCohort()
    return cohort ? getPatientsByIds(patients, cohort.patientIds) : []
  }

  const getDefaultMessage = () => {
    switch (actionType) {
      case 'outreach':
        return intl.formatMessage({ id: 'massActions.messageTemplate.diabetes' })
      case 'reminder':
        return intl.formatMessage({ id: 'massActions.messageTemplate.reminder' })
      case 'appointment':
        return intl.formatMessage({ id: 'massActions.messageTemplate.diabetes' })
      default:
        return ''
    }
  }

  const handleStepComplete = () => {
    switch (currentStep) {
      case 'selectCohort':
        if (selectedCohort) {
          setMessage(getDefaultMessage())
          setCurrentStep('configureAction')
        }
        break
      case 'configureAction':
        if (message && (actionType !== 'appointment' || selectedSlot)) {
          setCurrentStep('preview')
        }
        break
      case 'preview':
        setShowConfirmation(true)
        break
    }
  }

  const executeAction = () => {
    const cohort = getSelectedCohort()
    const affectedPatients = getAffectedPatients()
    
    if (!cohort || affectedPatients.length === 0) return

    // Log the mass action
    logUserAction('mass_action_executed', {
      cohortId: cohort.cohortId,
      cohortName: cohort.name[locale],
      actionType,
      affectedPatients: affectedPatients.length,
      message: message.substring(0, 100),
      appointmentSlot: selectedSlot || null,
      timestamp: new Date().toISOString()
    })

    // Log individual patient actions
    affectedPatients.forEach(patient => {
      logUserAction(`patient_${actionType}`, {
        patientId: patient.id,
        patientName: patient.name,
        cohortId: cohort.cohortId,
        message: message.replace('{patientName}', patient.name),
        appointmentSlot: selectedSlot || null,
        timestamp: new Date().toISOString()
      })
    })

    // Show success message
    setToast({
      type: 'success',
      message: intl.formatMessage(
        { id: 'massActions.success.message' },
        { count: affectedPatients.length }
      )
    })

    // Reset form
    setSelectedCohort('')
    setActionType('outreach')
    setMessage('')
    setSelectedSlot('')
    setCurrentStep('selectCohort')
    setShowConfirmation(false)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'selectCohort':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                <FormattedMessage id="massActions.steps.selectCohort" />
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FormattedMessage id="massActions.selectCohort" />
                </label>
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">
                    {intl.formatMessage({ id: 'massActions.selectCohortPlaceholder' })}
                  </option>
                  {cohorts.map(cohort => (
                    <option key={cohort.cohortId} value={cohort.cohortId}>
                      {cohort.name[locale]}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCohort && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {getSelectedCohort()?.name[locale]}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {getSelectedCohort()?.reason[locale]}
                  </p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <FormattedMessage 
                        id="massActions.preview.affectedPatients" 
                        values={{ count: getAffectedPatients().length }}
                      />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'configureAction':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                <FormattedMessage id="massActions.steps.configureAction" />
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TranslatableSelect
                  label={intl.formatMessage({ id: 'massActions.actionType' })}
                  options={actionTypeOptions}
                  value={actionType}
                  onChange={(e) => {
                    setActionType(e.target.value as ActionType)
                    setMessage(getDefaultMessage())
                  }}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FormattedMessage id="massActions.messageTemplate" />
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={intl.formatMessage({ id: 'massActions.messageTemplate.placeholder' })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <FormattedMessage id="massActions.template.personalization" values={{ patientName: '{patientName}' }} />
                  </p>
                </div>

                {actionType === 'appointment' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FormattedMessage id="massActions.appointmentSlots.selectSlot" />
                    </label>
                    <div className="space-y-2">
                      {appointmentSlots.map(slot => (
                        <label key={slot.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="appointmentSlot"
                            value={slot.id}
                            checked={selectedSlot === slot.id}
                            onChange={(e) => setSelectedSlot(e.target.value)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                {formatDate(slot.date)} - {slot.time}
                              </span>
                              <Badge variant="success">
                                <FormattedMessage id="massActions.appointmentSlots.available" />
                              </Badge>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  <FormattedMessage id="massActions.messagePreview" />
                </h3>
                <div className="bg-white border border-gray-200 rounded p-3">
                  <p className="text-sm text-gray-700">
                    {message.replace('{patientName}', intl.formatMessage({ id: 'massActions.preview.samplePatient' }))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'preview':
        const affectedPatients = getAffectedPatients()
        const cohort = getSelectedCohort()
        
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                <FormattedMessage id="massActions.steps.preview" />
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    <FormattedMessage id="massActions.summary.title" />
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-blue-700">
                        <FormattedMessage id="massActions.summary.cohort" />
                      </dt>
                      <dd className="text-blue-900 font-medium">
                        {cohort?.name[locale]}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-blue-700">
                        <FormattedMessage id="massActions.summary.actionType" />
                      </dt>
                      <dd className="text-blue-900 font-medium">
                        <FormattedMessage id={`massActions.actionType.${actionType}`} />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-blue-700">
                        <FormattedMessage id="massActions.summary.patientCount" />
                      </dt>
                      <dd className="text-blue-900 font-medium">{affectedPatients.length}</dd>
                    </div>
                    {selectedSlot && (
                      <div className="flex justify-between">
                        <dt className="text-blue-700">
                          <FormattedMessage id="massActions.summary.timeSlot" />
                        </dt>
                        <dd className="text-blue-900 font-medium">
                          {appointmentSlots.find(s => s.id === selectedSlot)?.date} - {appointmentSlots.find(s => s.id === selectedSlot)?.time}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    <FormattedMessage id="massActions.preview.affectedPatientsTitle" />
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {affectedPatients.map(patient => (
                      <div key={patient.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                        <span className="text-sm text-gray-900">{patient.name}</span>
                        <Badge variant={patient.riskLevel === 'critical' ? 'critical' : patient.riskLevel === 'high' ? 'warning' : 'default'}>
                          <FormattedMessage id={`riskLevel.${patient.riskLevel}`} defaultMessage={patient.riskLevel} />
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    <FormattedMessage id="massActions.preview.messagePreview" />
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {message.replace('{patientName}', intl.formatMessage({ id: 'massActions.preview.patientPlaceholder' }))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  // Check if user has permission to approve mass actions
  if (!permissions.canApproveMassActions) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          <FormattedMessage id="massActions.title" />
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            <FormattedMessage id="massActions.restricted.title" />
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            <FormattedMessage id="massActions.restricted.description" values={{ role: intl.formatMessage({ id: `userRole.${user.role}` }) }} />
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          <FormattedMessage id="massActions.title" />
        </h1>
        {user.role === 'gp' && (
          <p className="text-sm text-gray-600 mt-1">
            <FormattedMessage id="massActions.subtitle.gp" />
          </p>
        )}
        {user.role === 'poh-s' && (
          <p className="text-sm text-gray-600 mt-1">
            <FormattedMessage id="massActions.subtitle.pohS" />
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {renderStep()}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
          <div>
            {currentStep !== 'selectCohort' && (
              <Button
                variant="outline"
                onClick={() => {
                  const stepOrder: Step[] = ['selectCohort', 'configureAction', 'preview']
                  const currentIndex = stepOrder.indexOf(currentStep)
                  if (currentIndex > 0) {
                    setCurrentStep(stepOrder[currentIndex - 1])
                  }
                }}
              >
                Vorige stap
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep !== 'preview' ? (
              <Button
                onClick={handleStepComplete}
                disabled={
                  (currentStep === 'selectCohort' && !selectedCohort) ||
                  (currentStep === 'configureAction' && (!message || (actionType === 'appointment' && !selectedSlot)))
                }
              >
                <FormattedMessage id="massActions.actions.nextStep" />
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowConfirmation(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                <FormattedMessage id="massActions.actions.approve" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <FormattedMessage id="massActions.confirmation.title" />
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              <FormattedMessage 
                id="massActions.confirmation.message"
                values={{ count: getAffectedPatients().length }}
              />
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                <FormattedMessage id="massActions.confirmation.cancel" />
              </Button>
              <Button
                onClick={executeAction}
                className="bg-green-600 hover:bg-green-700"
              >
                <FormattedMessage id="massActions.confirmation.confirm" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default MassActions