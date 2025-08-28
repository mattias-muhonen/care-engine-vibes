import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { X, Users, Calendar, TrendingUp, Eye } from 'lucide-react'
import { Cohort, Patient, getPatientsByIds, getLatestHbA1c } from '../../utils/patientFilters'
import { formatDateRelative, calculateAge } from '../../utils/formatDate'
import { useLocale } from '../../contexts/LocaleContext'
import Badge from '../atoms/Badge'
import Button from '../atoms/Button'

interface CohortDetailPanelProps {
  cohort: Cohort | null
  patients: Patient[]
  onClose: () => void
  onSelectPatient: (patientId: string) => void
}

function CohortDetailPanel({ cohort, patients, onClose, onSelectPatient }: CohortDetailPanelProps) {
  const { locale } = useLocale()
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])

  if (!cohort) return null

  const cohortPatients = getPatientsByIds(patients, cohort.patientIds)
  
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'critical'
      case 'medium': return 'warning'
      case 'low': return 'default'
      default: return 'default'
    }
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

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPatients.length === cohortPatients.length) {
      setSelectedPatients([])
    } else {
      setSelectedPatients(cohortPatients.map(p => p.id))
    }
  }

  const riskStats = cohortPatients.reduce((acc, patient) => {
    acc[patient.riskLevel] = (acc[patient.riskLevel] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const consentStats = cohortPatients.reduce((acc, patient) => {
    acc[patient.consent.status] = (acc[patient.consent.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            <FormattedMessage id="cohortDetail.title" />
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
        {/* Cohort Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {cohort.name[locale]}
            </h3>
            <Badge variant={getPriorityVariant(cohort.priority)} className="mb-3">
              <FormattedMessage id={`priority.${cohort.priority}`} defaultMessage={cohort.priority} /> <FormattedMessage id="cohortDetail.priorityLabel" />
            </Badge>
            <p className="text-sm text-gray-600">
              {cohort.reason[locale]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase"><FormattedMessage id="cohortDetail.stats.patients" /></span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{cohortPatients.length}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase"><FormattedMessage id="cohortDetail.stats.updated" /></span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatDateRelative(cohort.lastUpdated)}
              </p>
            </div>
          </div>

          {/* Filter criteria */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900"><FormattedMessage id="cohortDetail.filterCriteria" /></span>
            </div>
            <p className="text-sm text-blue-700">
              <strong><FormattedMessage id="cohortDetail.filterCondition" /></strong> {cohort.filter.condition === 'diabetes_t2' ? <FormattedMessage id="cohorts.conditions.diabetes_t2" /> : cohort.filter.condition}
            </p>
            <p className="text-sm text-blue-700">
              <strong><FormattedMessage id="cohortDetail.filterCriteriaLabel" /></strong> {cohort.filter.criteria}
            </p>
          </div>
        </div>

        {/* Risk & Consent Stats */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900"><FormattedMessage id="cohortDetail.overview.title" /></h4>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2"><FormattedMessage id="cohortDetail.riskDistribution" /></h5>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(riskStats).map(([risk, count]) => (
                <div key={risk} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <Badge variant={getRiskBadgeVariant(risk)} size="sm">
                    <FormattedMessage id={`riskLevel.${risk}`} defaultMessage={risk} />
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2"><FormattedMessage id="cohortDetail.consentStatus" /></h5>
            <div className="space-y-2">
              {Object.entries(consentStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <Badge variant={status === 'given' ? 'success' : 'critical'} size="sm">
                    {status === 'given' ? <FormattedMessage id="cohortDetail.consent.given" /> : <FormattedMessage id="cohortDetail.consent.withdrawn" />}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900"><FormattedMessage id="cohortDetail.patientsInCohort" /></h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedPatients.length === cohortPatients.length ? <FormattedMessage id="cohortDetail.deselectAll" /> : <FormattedMessage id="cohortDetail.selectAll" />}
            </Button>
          </div>

          <div className="space-y-2">
            {cohortPatients.map((patient) => {
              const latestHbA1c = getLatestHbA1c(patient)
              const isSelected = selectedPatients.includes(patient.id)
              
              return (
                <div
                  key={patient.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    isSelected ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectPatient(patient.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-medium text-gray-900">{patient.name}</h5>
                        <Badge variant={getRiskBadgeVariant(patient.riskLevel)} size="sm">
                          <FormattedMessage id={`riskLevel.${patient.riskLevel}`} defaultMessage={patient.riskLevel} />
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {calculateAge(patient.dob)} <FormattedMessage id="patient.age" /> • ID: {patient.id}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500"><FormattedMessage id="cohortDetail.vitals.hba1c" /></span>{' '}
                          <span className={`font-medium ${
                            latestHbA1c && latestHbA1c > 70 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {latestHbA1c ? (
                              <>
                                {latestHbA1c} <FormattedMessage id="cohortDetail.vitals.units" />
                              </>
                            ) : (
                              <FormattedMessage id="cohortDetail.vitals.noData" />
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500"><FormattedMessage id="cohortDetail.vitals.lastContact" /></span>{' '}
                          <span className="font-medium text-gray-900">
                            {formatDateRelative(patient.lastContact)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectPatient(patient.id)
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        {selectedPatients.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 -mx-6 px-6">
            <div className="flex items-center gap-2">
              <Button variant="primary">
                <FormattedMessage id="cohortDetail.bulkAction" values={{ count: selectedPatients.length }} />
              </Button>
              <Button variant="outline" onClick={() => setSelectedPatients([])}>
                <FormattedMessage id="cohortDetail.cancel" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CohortDetailPanel