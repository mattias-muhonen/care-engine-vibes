import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navigation from "@/components/Navigation"
import Dashboard from "@/pages/Dashboard"
import ActionQueue from "@/pages/ActionQueue"
import Home from "@/pages/Home"
import About from "@/pages/About"
import Components from "@/pages/Components"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/actions" element={<ActionQueue />} />
            <Route path="/config" element={<div className="p-8">Configuration - Coming Soon</div>} />
            <Route path="/audit" element={<div className="p-8">Audit Log - Coming Soon</div>} />
            
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
