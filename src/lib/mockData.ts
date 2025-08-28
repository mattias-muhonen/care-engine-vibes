import type { Patient, LabResult, PatientFlag, RiskLevel } from '@/types/patient'
import type { ActionItem, BulkAction, MessageTemplateConfig, ActionType } from '@/types/actions'
import type { User, SystemSettings } from '@/types/audit'

// Helper function to generate random dates
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Generate realistic Dutch names
const dutchFirstNames = [
  'Jan', 'Pieter', 'Cornelis', 'Johannes', 'Jacobus', 'Adrianus', 'Hendrikus', 'Gerrit',
  'Maria', 'Anna', 'Johanna', 'Petronella', 'Catharina', 'Geertruida', 'Elisabeth', 'Hendrika'
]

const dutchLastNames = [
  'de Jong', 'Jansen', 'de Vries', 'van den Berg', 'van Dijk', 'Bakker', 'Janssen', 'Visser',
  'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks',
  'van Leeuwen', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Smits', 'de Graaf', 'van der Meer'
]

const dutchCities = [
  'Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen',
  'Almere', 'Breda', 'Nijmegen', 'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Amersfoort'
]

const generateBSN = (): string => {
  // Generate a valid-looking BSN (not a real algorithm for demo)
  return Math.floor(100000000 + Math.random() * 900000000).toString()
}

const generatePostalCode = (): string => {
  const numbers = Math.floor(1000 + Math.random() * 9000)
  const letters = String.fromCharCode(65 + Math.random() * 26) + String.fromCharCode(65 + Math.random() * 26)
  return `${numbers} ${letters}`
}

