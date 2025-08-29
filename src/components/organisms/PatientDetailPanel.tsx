import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { X, User, Activity, FileText, TrendingUp, AlertCircle, Plus, Settings } from 'lucide-react'
import { Patient } from '../../utils/patientFilters'
import { formatDate, formatDateRelative, calculateAge } from '../../utils/formatDate'
import { logUserAction } from '../../utils/storage'
import { PatientPathwayAssignment, PatientPathwayStorage } from '../../utils/patientPathways'
import { useUser, getUserRolePermissions } from '../../contexts/UserContext'
import Badge from '../atoms/Badge'
import Button from '../atoms/Button'
import PatientPathwayAssignmentModal from './PatientPathwayAssignmentModal'
import PatientPathwayAdjustmentModal from './PatientPathwayAdjustmentModal'

interface PatientDetailPanelProps {
  patient: Patient | null
  onClose: () => void
}

function PatientDetailPanel({ patient, onClose }: PatientDetailPanelProps) {
  const { user } = useUser()
  const permissions = getUserRolePermissions(user.role)
  const [patientPathwayAssignments, setPatientPathwayAssignments] = useState<PatientPathwayAssignment[]>([])
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [adjustmentAssignment, setAdjustmentAssignment] = useState<PatientPathwayAssignment | null>(null)

  if (!patient) return null

  // Log patient detail view
  logUserAction('patient_detail_viewed', {
    patientId: patient.id,
    patientName: patient.name,
    riskLevel: patient.riskLevel
  })

  useEffect(() => {
    // Load patient pathway assignments
    const assignments = PatientPathwayStorage.getActiveAssignmentsByPatient(patient.id)
    setPatientPathwayAssignments(assignments)
  }, [patient.id])

  const handlePathwayAssigned = (assignment: PatientPathwayAssignment) => {
    setPatientPathwayAssignments(prev => [...prev, assignment])
  }

  const handlePathwayUpdated = (updatedAssignment: PatientPathwayAssignment) => {
    setPatientPathwayAssignments(prev => 
      prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a)
    )
  }

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'critical'
      case 'high': return 'warning'
      case 'medium': return 'default'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getPathwayStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'monitoring': return 'default'
      case 'paused': return 'warning'
      case 'urgent': return 'critical'
      case 'completed': return 'success'
      default: return 'default'
    }
  }

  const getLatestVitals = () => {
    if (!patient.vitals || patient.vitals.length === 0) return null
    return [...patient.vitals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }

  const latestVitals = getLatestVitals()
  const sortedVitals = patient.vitals ? [...patient.vitals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            <FormattedMessage id="patientDetail.title" />
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Demographics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">
              <FormattedMessage id="patientDetail.demographics" />
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  <FormattedMessage id="patientDetail.demographics.name" />
                </dt>
                <dd className="text-sm text-gray-900 mt-1">{patient.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  <FormattedMessage id="patientDetail.demographics.age" />
                </dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {calculateAge(patient.dob)} <FormattedMessage id="patient.age" />
                </dd>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  <FormattedMessage id="patientDetail.demographics.dob" />
                </dt>
                <dd className="text-sm text-gray-900 mt-1">{formatDate(patient.dob)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  <FormattedMessage id="patientDetail.demographics.nhsNumber" />
                </dt>
                <dd className="text-sm text-gray-900 mt-1">{patient.nhsNumber}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Consent */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">
              <FormattedMessage id="patientDetail.consent" />
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  <FormattedMessage id="patientDetail.consent.status" />
                </dt>
                <dd className="text-sm mt-1">
                  <Badge variant={patient.consent.status === 'given' ? 'success' : 'critical'}>
                    <FormattedMessage 
                      id={patient.consent.status === 'given' ? 'patientDetail.consent.given' : 'patientDetail.consent.withdrawn'} 
                    />
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  <FormattedMessage id="patientDetail.consent.date" />
                </dt>
                <dd className="text-sm text-gray-900 mt-1">{formatDate(patient.consent.date)}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Care Pathway */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">
              <FormattedMessage id="patientDetail.pathway" />
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  <FormattedMessage id="patientDetail.pathway.status" />
                </dt>
                <dd className="text-sm mt-1">
                  <Badge variant={getPathwayStatusVariant(patient.pathwayStatus)}>
                    <FormattedMessage id={`patientDetail.pathway.${patient.pathwayStatus}`} />
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  <FormattedMessage id="patientDetail.pathway.riskLevel" />
                </dt>
                <dd className="text-sm mt-1">
                  <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
                    <FormattedMessage id={`patientDetail.riskLevel.${patient.riskLevel}`} />
                  </Badge>
                </dd>
              </div>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                <FormattedMessage id="patientDetail.pathway.lastContact" />
              </dt>
              <dd className="text-sm text-gray-900 mt-1">
                {formatDate(patient.lastContact)} ({formatDateRelative(patient.lastContact)})
              </dd>
            </div>
          </div>
        </div>

        {/* Pathway Assignments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">
                <FormattedMessage id="patientDetail.pathwayAssignments" />
              </h3>
            </div>
            {permissions.canConfigureThresholds && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAssignmentModal(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                <FormattedMessage id="patientDetail.pathwayAssignments.assign" />
              </Button>
            )}
          </div>

          {patientPathwayAssignments.length > 0 ? (
            <div className="space-y-3">
              {patientPathwayAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {assignment.template.name.en}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {assignment.template.condition} • Assigned {formatDateRelative(assignment.assignedDate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={assignment.status === 'active' ? 'success' : 'default'}>
                        <FormattedMessage id={`patientPathway.status.${assignment.status}`} />
                      </Badge>
                      {permissions.canConfigureThresholds && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setAdjustmentAssignment(assignment)}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          <FormattedMessage id="patientDetail.pathwayAssignments.adjust" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      <FormattedMessage id="patientDetail.pathwayAssignments.progress" />:
                    </div>
                    <div className="space-y-1">
                      {assignment.steps.slice(0, 3).map((step: any, index: number) => {
                        const stepStatus = step.status
                        const statusVariant = stepStatus === 'completed' ? 'success' : 
                                           stepStatus === 'excluded' ? 'default' : 
                                           stepStatus === 'snoozed' ? 'warning' : 'default'
                        
                        return (
                          <div key={step.stepId} className="flex items-center justify-between text-xs">
                            <span className="text-gray-700">
                              {index + 1}. {step.originalStep.name.en}
                            </span>
                            <Badge variant={statusVariant} className="text-xs">
                              <FormattedMessage id={`patientPathway.stepStatus.${stepStatus}`} />
                            </Badge>
                          </div>
                        )
                      })}
                      {assignment.steps.length > 3 && (
                        <div className="text-xs text-gray-500 text-center pt-1">
                          +{assignment.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {assignment.overallJustification && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">
                        <FormattedMessage id="patientDetail.pathwayAssignments.justification" />:
                      </div>
                      <p className="text-sm text-gray-700">{assignment.overallJustification}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Settings className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500 mb-3">
                <FormattedMessage id="patientDetail.pathwayAssignments.noAssignments" />
              </p>
              {permissions.canConfigureThresholds && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAssignmentModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <FormattedMessage id="patientDetail.pathwayAssignments.assignFirst" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Vitals Timeline */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">
              <FormattedMessage id="patientDetail.vitals" />
            </h3>
          </div>

          {sortedVitals.length > 0 ? (
            <div className="space-y-3">
              {/* Latest Values Summary */}
              {latestVitals && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">
                    <FormattedMessage id="patientDetail.vitals.timeline" />
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <dt className="font-medium text-blue-700">
                        <FormattedMessage id="patientDetail.vitals.hba1c" />
                      </dt>
                      <dd className={`mt-1 font-semibold ${latestVitals.hba1c > 70 ? 'text-red-600' : 'text-green-600'}`}>
                        {latestVitals.hba1c} <FormattedMessage id="cohortDetail.vitals.units" />
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-blue-700">
                        <FormattedMessage id="patientDetail.vitals.bloodPressure" />
                      </dt>
                      <dd className="text-blue-900 mt-1 font-semibold">{latestVitals.bp} mmHg</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-blue-700">
                        <FormattedMessage id="patientDetail.vitals.weight" />
                      </dt>
                      <dd className="text-blue-900 mt-1 font-semibold">{latestVitals.weight} kg</dd>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  <FormattedMessage id="patientDetail.vitals.timeline" />
                </h4>
                <div className="space-y-2">
                  {sortedVitals.map((vital) => (
                    <div key={vital.date} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(vital.date)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateRelative(vital.date)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">HbA1c:</span>
                          <span className={`ml-1 font-medium ${vital.hba1c > 70 ? 'text-red-600' : 'text-green-600'}`}>
                            {vital.hba1c}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">BP:</span>
                          <span className="ml-1 font-medium text-gray-900">{vital.bp}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Weight:</span>
                          <span className="ml-1 font-medium text-gray-900">{vital.weight}kg</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">
                <FormattedMessage id="patientDetail.vitals.noData" />
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">
              <FormattedMessage id="patientDetail.notes" />
            </h3>
          </div>

          {patient.notes && patient.notes.length > 0 ? (
            <div className="space-y-3">
              {patient.notes
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((note, index) => (
                <div key={`${note.date}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{note.author}</span>
                    <span className="text-xs text-gray-500">{formatDate(note.date)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">
                <FormattedMessage id="patientDetail.notes.noNotes" />
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pathway Assignment Modal */}
      {showAssignmentModal && (
        <PatientPathwayAssignmentModal
          patient={patient}
          onClose={() => setShowAssignmentModal(false)}
          onAssigned={handlePathwayAssigned}
        />
      )}

      {/* Pathway Adjustment Modal */}
      {adjustmentAssignment && (
        <PatientPathwayAdjustmentModal
          assignment={adjustmentAssignment}
          onClose={() => setAdjustmentAssignment(null)}
          onUpdated={handlePathwayUpdated}
        />
      )}
    </div>
  )
}

export default PatientDetailPanel