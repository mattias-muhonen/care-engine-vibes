import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navigation from "@/components/Navigation"
import Dashboard from "@/pages/Dashboard"
import ActionQueue from "@/pages/ActionQueue"
import Configuration from "@/pages/Configuration"
import AuditLog from "@/pages/AuditLog"
import Home from "@/pages/Home"
import About from "@/pages/About"
import Components from "@/pages/Components"

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-6 py-8 space-y-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/actions" element={<ActionQueue />} />
            <Route path="/config" element={<Configuration />} />
            <Route path="/audit" element={<AuditLog />} />
            
            {/* Original demo pages */}
            <Route path="/demo" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/components" element={<Components />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
