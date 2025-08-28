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
    <nav className="sticky top-0 z-50 border-b bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
              <Activity className="h-6 w-6 text-primary" />
              <span>Diabeteszorg Automatisering</span>
            </Link>
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.path}
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className={location.pathname === item.path ? 
                      "bg-gradient-to-r from-primary to-primary/80 shadow-lg" : 
                      "hover:bg-accent/50 hover:scale-105 transition-all"
                    }
                  >
                    <Link to={item.path} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {emergencyStopActive && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{dutch.emergencyStopActive}</span>
              </Badge>
            )}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{dutch.systemStatus}: Actief</span>
            </div>
            <Button variant="outline" size="sm" className="hover:bg-accent/50 hover:scale-105 transition-all">
              Dr. M. van der Berg (POH-S)
            </Button>
            <Button size="sm" variant="ghost" className="hover:bg-accent/50 transition-all">
              {dutch.logout}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}