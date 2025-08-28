import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Activity, Users, ClipboardCheck, Settings, FileText, AlertTriangle } from "lucide-react"
import { dutch } from "@/lib/dutch"

const navItems = [
  { name: dutch.cohortOverview, path: "/", icon: Users },
  { name: dutch.actionQueue, path: "/actions", icon: ClipboardCheck },
  { name: dutch.configuration, path: "/config", icon: Settings },
  { name: dutch.auditLog, path: "/audit", icon: FileText },
]

export default function Navigation() {
  const location = useLocation()
  const emergencyStopActive = false // This would come from system state

  return (
    <nav className="sticky top-0 z-50 navigation-blur" role="navigation" aria-label="Hoofdnavigatie">
      <div className="container mx-auto px-6 py-4">
        <div className="flex h-16 items-center justify-between gap-8">
          <div className="flex items-center space-x-12">
            <Link 
              to="/" 
              className="clickable-target group focus-ring" 
              aria-label="Diabeteszorg Engine - Ga naar dashboard"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Activity className="h-10 w-10 text-primary drop-shadow-lg transition-colors duration-200" aria-hidden="true" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Diabeteszorg Engine
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    Nederlandse Huisarts Automatisering
                  </span>
                </div>
              </div>
            </Link>
            <nav className="hidden lg:flex" role="menubar" aria-label="Sectienavigatie">
              <ul className="flex space-x-3" role="none">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <li key={item.path} role="none">
                      <Link
                        to={item.path}
                        role="menuitem"
                        className={`clickable-target focus-ring ${
                          isActive ? 
                          "btn-medical" : 
                          "btn-medical-secondary transition-all duration-200"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={`Ga naar ${item.name}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-6">
            {emergencyStopActive && (
              <div 
                role="alert" 
                aria-live="polite"
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg shadow-sm"
              >
                <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
                <span className="font-semibold text-red-800">{dutch.emergencyStopActive}</span>
              </div>
            )}
            <div 
              className="flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 shadow-sm"
              role="status"
              aria-live="polite"
              aria-label="Systeem status"
            >
              <div className="relative" aria-hidden="true">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="text-sm font-medium text-green-700">
                {dutch.systemStatus}: <span className="font-semibold">Actief</span>
              </span>
            </div>
            
            {/* Mobile menu button - hidden for now */}
            <div className="lg:hidden">
              <button
                className="clickable-target btn-medical-secondary"
                aria-label="Menu openen"
                aria-expanded="false"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="sr-only">Menu</span>
              </button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="clickable-target btn-medical-secondary font-medium hidden sm:flex"
              aria-label="Gebruikersprofiel van Dr. M. van der Berg, Praktijkondersteuner Huisarts Somatiek"
            >
              <span className="text-lg mr-2" aria-hidden="true">👨‍⚕️</span>
              <span className="hidden md:inline">Dr. M. van der Berg (POH-S)</span>
              <span className="md:hidden">Dr. van der Berg</span>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="clickable-target hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-200 border border-transparent hover:border-red-200/50 font-medium focus-ring"
              aria-label="Uitloggen uit het systeem"
            >
              {dutch.logout}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}