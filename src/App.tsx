import { BrowserRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import AppRoutes from './routes'
import nlMessages from './i18n/nl.json'

function App() {
  return (
    <IntlProvider locale="nl" messages={nlMessages}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </IntlProvider>
  )
}

export default App