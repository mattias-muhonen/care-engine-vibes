import { format, parseISO, differenceInMonths, differenceInDays, isValid } from 'date-fns'
import { nl } from 'date-fns/locale'

export function formatDate(dateInput: string | Date, formatPattern: string = 'dd-MM-yyyy'): string {
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput
    
    if (!isValid(date)) {
      return 'Ongeldige datum'
    }
    
    return format(date, formatPattern, { locale: nl })
  } catch (error) {
    return 'Ongeldige datum'
  }
}

export function formatDateTime(dateInput: string | Date): string {
  return formatDate(dateInput, 'dd-MM-yyyy HH:mm')
}

export function formatDateRelative(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput
    const now = new Date()
    
    if (!isValid(date)) {
      return 'Ongeldige datum'
    }
    
    const monthsDiff = differenceInMonths(now, date)
    const daysDiff = differenceInDays(now, date)
    
    if (monthsDiff >= 12) {
      const years = Math.floor(monthsDiff / 12)
      return `${years} jaar geleden`
    } else if (monthsDiff >= 1) {
      return `${monthsDiff} maand${monthsDiff > 1 ? 'en' : ''} geleden`
    } else if (daysDiff >= 7) {
      const weeks = Math.floor(daysDiff / 7)
      return `${weeks} week${weeks > 1 ? '' : ''} geleden`
    } else if (daysDiff >= 1) {
      return `${daysDiff} dag${daysDiff > 1 ? 'en' : ''} geleden`
    } else {
      return 'Vandaag'
    }
  } catch (error) {
    return 'Ongeldige datum'
  }
}

export function isOverdue(lastContactDate: string, thresholdMonths: number = 6): boolean {
  try {
    const lastContact = parseISO(lastContactDate)
    const now = new Date()
    
    if (!isValid(lastContact)) {
      return false
    }
    
    const monthsDiff = differenceInMonths(now, lastContact)
    return monthsDiff >= thresholdMonths
  } catch (error) {
    return false
  }
}

export function calculateAge(dateOfBirth: string): number {
  try {
    const dob = parseISO(dateOfBirth)
    const now = new Date()
    
    if (!isValid(dob)) {
      return 0
    }
    
    let age = now.getFullYear() - dob.getFullYear()
    const monthDiff = now.getMonth() - dob.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age--
    }
    
    return age
  } catch (error) {
    return 0
  }
}