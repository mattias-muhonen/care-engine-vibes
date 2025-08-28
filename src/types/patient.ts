export interface DutchAddress {
  street: string
  houseNumber: string
  postalCode: string // Format: 1234 AB
  city: string
  province: string
}

export interface LabResult {
  id: string
  date: Date
  hba1c: number        // mmol/mol (NHG: <53 good, 53-63 acceptable, >64 action needed)
  glucose: number      // mmol/L (fasting glucose)
  cholesterol: number  // mmol/L (total cholesterol)
  ldlCholesterol?: number // mmol/L (LDL cholesterol)
  bloodPressure: {
    systolic: number   // mmHg
    diastolic: number  // mmHg
  }
  bmi: number         // kg/m²
  egfr?: number       // mL/min/1.73m² (kidney function)
  albuminCreatinine?: number // mg/mmol (kidney function)
}

export type RiskLevel = 'high' | 'medium' | 'low'
export type PatientStatus = 'active' | 'inactive' | 'transferred'

export interface PatientFlag {
  id: string
  type: 'overdue_hba1c' | 'high_hba1c' | 'overdue_visit' | 'multiple_risks' | 'urgent_review'
  severity: RiskLevel
  message: string
  createdAt: Date
  resolved: boolean
}

export interface Visit {
  id: string
  date: Date
  type: 'routine_check' | 'lab_results' | 'urgent' | 'phone_consultation'
  provider: 'GP' | 'POH-S' | 'Dietitian' | 'Specialist'
  notes?: string
  labResultId?: string
}

export interface Patient {
  id: string
  bsn: string          // Dutch social security number (Burgerservicenummer)
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: 'M' | 'V'    // M = Male, V = Female (Dutch abbreviations)
  address: DutchAddress
  phone: string
  email?: string
  
  // Medical Information
  diabetesType: 'type1' | 'type2' | 'gestational' | 'other'
  diagnosisDate: Date
  riskLevel: RiskLevel
  status: PatientStatus
  
  // Care Information
  primaryProvider: 'GP' | 'POH-S'
  lastVisit?: Date
  nextDue: Date
  consentForContact: boolean
  consentForSMS: boolean
  consentForEmail: boolean
  
  // Clinical Data
  labResults: LabResult[]
  visits: Visit[]
  flags: PatientFlag[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}