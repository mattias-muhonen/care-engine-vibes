import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Users, AlertTriangle, Clock, CheckCircle, Activity } from 'lucide-react'
import patientsData from '../../mocks/patients.json'
import cohortsData from '../../mocks/cohorts.json'
import { Patient, Cohort } from '../../utils/patientFilters'
import { isOverdue } from '../../utils/formatDate'
import { initializeAuditLog, logUserAction } from '../../utils/storage'
import Tile from '../atoms/Tile'
import CohortTable from '../organisms/CohortTable'
import CohortDetailPanel from '../organisms/CohortDetailPanel'

function Dashboard() {
  const intl = useIntl()
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  
  const patients = patientsData as Patient[]
  const cohorts = cohortsData as Cohort[]

  // Initialize audit log on first load
  useState(() => {
    initializeAuditLog()
  })

  const handleOpenCohort = (cohortId: string) => {
    const cohort = cohorts.find(c => c.cohortId === cohortId)
    if (cohort) {
      setSelectedCohort(cohort)
      logUserAction('cohort_opened', {
        cohortId: cohort.cohortId,
        cohortName: cohort.name,
        patientCount: cohort.patientIds.length
      })
    }
  }

  const handleSelectPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      logUserAction('patient_selected', {
        patientId: patient.id,
        patientName: patient.name,
        riskLevel: patient.riskLevel
      })
      // TODO: Open patient detail view when implemented
    }
  }

  const handleCloseCohort = () => {
    setSelectedCohort(null)
  }

  // Calculate dashboard metrics
  const highRiskPatients = patients.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length
  const overdueReviews = patients.filter(p => isOverdue(p.lastContact, 6)).length
  const pendingActions = cohorts.reduce((acc, cohort) => acc + cohort.patientIds.length, 0)
  const totalPatients = patients.length
  const activeCohorts = cohorts.length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        <FormattedMessage id="dashboard.title" />
      </h1>
      
      {/* Summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Tile
          title={intl.formatMessage({ id: 'dashboard.tiles.totalPatients' })}
          value={totalPatients}
          icon={Users}
          variant="default"
        />
        
        <Tile
          title={intl.formatMessage({ id: 'dashboard.tiles.activeCohorts' })}
          value={activeCohorts}
          icon={Activity}
          variant="default"
        />
        
        <Tile
          title={intl.formatMessage({ id: 'dashboard.tiles.highRiskPatients' })}
          value={highRiskPatients}
          icon={AlertTriangle}
          variant="critical"
        />
        
        <Tile
          title={intl.formatMessage({ id: 'dashboard.tiles.overdueReviews' })}
          value={overdueReviews}
          icon={Clock}
          variant="warning"
        />
        
        <Tile
          title={intl.formatMessage({ id: 'dashboard.tiles.pendingActions' })}
          value={pendingActions}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Cohort Table */}
      <CohortTable
        cohorts={cohorts}
        patients={patients}
        onOpenCohort={handleOpenCohort}
      />

      {/* Cohort Detail Panel */}
      {selectedCohort && (
        <CohortDetailPanel
          cohort={selectedCohort}
          patients={patients}
          onClose={handleCloseCohort}
          onSelectPatient={handleSelectPatient}
        />
      )}
    </div>
  )
}

export default Dashboard