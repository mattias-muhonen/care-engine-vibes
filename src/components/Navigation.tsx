import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    <nav className="sticky top-0 z-50 navigation-blur shadow-lg">
      <div className="container mx-auto px-6 py-3">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Activity className="h-8 w-8 text-primary drop-shadow-lg group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Diabeteszorg Engine
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Nederlandse Huisarts Automatisering
                </span>
              </div>
            </Link>
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className={isActive ? 
                      "btn-medical shadow-lg scale-105" : 
                      "hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 hover:scale-105 transition-all duration-200 border border-transparent hover:border-primary/20"
                    }
                  >
                    <Link to={item.path} className="flex items-center space-x-2.5 px-4 py-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {emergencyStopActive && (
              <Badge variant="destructive" className="flex items-center space-x-1.5 px-3 py-1.5 shadow-lg">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="font-medium">{dutch.emergencyStopActive}</span>
              </Badge>
            )}
            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 shadow-sm">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="text-sm font-medium text-green-700">
                {dutch.systemStatus}: <span className="font-semibold">Actief</span>
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="btn-medical-secondary font-medium px-4 py-2"
            >
              👨‍⚕️ Dr. M. van der Berg (POH-S)
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-200 border border-transparent hover:border-red-200/50 font-medium"
            >
              {dutch.logout}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}