// Risk calculation based on NHG guidelines
const calculateRiskLevel = (patient: Partial<Patient>): RiskLevel => {
  if (!patient.labResults || patient.labResults.length === 0) return 'medium'
  
  const latestLab = patient.labResults[0]
  const daysSinceLastVisit = patient.lastVisit 
    ? Math.floor((new Date().getTime() - patient.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    : 365
  
  // High risk: HbA1c >70 and overdue >180 days
  if (latestLab.hba1c > 70 && daysSinceLastVisit > 180) return 'high'
  
  // Medium risk: HbA1c 64-70 OR overdue 90-180 days
  if ((latestLab.hba1c >= 64 && latestLab.hba1c <= 70) || (daysSinceLastVisit >= 90 && daysSinceLastVisit <= 180)) {
    return 'medium'
  }
  
  // Low risk: everything else
  return 'low'
}

// Generate lab results with realistic Dutch medical values
const generateLabResults = (): LabResult[] => {
  const results: LabResult[] = []
  const baseDate = new Date()
  
  // Generate 3-5 historical lab results
  for (let i = 0; i < Math.floor(3 + Math.random() * 3); i++) {
    const labDate = new Date(baseDate)
    labDate.setMonth(labDate.getMonth() - (i * 3 + Math.random() * 2)) // Every 3-4 months
    
    // Generate realistic values with some progression
    const hba1cBase = 45 + Math.random() * 40 // Base range 45-85 mmol/mol
    const hba1cTrend = i * (Math.random() * 4 - 2) // Small trend over time
    
    results.push({
      id: `lab_${Date.now()}_${i}`,
      date: labDate,
      hba1c: Math.round(hba1cBase + hba1cTrend),
      glucose: Math.round(4.0 + Math.random() * 8.0), // 4.0-12.0 mmol/L
      cholesterol: Math.round(3.5 + Math.random() * 3.5), // 3.5-7.0 mmol/L
      ldlCholesterol: Math.round(2.0 + Math.random() * 3.0), // 2.0-5.0 mmol/L
      bloodPressure: {
        systolic: Math.round(110 + Math.random() * 40), // 110-150 mmHg
        diastolic: Math.round(70 + Math.random() * 25)   // 70-95 mmHg
      },
      bmi: Math.round((22 + Math.random() * 10) * 10) / 10, // 22-32 kg/m²
      egfr: Math.round(60 + Math.random() * 40), // 60-100 mL/min/1.73m²
      albuminCreatinine: Math.round(Math.random() * 10 * 10) / 10 // 0-10 mg/mmol
    })
  }
  
  return results.sort((a, b) => b.date.getTime() - a.date.getTime())
}

// Generate patient flags based on risk factors
const generatePatientFlags = (patient: Partial<Patient>): PatientFlag[] => {
  const flags: PatientFlag[] = []
  
  if (!patient.labResults || patient.labResults.length === 0) return flags
  
  const latestLab = patient.labResults[0]
  const daysSinceLastLab = Math.floor((new Date().getTime() - latestLab.date.getTime()) / (1000 * 60 * 60 * 24))
  const daysSinceLastVisit = patient.lastVisit 
    ? Math.floor((new Date().getTime() - patient.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    : 365
  
  // HbA1c too high
  if (latestLab.hba1c > 64) {
    flags.push({
      id: `flag_hba1c_${patient.id}`,
      type: 'high_hba1c',
      severity: latestLab.hba1c > 75 ? 'high' : 'medium',
      message: `HbA1c te hoog: ${latestLab.hba1c} mmol/mol (doel: <64)`,
      createdAt: new Date(),
      resolved: false
    })
  }
  
  // Overdue HbA1c
  if (daysSinceLastLab > 90) {
    flags.push({
      id: `flag_overdue_lab_${patient.id}`,
      type: 'overdue_hba1c',
      severity: daysSinceLastLab > 180 ? 'high' : 'medium',
      message: `HbA1c controle te laat: ${Math.floor(daysSinceLastLab / 30)} maanden geleden`,
      createdAt: new Date(),
      resolved: false
    })
  }
  
  // Overdue visit
  if (daysSinceLastVisit > 120) {
    flags.push({
      id: `flag_overdue_visit_${patient.id}`,
      type: 'overdue_visit',
      severity: daysSinceLastVisit > 240 ? 'high' : 'medium',
      message: `Controle afspraak te laat: ${Math.floor(daysSinceLastVisit / 30)} maanden geleden`,
      createdAt: new Date(),
      resolved: false
    })
  }
  
  return flags
}

// Generate mock patients
export const generateMockPatients = (count: number = 25): Patient[] => {
  const patients: Patient[] = []
  
  for (let i = 0; i < count; i++) {
    const firstName = dutchFirstNames[Math.floor(Math.random() * dutchFirstNames.length)]
    const lastName = dutchLastNames[Math.floor(Math.random() * dutchLastNames.length)]
    const city = dutchCities[Math.floor(Math.random() * dutchCities.length)]
    
    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - (45 + Math.random() * 30)) // Age 45-75
    
    const lastVisit = Math.random() > 0.3 
      ? randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date())
      : undefined
    
    const partialPatient = {
      id: `patient_${i + 1}`,
      labResults: generateLabResults(),
      lastVisit
    }
    
    const patient: Patient = {
      ...partialPatient,
      bsn: generateBSN(),
      firstName,
      lastName,
      dateOfBirth: birthDate,
      gender: Math.random() > 0.5 ? 'M' : 'V',
      address: {
        street: 'Kerkstraat',
        houseNumber: `${Math.floor(1 + Math.random() * 200)}`,
        postalCode: generatePostalCode(),
        city,
        province: 'Noord-Holland'
      },
      phone: `06-${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@email.nl`,
      
      diabetesType: 'type2',
      diagnosisDate: randomDate(new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000), birthDate),
      riskLevel: 'medium', // Will be calculated
      status: 'active',
      
      primaryProvider: Math.random() > 0.7 ? 'GP' : 'POH-S',
      nextDue: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000), // Next 90 days
      consentForContact: Math.random() > 0.05,
      consentForSMS: Math.random() > 0.2,
      consentForEmail: Math.random() > 0.3,
      
      visits: [], // Could generate visit history
      flags: [], // Will be generated
      
      createdAt: randomDate(new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), new Date()),
      updatedAt: new Date()
    }
    
    // Calculate risk level and generate flags
    patient.riskLevel = calculateRiskLevel(patient)
    patient.flags = generatePatientFlags(patient)
    
    patients.push(patient)
  }
  
  return patients.sort((a, b) => {
    // Sort by risk level (high -> medium -> low) then by latest lab date
    const riskOrder = { high: 3, medium: 2, low: 1 }
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
    }
    
    const aLatestLab = a.labResults[0]?.date.getTime() || 0
    const bLatestLab = b.labResults[0]?.date.getTime() || 0
    return aLatestLab - bLatestLab // Older labs first (more urgent)
  })
}

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user_1',
    name: 'Dr. Martine van der Berg',
    role: 'POH-S',
    email: 'martine.vandenberg@huisarts.nl',
    practiceId: 'practice_1',
    isActive: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'user_2',
    name: 'Dr. Jan Bakker',
    role: 'GP',
    email: 'jan.bakker@huisarts.nl',
    practiceId: 'practice_1',
    isActive: true,
    lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'user_3',
    name: 'Saskia Meijer',
    role: 'Practice_Manager',
    email: 'saskia.meijer@huisarts.nl',
    practiceId: 'practice_1',
    isActive: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  }
]

