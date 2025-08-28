import type { RiskLevel } from '@/types/patient'
import type { ActionType, ActionStatus } from '@/types/actions'
import type { UserRole } from '@/types/audit'

// Dutch translations for the application
export const dutch = {
  // General UI
  dashboard: 'Dashboard',
  patients: 'Patiënten',
  actions: 'Acties',
  configuration: 'Configuratie',
  auditLog: 'Auditlogboek',
  reports: 'Rapporten',
  
  // Navigation
  cohortOverview: 'Diabetescohort Overzicht',
  actionQueue: 'Wachtende Acties',
  patientDetails: 'Patiënt Details',
  settings: 'Instellingen',
  logout: 'Uitloggen',
  
  // Patient Information
  name: 'Naam',
  dateOfBirth: 'Geboortedatum',
  age: 'Leeftijd',
  bsn: 'BSN',
  address: 'Adres',
  phone: 'Telefoon',
  email: 'E-mail',
  
  // Medical Terms
  hba1c: 'HbA1c',
  glucose: 'Glucose',
  cholesterol: 'Cholesterol',
  bloodPressure: 'Bloeddruk',
  bmi: 'BMI',
  labResults: 'Laboratoriumuitslagen',
  lastVisit: 'Laatste bezoek',
  nextDue: 'Volgende controle',
  diabetesType: 'Diabetes type',
  diagnosisDate: 'Diagnosedatum',
  
  // Risk Levels
  riskLevels: {
    high: 'Hoog risico',
    medium: 'Gemiddeld risico',
    low: 'Laag risico'
  } as Record<RiskLevel, string>,
  
  // Action Types
  actionTypes: {
    sms_reminder: 'SMS herinnering',
    email_reminder: 'E-mail herinnering',
    phone_call: 'Telefonisch contact',
    letter: 'Brief',
    book_appointment: 'Afspraak inplannen',
    escalate_to_gp: 'Doorverwijzen naar huisarts'
  } as Record<ActionType, string>,
  
  // Action Status
  actionStatus: {
    pending: 'In afwachting',
    approved: 'Goedgekeurd',
    rejected: 'Afgewezen',
    completed: 'Voltooid',
    failed: 'Mislukt',
    cancelled: 'Geannuleerd'
  } as Record<ActionStatus, string>,
  
  // User Roles
  userRoles: {
    GP: 'Huisarts',
    'POH-S': 'POH-S',
    Practice_Manager: 'Praktijkmanager',
    System: 'Systeem'
  } as Record<UserRole, string>,
  
  // Buttons and Actions
  approve: 'Goedkeuren',
  reject: 'Afwijzen',
  edit: 'Bewerken',
  delete: 'Verwijderen',
  save: 'Opslaan',
  cancel: 'Annuleren',
  view: 'Bekijken',
  filter: 'Filteren',
  search: 'Zoeken',
  export: 'Exporteren',
  print: 'Afdrukken',
  
  // Bulk Actions
  selectAll: 'Alles selecteren',
  selectNone: 'Niets selecteren',
  bulkApprove: 'Bulk goedkeuren',
  bulkReject: 'Bulk afwijzen',
  bulkAction: 'Bulk actie',
  selectedItems: 'Geselecteerde items',
  
  // Filters
  showAll: 'Alles tonen',
  showHighRisk: 'Alleen hoog risico',
  showMediumRisk: 'Alleen gemiddeld risico',
  showLowRisk: 'Alleen laag risico',
  showOverdue: 'Alleen achterstallig',
  showPending: 'Alleen in afwachting',
  
  // Time and Dates
  today: 'Vandaag',
  yesterday: 'Gisteren',
  thisWeek: 'Deze week',
  thisMonth: 'Deze maand',
  daysAgo: (days: number) => `${days} dag${days === 1 ? '' : 'en'} geleden`,
  monthsAgo: (months: number) => `${months} maand${months === 1 ? '' : 'en'} geleden`,
  
  // Medical Messages
  hba1cTooHigh: 'HbA1c te hoog',
  overdueForLabs: 'Laboratoriumcontrole achterstallig',
  overdueForVisit: 'Controle afspraak achterstallig',
  nhgGuidelines: 'NHG-richtlijnen',
  targetValue: 'Streefwaarde',
  currentValue: 'Huidige waarde',
  lastMeasurement: 'Laatste meting',
  
  // Consent and Privacy
  consentForContact: 'Toestemming voor contact',
  consentForSMS: 'Toestemming voor SMS',
  consentForEmail: 'Toestemming voor e-mail',
  privacyCompliance: 'Privacy-naleving',
  gdprCompliant: 'AVG-conform',
  
  // System Messages
  dataUpToDate: 'Gegevens zijn bijgewerkt',
  lastDataImport: 'Laatste data-import',
  systemStatus: 'Systeemstatus',
  emergencyStop: 'Noodstop',
  emergencyStopActive: 'Noodstop actief',
  emergencyStopInactive: 'Noodstop inactief',
  
  // Validation and Errors
  required: 'Verplicht',
  invalidEmail: 'Ongeldig e-mailadres',
  invalidPhone: 'Ongeldig telefoonnummer',
  invalidPostalCode: 'Ongeldige postcode',
  invalidBSN: 'Ongeldig BSN',
  errorOccurred: 'Er is een fout opgetreden',
  tryAgain: 'Probeer opnieuw',
  
  // Confirmation Messages
  confirmApprove: 'Weet je zeker dat je deze actie wilt goedkeuren?',
  confirmReject: 'Weet je zeker dat je deze actie wilt afwijzen?',
  confirmDelete: 'Weet je zeker dat je dit wilt verwijderen?',
  confirmBulkAction: (count: number) => `Weet je zeker dat je ${count} acties wilt uitvoeren?`,
  
  // Success Messages
  actionApproved: 'Actie goedgekeurd',
  actionRejected: 'Actie afgewezen',
  settingsSaved: 'Instellingen opgeslagen',
  dataExported: 'Gegevens geëxporteerd',
  
  // NHG Guidelines
  nhgHba1cTarget: 'NHG-streefwaarde HbA1c: <53 mmol/mol (goed), 53-63 mmol/mol (acceptabel)',
  nhgHba1cAction: 'NHG-actiewaarde HbA1c: >64 mmol/mol',
  nhgVisitFrequency: 'NHG-controlefrequentie: elke 3-6 maanden',
  nhgLabFrequency: 'NHG-laboratoriumcontrole: elke 3 maanden bij slechte instelling'
}

// Utility functions for Dutch formatting
export const formatDutchDate = (date: Date): string => {
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const formatDutchDateTime = (date: Date): string => {
  return date.toLocaleString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDutchNumber = (num: number, decimals: number = 1): string => {
  return num.toLocaleString('nl-NL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export const formatBSN = (bsn: string): string => {
  // Format BSN as xxx.xxx.xxx for better readability
  if (bsn.length === 9) {
    return `${bsn.slice(0, 3)}.${bsn.slice(3, 6)}.${bsn.slice(6, 9)}`
  }
  return bsn
}

export const formatDutchPostalCode = (postalCode: string): string => {
  // Ensure postal code is in format "1234 AB"
  const cleaned = postalCode.replace(/\s/g, '')
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6).toUpperCase()}`
  }
  return postalCode
}

export const getAgeFromBirthDate = (birthDate: Date): number => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export const getDaysBetween = (date1: Date, date2: Date = new Date()): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

export const getMonthsBetween = (date1: Date, date2: Date = new Date()): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)) // Average days per month
}