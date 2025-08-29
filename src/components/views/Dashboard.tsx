import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Users, AlertTriangle, Clock, CheckCircle, Activity } from 'lucide-react'
import patientsData from '../../mocks/patients.json'
import cohortsData from '../../mocks/cohorts.json'
import { Patient, Cohort } from '../../utils/patientFilters'
import { isOverdue } from '../../utils/formatDate'
import { initializeAuditLog, logUserAction } from '../../utils/storage'
import { useUser, getUserRolePermissions } from '../../contexts/UserContext'
import Tile from '../atoms/Tile'
import CohortTable from '../organisms/CohortTable'
import CohortDetailPanel from '../organisms/CohortDetailPanel'
import PatientDetailPanel from '../organisms/PatientDetailPanel'

function Dashboard() {
  const intl = useIntl()
  const { user } = useUser()
  const permissions = getUserRolePermissions(user.role)
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
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
      setSelectedPatient(patient)
      setSelectedCohort(null) // Close cohort panel when opening patient panel
      logUserAction('patient_selected', {
        patientId: patient.id,
        patientName: patient.name,
        riskLevel: patient.riskLevel
      })
    }
  }

  const handleCloseCohort = () => {
    setSelectedCohort(null)
  }

  const handleClosePatient = () => {
    setSelectedPatient(null)
  }

  // Calculate dashboard metrics
  const highRiskPatients = patients.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length
  const overdueReviews = patients.filter(p => isOverdue(p.lastContact, 6)).length
  const pendingActions = cohorts.reduce((acc, cohort) => acc + cohort.patientIds.length, 0)
  const totalPatients = patients.length
  const activeCohorts = cohorts.length

  // Role-based tile filtering
  const getRoleSpecificTiles = () => {
    const baseTiles = [
      {
        id: 'totalPatients',
        title: intl.formatMessage({ id: 'dashboard.tiles.totalPatients' }),
        value: totalPatients,
        icon: Users,
        variant: "default" as const
      },
      {
        id: 'activeCohorts',
        title: intl.formatMessage({ id: 'dashboard.tiles.activeCohorts' }),
        value: activeCohorts,
        icon: Activity,
        variant: "default" as const
      }
    ]

    const roleSpecificTiles = []

    // GP: Focus on approval workflow and high-risk patients
    if (user.role === 'gp') {
      roleSpecificTiles.push(
        {
          id: 'highRiskPatients',
          title: intl.formatMessage({ id: 'dashboard.tiles.highRiskPatientsGP' }),
          value: highRiskPatients,
          icon: AlertTriangle,
          variant: "critical" as const
        },
        {
          id: 'pendingActions',
          title: intl.formatMessage({ id: 'dashboard.tiles.pendingApprovals' }),
          value: pendingActions,
          icon: CheckCircle,
          variant: "warning" as const
        }
      )
    }

    // POH-S: Daily operations view
    if (user.role === 'poh-s') {
      roleSpecificTiles.push(
        {
          id: 'highRiskPatients',
          title: intl.formatMessage({ id: 'dashboard.tiles.highRiskPatients' }),
          value: highRiskPatients,
          icon: AlertTriangle,
          variant: "critical" as const
        },
        {
          id: 'overdueReviews',
          title: intl.formatMessage({ id: 'dashboard.tiles.overdueReviews' }),
          value: overdueReviews,
          icon: Clock,
          variant: "warning" as const
        },
        {
          id: 'pendingActions',
          title: intl.formatMessage({ id: 'dashboard.tiles.pendingActions' }),
          value: pendingActions,
          icon: CheckCircle,
          variant: "success" as const
        }
      )
    }

    // Practice Manager: Oversight and compliance
    if (user.role === 'practice-manager') {
      roleSpecificTiles.push(
        {
          id: 'overdueReviews',
          title: intl.formatMessage({ id: 'dashboard.tiles.overdueReviews' }),
          value: overdueReviews,
          icon: Clock,
          variant: "warning" as const
        },
        {
          id: 'compliance',
          title: intl.formatMessage({ id: 'dashboard.tiles.complianceRate' }),
          value: Math.round(((totalPatients - overdueReviews) / totalPatients) * 100),
          icon: CheckCircle,
          variant: "success" as const
        }
      )
    }

    return [...baseTiles, ...roleSpecificTiles]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          <FormattedMessage id="dashboard.title" />
        </h1>
        {permissions.focusArea && (
          <p className="text-sm text-gray-600 mt-1">
            <FormattedMessage id={`dashboard.focusArea.${permissions.focusArea}`} />
          </p>
        )}
      </div>
      
      {/* Summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {getRoleSpecificTiles().map((tile) => (
          <Tile
            key={tile.id}
            title={tile.title}
            value={tile.value}
            icon={tile.icon}
            variant={tile.variant}
          />
        ))}
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

      {/* Patient Detail Panel */}
      {selectedPatient && (
        <PatientDetailPanel
          patient={selectedPatient}
          onClose={handleClosePatient}
        />
      )}
    </div>
  )
}

export default Dashboard