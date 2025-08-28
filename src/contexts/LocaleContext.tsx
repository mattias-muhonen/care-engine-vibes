import { createContext, useContext, useState, ReactNode } from 'react'

type Locale = 'nl' | 'en'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

interface LocaleProviderProps {
  children: ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>('nl')

  const toggleLocale = () => {
    setLocale(current => current === 'nl' ? 'en' : 'nl')
  }

  const value = {
    locale,
    setLocale,
    toggleLocale
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

export function getLocaleDisplayName(locale: Locale): string {
  switch (locale) {
    case 'nl':
      return 'Nederlands'
    case 'en':
      return 'English'
    default:
      return locale
  }
}

export function getLocaleFlag(locale: Locale): string {
  switch (locale) {
    case 'nl':
      return '🇳🇱'
    case 'en':
      return '🇬🇧'
    default:
      return '🌐'
  }
}