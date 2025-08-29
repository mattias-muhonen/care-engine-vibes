import { NavLink } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText,
  Activity,
  BarChart3 
} from 'lucide-react'

const navigationItems = [
  { to: '/dashboard', icon: LayoutDashboard, messageId: 'nav.dashboard' },
  { to: '/mass-actions', icon: Users, messageId: 'nav.massActions' },
  { to: '/administrative-metrics', icon: BarChart3, messageId: 'nav.administrativeMetrics' },
  { to: '/config', icon: Settings, messageId: 'nav.config' },
  { to: '/audit', icon: FileText, messageId: 'nav.audit' },
]

function LeftNavigation() {
  return (
    <nav className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8">
          <Activity className="w-8 h-8 text-primary-600" />
          <h1 className="text-xl font-semibold text-gray-900">
            <FormattedMessage id="app.title" />
          </h1>
        </div>
        
        <ul className="space-y-2">
          {navigationItems.map(({ to, icon: Icon, messageId }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <FormattedMessage id={messageId} />
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default LeftNavigation