// Mock system settings
export const mockSystemSettings: SystemSettings = {
  practiceId: 'practice_1',
  practiceName: 'Huisartspraktijk Rotterdam Centrum',
  
  dailyActionLimit: 100,
  maxBulkActionSize: 50,
  emergencyStopEnabled: false,
  
  hba1cThresholds: {
    good: 53,
    acceptable: 63,
    actionNeeded: 64
  },
  
  overdueThresholds: {
    hba1cMonths: 3,
    visitMonths: 6,
    urgentDays: 14
  },
  
  autoApprovalEnabled: false,
  autoApprovalRiskLimit: 'low',
  businessHoursOnly: true,
  weekendsEnabled: false,
  
  emailNotifications: true,
  smsNotifications: true,
  emergencyContactEmail: 'admin@huisarts.nl',
  
  dataRetentionDays: 2555, // 7 years
  auditLogRetentionDays: 2555,
  consentReminderDays: 365,
  
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  updatedAt: new Date()
}

// Generate mock patients on load
export const mockPatients = generateMockPatients(25)

// Generate mock actions based on patients
export const generateMockActions = (): ActionItem[] => {
  const actions: ActionItem[] = []
  
  // Create actions for high-risk patients
  const highRiskPatients = mockPatients.filter(p => p.riskLevel === 'high')
  const mediumRiskPatients = mockPatients.filter(p => p.riskLevel === 'medium')
  
  // High-risk patients get multiple urgent actions
  highRiskPatients.forEach((patient) => {
    // SMS reminder for overdue HbA1c
    actions.push({
      id: `action_${actions.length + 1}`,
      patientId: patient.id,
      type: 'sms_reminder',
      status: 'pending',
      priority: 'high',
      title: 'SMS herinnering: HbA1c controle',
      description: `${patient.firstName} ${patient.lastName} - HbA1c controle ${Math.floor(Math.random() * 6 + 3)} maanden achterstallig`,
      messageTemplate: 'hba1c_reminder',
      createdBy: 'system',
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Within last 24 hours
      estimatedDuration: 2,
      cost: 0.05
    })
    
    // Book appointment action
    actions.push({
      id: `action_${actions.length + 1}`,
      patientId: patient.id,
      type: 'book_appointment',
      status: 'pending',
      priority: 'high',
      title: 'Afspraak inplannen: Diabetescontrole',
      description: `Urgente controle nodig voor ${patient.firstName} ${patient.lastName} - HbA1c ${patient.labResults[0]?.hba1c || 70} mmol/mol`,
      scheduledFor: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000), // Next 2 weeks
      createdBy: 'system',
      createdAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000), // Within last 12 hours
      estimatedDuration: 30,
      cost: 0
    })
  })
  
  // Medium-risk patients get routine actions
  mediumRiskPatients.slice(0, 8).forEach((patient) => {
    const actionTypes = ['email_reminder', 'phone_call', 'letter']
    const randomType = actionTypes[Math.floor(Math.random() * actionTypes.length)]
    
    actions.push({
      id: `action_${actions.length + 1}`,
      patientId: patient.id,
      type: randomType as ActionType,
      status: Math.random() > 0.7 ? 'approved' : 'pending',
      priority: 'medium',
      title: `${randomType === 'email_reminder' ? 'E-mail herinnering' : randomType === 'phone_call' ? 'Telefonisch contact' : 'Brief versturen'}: Controle afspraak`,
      description: `${patient.firstName} ${patient.lastName} - Routine diabetescontrole inplannen`,
      messageTemplate: 'appointment_reminder',
      scheduledFor: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Next month
      createdBy: 'system',
      createdAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000), // Within last 48 hours
      estimatedDuration: randomType === 'phone_call' ? 5 : 2,
      cost: randomType === 'letter' ? 0.80 : randomType === 'email_reminder' ? 0 : 0
    })
  })
  
  // Add some completed actions for demonstration
  actions.slice(0, 3).forEach(action => {
    if (Math.random() > 0.5) {
      action.status = 'completed'
      action.approvedBy = 'user_1'
      action.approvedAt = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      action.executedAt = new Date(action.approvedAt.getTime() + Math.random() * 60 * 60 * 1000)
      action.executionResult = {
        success: true,
        message: 'Actie succesvol uitgevoerd',
        details: { deliveryStatus: 'delivered', timestamp: action.executedAt }
      }
    }
  })
  
  // Sort by priority and creation date
  return actions.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}

