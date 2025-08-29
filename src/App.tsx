import { BrowserRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { LocaleProvider, useLocale } from './contexts/LocaleContext'
import { UserProvider } from './contexts/UserContext'
import AppRoutes from './routes'
import nlMessages from './i18n/nl.json'
import enMessages from './i18n/en.json'

function AppContent() {
  const { locale } = useLocale()
  
  const messages = {
    nl: nlMessages,
    en: enMessages
  }

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </IntlProvider>
  )
}

function App() {
  return (
    <LocaleProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </LocaleProvider>
  )
}

export default App