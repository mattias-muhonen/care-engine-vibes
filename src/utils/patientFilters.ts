export type ConsentStatus = 'given' | 'withdrawn' | 'pending'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type PathwayStatus = 'active' | 'monitoring' | 'paused' | 'urgent' | 'completed'

export interface Patient {
  id: string
  name: string
  dob: string
  nhsNumber: string
  consent: {
    status: ConsentStatus
    date: string
  }
  vitals: Array<{
    date: string
    hba1c: number
    bp: string
    weight: number
  }>
  notes: Array<{
    date: string
    author: string
    content: string
  }>
  pathwayStatus: PathwayStatus
  lastContact: string
  riskLevel: RiskLevel
}

export interface Cohort {
  cohortId: string
  name: string
  filter: {
    condition: string
    criteria: string
  }
  patientIds: string[]
  reason: string
  priority: 'low' | 'medium' | 'high'
  createdDate: string
  lastUpdated: string
}

export function hasValidConsent(patient: Patient): boolean {
  return patient.consent.status === 'given'
}

export function filterPatientsByConsent(patients: Patient[], consentStatus?: ConsentStatus): Patient[] {
  if (!consentStatus) {
    return patients
  }
  return patients.filter(patient => patient.consent.status === consentStatus)
}

export function filterPatientsByRisk(patients: Patient[], riskLevel?: RiskLevel): Patient[] {
  if (!riskLevel) {
    return patients
  }
  return patients.filter(patient => patient.riskLevel === riskLevel)
}

export function filterPatientsByPathway(patients: Patient[], pathwayStatus?: PathwayStatus): Patient[] {
  if (!pathwayStatus) {
    return patients
  }
  return patients.filter(patient => patient.pathwayStatus === pathwayStatus)
}

export function getLatestHbA1c(patient: Patient): number | null {
  if (!patient.vitals || patient.vitals.length === 0) {
    return null
  }
  
  const sortedVitals = [...patient.vitals].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  return sortedVitals[0].hba1c
}

// Export getLatestHbA1c from here for convenience
export { getLatestHbA1c as getLatestHbA1cFromUtils }

export function getLatestBP(patient: Patient): string | null {
  if (!patient.vitals || patient.vitals.length === 0) {
    return null
  }
  
  const sortedVitals = [...patient.vitals].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  return sortedVitals[0].bp
}

export function isHbA1cAboveThreshold(patient: Patient, threshold: number = 70): boolean {
  const latestHbA1c = getLatestHbA1c(patient)
  return latestHbA1c !== null && latestHbA1c > threshold
}

export function isBPElevated(patient: Patient): boolean {
  const latestBP = getLatestBP(patient)
  if (!latestBP) return false
  
  const [systolic] = latestBP.split('/').map(Number)
  return systolic > 140
}

export function sortPatientsByRisk(patients: Patient[]): Patient[] {
  const riskOrder: Record<RiskLevel, number> = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1
  }
  
  return [...patients].sort((a, b) => riskOrder[b.riskLevel] - riskOrder[a.riskLevel])
}

export function getPatientsByIds(patients: Patient[], patientIds: string[]): Patient[] {
  return patients.filter(patient => patientIds.includes(patient.id))
}

export function searchPatients(patients: Patient[], searchTerm: string): Patient[] {
  if (!searchTerm.trim()) {
    return patients
  }
  
  const term = searchTerm.toLowerCase()
  return patients.filter(patient => 
    patient.name.toLowerCase().includes(term) ||
    patient.nhsNumber.includes(term) ||
    patient.id.toLowerCase().includes(term)
  )
}