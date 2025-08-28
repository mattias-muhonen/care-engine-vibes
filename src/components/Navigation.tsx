import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sparkles, Home, Info, Layers } from "lucide-react"

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "About", path: "/about", icon: Info },
  { name: "Components", path: "/components", icon: Layers },
]

export default function Navigation() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-50 border-b bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6 text-primary" />
              <span>React SPA</span>
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
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hover:bg-accent/50 hover:scale-105 transition-all">
              Sign In
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}