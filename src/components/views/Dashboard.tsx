import { useState } from 'react'
import patientsData from '../../mocks/patients.json'
import cohortsData from '../../mocks/cohorts.json'
import { Patient, Cohort } from '../../utils/patientFilters'
import { initializeAuditLog, logUserAction } from '../../utils/storage'
import CohortTable from '../organisms/CohortTable'
import CohortDetailPanel from '../organisms/CohortDetailPanel'
import PatientDetailPanel from '../organisms/PatientDetailPanel'

function Dashboard() {
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

  return (
    <div className="space-y-6">
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