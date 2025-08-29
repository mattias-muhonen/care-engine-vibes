import { createContext, useContext, useState, ReactNode } from 'react'

export type UserRole = 'gp' | 'poh-s' | 'practice-manager'

export interface User {
  id: string
  name: string
  role: UserRole
  practice: string
}

interface UserContextType {
  user: User
  setUser: (user: User) => void
  changeRole: (role: UserRole) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

const defaultUsers: Record<UserRole, User> = {
  'gp': {
    id: 'gp-001',
    name: 'Dr. van der Berg',
    role: 'gp',
    practice: 'Huisartsenpraktijk Rotterdam Centrum'
  },
  'poh-s': {
    id: 'poh-s-001',
    name: 'Martine van der Berg (POH-S)',
    role: 'poh-s',
    practice: 'Huisartsenpraktijk Rotterdam Centrum'
  },
  'practice-manager': {
    id: 'pm-001',
    name: 'Sarah de Jong (Practice Manager)',
    role: 'practice-manager',
    practice: 'Huisartsenpraktijk Rotterdam Centrum'
  }
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User>(defaultUsers['poh-s']) // Start with POH-S as default

  const changeRole = (role: UserRole) => {
    setUser(defaultUsers[role])
  }

  const value = {
    user,
    setUser,
    changeRole
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export function getUserRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'gp':
      return 'Huisarts'
    case 'poh-s':
      return 'POH-S'
    case 'practice-manager':
      return 'Praktijkmanager'
    default:
      return role
  }
}

export function getUserRolePermissions(role: UserRole) {
  switch (role) {
    case 'gp':
      return {
        canApproveMassActions: true,
        canConfigureThresholds: false,
        canViewAuditDetails: true,
        canManageGovernance: false,
        focusArea: 'approval' as const
      }
    case 'poh-s':
      return {
        canApproveMassActions: true,
        canConfigureThresholds: true,
        canViewAuditDetails: true,
        canManageGovernance: false,
        focusArea: 'daily-operations' as const
      }
    case 'practice-manager':
      return {
        canApproveMassActions: false,
        canConfigureThresholds: false,
        canViewAuditDetails: true,
        canManageGovernance: true,
        focusArea: 'oversight' as const
      }
    default:
      return {
        canApproveMassActions: false,
        canConfigureThresholds: false,
        canViewAuditDetails: false,
        canManageGovernance: false,
        focusArea: 'restricted' as const
      }
  }
}