// Generate mock bulk actions
export const generateMockBulkActions = (): BulkAction[] => {
  return [
    {
      id: 'bulk_1',
      name: 'HbA1c herinneringen - Hoog risico patiënten',
      description: 'SMS herinneringen voor alle hoog-risico patiënten met achterstallige HbA1c',
      actionType: 'sms_reminder',
      patientIds: mockPatients.filter(p => p.riskLevel === 'high').slice(0, 5).map(p => p.id),
      template: 'hba1c_reminder',
      createdBy: 'user_1',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'pending_approval',
      individualActions: [],
      summary: {
        total: 5,
        successful: 0,
        failed: 0,
        pending: 5
      }
    },
    {
      id: 'bulk_2',
      name: 'Afspraken inplannen - Medium risico',
      description: 'Routine controle afspraken voor medium risico patiënten',
      actionType: 'book_appointment',
      patientIds: mockPatients.filter(p => p.riskLevel === 'medium').slice(0, 8).map(p => p.id),
      createdBy: 'user_1',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: 'approved',
      individualActions: [],
      summary: {
        total: 8,
        successful: 6,
        failed: 1,
        pending: 1
      }
    }
  ]
}

// Message templates in Dutch
export const messageTemplates: MessageTemplateConfig[] = [
  {
    id: 'hba1c_reminder',
    name: 'HbA1c Controle Herinnering',
    subject: 'HbA1c controle nodig - {practice_name}',
    content: 'Beste {patient_name}, uw HbA1c controle is achterstallig. Gelieve contact op te nemen met onze praktijk op {practice_phone} om een afspraak in te plannen. Met vriendelijke groet, {provider_name}',
    variables: ['patient_name', 'practice_name', 'practice_phone', 'provider_name'],
    language: 'nl',
    category: 'reminder'
  },
  {
    id: 'appointment_reminder',
    name: 'Afspraak Herinnering',
    subject: 'Diabetescontrole afspraak - {practice_name}',
    content: 'Beste {patient_name}, het is tijd voor uw routine diabetescontrole. U kunt een afspraak maken via {practice_phone} of online via onze website. Met vriendelijke groet, {provider_name}',
    variables: ['patient_name', 'practice_name', 'practice_phone', 'provider_name'],
    language: 'nl',
    category: 'reminder'
  },
  {
    id: 'lab_results_overdue',
    name: 'Laboratoriumuitslagen Achterstallig',
    content: 'Beste {patient_name}, uw laboratoriumuitslagen zijn achterstallig. Gelieve contact op te nemen voor een nieuwe afspraak.',
    variables: ['patient_name', 'practice_phone'],
    language: 'nl',
    category: 'results'
  },
  {
    id: 'urgent_review',
    name: 'Urgente Controle Vereist',
    subject: 'URGENT: Diabetescontrole vereist',
    content: 'Beste {patient_name}, op basis van uw recente uitslagen is een urgente controle vereist. Gelieve zo spoedig mogelijk contact op te nemen met {practice_phone}.',
    variables: ['patient_name', 'practice_phone'],
    language: 'nl',
    category: 'urgent'
  }
]

// Generate mock actions
export const mockActions = generateMockActions()
export const mockBulkActions = generateMockBulkActions()