import { useState } from 'react'
import { ChevronDown, Building2, User } from 'lucide-react'
import { useUser, UserRole, getUserRoleDisplayName } from '../../contexts/UserContext'
import LanguageToggle from '../atoms/LanguageToggle'

function TopBar() {
  const { user, changeRole } = useUser()
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)

  const roles: UserRole[] = ['gp', 'poh-s', 'practice-manager']

  const handleRoleChange = (role: UserRole) => {
    changeRole(role)
    setShowRoleDropdown(false)
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <Building2 className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {user.practice}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <LanguageToggle />
        
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {user.name}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Selecteer Rol
                </div>
              </div>
              
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    user.role === role ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {role === 'gp' && 'Dr. van der Berg'}
                        {role === 'poh-s' && 'Martine van der Berg'}
                        {role === 'practice-manager' && 'Sarah de Jong'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getUserRoleDisplayName(role)}
                      </div>
                    </div>
                    {user.role === role && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
              
              <div className="p-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Huidige rol: <span className="font-medium">{getUserRoleDisplayName(user.role)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar